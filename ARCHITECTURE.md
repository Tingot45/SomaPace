# SomaPace — Architecture Document

## System Overview

SomaPace is a smart, self-paced learning web application built for Kenyan students following the Competency-Based Curriculum (CBC). Students upload school materials (PDFs, DOCX, images), and the system uses AI (Google Gemini 1.5 Pro) to generate structured lessons, quizzes, flashcards, and practice questions. Content is delivered as a Progressive Web App (PWA) with full offline support, audio narration via Google Cloud TTS, and spaced repetition for retention. Payments are handled through M-Pesa (Safaricom Daraja API).

### Key Design Principles

- **Offline-First**: PWA with service worker caching for low-bandwidth environments
- **Mobile-First**: Designed for smartphones (85%+ of Kenyan internet access)
- **AI-Powered**: Automated content generation from raw school materials
- **CBC-Aligned**: Content structured per Kenyan curriculum standards
- **Low-Cost**: Infrastructure designed to serve 10,000+ students at ~$0.02/student/month

---

## Architecture Diagram

```mermaid
graph TB
    subgraph Client["Client Layer"]
        PWA["Next.js PWA<br/>Mobile-First"]
        SW["Service Worker<br/>Offline Cache"]
    end
    
    subgraph API["API Layer"]
        GW["FastAPI Gateway<br/>JWT Auth + RBAC"]
    end
    
    subgraph Services["Service Layer"]
        MP["Material Processor<br/>PDF/DOCX/OCR"]
        AI["AI Generator<br/>Gemini 1.5 Pro"]
        TTS["TTS Service<br/>Google Cloud TTS"]
        PAY["Payment Service<br/>M-Pesa Daraja"]
        SR["Spaced Repetition<br/>SM-2 Algorithm"]
    end
    
    subgraph Data["Data Layer"]
        PG[("PostgreSQL 16<br/>+ pgvector")]
        RD[("Redis 7<br/>Queue + Cache")]
        S3["Cloudflare R2<br/>File Storage"]
    end
    
    subgraph External["External APIs"]
        GEMINI["Google Gemini<br/>Content Generation"]
        MPESA["Safaricom M-Pesa<br/>Daraja API"]
        TTS_API["Google Cloud<br/>Text-to-Speech"]
    end
    
    PWA --> GW
    SW -.-> PWA
    GW --> MP
    GW --> AI
    GW --> PAY
    GW --> SR
    MP --> PG
    MP --> S3
    AI --> GEMINI
    PAY --> MPESA
    TTS --> TTS_API
    AI --> RD
    SR --> PG
    GW --> RD
```

---

## Data Flow

### 1. Material Upload Pipeline

```mermaid
sequenceDiagram
    actor Student
    participant PWA as Next.js PWA
    participant API as FastAPI
    participant R2 as Cloudflare R2
    participant Queue as Redis Queue
    participant Proc as Material Processor
    participant DB as PostgreSQL

    Student->>PWA: Upload PDF/DOCX/Image
    PWA->>API: POST /api/v1/materials/upload
    API->>API: Validate JWT, check subscription
    API->>R2: Store raw file
    API->>DB: Create Material (status=pending)
    API->>Queue: Enqueue processing job
    API-->>PWA: 202 Accepted {material_id}
    
    Queue->>Proc: Dequeue job
    Proc->>R2: Download raw file
    Proc->>Proc: Extract text (PDF/DOCX/OCR)
    Proc->>DB: Update Material (extracted_json, status=processed)
    Proc->>Queue: Enqueue AI generation job
```

### 2. AI Lesson Generation Pipeline

```mermaid
sequenceDiagram
    participant Queue as Redis Queue
    participant AI as AI Generator
    participant Gemini as Google Gemini
    participant TTS as TTS Service
    participant GTTS as Google Cloud TTS
    participant DB as PostgreSQL
    participant R2 as Cloudflare R2

    Queue->>AI: Dequeue generation job
    AI->>DB: Fetch Material (extracted_json)
    AI->>Gemini: Generate topics, lessons, quizzes
    Gemini-->>AI: Structured JSON response
    AI->>DB: Store Topics, Lessons, Quizzes
    
    loop For each lesson chunk
        AI->>TTS: Generate audio narration
        TTS->>GTTS: synthesize(text, voice)
        GTTS-->>TTS: Audio bytes
        TTS->>R2: Store audio file
        TTS->>DB: Update Lesson (audio_url)
    end
    
    AI->>DB: Update Material (status=ready)
```

