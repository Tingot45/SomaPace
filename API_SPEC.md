# SomaPace — API Specification

## Overview

- **Base URL**: `https://api.somapace.com/api/v1`
- **Content-Type**: `application/json` (unless noted)
- **Authentication**: Bearer token in `Authorization` header
- **Rate Limiting**: 100 requests/minute per IP, 10 requests/minute for auth endpoints
- **Versioning**: URL-based (`/api/v1/`)

### Authentication Header

```
Authorization: Bearer <access_token>
```

### Standard Error Response

```json
{
  "detail": "Error message describing what went wrong",
  "code": "ERROR_CODE"
}
```

### Standard Error Codes

| Code | HTTP Status | Description |
|------|------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Request body validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Auth Endpoints

### POST /api/v1/auth/register

Register a new student account.

- **Auth Required**: No
- **Request Body**:

```json
{
  "phone_number": "+254712345678",
  "full_name": "Wanjiku Kamau",
  "grade": 7,
  "password": "securePassword123"
}
```

- **Response**: `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "phone_number": "+254712345678",
  "full_name": "Wanjiku Kamau",
  "grade": 7,
  "role": "student",
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

- **Status Codes**:
  - `201` — Success
  - `422` — Validation error (missing fields, invalid phone format)
  - `409` — Phone number already registered

- **Example cURL**:

```bash
curl -X POST https://api.somapace.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+254712345678",
    "full_name": "Wanjiku Kamau",
    "grade": 7,
    "password": "securePassword123"
  }'
```

---

### POST /api/v1/auth/login

Authenticate with phone number and password.

- **Auth Required**: No
- **Request Body**:

```json
{
  "phone_number": "+254712345678",
  "password": "securePassword123"
}
```

- **Response**: `200 OK`

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 900,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "full_name": "Wanjiku Kamau",
    "grade": 7,
    "role": "student"
  }
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Invalid credentials
  - `422` — Validation error

- **Example cURL**:

```bash
curl -X POST https://api.somapace.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone_number": "+254712345678",
    "password": "securePassword123"
  }'
```

---

### GET /api/v1/auth/me

Get current authenticated user profile.

- **Auth Required**: Yes (student, teacher, admin)
- **Response**: `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "phone_number": "+254712345678",
  "full_name": "Wanjiku Kamau",
  "grade": 7,
  "role": "student",
  "created_at": "2026-01-15T10:30:00Z",
  "subscription": {
    "active": true,
    "plan": "yearly",
    "expires_at": "2027-01-15T10:30:00Z"
  }
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized

- **Example cURL**:

```bash
curl -X GET https://api.somapace.com/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### PUT /api/v1/auth/me

Update current user profile.

- **Auth Required**: Yes (student, teacher, admin)
- **Request Body**:

```json
{
  "full_name": "Wanjiku Kamau Updated",
  "grade": 8
}
```

- **Response**: `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "phone_number": "+254712345678",
  "full_name": "Wanjiku Kamau Updated",
  "grade": 8,
  "role": "student",
  "updated_at": "2026-09-14T12:00:00Z"
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `422` — Validation error

- **Example cURL**:

```bash
curl -X PUT https://api.somapace.com/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Wanjiku Kamau Updated",
    "grade": 8
  }'
```

---

## Material Endpoints

### POST /api/v1/materials/upload

Upload a school material (PDF, DOCX, or image) for processing.

- **Auth Required**: Yes (student, teacher, admin)
- **Content-Type**: `multipart/form-data`
- **Request Body**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | PDF, DOCX, JPG, PNG (max 50MB) |
| `grade` | integer | Yes | CBC grade level (1-12) |
| `subject` | string | Yes | Subject name |

- **Response**: `202 Accepted`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "source_filename": "math-grade7-chapter3.pdf",
  "file_type": "pdf",
  "grade": 7,
  "subject": "Mathematics",
  "status": "pending",
  "created_at": "2026-09-14T12:00:00Z"
}
```

- **Status Codes**:
  - `202` — Accepted for processing
  - `401` — Unauthorized
  - `403` — Subscription required
  - `413` — File too large
  - `422` — Invalid file type or missing fields

- **Example cURL**:

```bash
curl -X POST https://api.somapace.com/api/v1/materials/upload \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -F "file=@math-grade7-chapter3.pdf" \
  -F "grade=7" \
  -F "subject=Mathematics"
