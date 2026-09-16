from __future__ import annotations

import uuid as _uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import require_role
from app.database import get_db
from app.models import (
    Lesson,
    LessonStatus,
    Material,
    MaterialStatus,
    Payment,
    PaymentStatus,
    Quiz,
    Subscription,
    Topic,
    User,
    UserProgress,
    UserRole,
)
from app.schemas import (
    AdminAnalytics,
    AdminDashboardStats,
    ContentReviewAction,
    GenerationQueueItem,
    LessonEditRequest,
    LessonResponse,
)

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(require_role(UserRole.admin))],
)


@router.get("/dashboard", response_model=AdminDashboardStats)
async def admin_dashboard(db: AsyncSession = Depends(get_db)) -> AdminDashboardStats:
    total_users = (await db.execute(select(func.count(User.id)))).scalar_one()
    total_materials = (await db.execute(select(func.count(Material.id)))).scalar_one()
    total_lessons = (await db.execute(select(func.count(Lesson.id)))).scalar_one()
    total_revenue = (
        await db.execute(select(func.coalesce(func.sum(Payment.amount_kes), 0)).where(Payment.status == PaymentStatus.completed))
    ).scalar_one()
    active_subs = (
        await db.execute(select(func.count(Subscription.id)).where(Subscription.is_active.is_(True)))
    ).scalar_one()
    pending_materials = (
        await db.execute(select(func.count(Material.id)).where(Material.status.in_([MaterialStatus.pending, MaterialStatus.processing])))
    ).scalar_one()
    pending_lessons = (
        await db.execute(select(func.count(Lesson.id)).where(Lesson.status.in_([LessonStatus.draft, LessonStatus.pending_review])))
    ).scalar_one()

    return AdminDashboardStats(
        total_users=total_users,
        total_materials=total_materials,
        total_lessons_generated=total_lessons,
        total_revenue_kes=float(total_revenue or 0),
        active_subscriptions=active_subs,
        pending_materials=pending_materials,
        pending_lessons=pending_lessons,
    )


@router.get("/analytics", response_model=AdminAnalytics)
async def admin_analytics(db: AsyncSession = Depends(get_db)) -> AdminAnalytics:
    most_viewed_rows = await db.execute(
        select(Lesson.title, func.count(UserProgress.id).label("views"))
        .join(UserProgress, UserProgress.lesson_id == Lesson.id)
        .group_by(Lesson.id, Lesson.title)
        .order_by(func.count(UserProgress.id).desc())
        .limit(10)
    )
    most_viewed = [{"title": r[0], "views": r[1]} for r in most_viewed_rows.all()]

    dropout_rows = await db.execute(
        select(Topic.title, func.count(UserProgress.id).label("starts"))
        .join(UserProgress, UserProgress.topic_id == Topic.id)
        .group_by(Topic.id, Topic.title)
        .order_by(func.count(UserProgress.id).desc())
        .limit(10)
    )
    dropout = [{"topic": r[0], "lesson_views": r[1]} for r in dropout_rows.all()]

    pass_rate_rows = await db.execute(
        select(Quiz.title, func.avg(UserProgress.score).label("avg_score"))
        .join(UserProgress, UserProgress.quiz_id == Quiz.id)
        .where(UserProgress.progress_type == "quiz_attempt")
        .group_by(Quiz.id, Quiz.title)
        .limit(10)
    )
    pass_rates = [{"quiz": r[0], "avg_score": round(float(r[1] or 0), 2)} for r in pass_rate_rows.all()]

    return AdminAnalytics(
        most_viewed_lessons=most_viewed,
        dropout_points=dropout,
        quiz_pass_rates=pass_rates,
    )


@router.post("/lessons/{lesson_id}/approve", response_model=LessonResponse)
async def approve_lesson(
    lesson_id: _uuid.UUID,
    db: AsyncSession = Depends(get_db),
) -> LessonResponse:
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    lesson.status = LessonStatus.approved
    await db.flush()
    await db.refresh(lesson)
    return LessonResponse.model_validate(lesson)


@router.post("/lessons/{lesson_id}/reject", response_model=LessonResponse)
async def reject_lesson(
    lesson_id: _uuid.UUID,
    body: ContentReviewAction,
    db: AsyncSession = Depends(get_db),
) -> LessonResponse:
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    lesson.status = LessonStatus.rejected
    if body.reason:
        lesson.content_json = {**lesson.content_json, "rejection_reason": body.reason}
    await db.flush()
    await db.refresh(lesson)
    return LessonResponse.model_validate(lesson)


@router.put("/lessons/{lesson_id}/edit", response_model=LessonResponse)
async def edit_lesson(
    lesson_id: _uuid.UUID,
    body: LessonEditRequest,
    db: AsyncSession = Depends(get_db),
) -> LessonResponse:
    result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
    lesson = result.scalar_one_or_none()
    if lesson is None:
        raise HTTPException(status_code=404, detail="Lesson not found")
    if body.title is not None:
        lesson.title = body.title
    if body.content_json is not None:
        lesson.content_json = body.content_json
    lesson.version += 1
    lesson.status = LessonStatus.draft
    await db.flush()
    await db.refresh(lesson)
    return LessonResponse.model_validate(lesson)


@router.get("/generation-queue", response_model=list[GenerationQueueItem])
async def generation_queue(db: AsyncSession = Depends(get_db)) -> list[GenerationQueueItem]:
    result = await db.execute(
        select(Topic)
        .join(Lesson, Lesson.topic_id == Topic.id)
        .where(Lesson.status.in_([LessonStatus.draft, LessonStatus.pending_review]))
        .distinct()
        .limit(50)
    )
    items = []
    for topic in result.scalars().all():
        items.append(
            GenerationQueueItem(
                topic_id=topic.id,
                title=topic.title,
                status="queued",
                created_at=topic.material.created_at if topic.material else None,
            )
        )
    return items