### 3. Quiz Flow

```mermaid
sequenceDiagram
    actor Student
    participant PWA as Next.js PWA
    participant API as FastAPI
    participant DB as PostgreSQL
    participant SR as Spaced Repetition

    Student->>PWA: Start Quiz
    PWA->>API: GET /api/v1/topics/{id}/quiz
    API->>DB: Fetch quiz questions
    API-->>PWA: Quiz JSON
    
    loop For each question
        Student->>PWA: Select answer
        PWA->>API: POST /api/v1/student/progress
        API->>DB: Store answer
        API->>SR: Update flashcard interval
        SR->>DB: Update UserFlashcardState
    end
    
    API-->>PWA: Quiz results + recommendations
```

### 4. M-Pesa Payment Flow

```mermaid
sequenceDiagram
    actor Student
    participant PWA as Next.js PWA
    participant API as FastAPI
    participant MPesa as Safaricom Daraja
    participant DB as PostgreSQL

    Student->>PWA: Select subscription plan
    PWA->>API: POST /api/v1/payments/init
    API->>MPesa: STK Push (Lipa Na M-Pesa)
    MPesa-->>Student: M-Pesa PIN prompt on phone
    Student->>MPesa: Enter PIN
    MPesa->>API: POST /api/v1/payments/callback
    API->>DB: Update Payment (status=completed)
    API->>DB: Activate/extend Subscription
    API-->>PWA: Subscription activated
```

---

## Database ER Diagram

```mermaid
erDiagram
    User ||--o{ Material : uploads
    User ||--o{ UserProgress : tracks
    User ||--o{ Payment : makes
    User ||--o{ Subscription : has
    User ||--o{ UserFlashcardState : reviews
    
    Material ||--o{ Topic : contains
    Material ||--o{ Chunk : chunks_into
    
    Topic ||--o| Lesson : has
    Topic ||--o{ Quiz : has
    Topic ||--o{ PracticeQuestion : has
    Topic ||--o{ Flashcard : has
    
    Lesson ||--o{ AudioNarration : has
    Lesson ||--o{ UserProgress : tracked_by
    Quiz ||--o{ UserProgress : tracked_by
    
    Flashcard ||--o{ UserFlashcardState : reviewed_by
    Payment ||--o| Subscription : creates
    
    User {
        uuid id PK
        string phone_number
        string full_name
        int grade
        enum role
        string password_hash
    }
    Material {
        uuid id PK
        string source_filename
        enum status
        json extracted_json
        int grade
    }
    Topic {
        uuid id PK
        string title
        json subtopics
        enum difficulty
    }
    Lesson {
        uuid id PK
        json content_json
        int word_count
        enum status
    }
    Quiz {
        uuid id PK
        json questions_json
        int passing_score
    }
    Flashcard {
        uuid id PK
        string front
        string back
    }
    Payment {
        uuid id PK
        decimal amount_kes
        enum status
        string mpesa_receipt
    }
```

### Full Schema Reference

#### users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, default gen_random_uuid() |
| phone_number | VARCHAR(15) | Unique, E.164 format |
| full_name | VARCHAR(255) | Required |
| grade | INTEGER | 1-12, Kenyan grade level |
| role | ENUM | student, teacher, admin |
| password_hash | VARCHAR(255) | bcrypt hash |
| created_at | TIMESTAMPTZ | Default now() |
| updated_at | TIMESTAMPTZ | Default now() |

#### materials
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK -> users.id |
| source_filename | VARCHAR(500) | Original filename |
| file_url | TEXT | R2 storage URL |
| file_type | ENUM | pdf, docx, image |
| extracted_json | JSONB | Parsed content |
| grade | INTEGER | CBC grade level |
| subject | VARCHAR(100) | e.g., Mathematics |
| status | ENUM | pending, processing, processed, failed, ready |
| created_at | TIMESTAMPTZ | |

