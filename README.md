# SomaPace

**Smart, self-paced learning for Kenyan students.**

SomaPace is a Progressive Web App that uses AI to transform school materials into interactive lessons, quizzes, flashcards, and practice questions — aligned with the Kenyan Competency-Based Curriculum (CBC). Built for low-bandwidth environments with full offline support.

---

## Features

- **Upload & Learn**: Upload PDFs, DOCX, or photos of school materials — AI generates structured lessons
- **Smart Quizzes**: Auto-generated quizzes with instant feedback and score tracking
- **Flashcards & Spaced Repetition**: SM-2 algorithm for long-term retention
- **Audio Narration**: Text-to-speech for every lesson (listen while commuting)
- **Offline-First PWA**: Works without internet after first load
- **M-Pesa Payments**: Subscribe via M-Pesa (KES 200/month or KES 700/year)
- **CBC-Aligned**: Content structured per Kenyan curriculum standards
- **Dashboard**: Track progress across subjects, grades, and topics

---

## Quick Start

### Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/somapace.git
cd somapace

# Copy and configure environment
cp .env.example .env

# Start all services
docker-compose up -d

# Run migrations
docker-compose exec backend alembic upgrade head

# Seed sample data
docker-compose exec backend python -m app.scripts.seed_data
```

Visit [http://localhost:3000](http://localhost:3000)

### Manual Setup

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend (in another terminal)
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS, PWA |
| Backend | Python 3.12, FastAPI, SQLAlchemy, Alembic |
| Database | PostgreSQL 16 + pgvector |
| Cache/Queue | Redis 7 |
| AI | Google Gemini 1.5 Pro |
| TTS | Google Cloud Text-to-Speech |
| Payments | Safaricom M-Pesa Daraja API |
| Storage | Cloudflare R2 |
| Hosting | Vercel (frontend), Railway (backend) |
| Monitoring | Sentry |

---

## Project Structure

```
somapace/
├── frontend/                  # Next.js PWA
│   ├── app/                   # App Router pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities, API client
│   ├── hooks/                 # Custom React hooks
│   ├── public/                # Static assets, manifest
│   └── styles/                # Global styles
├── backend/                   # FastAPI backend
│   ├── app/
│   │   ├── api/               # API route handlers
│   │   │   └── v1/            # Versioned endpoints
│   │   ├── core/              # Config, security, deps
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   │   ├── ai/            # Gemini integration
│   │   │   ├── material/      # PDF/DOCX/OCR processing
│   │   │   ├── payment/       # M-Pesa integration
│   │   │   ├── spaced_rep/    # SM-2 algorithm
│   │   │   └── tts/           # Text-to-speech
│   │   ├── tasks/             # Background job handlers
│   │   └── scripts/           # Seed data, utilities
│   ├── alembic/               # Database migrations
│   ├── tests/                 # Test suite
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── ARCHITECTURE.md
├── DEPLOYMENT.md
├── RISK_REGISTER.md
├── API_SPEC.md
└── README.md
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | System architecture, data flow diagrams, database schema |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Deployment guide, environment setup, cost estimates |
| [API_SPEC.md](./API_SPEC.md) | Full API specification with request/response examples |
| [RISK_REGISTER.md](./RISK_REGISTER.md) | Risk assessment and mitigation strategies |

---

## API Documentation

Once the backend is running, interactive API docs are available at:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## Development

### Running Tests

```bash
# Backend
cd backend
pytest

# With coverage
pytest --cov=app --cov-report=html

# Frontend
cd frontend
npm test
```

### Code Quality

```bash
# Backend linting
cd backend
ruff check .
ruff format .

# Frontend linting
cd frontend
npm run lint
npm run typecheck
```

### Database Migrations

```bash
# Create a new migration
cd backend
alembic revision --autogenerate -m "description of change"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

---

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the complete deployment guide.

**TL;DR**:
1. Frontend → Vercel (connect GitHub, auto-deploy)
2. Backend → Railway (Docker, env vars, migrations)
3. Database → Neon (PostgreSQL + pgvector)
4. Redis → Upstash (managed Redis)
5. Storage → Cloudflare R2 (S3-compatible)
6. M-Pesa → Safaricom Daraja (register app, configure callbacks)

---

## Pricing

| Plan | Price | Duration |
|------|-------|----------|
| Free Trial | KES 0 | 7 days |
| Monthly | KES 200 | 30 days |
| Yearly | KES 700 | 365 days |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards

- **Python**: Follow PEP 8, use type hints, run `ruff` linter
- **TypeScript**: Strict mode, ESLint, Prettier
- **Commits**: Conventional Commits (`feat:`, `fix:`, `docs:`, etc.)
- **PRs**: Include description, test results, and screenshots if UI changes

---

## License

This project is licensed under the MIT License — see [LICENSE](./LICENSE) for details.

---

## Support

- **Issues**: [GitHub Issues](https://github.com/your-org/somapace/issues)
- **Email**: support@somapace.com
- **WhatsApp**: +254 700 000 000

---

Built with ❤️ for Kenyan students.
