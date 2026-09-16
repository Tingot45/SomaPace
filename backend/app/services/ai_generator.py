from __future__ import annotations

import asyncio
import json
import logging
import re
from typing import Any

import httpx
from sqlalchemy import select

from app.config import settings
from app.database import async_session_factory
from app.models import (
    Flashcard,
    Lesson,
    LessonStatus,
    Material,
    PracticeQuestion,
    Quiz,
    QuizStatus,
    QuestionType,
    Topic,
    Difficulty,
)
from app.services.content_processor import calculate_flesch_kincaid, count_words

logger = logging.getLogger(__name__)

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta"
GEMINI_MODEL = "gemini-1.5-flash"
MAX_RETRIES = 3
RETRY_BASE_DELAY = 2.0

KENYAN_ANALOGIES = (
    "Use everyday Kenyan examples: matatu routes, market shopping, "
    "boda-boda distances, farming activities, market day profits, "
    "cooking measurements, school uniforms, and other relatable scenarios "
    "that Kenyan students experience daily."
)
CREATIVE_CONSTRAINTS = (
    "CRITICAL REQUIREMENTS:\n"
    f"1. {KENYAN_ANALOGIES}\n"
    "2. Start with a 'Did you know?' hook connected to Kenyan life.\n"
    "3. Use simple, conversational English appropriate for Grade {grade} students.\n"
    "4. Include at least 2 local examples from Kenyan context.\n"
    "5. Use Sheng or Swahili words where they make concepts clearer (e.g. 'shilingi' for money).\n"
    "6. Word count MUST be between 1200-2000 words.\n"
    "7. Follow the 10-part lesson template exactly.\n"
    "8. End with a recap quiz of 3-5 quick questions.\n"
    "9. Reference real Kenyan places: Nairobi, Kisumu, Mombasa, Nakuru, Eldoret.\n"
    "10. Make connections to CBC-Kenya curriculum competencies.\n"
)


async def _call_gemini(
    prompt: str,
    temperature: float = 0.7,
    max_tokens: int = 4096,
    retry: int = 0,
) -> str:
    """Call Gemini API with exponential backoff."""
    url = f"{GEMINI_BASE}/models/{GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens,
            "responseMimeType": "application/json",
        },
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        for attempt in range(MAX_RETRIES):
            try:
                resp = await client.post(url, json=payload)
                if resp.status_code == 200:
                    data = resp.json()
                    text = data["candidates"][0]["content"]["parts"][0]["text"]
                    return text
                if resp.status_code in (429, 500, 503):
                    delay = RETRY_BASE_DELAY * (2 ** attempt)
                    logger.warning("Gemini %s, retrying in %.1fs", resp.status_code, delay)
                    await asyncio.sleep(delay)
                    continue
                resp.raise_for_status()
            except httpx.HTTPStatusError:
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(RETRY_BASE_DELAY * (2 ** attempt))
                    continue
                raise
            except httpx.RequestError:
                if attempt < MAX_RETRIES - 1:
                    await asyncio.sleep(RETRY_BASE_DELAY * (2 ** attempt))
                    continue
                raise
    raise RuntimeError("Gemini API request failed after retries")


def _extract_json(text: str) -> dict | list:
    """Robustly extract JSON from Gemini response."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group())
    match = re.search(r"\[.*\]", text, re.DOTALL)
    if match:
        return json.loads(match.group())
    raise ValueError(f"Could not parse JSON from response: {text[:200]}")


async def generate_lesson(topic_id: str, material_chunks: list[str]) -> dict:
    """Generate a full lesson following the 10-part CBC-Kenya template."""
    async with async_session_factory() as db:
        result = await db.execute(select(Topic).where(Topic.id == topic_id))
        topic = result.scalar_one_or_none()
        if topic is None:
            raise ValueError(f"Topic {topic_id} not found")
        mat_result = await db.execute(select(Material).where(Material.id == topic.material_id))
        material = mat_result.scalar_one_or_none()
    grade = material.grade if material else 4
    difficulty_label = topic.difficulty.value if topic.difficulty else "beginner"

    context = "\n\n".join(material_chunks[:8])
    prompt = f"""You are an expert Kenyan curriculum teacher creating a lesson for Grade {grade} students.

