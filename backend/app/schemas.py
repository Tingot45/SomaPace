from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.utils.validators import validate_grade, validate_phone_ke


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class UserCreate(BaseModel):
    phone_number: str
    password: str = Field(min_length=6, max_length=128)
    full_name: str = Field(min_length=1, max_length=255)
    grade: int

    @field_validator("phone_number")
    @classmethod
    def check_phone(cls, v: str) -> str:
        return validate_phone_ke(v)

    @field_validator("grade")
    @classmethod
    def check_grade(cls, v: int) -> int:
        return validate_grade(v)


class UserLogin(BaseModel):
    phone_number: str
    password: str

    @field_validator("phone_number")
    @classmethod
    def check_phone(cls, v: str) -> str:
        return validate_phone_ke(v)


class UserResponse(BaseModel):
    id: UUID
    phone_number: str
    email: str | None = None
    full_name: str
    grade: int
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    email: str | None = None
    full_name: str | None = None
    grade: int | None = None

    @field_validator("grade")
    @classmethod
    def check_grade(cls, v: int | None) -> int | None:
        if v is not None:
            return validate_grade(v)
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ---------------------------------------------------------------------------
# Materials
# ---------------------------------------------------------------------------

class MaterialUploadResponse(BaseModel):
    id: UUID
    source_filename: str
    file_type: str
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MaterialStatusResponse(BaseModel):
    id: UUID
    source_filename: str
    status: str
    grade: int
    subject_id: UUID
    created_at: datetime
    processed_at: datetime | None = None

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Content
# ---------------------------------------------------------------------------

class TopicResponse(BaseModel):
    id: UUID
    material_id: UUID
    subject_id: UUID
    title: str
    subtopics: list[Any] | None = None
    difficulty: str
    order_index: int

    model_config = {"from_attributes": True}


class LessonResponse(BaseModel):
    id: UUID
    topic_id: UUID
    title: str
    content_json: dict
    word_count: int
    reading_level: float
    version: int
    status: str
    generated_by: str
    created_at: datetime
    published_at: datetime | None = None

    model_config = {"from_attributes": True}


class QuizResponse(BaseModel):
    id: UUID
    topic_id: UUID
    lesson_id: UUID | None = None
    title: str
    questions_json: list[dict]
    time_limit_seconds: int | None = None
    passing_score: int
    version: int
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}


class FlashcardResponse(BaseModel):
    id: UUID
    topic_id: UUID
    lesson_id: UUID | None = None
    front: str
    back: str
    difficulty: str
    tags: list[str] | None = None

    model_config = {"from_attributes": True}


class PracticeQuestionResponse(BaseModel):
    id: UUID
    topic_id: UUID
    lesson_id: UUID | None = None
    question_text: str
    question_type: str
    options: list[str] | None = None
    correct_answer: str
    explanation: str
    difficulty: str
    hints: list[str] | None = None

    model_config = {"from_attributes": True}


class AudioNarrationResponse(BaseModel):
    id: UUID
    lesson_id: UUID
    script_text: str
    audio_url: str
    duration_seconds: float
    voice_id: str
    language: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Student
# ---------------------------------------------------------------------------

class OnboardingRequest(BaseModel):
    grade: int
    subjects: list[UUID]

    @field_validator("grade")
    @classmethod
    def check_grade(cls, v: int) -> int:
        return validate_grade(v)


class DiagnosticAnswer(BaseModel):
    question_id: str
    selected_index: int
    is_correct: bool


class DiagnosticQuizRequest(BaseModel):
    grade: int
    subject_ids: list[UUID]
    answers: list[DiagnosticAnswer]

    @field_validator("grade")
    @classmethod
    def check_grade(cls, v: int) -> int:
        return validate_grade(v)


class DiagnosticResult(BaseModel):
    overall_level: str
    subject_levels: dict[str, str]
    recommended_topics: list[UUID]
    weak_areas: list[str]


class UserProgressCreate(BaseModel):
    topic_id: UUID
    lesson_id: UUID | None = None
    quiz_id: UUID | None = None
    progress_type: str
    score: float | None = None
    time_spent_seconds: int = 0


class UserProgressResponse(BaseModel):
    id: UUID
    user_id: UUID
    topic_id: UUID
    lesson_id: UUID | None = None
    quiz_id: UUID | None = None
    progress_type: str
    score: float | None = None
    time_spent_seconds: int
    completed_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserFlashcardStateUpdate(BaseModel):
    quality: int = Field(ge=0, le=5, description="SM-2 quality rating 0-5")


class FlashcardReviewResponse(BaseModel):
    flashcard: FlashcardResponse
    state: dict[str, Any] | None = None
    next_review_at: datetime | None = None


class DashboardResponse(BaseModel):
    streak_days: int
    total_topics_completed: int
    recommended_topics: list[TopicResponse]
    weak_areas: list[str]
    recent_progress: list[UserProgressResponse]
    cards_due_for_review: int


# ---------------------------------------------------------------------------
# Payments
# ---------------------------------------------------------------------------

class PaymentInitRequest(BaseModel):
    phone_number: str
    amount_kes: Decimal = Field(gt=0, decimal_places=2)

    @field_validator("phone_number")
    @classmethod
    def check_phone(cls, v: str) -> str:
        return validate_phone_ke(v)


class PaymentStatusResponse(BaseModel):
    id: UUID
    status: str
    amount_kes: Decimal
    currency: str
    mpesa_receipt: str | None = None
    created_at: datetime
    completed_at: datetime | None = None

    model_config = {"from_attributes": True}


class MpesaCallbackPayload(BaseModel):
    Body: dict[str, Any]


class SubscriptionResponse(BaseModel):
    id: UUID
    plan: str
    start_date: datetime
    end_date: datetime
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------

class AdminDashboardStats(BaseModel):
    total_users: int
    total_materials: int
    total_lessons_generated: int
    total_revenue_kes: float
    active_subscriptions: int
    pending_materials: int
    pending_lessons: int


class AdminAnalytics(BaseModel):
    most_viewed_lessons: list[dict[str, Any]]
    dropout_points: list[dict[str, Any]]
    quiz_pass_rates: list[dict[str, Any]]


class ContentReviewAction(BaseModel):
    reason: str | None = None


class LessonEditRequest(BaseModel):
    content_json: dict | None = None
    title: str | None = None


class GenerationQueueItem(BaseModel):
    topic_id: UUID
    title: str
    status: str
    created_at: datetime