#### topics
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| material_id | UUID | FK -> materials.id |
| title | VARCHAR(500) | Topic name |
| subtopics | JSONB | Array of subtopic strings |
| difficulty | ENUM | easy, medium, hard |
| order_index | INTEGER | Display order |

#### lessons
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| topic_id | UUID | FK -> topics.id |
| content_json | JSONB | Structured lesson content |
| word_count | INTEGER | For TTS cost estimation |
| audio_url | TEXT | R2 URL for audio narration |
| status | ENUM | generating, ready, failed |

#### quizzes
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| topic_id | UUID | FK -> topics.id |
| questions_json | JSONB | Array of question objects |
| passing_score | INTEGER | Percentage (default 70) |

#### flashcards
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| topic_id | UUID | FK -> topics.id |
| front | TEXT | Question/term |
| back | TEXT | Answer/definition |

#### practice_questions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| topic_id | UUID | FK -> topics.id |
| question_text | TEXT | |
| solution_json | JSONB | Step-by-step solution |
| difficulty | ENUM | |

#### user_progress
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK -> users.id |
| topic_id | UUID | FK -> topics.id |
| lesson_id | UUID | FK -> lessons.id (nullable) |
| quiz_id | UUID | FK -> quizzes.id (nullable) |
| score | INTEGER | Percentage |
| completed | BOOLEAN | |
| created_at | TIMESTAMPTZ | |

#### user_flashcard_state
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK -> users.id |
| flashcard_id | UUID | FK -> flashcards.id |
| ease_factor | FLOAT | SM-2 parameter (default 2.5) |
| interval_days | INTEGER | Days until next review |
| repetitions | INTEGER | Successful reviews |
| next_review | TIMESTAMPTZ | Next scheduled review |

#### payments
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK -> users.id |
| amount_kes | DECIMAL(10,2) | Amount in KES |
| mpesa_receipt | VARCHAR(100) | M-Pesa transaction ID |
| status | ENUM | pending, completed, failed |
| created_at | TIMESTAMPTZ | |

#### subscriptions
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| user_id | UUID | FK -> users.id |
| payment_id | UUID | FK -> payments.id |
| plan | ENUM | monthly, yearly |
| starts_at | TIMESTAMPTZ | |
| expires_at | TIMESTAMPTZ | |
| active | BOOLEAN | |

#### audio_narrations
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| lesson_id | UUID | FK -> lessons.id |
| voice | VARCHAR(50) | TTS voice name |
| audio_url | TEXT | R2 URL |
| duration_seconds | FLOAT | |

#### chunks
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| material_id | UUID | FK -> materials.id |
| chunk_index | INTEGER | Order within material |
| content | TEXT | Extracted text chunk |
| embedding | VECTOR(768) | pgvector embedding |

---

## Authentication & Authorization

### JWT-Based Auth Flow

```mermaid
sequenceDiagram
    actor Student
    participant PWA as Next.js PWA
    participant API as FastAPI
    participant DB as PostgreSQL
    participant RD as Redis

    Student->>PWA: Enter phone + password
    PWA->>API: POST /api/v1/auth/login
    API->>DB: Verify credentials
    API->>API: Generate JWT (access + refresh)
    API-->>PWA: {access_token, refresh_token}
    PWA->>PWA: Store in httpOnly cookie
    
    loop Authenticated requests
        PWA->>API: GET /api/v1/... + Authorization: Bearer <token>
        API->>API: Verify JWT signature + expiry
        API->>API: Check RBAC permissions
        API-->>PWA: 200 OK + data
    end
    
    PWA->>API: POST /api/v1/auth/refresh
    API->>RD: Verify refresh token not revoked
    API-->>PWA: New access_token
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|------------|
| **student** | Upload materials, view own progress, take quizzes, manage flashcards, make payments |
| **teacher** | All student permissions + view class progress, upload bulk materials |
| **admin** | All permissions + approve/reject content, view analytics, manage users, edit content |

### JWT Token Structure

```json
{
  "sub": "uuid-of-user",
  "role": "student",
  "grade": 7,
  "exp": 1700000000,
  "iat": 1699996400
}
```

- **Access Token**: 15-minute expiry
- **Refresh Token**: 30-day expiry, stored in Redis for revocation

---

## AI Content Generation Pipeline

### Pipeline Architecture

```mermaid
flowchart LR
    A[Raw Material] --> B[Text Extraction]
    B --> C[Chunking<br/>~2000 tokens/chunk]
    C --> D[Gemini 1.5 Pro<br/>Topic Extraction]
    D --> E[Gemini 1.5 Pro<br/>Lesson Generation]
    E --> F[Gemini 1.5 Pro<br/>Quiz Generation]
    E --> G[Gemini 1.5 Pro<br/>Flashcard Generation]
    E --> H[Gemini 1.5 Pro<br/>Practice Questions]
    E --> I[Google Cloud TTS<br/>Audio Narration]
    
    style A fill:#e1f5fe
    style D fill:#fff3e0
    style E fill:#fff3e0
    style F fill:#fff3e0
    style G fill:#fff3e0
    style H fill:#fff3e0
    style I fill:#e8f5e9
