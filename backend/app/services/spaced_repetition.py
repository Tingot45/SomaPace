from __future__ import annotations

import logging
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Flashcard, UserFlashcardState

logger = logging.getLogger(__name__)


def calculate_next_review(
    ease_factor: float,
    interval_days: int,
    repetitions: int,
    quality: int,
) -> tuple[float, int, int, datetime]:
    """SM-2 algorithm implementation.

    Args:
        ease_factor: Current ease factor (default 2.5)
        interval_days: Current interval in days
        repetitions: Number of successful repetitions
        quality: Quality of response (0-5)
            0 = complete blackout
            1 = incorrect; remembered upon seeing the answer
            2 = incorrect; correct answer seemed easy to recall
            3 = correct; recalled with serious difficulty
            4 = correct; recalled with some hesitation
            5 = perfect response

    Returns:
        (new_ease_factor, new_interval_days, new_repetitions, next_review_at)
    """
    if quality < 0 or quality > 5:
        raise ValueError("Quality must be between 0 and 5")

    if quality < 3:
        new_repetitions = 0
        new_interval = 1
    else:
        if repetitions == 0:
            new_interval = 1
        elif repetitions == 1:
            new_interval = 6
        else:
            new_interval = round(interval_days * ease_factor)
        new_repetitions = repetitions + 1

    new_ef = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    new_ef = max(1.3, new_ef)

    next_review = datetime.now(timezone.utc) + timedelta(days=new_interval)
    return new_ef, new_interval, new_repetitions, next_review


async def get_due_cards(user_id, db: AsyncSession, limit: int = 20) -> list:
    """Get flashcards due for review by a user.

    Returns flashcards where next_review_at <= now or the card has never been reviewed.
    """
    now = datetime.now(timezone.utc)
    stmt = (
        select(Flashcard)
        .join(UserFlashcardState, UserFlashcardState.flashcard_id == Flashcard.id, isouter=True)
        .where(
            (UserFlashcardState.user_id == user_id) | (UserFlashcardState.id.is_(None))
        )
        .where(
            (UserFlashcardState.next_review_at <= now) | (UserFlashcardState.id.is_(None))
        )
        .limit(limit)
    )
    result = await db.execute(stmt)
    due_cards = result.scalars().all()

    if len(due_cards) < limit:
        unreviewed_stmt = (
            select(Flashcard)
            .where(~Flashcard.id.in_(select(UserFlashcardState.flashcard_id).where(UserFlashcardState.user_id == user_id)))
            .limit(limit - len(due_cards))
        )
        extra = await db.execute(unreviewed_stmt)
        due_cards = list(due_cards) + list(extra.scalars().all())

    return due_cards[:limit]


async def update_card_state(
    user_id,
    flashcard_id,
    quality: int,
    db: AsyncSession,
) -> UserFlashcardState:
    """Update the spaced repetition state for a flashcard after review."""
    result = await db.execute(
        select(UserFlashcardState).where(
            UserFlashcardState.user_id == user_id,
            UserFlashcardState.flashcard_id == flashcard_id,
        )
    )
    state = result.scalar_one_or_none()

    if state is None:
        new_ef, new_interval, new_reps, next_review = calculate_next_review(
            2.5, 1, 0, quality
        )
        state = UserFlashcardState(
            user_id=user_id,
            flashcard_id=flashcard_id,
            ease_factor=new_ef,
            interval_days=new_interval,
            repetitions=new_reps,
            next_review_at=next_review,
            last_reviewed_at=datetime.now(timezone.utc),
        )
        db.add(state)
    else:
        new_ef, new_interval, new_reps, next_review = calculate_next_review(
            state.ease_factor, state.interval_days, state.repetitions, quality
        )
        state.ease_factor = new_ef
        state.interval_days = new_interval
        state.repetitions = new_reps
        state.next_review_at = next_review
        state.last_reviewed_at = datetime.now(timezone.utc)

    await db.flush()
    return state
