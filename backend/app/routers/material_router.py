from __future__ import annotations

import uuid as _uuid
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth import get_current_user, require_role
from app.config import settings
from app.database import get_db
from app.models import Material, MaterialStatus, User, UserRole
from app.schemas import MaterialStatusResponse, MaterialUploadResponse
from app.services.worker import enqueue_material_processing
from app.utils.file_handler import calculate_checksum, get_file_type, save_upload, validate_file

router = APIRouter(prefix="/api", tags=["materials"])

ALLOWED_TYPES = {"pdf", "docx", "pptx", "png", "jpg", "jpeg", "tiff", "bmp"}


@router.post("/materials/upload", response_model=MaterialUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_material(
    file: UploadFile,
    grade: int = Query(..., ge=4, le=10),
    subject_id: _uuid.UUID = Query(...),
    current_user: User = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> MaterialUploadResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="Filename required")

    file_type = get_file_type(file.filename)
    if file_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file_type}")

    content = await file.read()
    if not validate_file(len(content), settings.MAX_UPLOAD_SIZE_MB):
        raise HTTPException(status_code=400, detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB} MB limit")

    storage_path, checksum = save_upload(content, file.filename, settings.UPLOAD_DIR)

    material = Material(
        source_filename=file.filename,
        storage_path=storage_path,
        file_type=file_type,
        file_size_bytes=len(content),
        uploaded_by=current_user.id,
        status=MaterialStatus.pending,
        grade=grade,
        subject_id=subject_id,
        checksum_sha256=checksum,
    )
    db.add(material)
    await db.flush()
    await db.refresh(material)

    await enqueue_material_processing(str(material.id))

    return MaterialUploadResponse(
        id=material.id,
        source_filename=material.source_filename,
        file_type=material.file_type,
        status=material.status.value,
        created_at=material.created_at,
    )


@router.get("/materials", response_model=list[MaterialStatusResponse])
async def list_materials(
    grade: int | None = Query(None),
    subject_id: _uuid.UUID | None = Query(None),
    material_status: Literal["pending", "processing", "processed", "failed", "rejected"] | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[MaterialStatusResponse]:
    stmt = select(Material)
    if grade is not None:
        stmt = stmt.where(Material.grade == grade)
    if subject_id is not None:
        stmt = stmt.where(Material.subject_id == subject_id)
    if material_status is not None:
        stmt = stmt.where(Material.status == material_status)
    stmt = stmt.order_by(Material.created_at.desc())
    result = await db.execute(stmt)
    materials = result.scalars().all()
    return [MaterialStatusResponse.model_validate(m) for m in materials]


@router.get("/materials/{material_id}", response_model=MaterialStatusResponse)
async def get_material(
    material_id: _uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MaterialStatusResponse:
    result = await db.execute(select(Material).where(Material.id == material_id))
    material = result.scalar_one_or_none()
    if material is None:
        raise HTTPException(status_code=404, detail="Material not found")
    return MaterialStatusResponse.model_validate(material)


@router.post("/materials/{material_id}/reprocess", response_model=MaterialStatusResponse)
async def reprocess_material(
    material_id: _uuid.UUID,
    current_user: User = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> MaterialStatusResponse:
    result = await db.execute(select(Material).where(Material.id == material_id))
    material = result.scalar_one_or_none()
    if material is None:
        raise HTTPException(status_code=404, detail="Material not found")

    material.status = MaterialStatus.pending
    material.processed_at = None
    await db.flush()
    await db.refresh(material)

    await enqueue_material_processing(str(material.id))

    return MaterialStatusResponse.model_validate(material)


@router.delete("/materials/{material_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_material(
    material_id: _uuid.UUID,
    current_user: User = Depends(require_role(UserRole.admin)),
    db: AsyncSession = Depends(get_db),
) -> None:
    result = await db.execute(select(Material).where(Material.id == material_id))
    material = result.scalar_one_or_none()
    if material is None:
        raise HTTPException(status_code=404, detail="Material not found")
    await db.delete(material)
