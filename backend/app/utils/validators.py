from __future__ import annotations

import re

from fastapi import HTTPException


def validate_phone_ke(phone: str) -> str:
    """Validate and normalize a Kenyan phone number.

    Accepts formats: +2547XXXXXXXX, 2547XXXXXXXX, 07XXXXXXXX.
    Returns the normalized +254 format.
    """
    cleaned = phone.strip().replace(" ", "").replace("-", "")
    pattern = re.compile(r"^(?:\+?254|0)?([17]\d{8})$")
    match = pattern.match(cleaned)
    if match is None:
        raise HTTPException(status_code=400, detail="Invalid Kenyan phone number. Use format: +2547XXXXXXXX or 07XXXXXXXX")
    normalized = f"+254{match.group(1)}"
    return normalized


def validate_grade(grade: int) -> int:
    """Validate that grade is within the supported range (4-10)."""
    if grade < 4 or grade > 10:
        raise HTTPException(status_code=400, detail="Grade must be between 4 and 10")
    return grade


def sanitize_html(text: str) -> str:
    """Strip all HTML tags from text, returning plain text only."""
    clean = re.sub(r"<[^>]+>", "", text)
    clean = re.sub(r"&[a-zA-Z]+;", " ", clean)
    clean = re.sub(r"&#\d+;", " ", clean)
    clean = re.sub(r"\s+", " ", clean).strip()
    return clean
