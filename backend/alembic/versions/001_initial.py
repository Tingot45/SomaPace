"""initial tables with pgvector

Revision ID: 001_initial
Revises:
Create Date: 2026-09-14

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSON
from pgvector.sqlalchemy import Vector

revision: str = "001_initial"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    role_enum = sa.Enum("student", "parent", "admin", name="userrole")
    role_enum.create(op.get_bind(), checkfirst=True)

    material_status_enum = sa.Enum("pending", "processing", "processed", "failed", "rejected", name="materialstatus")
    material_status_enum.create(op.get_bind(), checkfirst=True)

    difficulty_enum = sa.Enum("beginner", "intermediate", "advanced", name="difficulty")
    difficulty_enum.create(op.get_bind(), checkfirst=True)

    lesson_status_enum = sa.Enum("draft", "pending_review", "approved", "published", "rejected", name="lessonstatus")
    lesson_status_enum.create(op.get_bind(), checkfirst=True)

    quiz_status_enum = sa.Enum("draft", "pending_review", "approved", "published", "rejected", name="quizstatus")
    quiz_status_enum.create(op.get_bind(), checkfirst=True)

    question_type_enum = sa.Enum("multiple_choice", "short_answer", "true_false", name="questiontype")
    question_type_enum.create(op.get_bind(), checkfirst=True)

    progress_type_enum = sa.Enum(
        "lesson_view", "lesson_complete", "quiz_attempt", "flashcard_review", "practice_attempt",
        name="progresstype",
    )
    progress_type_enum.create(op.get_bind(), checkfirst=True)

    payment_status_enum = sa.Enum("pending", "processing", "completed", "failed", "refunded", name="paymentstatus")
    payment_status_enum.create(op.get_bind(), checkfirst=True)

    payment_method_enum = sa.Enum("mpesa", "airtel_money", "card", name="paymentmethod")
    payment_method_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("phone_number", sa.String(20), unique=True, nullable=False),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("grade", sa.Integer, nullable=False),
        sa.Column("role", role_enum, nullable=False, server_default="student"),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("is_active", sa.Boolean, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "subjects",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(255), unique=True, nullable=False),
        sa.Column("curriculum", sa.String(100), server_default="CBC-Kenya"),
        sa.Column("is_active", sa.Boolean, server_default=sa.text("true")),
    )

    op.create_table(
        "materials",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("source_filename", sa.String(512), nullable=False),
        sa.Column("storage_path", sa.String(1024), nullable=False),
        sa.Column("file_type", sa.String(20), nullable=False),
        sa.Column("file_size_bytes", sa.Integer, nullable=False),
        sa.Column("uploaded_by", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("status", material_status_enum, nullable=False, server_default="pending"),
        sa.Column("raw_text", sa.Text, nullable=True),
        sa.Column("extracted_json", JSON, nullable=True),
        sa.Column("grade", sa.Integer, nullable=False),
        sa.Column("subject_id", UUID(as_uuid=True), sa.ForeignKey("subjects.id"), nullable=False),
        sa.Column("checksum_sha256", sa.String(64), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("processed_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "topics",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("material_id", UUID(as_uuid=True), sa.ForeignKey("materials.id"), nullable=False),
        sa.Column("subject_id", UUID(as_uuid=True), sa.ForeignKey("subjects.id"), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("subtopics", JSON, nullable=True),
        sa.Column("difficulty", difficulty_enum, nullable=False, server_default="beginner"),
        sa.Column("order_index", sa.Integer, server_default=sa.text("0")),
    )

    op.create_table(
        "chunks",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("topic_id", UUID(as_uuid=True), sa.ForeignKey("topics.id"), nullable=False),
        sa.Column("material_id", UUID(as_uuid=True), sa.ForeignKey("materials.id"), nullable=False),
        sa.Column("text", sa.Text, nullable=False),
        sa.Column("page_number", sa.Integer, nullable=True),
        sa.Column("keywords", JSON, nullable=True),
        sa.Column("embedding_id", sa.String(255), nullable=True),
        sa.Column("token_count", sa.Integer, server_default=sa.text("0")),
        sa.Column("embedding", Vector(768), nullable=True),
    )

    op.create_table(
        "lessons",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("topic_id", UUID(as_uuid=True), sa.ForeignKey("topics.id"), nullable=False),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("content_json", JSON, nullable=False),
        sa.Column("word_count", sa.Integer, server_default=sa.text("0")),
        sa.Column("reading_level", sa.Float, server_default=sa.text("0.0")),
        sa.Column("version", sa.Integer, server_default=sa.text("1")),
        sa.Column("status", lesson_status_enum, nullable=False, server_default="draft"),
        sa.Column("generated_by", sa.String(100), server_default="gemini"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "quizzes",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("topic_id", UUID(as_uuid=True), sa.ForeignKey("topics.id"), nullable=False),
        sa.Column("lesson_id", UUID(as_uuid=True), sa.ForeignKey("lessons.id"), nullable=True),
        sa.Column("title", sa.String(512), nullable=False),
        sa.Column("questions_json", JSON, nullable=False),
        sa.Column("time_limit_seconds", sa.Integer, nullable=True),
        sa.Column("passing_score", sa.Integer, server_default=sa.text("70")),
        sa.Column("version", sa.Integer, server_default=sa.text("1")),
        sa.Column("status", quiz_status_enum, nullable=False, server_default="draft"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "practice_questions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("topic_id", UUID(as_uuid=True), sa.ForeignKey("topics.id"), nullable=False),
        sa.Column("lesson_id", UUID(as_uuid=True), sa.ForeignKey("lessons.id"), nullable=True),
        sa.Column("question_text", sa.Text, nullable=False),
        sa.Column("question_type", question_type_enum, nullable=False),
        sa.Column("options", JSON, nullable=True),
        sa.Column("correct_answer", sa.Text, nullable=False),
        sa.Column("explanation", sa.Text, nullable=False),
        sa.Column("difficulty", difficulty_enum, nullable=False, server_default="beginner"),
        sa.Column("hints", JSON, nullable=True),
    )

    op.create_table(
        "flashcards",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("topic_id", UUID(as_uuid=True), sa.ForeignKey("topics.id"), nullable=False),
        sa.Column("lesson_id", UUID(as_uuid=True), sa.ForeignKey("lessons.id"), nullable=True),
        sa.Column("front", sa.Text, nullable=False),
        sa.Column("back", sa.Text, nullable=False),
        sa.Column("difficulty", difficulty_enum, nullable=False, server_default="beginner"),
        sa.Column("tags", JSON, nullable=True),
    )

    op.create_table(
        "audio_narrations",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("lesson_id", UUID(as_uuid=True), sa.ForeignKey("lessons.id"), nullable=False),
        sa.Column("script_text", sa.Text, nullable=False),
        sa.Column("audio_url", sa.String(1024), nullable=False),
        sa.Column("duration_seconds", sa.Float, server_default=sa.text("0.0")),
        sa.Column("voice_id", sa.String(100), nullable=False),
        sa.Column("language", sa.String(10), server_default="en"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "user_progress",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("topic_id", UUID(as_uuid=True), sa.ForeignKey("topics.id"), nullable=False),
        sa.Column("lesson_id", UUID(as_uuid=True), sa.ForeignKey("lessons.id"), nullable=True),
        sa.Column("quiz_id", UUID(as_uuid=True), sa.ForeignKey("quizzes.id"), nullable=True),
        sa.Column("progress_type", progress_type_enum, nullable=False),
        sa.Column("score", sa.Float, nullable=True),
        sa.Column("time_spent_seconds", sa.Integer, server_default=sa.text("0")),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "user_flashcard_states",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("flashcard_id", UUID(as_uuid=True), sa.ForeignKey("flashcards.id"), nullable=False),
        sa.Column("ease_factor", sa.Float, server_default=sa.text("2.5")),
        sa.Column("interval_days", sa.Integer, server_default=sa.text("1")),
        sa.Column("repetitions", sa.Integer, server_default=sa.text("0")),
        sa.Column("next_review_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("last_reviewed_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "payments",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("amount_kes", sa.Numeric(10, 2), nullable=False),
        sa.Column("currency", sa.String(10), server_default="KES"),
        sa.Column("status", payment_status_enum, nullable=False, server_default="pending"),
        sa.Column("payment_method", payment_method_enum, nullable=False, server_default="mpesa"),
        sa.Column("transaction_id", sa.String(255), nullable=True),
        sa.Column("mpesa_receipt", sa.String(255), nullable=True),
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "subscriptions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("payment_id", UUID(as_uuid=True), sa.ForeignKey("payments.id"), nullable=False),
        sa.Column("plan", sa.String(50), server_default="annual"),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_active", sa.Boolean, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_index("ix_user_progress_user_topic", "user_progress", ["user_id", "topic_id"])
    op.create_index("ix_user_flashcard_states_user", "user_flashcard_states", ["user_id"])
    op.create_index("ix_payments_user", "payments", ["user_id"])
    op.create_index(
        "ix_chunks_embedding",
        "chunks",
        ["embedding vector_cosine_ops"],
        postgresql_using="ivfflat",
        postgresql_with={"lists": 100},
    )


def downgrade() -> None:
    op.drop_table("subscriptions")
    op.drop_table("payments")
    op.drop_table("user_flashcard_states")
    op.drop_table("user_progress")
    op.drop_table("audio_narrations")
    op.drop_table("flashcards")
    op.drop_table("practice_questions")
    op.drop_table("quizzes")
    op.drop_table("lessons")
    op.drop_table("chunks")
    op.drop_table("topics")
    op.drop_table("materials")
    op.drop_table("subjects")
    op.drop_table("users")

    sa.Enum(name="paymentmethod").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="paymentstatus").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="progresstype").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="questiontype").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="quizstatus").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="lessonstatus").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="difficulty").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="materialstatus").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="userrole").drop(op.get_bind(), checkfirst=True)