```

### Gemini Prompt Strategy

Each generation step uses structured prompts with JSON schema enforcement:

1. **Topic Extraction**: Input material text → Output array of topics with subtopics
2. **Lesson Generation**: Input topic + subtopics → Output structured lesson (sections, key points, examples, CBC alignment)
3. **Quiz Generation**: Input lesson content → Output MCQs, short answer, fill-in-the-blank questions with answers
4. **Flashcard Generation**: Input lesson content → Output front/back flashcard pairs
5. **Practice Questions**: Input lesson content → Output worked examples with step-by-step solutions

### Content Validation

- Second Gemini call validates generated content against source material
- Confidence scoring on factual claims
- Admin approval required before content goes live
- Source citations preserved from original material

---

## M-Pesa Payment Flow

### Daraja API Integration

```mermaid
flowchart TD
    A[Student Clicks Subscribe] --> B[Frontend: POST /payments/init]
    B --> C[Backend: Generate STK Push]
    C --> D[Safaricom: Lipa Na M-Pesa Online]
    D --> E[Student: Enter M-Pesa PIN on phone]
    E --> F{Transaction Success?}
    F -->|Yes| G[Safaricom: Callback to /payments/callback]
    G --> H[Backend: Verify + Update DB]
    H --> I[Activate Subscription]
    I --> J[Push notification to student]
    F -->|No| K[Backend: Mark payment failed]
    K --> L[Student: Retry or try again]
    
    G -.->|Callback fails| M[Backend: Poll /payments/query/{id}]
    M --> N{Transaction found?}
    N -->|Yes| H
    N -->|No| O[Log for manual reconciliation]
```

### Payment Plans

| Plan | Price (KES) | Duration | Features |
|------|------------|----------|----------|
| Monthly | 200 | 30 days | Full access to all content |
| Yearly | 700 | 365 days | Full access + priority support |
| Free Trial | 0 | 7 days | Limited content (3 topics per subject) |

---

## Caching Strategy

### Redis Cache Layers

| Cache Key Pattern | TTL | Purpose |
|-------------------|-----|---------|
| `user:{id}:progress` | 5 min | Dashboard progress data |
| `topic:{id}:quiz` | 1 hour | Quiz questions (rarely change) |
| `topic:{id}:flashcards` | 1 hour | Flashcard sets |
| `topic:{id}:lesson` | 1 hour | Lesson content |
| `material:{id}:status` | 30 sec | Processing status polling |
| `rate_limit:{ip}` | 1 min | API rate limiting |
| `session:{refresh_token}` | 30 days | Refresh token storage |

### Cache Invalidation

- **Write-through**: Lesson/quiz updates invalidate related cache keys
- **TTL-based**: All caches have explicit TTL
- **Event-driven**: Material processing completion triggers cache refresh

---

## Offline Architecture (PWA + Service Worker)

### Service Worker Strategy

```mermaid
flowchart TD
    A[Request from PWA] --> B{Service Worker Intercept}
    B -->|Cache First| C[Cached Response]
    B -->|Network First| D{Network Available?}
    D -->|Yes| E[Network Response + Update Cache]
    D -->|No| F[Stale-While-Revalidate]
    
    subgraph "Cache Strategy by Resource Type"
        G[HTML Pages] -->|Network First| H[Always try fresh]
        I[API Calls] -->|Network First| I1[Queue if offline]
        J[Static Assets] -->|Cache First| K[Served from cache]
        L[Audio Files] -->|Cache First| M[Pre-cache on lesson open]
        N[Images] -->|Stale-While-Revalidate| O[Serve cached, update in background]
    end