```

---

### GET /api/v1/materials

List all materials uploaded by the current user.

- **Auth Required**: Yes (student, teacher, admin)
- **Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 50) |
| `status` | string | — | Filter by status: pending, processing, processed, failed, ready |
| `grade` | integer | — | Filter by grade |
| `subject` | string | — | Filter by subject |

- **Response**: `200 OK`

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "source_filename": "math-grade7-chapter3.pdf",
      "file_type": "pdf",
      "grade": 7,
      "subject": "Mathematics",
      "status": "ready",
      "topics_count": 5,
      "created_at": "2026-09-14T12:00:00Z"
    }
  ],
  "total": 15,
  "page": 1,
  "pages": 1
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized

- **Example cURL**:

```bash
curl -X GET "https://api.somapace.com/api/v1/materials?page=1&limit=20&status=ready" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### GET /api/v1/materials/{id}

Get details of a specific material including extracted content.

- **Auth Required**: Yes (owner, teacher, admin)
- **Response**: `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "source_filename": "math-grade7-chapter3.pdf",
  "file_type": "pdf",
  "grade": 7,
  "subject": "Mathematics",
  "status": "ready",
  "extracted_json": {
    "title": "Introduction to Algebra",
    "sections": ["Variables", "Expressions", "Equations"]
  },
  "topics": [
    {
      "id": "topic-uuid-1",
      "title": "Understanding Variables",
      "difficulty": "easy"
    },
    {
      "id": "topic-uuid-2",
      "title": "Algebraic Expressions",
      "difficulty": "medium"
    }
  ],
  "created_at": "2026-09-14T12:00:00Z",
  "processed_at": "2026-09-14T12:05:00Z"
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `403` — Not owner
  - `404` — Material not found

- **Example cURL**:

```bash
curl -X GET https://api.somapace.com/api/v1/materials/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### POST /api/v1/materials/{id}/reprocess

Re-process a material (e.g., after OCR improvements).

- **Auth Required**: Yes (owner, admin)
- **Response**: `202 Accepted`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "status": "pending",
  "message": "Material queued for reprocessing"
}
```

- **Status Codes**:
  - `202` — Accepted
  - `401` — Unauthorized
  - `403` — Not owner
  - `404` — Material not found

- **Example cURL**:

```bash
curl -X POST https://api.somapace.com/api/v1/materials/550e8400-e29b-41d4-a716-446655440001/reprocess \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### DELETE /api/v1/materials/{id}

Delete a material and all associated content.

- **Auth Required**: Yes (owner, admin)
- **Response**: `204 No Content`

- **Status Codes**:
  - `204` — Deleted
  - `401` — Unauthorized
  - `403` — Not owner
  - `404` — Material not found

- **Example cURL**:

