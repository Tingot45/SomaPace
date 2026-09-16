from __future__ import annotations

import enum
import uuid
from datetime import datetime
from decimal import Decimal

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Boolean,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSON, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base

# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------


class UserRole(str, enum.Enum):
    student = "student"
    parent = "parent"
    admin = "admin"


class MaterialStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    processed = "processed"
    failed = "failed"
    rejected = "rejected"


class Difficulty(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class LessonStatus(str, enum.Enum):
    draft = "draft"
    pending_review = "pending_review"
    approved = "approved"
    published = "published"
    rejected = "rejected"


class QuizStatus(str, enum.Enum):
    draft = "draft"
    pending_review = "pending_review"
    approved = "approved"
    published = "published"
    rejected = "rejected"


class QuestionType(str, enum.Enum):
    multiple_choice = "multiple_choice"
    short_answer = "short_answer"
    true_false = "true_false"


class ProgressType(str, enum.Enum):
    lesson_view = "lesson_view"
    lesson_complete = "lesson_complete"
    quiz_attempt = "quiz_attempt"
    flashcard_review = "flashcard_review"
    practice_attempt = "practice_attempt"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    completed = "completed"
    failed = "failed"
    refunded = "refunded"


class PaymentMethod(str, enum.Enum):
    mpesa = "mpesa"
    airtel_money = "airtel_money"
    card = "card"


class UUIDPrimaryKeyMixin:
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------


class User(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "users"

    phone_number: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    grade: Mapped[int] = mapped_column(Integer, nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.student, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    materials: Mapped[list[Material]] = relationship("Material", back_populates="uploader", lazy="selectin")
    progress: Mapped[list[UserProgress]] = relationship("UserProgress", back_populates="user", lazy="selectin")
    flashcard_states: Mapped[list[UserFlashcardState]] = relationship("UserFlashcardState", back_populates="user", lazy="selectin")
    payments: Mapped[list[Payment]] = relationship("Payment", back_populates="user", lazy="selectin")
    subscriptions: Mapped[list[Subscription]] = relationship("Subscription", back_populates="user", lazy="selectin")


class Subject(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "subjects"

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    curriculum: Mapped[str] = mapped_column(String(100), default="CBC-Kenya")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    materials: Mapped[list[Material]] = relationship("Material", back_populates="subject", lazy="selectin")
    topics: Mapped[list[Topic]] = relationship("Topic", back_populates="subject", lazy="selectin")


class Material(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "materials"

    source_filename: Mapped[str] = mapped_column(String(512), nullable=False)
    storage_path: Mapped[str] = mapped_column(String(1024), nullable=False)
    file_type: Mapped[str] = mapped_column(String(20), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(Integer, nullable=False)
    uploaded_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status: Mapped[MaterialStatus] = mapped_column(Enum(MaterialStatus), default=MaterialStatus.pending)
    raw_text: Mapped[str | None] = mapped_column(Text, nullable=True)
    extracted_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    grade: Mapped[int] = mapped_column(Integer, nullable=False)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    checksum_sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    processed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    uploader: Mapped[User] = relationship("User", back_populates="materials")
    subject: Mapped[Subject] = relationship("Subject", back_populates="materials")
    topics: Mapped[list[Topic]] = relationship("Topic", back_populates="material", lazy="selectin")
    chunks: Mapped[list[Chunk]] = relationship("Chunk", back_populates="material", lazy="selectin")


class Topic(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "topics"

    material_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("materials.id"), nullable=False)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    subtopics: Mapped[list | None] = mapped_column(JSON, nullable=True)
    difficulty: Mapped[Difficulty] = mapped_column(Enum(Difficulty), default=Difficulty.beginner)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    material: Mapped[Material] = relationship("Material", back_populates="topics")
    subject: Mapped[Subject] = relationship("Subject", back_populates="topics")
    chunks: Mapped[list[Chunk]] = relationship("Chunk", back_populates="topic", lazy="selectin")
    lessons: Mapped[list[Lesson]] = relationship("Lesson", back_populates="topic", lazy="selectin")
    quizzes: Mapped[list[Quiz]] = relationship("Quiz", back_populates="topic", lazy="selectin")
    flashcards: Mapped[list[Flashcard]] = relationship("Flashcard", back_populates="topic", lazy="selectin")
    practice_questions: Mapped[list[PracticeQuestion]] = relationship("PracticeQuestion", back_populates="topic", lazy="selectin")
    progress: Mapped[list[UserProgress]] = relationship("UserProgress", back_populates="topic", lazy="selectin")


class Chunk(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "chunks"

    topic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    material_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("materials.id"), nullable=False)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    keywords: Mapped[list | None] = mapped_column(JSON, nullable=True)
    embedding_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    token_count: Mapped[int] = mapped_column(Integer, default=0)
    embedding = mapped_column(Vector(768), nullable=True)

    topic: Mapped[Topic] = relationship("Topic", back_populates="chunks")
    material: Mapped[Material] = relationship("Material", back_populates="chunks")


class Lesson(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "lessons"

    topic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    content_json: Mapped[dict] = mapped_column(JSON, nullable=False)
    word_count: Mapped[int] = mapped_column(Integer, default=0)
    reading_level: Mapped[float] = mapped_column(Float, default=0.0)
    version: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[LessonStatus] = mapped_column(Enum(LessonStatus), default=LessonStatus.draft)
    generated_by: Mapped[str] = mapped_column(String(100), default="gemini")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    topic: Mapped[Topic] = relationship("Topic", back_populates="lessons")
    quizzes: Mapped[list[Quiz]] = relationship("Quiz", back_populates="lesson", lazy="selectin")
    practice_questions: Mapped[list[PracticeQuestion]] = relationship("PracticeQuestion", back_populates="lesson", lazy="selectin")
    flashcards: Mapped[list[Flashcard]] = relationship("Flashcard", back_populates="lesson", lazy="selectin")
    audio_narrations: Mapped[list[AudioNarration]] = relationship("AudioNarration", back_populates="lesson", lazy="selectin")
    progress: Mapped[list[UserProgress]] = relationship("UserProgress", back_populates="lesson", lazy="selectin")


class Quiz(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "quizzes"

    topic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    lesson_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(512), nullable=False)
    questions_json: Mapped[list] = mapped_column(JSON, nullable=False)
    time_limit_seconds: Mapped[int | None] = mapped_column(Integer, nullable=True)
    passing_score: Mapped[int] = mapped_column(Integer, default=70)
    version: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[QuizStatus] = mapped_column(Enum(QuizStatus), default=QuizStatus.draft)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    topic: Mapped[Topic] = relationship("Topic", back_populates="quizzes")
    lesson: Mapped[Lesson | None] = relationship("Lesson", back_populates="quizzes")
    progress: Mapped[list[UserProgress]] = relationship("UserProgress", back_populates="quiz", lazy="selectin")


class PracticeQuestion(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "practice_questions"

    topic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    lesson_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=True)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    question_type: Mapped[QuestionType] = mapped_column(Enum(QuestionType), nullable=False)
    options: Mapped[list | None] = mapped_column(JSON, nullable=True)
    correct_answer: Mapped[str] = mapped_column(Text, nullable=False)
    explanation: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[Difficulty] = mapped_column(Enum(Difficulty), default=Difficulty.beginner)
    hints: Mapped[list | None] = mapped_column(JSON, nullable=True)

    topic: Mapped[Topic] = relationship("Topic", back_populates="practice_questions")
    lesson: Mapped[Lesson | None] = relationship("Lesson", back_populates="practice_questions")


class Flashcard(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "flashcards"

    topic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    lesson_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=True)
    front: Mapped[str] = mapped_column(Text, nullable=False)
    back: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[Difficulty] = mapped_column(Enum(Difficulty), default=Difficulty.beginner)
    tags: Mapped[list | None] = mapped_column(JSON, nullable=True)

    topic: Mapped[Topic] = relationship("Topic", back_populates="flashcards")
    lesson: Mapped[Lesson | None] = relationship("Lesson", back_populates="flashcards")
    user_states: Mapped[list[UserFlashcardState]] = relationship("UserFlashcardState", back_populates="flashcard", lazy="selectin")


class AudioNarration(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "audio_narrations"

    lesson_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=False)
    script_text: Mapped[str] = mapped_column(Text, nullable=False)
    audio_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    duration_seconds: Mapped[float] = mapped_column(Float, default=0.0)
    voice_id: Mapped[str] = mapped_column(String(100), nullable=False)
    language: Mapped[str] = mapped_column(String(10), default="en")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    lesson: Mapped[Lesson] = relationship("Lesson", back_populates="audio_narrations")


class UserProgress(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "user_progress"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    topic_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("topics.id"), nullable=False)
    lesson_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("lessons.id"), nullable=True)
    quiz_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("quizzes.id"), nullable=True)
    progress_type: Mapped[ProgressType] = mapped_column(Enum(ProgressType), nullable=False)
    score: Mapped[float | None] = mapped_column(Float, nullable=True)
    time_spent_seconds: Mapped[int] = mapped_column(Integer, default=0)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship("User", back_populates="progress")
    topic: Mapped[Topic] = relationship("Topic", back_populates="progress")
    lesson: Mapped[Lesson | None] = relationship("Lesson", back_populates="progress")
    quiz: Mapped[Quiz | None] = relationship("Quiz", back_populates="progress")


class UserFlashcardState(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "user_flashcard_states"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    flashcard_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("flashcards.id"), nullable=False)
    ease_factor: Mapped[float] = mapped_column(Float, default=2.5)
    interval_days: Mapped[int] = mapped_column(Integer, default=1)
    repetitions: Mapped[int] = mapped_column(Integer, default=0)
    next_review_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[User] = relationship("User", back_populates="flashcard_states")
    flashcard: Mapped[Flashcard] = relationship("Flashcard", back_populates="user_states")


class Payment(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "payments"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    amount_kes: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="KES")
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), default=PaymentStatus.pending)
    payment_method: Mapped[PaymentMethod] = mapped_column(Enum(PaymentMethod), default=PaymentMethod.mpesa)
    transaction_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    mpesa_receipt: Mapped[str | None] = mapped_column(String(255), nullable=True)
    valid_until: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user: Mapped[User] = relationship("User", back_populates="payments")
    subscriptions: Mapped[list[Subscription]] = relationship("Subscription", back_populates="payment", lazy="selectin")


class Subscription(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "subscriptions"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    payment_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("payments.id"), nullable=False)
    plan: Mapped[str] = mapped_column(String(50), default="annual")
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped[User] = relationship("User", back_populates="subscriptions")
    payment: Mapped[Payment] = relationship("Payment", back_populates="subscriptions")