```

### Offline Capabilities

| Feature | Offline Support | Notes |
|---------|----------------|-------|
| View lessons | Yes | Cached on first visit |
| Take quizzes | Yes | Questions cached, answers queued |
| Review flashcards | Yes | SM-2 state stored locally |
| Listen to audio | Yes | Audio files pre-cached |
| Upload materials | No | Requires network |
| Make payments | No | Requires network |
| View dashboard | Yes | Last-synced data |
| Submit progress | Queued | Syncs when online |

### Sync Strategy

```mermaid
sequenceDiagram
    participant PWA as PWA (Client)
    participant SW as Service Worker
    participant API as FastAPI
    participant RD as Redis Queue

    PWA->>SW: Queue offline action
    SW->>SW: Store in IndexedDB
    
    Note over SW: Network restored
    
    SW->>API: Sync queued actions
    API->>RD: Enqueue for processing
    API-->>SW: 200 OK
    SW->>SW: Clear synced items from IndexedDB
```

### IndexedDB Schema (Client-Side)

| Store | Purpose | Sync Direction |
|-------|---------|---------------|
| `progress_queue` | Queued quiz answers, progress updates | Client → Server |
| `cached_lessons` | Offline lesson content | Server → Client |
| `cached_flashcards` | Offline flashcard data | Server → Client |
| `user_preferences` | UI settings, theme | Local only |
| `sync_metadata` | Last sync timestamps | Local only |

---

## Infrastructure Diagram

```mermaid
graph LR
    subgraph "Edge"
        CDN["Cloudflare CDN"]
    end
    
    subgraph "Compute"
        VERCEL["Vercel<br/>(Next.js Frontend)"]
        RAILWAY["Railway<br/>(FastAPI Backend)"]
    end
    
    subgraph "Data"
        NEON["Neon PostgreSQL<br/>+ pgvector"]
        UPSTASH["Upstash Redis"]
        R2["Cloudflare R2"]
    end
    
    subgraph "External"
        GEMINI["Google Gemini"]
        MPP["M-Pesa Daraja"]
        GTTS["Google Cloud TTS"]
    end
    
    CDN --> VERCEL
    VERCEL --> RAILWAY
    RAILWAY --> NEON
    RAILWAY --> UPSTASH
    RAILWAY --> R2
    RAILWAY --> GEMINI
    RAILWAY --> MPP
    RAILWAY --> GTTS
```

---

## Security Considerations

- **Transport**: HTTPS everywhere (TLS 1.3)
- **Authentication**: JWT with short-lived access tokens (15 min)
- **Authorization**: RBAC enforced at API gateway level
- **Data at Rest**: PostgreSQL encryption, R2 server-side encryption
- **Input Validation**: Pydantic models on all endpoints
- **Rate Limiting**: 100 req/min per IP, 10 req/min for auth endpoints
- **CORS**: Strict origin whitelist
- **Headers**: CSP, X-Frame-Options, HSTS
- **Secrets**: Environment variables, never in code
- **Logging**: No PII in logs, structured JSON logging

---

## Monitoring & Observability

| Layer | Tool | Metrics |
|-------|------|---------|
| Frontend | Vercel Analytics | Core Web Vitals, page load |
| Backend | Sentry | Error tracking, performance |
| Database | Neon Dashboard | Connection count, query time |
| Redis | Upstash Dashboard | Memory, ops/sec |
| API | Custom metrics | Request latency, error rates |
| Business | Admin dashboard | Users, completions, revenue |

---

## Scalability Notes

- **Horizontal**: Railway auto-scales backend instances
- **Database**: Neon branching for development, connection pooling via PgBouncer
- **Cache**: Upstash auto-scales with request volume
- **Storage**: R2 has no egress fees, scales infinitely
- **AI**: Gemini API has generous quotas; batch processing during off-peak hours
- **Queue**: Redis-backed job queue handles concurrent generation requests
