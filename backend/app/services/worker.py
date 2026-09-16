from __future__ import annotations

import logging
from typing import Any

from arq import cron
from arq.connections import RedisSettings
from sqlalchemy import select

from app.config import settings
from app.database import async_session_factory
from app.models import AudioNarration, Lesson, Topic

logger = logging.getLogger(__name__)

REDIS_SETTINGS = RedisSettings.from_dsn(settings.REDIS_URL)

_worker_tasks: dict[str, Any] = {}
_queue_pool: Any = None


async def _get_queue() -> Any:
    """Get (or lazily create) a shared arq Redis pool."""
    global _queue_pool
    if _queue_pool is None:
        from arq import create_pool

        _queue_pool = await create_pool(REDIS_SETTINGS)
    return _queue_pool


async def enqueue_material_processing(material_id: str) -> str:
    """Enqueue a background job to process a material."""
    queue = await _get_queue()
    job = await queue.enqueue("process_material_job", material_id)
    _worker_tasks[f"material:{material_id}"] = job
    logger.info("Enqueued material processing for %s", material_id)
    return str(job.job_id) if hasattr(job, "job_id") else ""


async def enqueue_topic_generation(topic_id: str) -> str:
    """Enqueue a background job to generate all content for a topic."""
    queue = await _get_queue()
    job = await queue.enqueue("generate_content_job", topic_id)
    _worker_tasks[f"topic:{topic_id}"] = job
    logger.info("Enqueued content generation for topic %s", topic_id)
    return str(job.job_id) if hasattr(job, "job_id") else ""


async def enqueue_audio_generation(lesson_id: str) -> str:
    """Enqueue a background job to generate audio narration for a lesson."""
    queue = await _get_queue()
    job = await queue.enqueue("generate_audio_job", lesson_id)
    _worker_tasks[f"audio:{lesson_id}"] = job
    logger.info("Enqueued audio generation for lesson %s", lesson_id)
    return str(job.job_id) if hasattr(job, "job_id") else ""


async def close_queue() -> None:
    """Close the shared arq pool (called on app shutdown)."""
    global _queue_pool
    if _queue_pool is not None:
        await _queue_pool.close()
        _queue_pool = None


async def generate_content_job(ctx: dict, topic_id: str) -> dict:
    """Background job: generate lesson, quiz, flashcards, and practice questions for a topic."""
    logger.info("Starting content generation for topic %s", topic_id)

    from app.services.ai_generator import (
        generate_flashcards,
        generate_lesson,
        generate_practice_questions,
        generate_quiz,
    )
    from app.services.material_processor import chunk_text

    async with async_session_factory() as db:
        result = await db.execute(select(Topic).where(Topic.id == topic_id))
        topic = result.scalar_one_or_none()
        if topic is None:
            logger.error("Topic %s not found", topic_id)
            return {"error": "Topic not found"}

        chunks_result = await db.execute(
            select(Material.raw_text)
            .join(Topic, Topic.material_id == Material.id)
            .where(Topic.id == topic_id)
        )
        raw_text_row = chunks_result.scalar_one_or_none()
        raw_text = raw_text_row or ""

    material_chunks = chunk_text(raw_text, 400, 50) if raw_text else ["No source material available"]

    results = {}
    try:
        lesson_result = await generate_lesson(topic_id, material_chunks)
        results["lesson"] = lesson_result
        logger.info("Lesson generated for topic %s", topic_id)
    except Exception as exc:
        logger.exception("Failed to generate lesson for topic %s: %s", topic_id, exc)
        results["lesson"] = {"error": str(exc)}

    async with async_session_factory() as db:
        lesson_result_db = await db.execute(select(Lesson).where(Lesson.topic_id == topic_id).order_by(Lesson.version.desc()).limit(1))
        latest_lesson = lesson_result_db.scalar_one_or_none()
        lesson_content = latest_lesson.content_json if latest_lesson else {}

    if lesson_content:
        try:
            quiz_result = await generate_quiz(topic_id, lesson_content)
            results["quiz"] = quiz_result
            logger.info("Quiz generated for topic %s", topic_id)
        except Exception as exc:
            logger.exception("Failed to generate quiz for topic %s: %s", topic_id, exc)
            results["quiz"] = {"error": str(exc)}

        try:
            flashcard_result = await generate_flashcards(topic_id, lesson_content)
            results["flashcards"] = flashcard_result
            logger.info("Flashcards generated for topic %s", topic_id)
        except Exception as exc:
            logger.exception("Failed to generate flashcards for topic %s: %s", topic_id, exc)
            results["flashcards"] = {"error": str(exc)}

        try:
            practice_result = await generate_practice_questions(topic_id, lesson_content)
            results["practice"] = practice_result
            logger.info("Practice questions generated for topic %s", topic_id)
        except Exception as exc:
            logger.exception("Failed to generate practice questions for topic %s: %s", topic_id, exc)
            results["practice"] = {"error": str(exc)}

    logger.info("Content generation completed for topic %s: %s", topic_id, results)
    return results


async def process_material_job(ctx: dict, material_id: str) -> dict:
    """Background job: process uploaded material through the extraction pipeline."""
    logger.info("Starting material processing for %s", material_id)
    try:
        from app.services.material_processor import process_material
        await process_material(material_id)
        logger.info("Material %s processed successfully", material_id)
        return {"status": "completed", "material_id": material_id}
    except Exception as exc:
        logger.exception("Material processing failed for %s: %s", material_id, exc)
        return {"status": "failed", "material_id": material_id, "error": str(exc)}


async def generate_audio_job(ctx: dict, lesson_id: str) -> dict:
    """Background job: generate audio narration script for a lesson."""
    logger.info("Starting audio generation for lesson %s", lesson_id)

    from app.services.ai_generator import generate_audio_script

    async with async_session_factory() as db:
        result = await db.execute(select(Lesson).where(Lesson.id == lesson_id))
        lesson = result.scalar_one_or_none()
        if lesson is None:
            return {"error": "Lesson not found"}

        script_text = await generate_audio_script(lesson.content_json)

        narration = AudioNarration(
            lesson_id=lesson.id,
            script_text=script_text,
            audio_url="",
            duration_seconds=len(script_text.split()) / 150.0 * 60.0,
            voice_id="kenyan-english-female",
            language="en",
        )
        db.add(narration)
        await db.commit()

    logger.info("Audio narration script generated for lesson %s", lesson_id)
    return {"status": "completed", "lesson_id": lesson_id}


async def _health_check(ctx: dict) -> None:
    """Periodic health check cron job."""
    logger.info("Worker health check: OK")


class WorkerSettings:
    """arq worker configuration."""
    functions = [
        generate_content_job,
        process_material_job,
        generate_audio_job,
    ]
    cron_jobs = [
        cron(_health_check, minute=0, run_at_startup=False),
    ]
    redis_settings = REDIS_SETTINGS
    max_jobs = 5
    poll_delay = 0.5
    job_timeout = 600
    max_tries = 3
    retry_delay = 30