TOPIC: {topic.title}
DIFFICULTY LEVEL: {difficulty_label}
SUBTOPICS: {', '.join(str(s) for s in (topic.subtopics or []))}

SOURCE MATERIAL CONTEXT:
{context}

{CREATIVE_CONSTRAINTS.format(grade=4)}

Generate a complete lesson in JSON format with EXACTLY these fields:
{{
  "hook": "An engaging 'Did you know?' introduction connected to Kenyan daily life (100-150 words)",
  "objectives": ["Clear learning objective 1", "Objective 2", "Objective 3", "Objective 4"],
  "sections": [
    {{
      "title": "Section title",
      "content": "Detailed explanation (300-400 words per section, at least 3 sections)"
    }}
  ],
  "worked_example": {{
    "title": "Worked Example",
    "steps": ["Step 1 description", "Step 2", "Step 3", "Step 4"],
    "answer": "Final answer with units"
  }},
  "kenyan_application": {{
    "title": "How This Works in Kenya",
    "examples": [
      "Example 1 with a Kenyan context like matatu fare calculation or market selling",
      "Example 2 with a farming or school context"
    ]
  }},
  "diagram_description": "Description of a diagram that would help visual learners",
  "misconceptions": [
    {{"myth": "Common wrong belief", "correction": "Why it's wrong and the correct understanding"}},
    {{"myth": "Another misconception", "correction": "Correction with local example"}}
  ],
  "summary": "Concise summary of key points (150-200 words)",
  "recap_quiz": [
    {{"question": "Quick recall question", "options": ["A", "B", "C", "D"], "correct_index": 0, "explanation": "Why the answer is correct"}},
    {{"question": "Second recall question", "options": ["A", "B", "C", "D"], "correct_index": 1, "explanation": "Explanation"}},
    {{"question": "Third recall question", "options": ["A", "B", "C", "D"], "correct_index": 2, "explanation": "Explanation"}}
  ],
  "further_practice": [
    "Practice suggestion 1 using Kenyan context",
    "Practice suggestion 2",
    "Practice suggestion 3"
  ]
}}

IMPORTANT: The total lesson MUST be 1200-2000 words. Each section content must be substantive with real teaching content.
Write in a warm, encouraging teacher voice. Use "we" and "let's" to include the student."""

    response_text = await _call_gemini(prompt, temperature=0.7, max_tokens=4096)
    lesson_json = _extract_json(response_text)

    full_text = " ".join(s.get("content", "") for s in lesson_json.get("sections", []))
    full_text += " " + lesson_json.get("hook", "") + " " + lesson_json.get("summary", "")
    word_count = count_words(full_text)
    reading_level = calculate_flesch_kincaid(full_text)

    async with async_session_factory() as db:
        lesson = Lesson(
            topic_id=topic.id,
            title=topic.title,
            content_json=lesson_json,
            word_count=word_count,
            reading_level=reading_level,
            status=LessonStatus.pending_review,
            generated_by="gemini",
        )
        db.add(lesson)
        await db.commit()

    return {"lesson_id": str(lesson.id), "word_count": word_count, "reading_level": reading_level}


async def generate_quiz(topic_id: str, lesson_content: dict, num_questions: int = 15) -> dict:
    """Generate a graded quiz with explanations."""
    async with async_session_factory() as db:
        result = await db.execute(select(Topic).where(Topic.id == topic_id))
        topic = result.scalar_one_or_none()
    if topic is None:
        raise ValueError(f"Topic {topic_id} not found")

    summary = json.dumps(lesson_content, indent=2)[:3000]
    prompt = f"""Generate a {num_questions}-question quiz for the following lesson.

TOPIC: {topic.title}
LESSON CONTENT SUMMARY:
{summary}

Each question must have exactly 4 options (A, B, C, D) with one correct answer.

Return JSON with this structure:
{{
  "title": "Quiz: {topic.title}",
  "questions": [
    {{
      "question": "Clear question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Why the correct answer is right, with a Kenyan example",
      "difficulty": "beginner"
    }}
  ],
  "time_limit_seconds": 900,
  "passing_score": 70
}}

