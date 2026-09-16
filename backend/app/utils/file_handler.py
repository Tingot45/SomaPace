from __future__ import annotations

import hashlib
import os
import uuid
from pathlib import Path


def save_upload(file_content: bytes, filename: str, upload_dir: str) -> tuple[str, str]:
    """Save uploaded file with UUID prefix. Returns (storage_path, sha256_checksum)."""
    os.makedirs(upload_dir, exist_ok=True)
    ext = Path(filename).suffix.lower()
    unique_name = f"{uuid.uuid4().hex}{ext}"
    storage_path = os.path.join(upload_dir, unique_name)
    with open(storage_path, "wb") as f:
        f.write(file_content)
    checksum = hashlib.sha256(file_content).hexdigest()
    return storage_path, checksum


def get_file_type(filename: str) -> str:
    """Detect file type from filename extension."""
    ext = Path(filename).suffix.lower().lstrip(".")
    type_map = {
        "pdf": "pdf",
        "docx": "docx",
        "doc": "docx",
        "pptx": "pptx",
        "ppt": "pptx",
        "png": "png",
        "jpg": "jpg",
        "jpeg": "jpeg",
        "tiff": "tiff",
        "tif": "tiff",
        "bmp": "bmp",
    }
    return type_map.get(ext, ext)


def validate_file(file_size_bytes: int, max_size_mb: int) -> bool:
    """Check that file does not exceed the max upload size."""
    max_bytes = max_size_mb * 1024 * 1024
    return file_size_bytes <= max_bytes


def calculate_checksum(file_path: str) -> str:
    """Calculate SHA-256 checksum of a file on disk."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()
