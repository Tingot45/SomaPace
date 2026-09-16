from __future__ import annotations

import uuid as _uuid

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user, require_role
from app.database import get_db
from app.models import (
    Flashcard,
    Lesson,
    LessonStatus,
    Material,
    PracticeQuestion,
    Quiz,
    Subject,
    Topic,
    User,
    UserRole,
)
from app.schemas import (
    FlashcardResponse,
    LessonResponse,
    PracticeQuestionResponse,
    QuizResponse,
    TopicResponse,
)
from app.services.worker import enqueue_topic_generation

router = APIRouter(prefix="/api/topics", tags=["content"])


@router.get("", response_model=list[TopicResponse])
async def list_topics(
    grade: int | None = Query(None, ge=4, le=10),
    subject_id: _uuid.UUID | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TopicResponse]:
    stmt = select(Topic).join(Subject, Topic.subject_id == Subject.id)
    if grade is not None:
        stmt = stmt.join(Material, Topic.material_id == Material.id).where(Material.grade == grade)
    if subject_id is not None:
        stmt = stmt.where(Topic.subject_id == subject_id)
    stmt = stmt.order_by(Topic.order_index.asc())
    result = await db.execute(stmt)
    return [TopicResponse.model_validate(t) for t in result.scalars().all()]


@router.get("/{topic_id}", response_model=TopicResponse)
async def get_topic(
    topic_id: _uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TopicResponse:
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    return TopicResponse.model_validate(topic)


@router.get("/{topic_id}/lesson", response_model=LessonResponse)
async def get_topic_lesson(
    topic_id: _uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> LessonResponse:
    result = await db.execute(
        select(Lesson)
        .where(Lesson.topic_id == topic_id)
        .where(Lesson.status.in_([LessonStatus.approved, LessonStatus.published]))
        .order_by(Lesson.version.desc())
        .limit(1)
    )
    lesson = result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(status_code=404, detail="No approved lesson for this topic")
    return LessonResponse.model_validate(lesson)


@router.get("/{topic_id}/quiz", response_model=QuizResponse)
async def get_topic_quiz(
    topic_id: _uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> QuizResponse:
    result = await db.execute(
        select(Quiz)
        .where(Quiz.topic_id == topic_id)
        .where(Quiz.status.in_(["approved", "published"]))
        .order_by(Quiz.version.desc())
        .limit(1)
    )
    quiz = result.scalar_one_or_none()
    if quiz is None:
        raise HTTPException(status_code=404, detail="No quiz available for this topic")
    return QuizResponse.model_validate(quiz)


@router.get("/{topic_id}/flashcards", response_model=list[FlashcardResponse])
async def get_topic_flashcards(
    topic_id: _uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[FlashcardResponse]:
    result = await db.execute(select(Flashcard).where(Flashcard.topic_id == topic_id))
    return [FlashcardResponse.model_validate(f) for f in result.scalars().all()]


@router.get("/{topic_id}/practice", response_model=list[PracticeQuestionResponse])
async def get_topic_practice(
    topic_id: _uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[PracticeQuestionResponse]:
    result = await db.execute(
        select(PracticeQuestion)
        .where(PracticeQuestion.topic_id == topic_id)
        .order_by(PracticeQuestion.difficulty)
    )
    return [PracticeQuestionResponse.model_validate(p) for p in result.scalars().all()]


@router.post("/{topic_id}/generate", status_code=202)
async def generate_topic_content(
    topic_id: _uuid.UUID,
    current_user: User = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(select(Topic).where(Topic.id == topic_id))
    topic = result.scalar_one_or_none()
    if topic is None:
        raise HTTPException(status_code=404, detail="Topic not found")
    await enqueue_topic_generation(str(topic_id))
    return {"message": "Content generation queued", "topic_id": str(topic_id)}