Make questions progressively harder (beginner -> intermediate -> advanced).
Use Kenyan context in at least 3 questions.
Include at least one true/false style question framed as multiple choice."""

    response_text = await _call_gemini(prompt, temperature=0.6, max_tokens=4096)
    quiz_json = _extract_json(response_text)

    async with async_session_factory() as db:
        quiz = Quiz(
            topic_id=topic.id,
            title=quiz_json.get("title", "Quiz"),
            questions_json=quiz_json.get("questions", []),
            time_limit_seconds=quiz_json.get("time_limit_seconds"),
            passing_score=quiz_json.get("passing_score", 70),
            status=QuizStatus.pending_review,
        )
        db.add(quiz)
        await db.commit()

    return {"quiz_id": str(quiz.id), "num_questions": len(quiz_json.get("questions", []))}


async def generate_flashcards(topic_id: str, lesson_content: dict, num_cards: int = 20) -> dict:
    """Generate flashcards from lesson content."""
    summary = json.dumps(lesson_content, indent=2)[:3000]
    prompt = f"""Generate {num_cards} educational flashcards from this lesson content.

LESSON:
{summary}

Return JSON:
{{
  "flashcards": [
    {{
      "front": "A clear question or prompt on the front of the card",
      "back": "A concise but complete answer on the back",
      "difficulty": "beginner",
      "tags": ["tag1", "tag2"]
    }}
  ]
}}

Rules:
- Front should be a question, back should be the answer.
- Mix difficulties: 40% beginner, 35% intermediate, 25% advanced.
- At least 3 flashcards should reference Kenyan context.
- Keep backs concise (1-3 sentences max).
- Tags should be relevant keywords from the content."""

    response_text = await _call_gemini(prompt, temperature=0.7, max_tokens=4096)
    data = _extract_json(response_text)
    cards = data.get("flashcards", []) if isinstance(data, dict) else data

    async with async_session_factory() as db:
        result = await db.execute(select(Topic).where(Topic.id == topic_id))
        topic = result.scalar_one_or_none()
        if topic is None:
            raise ValueError(f"Topic {topic_id} not found")
        created = []
        for card in cards[:num_cards]:
            try:
                card_diff = Difficulty(card.get("difficulty", "beginner"))
            except ValueError:
                card_diff = Difficulty.beginner
            fc = Flashcard(
                topic_id=topic.id,
                front=card.get("front", ""),
                back=card.get("back", ""),
                difficulty=card_diff,
                tags=card.get("tags", []),
            )
            db.add(fc)
            created.append(fc)
        await db.commit()

    return {"flashcards_created": len(created)}


async def generate_audio_script(lesson_content: dict) -> str:
    """Generate a teacher-style narration script for audio production."""
    sections = lesson_content.get("sections", [])
    hook = lesson_content.get("hook", "")
    summary = lesson_content.get("summary", "")
    prompt = f"""You are a warm, engaging Kenyan teacher recording an audio lesson for students.
Convert this written lesson into a spoken narration script.

LESSON HOOK: {hook}

SECTIONS:
{json.dumps(sections, indent=2)[:2000]}

SUMMARY: {summary}

Rules:
- Write in natural spoken English as if talking to students directly.
- Use transitional phrases like "Now let's look at...", "Here's something interesting...", "Remember when we said...".
- Add emphasis markers like *pause* for dramatic effect.
- Pronounce Kenyan names/places naturally (e.g., Nairobi, Kisumu, shilingi).
- Target length: 800-1200 words (about 5-7 minutes of audio).
- Tone: enthusiastic, patient, encouraging.
- Include rhetorical questions to engage listeners.
- Start with a greeting and end with encouragement."""

    return await _call_gemini(prompt, temperature=0.8, max_tokens=4096)


async def generate_practice_questions(topic_id: str, lesson_content: dict, num_questions: int = 10) -> dict:
    """Generate adaptive-difficulty practice questions."""
    summary = json.dumps(lesson_content, indent=2)[:3000]
    prompt = f"""Generate {num_questions} practice questions for this lesson with increasing difficulty.

LESSON:
{summary}

Return JSON:
{{
  "questions": [
    {{
      "question_text": "The question",
      "question_type": "multiple_choice",
      "options": ["A", "B", "C", "D"],
      "correct_answer": "The correct answer",
      "explanation": "Step-by-step explanation with Kenyan context",
      "difficulty": "beginner",
      "hints": ["Hint 1", "Hint 2"]
    }}
  ]
}}