```bash
curl -X DELETE https://api.somapace.com/api/v1/materials/550e8400-e29b-41d4-a716-446655440001 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Content Endpoints

### GET /api/v1/topics

List all topics (from user's materials or all available).

- **Auth Required**: Yes (student, teacher, admin)
- **Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `material_id` | uuid | — | Filter by material |
| `grade` | integer | — | Filter by grade |
| `subject` | string | — | Filter by subject |
| `difficulty` | string | — | Filter by difficulty: easy, medium, hard |
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |

- **Response**: `200 OK`

```json
{
  "items": [
    {
      "id": "topic-uuid-1",
      "title": "Understanding Variables",
      "subtopics": ["What are variables", "Naming conventions", "Using variables in expressions"],
      "difficulty": "easy",
      "material_id": "material-uuid-1",
      "has_lesson": true,
      "has_quiz": true,
      "flashcard_count": 10,
      "progress": {
        "lesson_completed": true,
        "quiz_score": 85
      }
    }
  ],
  "total": 50,
  "page": 1,
  "pages": 3
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized

- **Example cURL**:

```bash
curl -X GET "https://api.somapace.com/api/v1/topics?grade=7&subject=Mathematics" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### GET /api/v1/topics/{id}

Get detailed topic information.

- **Auth Required**: Yes (student, teacher, admin)
- **Response**: `200 OK`

```json
{
  "id": "topic-uuid-1",
  "title": "Understanding Variables",
  "subtopics": ["What are variables", "Naming conventions", "Using variables in expressions"],
  "difficulty": "easy",
  "material": {
    "id": "material-uuid-1",
    "source_filename": "math-grade7-chapter3.pdf",
    "subject": "Mathematics",
    "grade": 7
  },
  "has_lesson": true,
  "has_quiz": true,
  "flashcard_count": 10,
  "practice_question_count": 5,
  "progress": {
    "lesson_completed": true,
    "quiz_score": 85,
    "quiz_attempts": 2,
    "last_reviewed": "2026-09-14T10:00:00Z"
  }
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `404` — Topic not found

- **Example cURL**:

```bash
curl -X GET https://api.somapace.com/api/v1/topics/topic-uuid-1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### GET /api/v1/topics/{id}/lesson

Get the lesson content for a topic.

- **Auth Required**: Yes (student, teacher, admin)
- **Response**: `200 OK`

```json
{
  "id": "lesson-uuid-1",
  "topic_id": "topic-uuid-1",
  "content_json": {
    "title": "Understanding Variables",
    "introduction": "In mathematics, a variable is a symbol that represents an unknown value...",
    "sections": [
      {
        "heading": "What is a Variable?",
        "content": "A variable is a letter or symbol that stands for a number...",
        "examples": ["x + 5 = 10", "where x = 5"],
        "key_point": "Variables are placeholders for unknown values"
      },
      {
        "heading": "Naming Variables",
        "content": "We typically use letters from the alphabet to name variables...",
        "examples": ["a, b, c for simple unknowns", "x, y for coordinates"],
        "key_point": "Use meaningful variable names"
      }
    ],
    "summary": "Variables are symbols that represent unknown numbers...",
    "cbc_alignment": "CBC Grade 7 Mathematics - Algebra"
  },
  "word_count": 450,
  "audio_url": "https://pub-xxx.r2.dev/audio/lesson-uuid-1.mp3",
  "audio_duration_seconds": 180,
  "status": "ready"
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `404` — Lesson not found
  - `425` — Lesson still generating

- **Example cURL**:

```bash
curl -X GET https://api.somapace.com/api/v1/topics/topic-uuid-1/lesson \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### GET /api/v1/topics/{id}/quiz

Get quiz questions for a topic.

- **Auth Required**: Yes (student, teacher, admin)
- **Response**: `200 OK`

```json
{
  "id": "quiz-uuid-1",
  "topic_id": "topic-uuid-1",
  "passing_score": 70,
  "questions": [
    {
      "id": "q-uuid-1",
      "type": "multiple_choice",
      "question": "What is a variable in algebra?",
      "options": [
        "A fixed number",
        "A symbol representing an unknown value",
        "A mathematical operation",
        "A type of equation"
      ],
      "correct_answer": 1,
      "explanation": "A variable is a symbol (usually a letter) that represents an unknown value in mathematical expressions and equations."
    },
    {
      "id": "q-uuid-2",
      "type": "fill_blank",
      "question": "In the expression 3x + 2, the variable is ___",
      "correct_answer": "x",
      "explanation": "x is the symbol representing the unknown value."
    },
    {
      "id": "q-uuid-3",
      "type": "short_answer",
      "question": "If x = 5, what is the value of 2x + 3?",
      "correct_answer": "13",
      "explanation": "2(5) + 3 = 10 + 3 = 13"
    }
  ],
  "total_questions": 10,
  "time_limit_minutes": 15
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `404` — Quiz not found

- **Example cURL**:

```bash
curl -X GET https://api.somapace.com/api/v1/topics/topic-uuid-1/quiz \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### GET /api/v1/topics/{id}/flashcards

Get flashcard set for a topic.

- **Auth Required**: Yes (student, teacher, admin)
- **Response**: `200 OK`

```json
{
  "topic_id": "topic-uuid-1",
  "flashcards": [
    {
      "id": "fc-uuid-1",
      "front": "What is a variable?",
      "back": "A symbol that represents an unknown value",
      "difficulty": "easy"
    },
    {
      "id": "fc-uuid-2",
      "front": "In 3x + 2, what is the coefficient?",
      "back": "3 (the number multiplied by the variable)",
      "difficulty": "medium"
    },
    {
      "id": "fc-uuid-3",
      "front": "What is the difference between a variable and a constant?",
      "back": "A variable can change; a constant has a fixed value",
      "difficulty": "medium"
    }
  ],
  "total_count": 10,
  "review_state": {
    "cards_to_review": 3,
    "cards_mastered": 5,
    "cards_learning": 2
  }
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `404` — Flashcards not found

- **Example cURL**:

```bash
curl -X GET https://api.somapace.com/api/v1/topics/topic-uuid-1/flashcards \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### GET /api/v1/topics/{id}/practice

Get practice questions for a topic.

- **Auth Required**: Yes (student, teacher, admin)
- **Response**: `200 OK`

```json
{
  "topic_id": "topic-uuid-1",
  "practice_questions": [
    {
      "id": "pq-uuid-1",
      "question_text": "Solve for x: 2x + 5 = 15",
      "difficulty": "easy",
      "solution_json": {
        "steps": [
          "Subtract 5 from both sides: 2x = 10",
          "Divide both sides by 2: x = 5"
        ],
        "answer": "x = 5",
        "hints": ["Try isolating the variable on one side"]
      }
    },
    {
      "id": "pq-uuid-2",
      "question_text": "If y = 3x - 2 and x = 4, find y",
      "difficulty": "medium",
      "solution_json": {
        "steps": [
          "Substitute x = 4 into the equation: y = 3(4) - 2",
          "Calculate: y = 12 - 2",
          "Result: y = 10"
        ],
        "answer": "y = 10",
        "hints": ["Substitute the value of x into the expression"]
      }
    }
  ],
  "total_count": 5
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `404` — No practice questions found

- **Example cURL**:

```bash
curl -X GET https://api.somapace.com/api/v1/topics/topic-uuid-1/practice \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### POST /api/v1/topics/{id}/generate

Trigger AI generation of content for a topic (admin/teacher only).

- **Auth Required**: Yes (teacher, admin)
- **Request Body**:

```json
{
  "generate_lesson": true,
  "generate_quiz": true,
  "generate_flashcards": true,
  "generate_practice": true,
  "voice_preference": "en-US-Neural2-F"
}
```

- **Response**: `202 Accepted`

```json
{
  "topic_id": "topic-uuid-1",
  "status": "queued",
  "estimated_time_seconds": 120,
  "message": "Content generation started. Poll status at GET /api/v1/topics/{id}"
}
```

- **Status Codes**:
  - `202` — Accepted for generation
  - `401` — Unauthorized
  - `403` — Teacher/admin required
  - `409` — Generation already in progress

- **Example cURL**:

```bash
curl -X POST https://api.somapace.com/api/v1/topics/topic-uuid-1/generate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "generate_lesson": true,
    "generate_quiz": true,
    "generate_flashcards": true,
    "generate_practice": true
  }'
```

---

## Student Endpoints

### POST /api/v1/student/onboarding

Complete student onboarding (grade, subjects, learning goals).

- **Auth Required**: Yes (student)
- **Request Body**:

```json
{
  "grade": 7,
  "subjects": ["Mathematics", "Science", "English"],
  "learning_style": "visual",
  "daily_goal_minutes": 30,
  "notifications_enabled": true
}
```

- **Response**: `200 OK`

```json
{
  "message": "Onboarding completed",
  "recommended_topics": [
    {
      "id": "topic-uuid-1",
      "title": "Introduction to Algebra",
      "subject": "Mathematics",
      "reason": "Based on your grade 7 curriculum"
    }
  ],
  "diagnostic_test": {
    "id": "diag-uuid-1",
    "url": "/api/v1/student/diagnostic"
  }
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `422` — Validation error

- **Example cURL**:

```bash
curl -X POST https://api.somapace.com/api/v1/student/onboarding \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "grade": 7,
    "subjects": ["Mathematics", "Science", "English"],
    "learning_style": "visual",
    "daily_goal_minutes": 30
  }'
```

---

### POST /api/v1/student/diagnostic

Submit diagnostic test results.

- **Auth Required**: Yes (student)
- **Request Body**:

```json
{
  "test_id": "diag-uuid-1",
  "answers": [
    {
      "question_id": "dq-1",
      "answer": "B",
      "time_spent_seconds": 30
    },
    {
      "question_id": "dq-2",
      "answer": "x = 5",
      "time_spent_seconds": 45
    }
  ]
}
```

- **Response**: `200 OK`

```json
{
  "test_id": "diag-uuid-1",
  "results": {
    "total_questions": 20,
    "correct": 14,
    "score_percentage": 70,
    "subject_scores": {
      "Mathematics": 80,
      "Science": 65,
      "English": 65
    },
    "weak_areas": ["Algebra", "Cell Biology"],
    "recommended_starting_points": [
      {
        "topic_id": "topic-uuid-5",
        "title": "Basic Algebra Concepts",
        "reason": "Recommended based on diagnostic results"
      }
    ]
  }
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `404` — Test not found

- **Example cURL**:

```bash
curl -X POST https://api.somapace.com/api/v1/student/diagnostic \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "test_id": "diag-uuid-1",
    "answers": [
      {"question_id": "dq-1", "answer": "B", "time_spent_seconds": 30}
    ]
  }'
```

---

### GET /api/v1/student/dashboard

Get student dashboard with progress overview.

- **Auth Required**: Yes (student)
- **Response**: `200 OK`

```json
{
  "user": {
    "id": "user-uuid-1",
    "full_name": "Wanjiku Kamau",
    "grade": 7
  },
  "subscription": {
    "active": true,
    "plan": "yearly",
    "expires_at": "2027-01-15T10:30:00Z"
  },
  "progress": {
    "topics_completed": 15,
    "topics_in_progress": 3,
    "total_topics": 50,
    "completion_percentage": 30,
    "quizzes_taken": 12,
    "average_quiz_score": 78,
    "flashcards_mastered": 45,
    "study_streak_days": 7,
    "total_study_minutes": 840
  },
  "recent_activity": [
    {
      "type": "quiz_completed",
      "topic_title": "Introduction to Algebra",
      "score": 85,
      "timestamp": "2026-09-14T10:00:00Z"
    },
    {
      "type": "lesson_completed",
      "topic_title": "Cell Structure",
      "timestamp": "2026-09-13T15:30:00Z"
    }
  ],
  "due_reviews": {
    "flashcards": 5,
    "next_review_time": "2026-09-15T08:00:00Z"
  },
  "subject_progress": [
    {
      "subject": "Mathematics",
      "topics_completed": 8,
      "total_topics": 20,
      "average_score": 82
    },
    {
      "subject": "Science",
      "topics_completed": 5,
      "total_topics": 15,
      "average_score": 75
    },
    {
      "subject": "English",
      "topics_completed": 2,
      "total_topics": 15,
      "average_score": 70
    }
  ]
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized

- **Example cURL**:

```bash
curl -X GET https://api.somapace.com/api/v1/student/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### POST /api/v1/student/progress

Record student progress (lesson completion, quiz answer, etc.).

- **Auth Required**: Yes (student)
- **Request Body**:

```json
{
  "topic_id": "topic-uuid-1",
  "activity_type": "quiz",
  "quiz_id": "quiz-uuid-1",
  "score": 85,
  "answers": [
    {
      "question_id": "q-uuid-1",
      "user_answer": 1,
      "correct": true,
      "time_spent_seconds": 15
    }
  ],
  "time_spent_seconds": 300
}
```

- **Response**: `200 OK`

```json
{
  "id": "progress-uuid-1",
  "topic_id": "topic-uuid-1",
  "activity_type": "quiz",
  "score": 85,
  "passed": true,
  "updated_flashcards": 3,
  "next_review_date": "2026-09-17T10:00:00Z",
  "encouragement_message": "Great job! You scored 85%. Keep up the excellent work!"
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `422` — Validation error

- **Example cURL**:

```bash
curl -X POST https://api.somapace.com/api/v1/student/progress \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "topic_id": "topic-uuid-1",
    "activity_type": "quiz",
    "quiz_id": "quiz-uuid-1",
    "score": 85,
    "answers": [
      {"question_id": "q-uuid-1", "user_answer": 1, "correct": true, "time_spent_seconds": 15}
    ],
    "time_spent_seconds": 300
  }'
```

---

### GET /api/v1/student/progress

Get student's learning progress history.

- **Auth Required**: Yes (student)
- **Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `subject` | string | — | Filter by subject |
| `from_date` | date | — | Start date (ISO 8601) |
| `to_date` | date | — | End date (ISO 8601) |
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |

- **Response**: `200 OK`

```json
{
  "items": [
    {
      "id": "progress-uuid-1",
      "topic": {
        "id": "topic-uuid-1",
        "title": "Introduction to Algebra",
        "subject": "Mathematics"
      },
      "activity_type": "quiz",
      "score": 85,
      "completed": true,
      "time_spent_seconds": 300,
      "created_at": "2026-09-14T10:00:00Z"
    }
  ],
  "summary": {
    "total_activities": 45,
    "lessons_completed": 15,
    "quizzes_taken": 12,
    "average_score": 78,
    "total_time_minutes": 840
  },
  "total": 45,
  "page": 1,
  "pages": 3
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized

- **Example cURL**:

```bash
curl -X GET "https://api.somapace.com/api/v1/student/progress?subject=Mathematics&from_date=2026-09-01" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### GET /api/v1/student/flashcards/review

Get flashcards due for review (spaced repetition).

- **Auth Required**: Yes (student)
- **Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `topic_id` | uuid | — | Filter by topic |
| `limit` | integer | 10 | Max cards to return |

- **Response**: `200 OK`

```json
{
  "flashcards": [
    {
      "id": "fc-uuid-1",
      "topic_id": "topic-uuid-1",
      "topic_title": "Introduction to Algebra",
      "front": "What is a variable?",
      "back": "A symbol that represents an unknown value",
      "state": {
        "ease_factor": 2.5,
        "interval_days": 1,
        "repetitions": 2,
        "next_review": "2026-09-14T10:00:00Z"
      }
    }
  ],
  "total_due": 5,
  "total_mastered": 45,
  "total_learning": 2
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized

- **Example cURL**:

```bash
curl -X GET "https://api.somapace.com/api/v1/student/flashcards/review?limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### POST /api/v1/student/flashcards/{id}/review

Submit a flashcard review (SM-2 algorithm update).

- **Auth Required**: Yes (student)
- **Request Body**:

```json
{
  "quality": 4,
  "response_time_seconds": 5
}
```

**Quality Rating (SM-2 Scale)**:
| Value | Meaning |
|-------|---------|
| 0 | Complete blackout |
| 1 | Incorrect, remembered after seeing answer |
| 2 | Incorrect, but answer was easy to recall |
| 3 | Correct, with serious difficulty |
| 4 | Correct, with some hesitation |
| 5 | Perfect, instant recall |

- **Response**: `200 OK`

```json
{
  "flashcard_id": "fc-uuid-1",
  "state": {
    "ease_factor": 2.6,
    "interval_days": 3,
    "repetitions": 3,
    "next_review": "2026-09-17T10:00:00Z"
  },
  "message": "Card reviewed. Next review in 3 days."
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `404` — Flashcard not found
  - `422` — Invalid quality rating

- **Example cURL**:

```bash
curl -X POST https://api.somapace.com/api/v1/student/flashcards/fc-uuid-1/review \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "quality": 4,
    "response_time_seconds": 5
  }'
```

---

## Payment Endpoints

### POST /api/v1/payments/init

Initialize an M-Pesa STK Push payment.

- **Auth Required**: Yes (student)
- **Request Body**:

```json
{
  "plan": "yearly",
  "phone_number": "+254712345678",
  "amount": 700
}
```

- **Response**: `200 OK`

```json
{
  "transaction_id": "txn-uuid-1",
  "checkout_request_id": "ws_CO_140920261234567890",
  "status": "pending",
  "amount": 700,
  "plan": "yearly",
  "message": "M-Pesa prompt sent to +254712****678"
}
```

- **Status Codes**:
  - `200` — STK push initiated
  - `401` — Unauthorized
  - `422` — Invalid phone number or amount
  - `503` — M-Pesa service unavailable

- **Example cURL**:

```bash
curl -X POST https://api.somapace.com/api/v1/payments/init \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "yearly",
    "phone_number": "+254712345678",
    "amount": 700
  }'
```

---

### POST /api/v1/payments/callback

M-Pesa callback endpoint (called by Safaricom).

- **Auth Required**: No (Safaricom callback)
- **Request Body** (Safaricom format):

```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34800735-1",
      "CheckoutRequestID": "ws_CO_140920261234567890",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          {"Name": "Amount", "Value": 700},
          {"Name": "MpesaReceiptNumber", "Value": "QHH12ABCD3"},
          {"Name": "Balance"},
          {"Name": "TransactionDate", "Value": 20260914120000},
          {"Name": "PhoneNumber", "Value": 254712345678}
        ]
      }
    }
  }
}
```

- **Response**: `200 OK`

```json
{
  "ResultCode": 0,
  "ResultDesc": "Success"
}
```

- **Status Codes**:
  - `200` — Callback received
  - `400` — Invalid payload

- **Example cURL** (for testing):

```bash
curl -X POST https://api.somapace.com/api/v1/payments/callback \
  -H "Content-Type: application/json" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "29115-34800735-1",
        "CheckoutRequestID": "ws_CO_140920261234567890",
        "ResultCode": 0,
        "ResultDesc": "Success",
        "CallbackMetadata": {
          "Item": [
            {"Name": "Amount", "Value": 700},
            {"Name": "MpesaReceiptNumber", "Value": "QHH12ABCD3"},
            {"Name": "PhoneNumber", "Value": 254712345678}
          ]
        }
      }
    }
  }'
