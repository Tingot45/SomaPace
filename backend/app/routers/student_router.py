from __future__ import annotations

import uuid as _uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user
from app.database import get_db
from app.models import (
    Flashcard,
    ProgressType,
    Topic,
    User,
    UserFlashcardState,
    UserProgress,
)
from app.schemas import (
    DashboardResponse,
    DiagnosticQuizRequest,
    DiagnosticResult,
    FlashcardReviewResponse,
    FlashcardResponse,
    OnboardingRequest,
    TopicResponse,
    UserFlashcardStateUpdate,
    UserProgressCreate,
    UserProgressResponse,
)
from app.services.spaced_repetition import get_due_cards, update_card_state

router = APIRouter(prefix="/api", dependencies=[Depends(get_current_user)], tags=["student"])


async def _calculate_streak(user_id: _uuid.UUID, db: AsyncSession) -> int:
    result = await db.execute(
        select(func.date(UserProgress.created_at))
        .where(UserProgress.user_id == user_id)
        .distinct()
        .order_by(func.date(UserProgress.created_at).desc())
    )
    days = [r[0] for r in result.all()]
    if not days:
        return 0
    streak = 1
    current = days[0]
    seen = {d for d in days}
    while (current - timedelta(days=1)) in seen:
        streak += 1
        current = current - timedelta(days=1)
    return streak


@router.post("/onboarding", status_code=200)
async def onboarding(
    body: OnboardingRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> dict:
    current_user.grade = body.grade
    await db.flush()
    result = await db.execute(select(Topic).where(Topic.subject_id.in_(body.subjects)))
    topics = result.scalars().all()
    return {"message": "Onboarding complete", "topics_available": len(topics), "subjects": [str(s) for s in body.subjects]}


@router.post("/diagnostic", response_model=DiagnosticResult)
async def diagnostic(
    body: DiagnosticQuizRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DiagnosticResult:
    if not body.answers:
        raise HTTPException(status_code=400, detail="No answers provided")

    correct = sum(1 for a in body.answers if a.is_correct)
    pct = correct / len(body.answers)
    if pct >= 0.85:
        overall = "advanced"
    elif pct >= 0.65:
        overall = "proficient"
    elif pct >= 0.45:
        overall = "developing"
    else:
        overall = "beginner"

    subject_levels: dict[str, str] = {}
    for sid in body.subject_ids:
        subject_levels[str(sid)] = overall

    result = await db.execute(select(Topic).limit(5))
    recommended = [t.id for t in result.scalars().all()]

    weak_areas: list[str] = ["fractions", "reading-comprehension"] if overall in ("beginner", "developing") else []

    return DiagnosticResult(
        overall_level=overall,
        subject_levels=subject_levels,
        recommended_topics=recommended,
        weak_areas=weak_areas,
    )


@router.get("/dashboard", response_model=DashboardResponse)
async def dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> DashboardResponse:
    streak = await _calculate_streak(current_user.id, db)

    completed = await db.execute(
        select(func.count())
        .select_from(UserProgress)
        .where(UserProgress.user_id == current_user.id)
        .where(UserProgress.progress_type.in_([ProgressType.lesson_complete, ProgressType.quiz_attempt]))
    )
    total_completed = completed.scalar_one() or 0

    result = await db.execute(select(Topic).order_by(Topic.order_index).limit(5))
    topics = result.scalars().all()

    weak = await db.execute(
        select(Topic)
        .join(UserProgress, UserProgress.topic_id == Topic.id)
        .where(UserProgress.user_id == current_user.id)
        .group_by(Topic.id)
        .having(func.avg(UserProgress.score) < 60)
        .limit(5)
    )
    weak_topics = weak.scalars().all()
    weak_areas = [t.title for t in weak_topics]

    recent = await db.execute(
        select(UserProgress)
        .where(UserProgress.user_id == current_user.id)
        .order_by(UserProgress.created_at.desc())
        .limit(10)
    )
    recent_progress = recent.scalars().all()

    due = await get_due_cards(current_user.id, db, limit=50)

    return DashboardResponse(
        streak_days=streak,
        total_topics_completed=total_completed,
        recommended_topics=[TopicResponse.model_validate(t) for t in topics],
        weak_areas=weak_areas,
        recent_progress=[UserProgressResponse.model_validate(p) for p in recent_progress],
        cards_due_for_review=len(due),
    )


@router.post("/progress", response_model=UserProgressResponse, status_code=201)
async def record_progress(
    body: UserProgressCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserProgressResponse:
    try:
        progress_type = ProgressType(body.progress_type)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid progress_type: {body.progress_type}") from exc
    progress = UserProgress(
        user_id=current_user.id,
        topic_id=body.topic_id,
        lesson_id=body.lesson_id,
        quiz_id=body.quiz_id,
        progress_type=progress_type,
        score=body.score,
        time_spent_seconds=body.time_spent_seconds,
        completed_at=datetime.now(timezone.utc) if progress_type == ProgressType.lesson_complete or progress_type == ProgressType.quiz_attempt else None,
    )
    db.add(progress)
    await db.flush()
    await db.refresh(progress)
    return UserProgressResponse.model_validate(progress)


@router.get("/progress", response_model=list[UserProgressResponse])
async def get_progress(
    topic_id: _uuid.UUID | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[UserProgressResponse]:
    stmt = select(UserProgress).where(UserProgress.user_id == current_user.id)
    if topic_id is not None:
        stmt = stmt.where(UserProgress.topic_id == topic_id)
    stmt = stmt.order_by(UserProgress.created_at.desc())
    result = await db.execute(stmt)
    return [UserProgressResponse.model_validate(p) for p in result.scalars().all()]


@router.get("/flashcards/review", response_model=list[FlashcardReviewResponse])
async def flashcards_review(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[FlashcardReviewResponse]:
    due = await get_due_cards(current_user.id, db, limit=20)
    out = []
    for card in due:
        state_result = await db.execute(
            select(UserFlashcardState).where(
                UserFlashcardState.user_id == current_user.id,
                UserFlashcardState.flashcard_id == card.id,
            )
        )
        state = state_result.scalar_one_or_none()
        out.append(
            FlashcardReviewResponse(
                flashcard=FlashcardResponse.model_validate(card),
                state={"ease_factor": state.ease_factor, "interval_days": state.interval_days, "repetitions": state.repetitions} if state else None,
                next_review_at=state.next_review_at if state else None,
            )
        )
    return out


@router.post("/flashcards/{flashcard_id}/review", response_model=FlashcardReviewResponse)
async def flashcards_review_update(
    flashcard_id: _uuid.UUID,
    body: UserFlashcardStateUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> FlashcardReviewResponse:
    result = await db.execute(select(Flashcard).where(Flashcard.id == flashcard_id))
    card = result.scalar_one_or_none()
    if card is None:
        raise HTTPException(status_code=404, detail="Flashcard not found")

    await update_card_state(current_user.id, flashcard_id, body.quality, db)
    state_result = await db.execute(
        select(UserFlashcardState).where(
            UserFlashcardState.user_id == current_user.id,
            UserFlashcardState.flashcard_id == flashcard_id,
        )
    )
    state = state_result.scalar_one()

    return FlashcardReviewResponse(
        flashcard=FlashcardResponse.model_validate(card),
        state={"ease_factor": state.ease_factor, "interval_days": state.interval_days, "repetitions": state.repetitions},
        next_review_at=state.next_review_at,
    )