Distribution: 3 beginner, 4 intermediate, 3 advanced.
Include mix of multiple_choice, short_answer, and true_false types.
At least 2 questions should use Kenyan real-world scenarios.
Hints should guide thinking, not give away the answer."""

    response_text = await _call_gemini(prompt, temperature=0.6, max_tokens=4096)
    data = _extract_json(response_text)
    questions = data.get("questions", []) if isinstance(data, dict) else data

    async with async_session_factory() as db:
        result = await db.execute(select(Topic).where(Topic.id == topic_id))
        topic = result.scalar_one_or_none()
        if topic is None:
            raise ValueError(f"Topic {topic_id} not found")
        created = []
        for q in questions[:num_questions]:
            try:
                q_type = QuestionType(q.get("question_type", "multiple_choice"))
            except ValueError:
                q_type = QuestionType.multiple_choice
            try:
                q_diff = Difficulty(q.get("difficulty", "beginner"))
            except ValueError:
                q_diff = Difficulty.beginner
            pq = PracticeQuestion(
                topic_id=topic.id,
                question_text=q.get("question_text", ""),
                question_type=q_type,
                options=q.get("options"),
                correct_answer=q.get("correct_answer", ""),
                explanation=q.get("explanation", ""),
                difficulty=q_diff,
                hints=q.get("hints", []),
            )
            db.add(pq)
            created.append(pq)
        await db.commit()

    return {"questions_created": len(created)}


async def generate_diagnostic_quiz(grade: int, subjects: list[str]) -> dict:
    """Generate an initial placement quiz for onboarding."""
    subject_str = ", ".join(subjects)
    prompt = f"""Generate a diagnostic placement quiz for a Grade {grade} student in these subjects: {subject_str}.
This quiz determines their current level.

Generate 5 questions per subject (3 difficulty levels).

Return JSON:
{{
  "quiz": {{
    "title": "Grade {grade} Diagnostic Quiz",
    "questions": [
      {{
        "subject": "subject name",
        "question": "Question text",
        "options": ["A", "B", "C", "D"],
        "correct_index": 0,
        "difficulty": "beginner|intermediate|advanced",
        "explanation": "Brief explanation"
      }}
    ]
  }}
}}

Use CBC-Kenya aligned content.
Questions should range from basic recall to application.
Include Kenyan context where appropriate."""

    response_text = await _call_gemini(prompt, temperature=0.5, max_tokens=4096)
    return _extract_json(response_text)


async def fact_check(lesson: dict, source_chunks: list[str]) -> dict:
    """Second-pass verification of generated lesson against source material."""
    sources = "\n".join(f"- {c[:300]}" for c in source_chunks[:5])
    prompt = f"""You are a fact-checker for educational content. Compare this generated lesson against the source material and flag any inaccuracies.

SOURCE MATERIAL:
{sources}

GENERATED LESSON (summary):
Hook: {lesson.get('hook', '')[:200]}
Summary: {lesson.get('summary', '')[:200]}
Sections count: {len(lesson.get('sections', []))}

Return JSON:
{{
  "accuracy_score": 0.95,
  "issues": [
    {{
      "severity": "low|medium|high",
      "description": "Description of the issue",
      "suggestion": "How to fix it"
    }}
  ],
  "verified_facts": ["Fact 1 verified against source", "Fact 2"],
  "flagged_claims": ["Claim not found in source"]
}}

Rate accuracy from 0.0 to 1.0. Be thorough."""

    response_text = await _call_gemini(prompt, temperature=0.3, max_tokens=2048)
    return _extract_json(response_text)


def check_reading_level(text: str, target_grade: int) -> dict:
    """Check Flesch-Kincaid reading level against target grade."""
    fk_grade = calculate_flesch_kincaid(text)
    wc = count_words(text)
    within_range = abs(fk_grade - target_grade) <= 2
    return {
        "flesch_kincaid_grade": round(fk_grade, 1),
        "target_grade": target_grade,
        "within_target": within_range,
        "word_count": wc,
        "suggestion": "Reading level is appropriate." if within_range else f"Reading level ({fk_grade}) deviates from target grade ({target_grade}). Simplify vocabulary and shorten sentences.",
    }
