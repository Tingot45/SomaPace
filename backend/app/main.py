from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

import redis.asyncio as aioredis
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routers import (
    admin_router,
    auth_router,
    content_router,
    material_router,
    payment_router,
    student_router,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

redis_pool: aioredis.Redis | None = None


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    global redis_pool
    logger.info("Starting SomaPace backend — env=%s", settings.ENVIRONMENT)
    await init_db()
    redis_pool = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    logger.info("Redis pool created")
    yield
    if redis_pool is not None:
        await redis_pool.close()
    from app.services.worker import close_queue
    await close_queue()
    logger.info("Shutdown complete")


app = FastAPI(
    title="SomaPace API",
    description="Smart self-paced learning platform for Kenyan students (Grades 4-10)",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(material_router.router)
app.include_router(content_router.router)
app.include_router(student_router.router)
app.include_router(payment_router.router)
app.include_router(admin_router.router)


@app.get("/api/health")
async def health_check() -> dict:
    return {"status": "ok", "service": "somapace-api", "version": "1.0.0"}