```

---

### POST /api/v1/payments/query/{transaction_id}

Query the status of a pending payment.

- **Auth Required**: Yes (student, admin)
- **Response**: `200 OK`

```json
{
  "transaction_id": "txn-uuid-1",
  "checkout_request_id": "ws_CO_140920261234567890",
  "status": "completed",
  "amount": 700,
  "mpesa_receipt": "QHH12ABCD3",
  "created_at": "2026-09-14T12:00:00Z",
  "completed_at": "2026-09-14T12:00:30Z"
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `404` — Transaction not found

- **Example cURL**:

```bash
curl -X POST https://api.somapace.com/api/v1/payments/query/txn-uuid-1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### GET /api/v1/payments/subscription

Get current subscription status.

- **Auth Required**: Yes (student)
- **Response**: `200 OK`

```json
{
  "active": true,
  "plan": "yearly",
  "starts_at": "2026-09-14T12:00:00Z",
  "expires_at": "2027-09-14T12:00:00Z",
  "auto_renew": true,
  "days_remaining": 365,
  "payment_history": [
    {
      "id": "payment-uuid-1",
      "amount_kes": 700,
      "status": "completed",
      "mpesa_receipt": "QHH12ABCD3",
      "created_at": "2026-09-14T12:00:00Z"
    }
  ]
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `404` — No subscription found

- **Example cURL**:

```bash
curl -X GET https://api.somapace.com/api/v1/payments/subscription \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Admin Endpoints

### GET /api/v1/admin/dashboard

Get admin dashboard with platform overview.

- **Auth Required**: Yes (admin)
- **Response**: `200 OK`

```json
{
  "overview": {
    "total_users": 8500,
    "active_users_today": 2100,
    "active_users_week": 5200,
    "new_users_today": 45,
    "new_users_week": 310
  },
  "subscriptions": {
    "active": 7800,
    "expired": 700,
    "revenue_today_kes": 31500,
    "revenue_week_kes": 217000,
    "revenue_month_kes": 875000
  },
  "content": {
    "total_materials": 450,
    "total_topics": 2200,
    "total_lessons": 1800,
    "total_quizzes": 1800,
    "pending_approval": 12
  },
  "generation_queue": {
    "pending": 5,
    "processing": 2,
    "failed_today": 1
  },
  "top_subjects": [
    {"subject": "Mathematics", "users": 6200, "topics": 800},
    {"subject": "Science", "users": 5800, "topics": 600},
    {"subject": "English", "users": 5100, "topics": 450}
  ]
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `403` — Admin required

- **Example cURL**:

```bash
curl -X GET https://api.somapace.com/api/v1/admin/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### GET /api/v1/admin/analytics

Get detailed analytics data.

- **Auth Required**: Yes (admin)
- **Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `30d` | Time period: 7d, 30d, 90d, 1y |
| `metric` | string | — | Specific metric: users, revenue, content, engagement |

- **Response**: `200 OK`

```json
{
  "period": "30d",
  "user_growth": {
    "daily": [
      {"date": "2026-09-01", "new_users": 35, "active_users": 1800},
      {"date": "2026-09-02", "new_users": 42, "active_users": 1950}
    ],
    "total_new": 1100,
    "growth_rate": 14.8
  },
  "engagement": {
    "avg_session_minutes": 22,
    "avg_quiz_score": 74,
    "completion_rate": 0.68,
    "retention_7day": 0.45,
    "retention_30day": 0.28
  },
  "content_performance": {
    "most_popular_topics": [
      {"topic": "Algebra Basics", "views": 4500, "avg_score": 82},
      {"topic": "Cell Structure", "views": 3800, "avg_score": 75}
    ],
    "lowest_performing": [
      {"topic": "Geometric Proofs", "views": 200, "avg_score": 45}
    ]
  }
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `403` — Admin required

- **Example cURL**:

```bash
curl -X GET "https://api.somapace.com/api/v1/admin/analytics?period=30d" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

### POST /api/v1/admin/lessons/{id}/approve

Approve a generated lesson for student access.

- **Auth Required**: Yes (admin)
- **Request Body**:

```json
{
  "notes": "Content verified, accurate for Grade 7 CBC"
}
```

- **Response**: `200 OK`

```json
{
  "lesson_id": "lesson-uuid-1",
  "status": "approved",
  "approved_by": "admin-uuid-1",
  "approved_at": "2026-09-14T14:00:00Z",
  "notes": "Content verified, accurate for Grade 7 CBC"
}
```

- **Status Codes**:
  - `200` — Approved
  - `401` — Unauthorized
  - `403` — Admin required
  - `404` — Lesson not found

- **Example cURL**:

```bash
curl -X POST https://api.somapace.com/api/v1/admin/lessons/lesson-uuid-1/approve \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{"notes": "Content verified, accurate for Grade 7 CBC"}'
```

---

### POST /api/v1/admin/lessons/{id}/reject

Reject a generated lesson.

- **Auth Required**: Yes (admin)
- **Request Body**:

```json
{
  "reason": "Incorrect formula in section 2, needs regeneration",
  "request_regeneration": true
}
```

- **Response**: `200 OK`

```json
{
  "lesson_id": "lesson-uuid-1",
  "status": "rejected",
  "rejected_by": "admin-uuid-1",
  "rejected_at": "2026-09-14T14:00:00Z",
  "reason": "Incorrect formula in section 2, needs regeneration",
  "regeneration_queued": true
}
```

- **Status Codes**:
  - `200` — Rejected
  - `401` — Unauthorized
  - `403` — Admin required
  - `404` — Lesson not found

- **Example cURL**:

```bash
curl -X POST https://api.somapace.com/api/v1/admin/lessons/lesson-uuid-1/reject \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Incorrect formula in section 2",
    "request_regeneration": true
  }'
```

---

### PUT /api/v1/admin/lessons/{id}/edit

Edit a lesson's content directly.

- **Auth Required**: Yes (admin)
- **Request Body**:

```json
{
  "content_json": {
    "title": "Understanding Variables",
    "introduction": "Updated introduction text...",
    "sections": []
  }
}
```

- **Response**: `200 OK`

```json
{
  "lesson_id": "lesson-uuid-1",
  "status": "edited",
  "edited_by": "admin-uuid-1",
  "edited_at": "2026-09-14T14:00:00Z",
  "version": 2
}
```

- **Status Codes**:
  - `200` — Updated
  - `401` — Unauthorized
  - `403` — Admin required
  - `404` — Lesson not found
  - `422` — Invalid content

- **Example cURL**:

```bash
curl -X PUT https://api.somapace.com/api/v1/admin/lessons/lesson-uuid-1/edit \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -H "Content-Type: application/json" \
  -d '{
    "content_json": {
      "title": "Understanding Variables",
      "introduction": "Updated text here"
    }
  }'
```

---

### GET /api/v1/admin/generation-queue

View current content generation queue.

- **Auth Required**: Yes (admin)
- **Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `status` | string | — | Filter: pending, processing, completed, failed |
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |

- **Response**: `200 OK`

```json
{
  "items": [
    {
      "id": "job-uuid-1",
      "topic_id": "topic-uuid-5",
      "topic_title": "Cell Division",
      "status": "processing",
      "content_types": ["lesson", "quiz", "flashcards", "practice"],
      "started_at": "2026-09-14T13:00:00Z",
      "estimated_completion": "2026-09-14T13:02:00Z",
      "progress_percentage": 65
    },
    {
      "id": "job-uuid-2",
      "topic_id": "topic-uuid-6",
      "topic_title": "Photosynthesis",
      "status": "pending",
      "content_types": ["lesson", "quiz"],
      "queued_at": "2026-09-14T13:00:00Z",
      "position_in_queue": 1
    }
  ],
  "summary": {
    "pending": 5,
    "processing": 2,
    "completed_today": 18,
    "failed_today": 1,
    "avg_generation_time_seconds": 90
  },
  "total": 7,
  "page": 1,
  "pages": 1
}
```

- **Status Codes**:
  - `200` — Success
  - `401` — Unauthorized
  - `403` — Admin required

- **Example cURL**:

```bash
curl -X GET "https://api.somapace.com/api/v1/admin/generation-queue?status=processing" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Appendix: Content Types Reference

### Lesson Content JSON Structure

```json
{
  "title": "Topic Title",
  "introduction": "Opening paragraph...",
  "sections": [
    {
      "heading": "Section Title",
      "content": "Section text...",
      "examples": ["Example 1", "Example 2"],
      "key_point": "Important takeaway",
      "cbc_alignment": "CBC standard reference"
    }
  ],
  "summary": "Summary paragraph...",
  "key_terms": [
    {"term": "Variable", "definition": "A symbol representing an unknown value"}
  ],
  "further_reading": ["Additional resources..."]
}
```

### Quiz Question Types

| Type | Fields |
|------|--------|
| `multiple_choice` | `question`, `options[]`, `correct_answer` (index), `explanation` |
| `true_false` | `question`, `correct_answer` (boolean), `explanation` |
| `fill_blank` | `question` (with ___), `correct_answer` (string), `explanation` |
| `short_answer` | `question`, `correct_answer` (string), `explanation` |

### Flashcard Object

```json
{
  "id": "uuid",
  "front": "Question or term",
  "back": "Answer or definition",
  "difficulty": "easy|medium|hard",
  "tags": ["tag1", "tag2"]
}
```

### Practice Question Object

```json
{
  "id": "uuid",
  "question_text": "Problem statement",
  "difficulty": "easy|medium|hard",
  "solution_json": {
    "steps": ["Step 1", "Step 2"],
    "answer": "Final answer",
    "hints": ["Hint 1"],
    "common_mistakes": ["Mistake 1"]
  }
}
```
