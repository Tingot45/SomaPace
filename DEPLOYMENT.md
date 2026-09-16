# SomaPace — Deployment Guide

## Table of Contents

1. [Phase 1: Development (Local)](#phase-1-development-local)
2. [Phase 2: Staging/Production](#phase-2-stagingproduction)
3. [Environment Variables](#environment-variables)
4. [Deployment Steps](#deployment-steps)
5. [Cost Estimates](#cost-estimates)
6. [Revenue Projections](#revenue-projections)
7. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Phase 1: Development (Local)

### Prerequisites

- Docker Desktop (with Docker Compose v2)
- Node.js 20+ (for non-Docker development)
- Python 3.12+ (for non-Docker development)
- Git

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-org/somapace.git
cd somapace

# Copy environment file
cp .env.example .env

# Edit .env with your local values (see Environment Variables section)
# At minimum, set: DATABASE_URL, REDIS_URL, GEMINI_API_KEY

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend alembic upgrade head

# Seed sample data (optional)
docker-compose exec backend python -m app.scripts.seed_data

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs (Swagger UI)
# Backend API: http://localhost:8000/redoc (ReDoc)
```

### Docker Compose Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000 | Next.js PWA dev server |
| backend | 8000 | FastAPI with hot reload |
| postgres | 5432 | PostgreSQL 16 + pgvector |
| redis | 6379 | Redis 7 for caching/queues |
| worker | — | Background job processor |

### Local Development Commands

```bash
# Frontend
cd frontend
npm install
npm run dev          # Dev server with HMR
npm run build        # Production build
npm run lint         # ESLint check
npm run typecheck    # TypeScript check

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
alembic revision --autogenerate -m "description"  # New migration
alembic upgrade head                              # Apply migrations
pytest                                           # Run tests
```

---

## Phase 2: Staging/Production

### Architecture Overview

| Component | Service | Plan |
|-----------|---------|------|
| Frontend | Vercel | Pro |
| Backend | Railway | Starter/Developer |
| Database | Neon | Pro |
| Cache/Queue | Upstash | Pay-as-you-go |
| File Storage | Cloudflare R2 | Free tier + usage |
| Domain/DNS | Cloudflare | Free |
| Monitoring | Sentry | Free tier |

---

## Environment Variables

### Frontend (Next.js — Vercel)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api.somapace.com` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `SomaPace` |
| `NEXT_PUBLIC_MPESA_SHORTCODE` | M-Pesa business shortcode | `174379` |
| `NEXT_PUBLIC_MPESA_ENV` | M-Pesa environment | `production` or `sandbox` |

### Backend (FastAPI — Railway)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@ep-xxx.neon.tech/somapace` |
| `REDIS_URL` | Redis connection string | `rediss://default:xxx@upstash.io:6380` |
| `SECRET_KEY` | JWT signing key (64+ chars random) | `your-super-secret-key-here` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token TTL | `15` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token TTL | `30` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `GEMINI_MODEL` | Gemini model to use | `gemini-1.5-pro` |
| `GOOGLE_CLOUD_PROJECT` | GCP project ID | `somapace-prod` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to GCP service account JSON | `/app/secrets/gcp-sa.json` |
| `TTS_VOICE_NAME` | Default TTS voice | `en-US-Neural2-F` |
| `MPESA_CONSUMER_KEY` | Daraja consumer key | `your-consumer-key` |
| `MPESA_CONSUMER_SECRET` | Daraja consumer secret | `your-consumer-secret` |
| `MPESA_PASSKEY` | Daraja Lipa Na M-Pesa passkey | `your-passkey` |
| `MPESA_SHORTCODE` | M-Pesa business shortcode | `174379` |
| `MPESA_CALLBACK_URL` | M-Pesa callback URL | `https://api.somapace.com/api/v1/payments/callback` |
| `MPESA_ENV` | M-Pesa environment | `production` or `sandbox` |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID | `your-account-id` |
| `R2_ACCESS_KEY_ID` | R2 access key | `your-access-key` |
| `R2_SECRET_ACCESS_KEY` | R2 secret key | `your-secret-key` |
| `R2_BUCKET_NAME` | R2 bucket name | `somapace-files` |
| `R2_PUBLIC_URL` | R2 public URL | `https://pub-xxx.r2.dev` |
| `SENTRY_DSN` | Sentry error tracking DSN | `https://xxx@sentry.io/xxx` |
| `ENVIRONMENT` | Deployment environment | `production` or `staging` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `https://somapace.com,https://www.somapace.com` |
| `LOG_LEVEL` | Logging level | `INFO` |
| `WORKER_CONCURRENCY` | Background worker threads | `4` |
| `MAX_UPLOAD_SIZE_MB` | Max file upload size | `50` |

---

## Deployment Steps

### 1. Frontend — Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# From the frontend directory
cd frontend

# Link to Vercel project
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
# Enter: https://api.somapace.com

# Deploy to production
vercel --prod
```

**Vercel Configuration** (`vercel.json`):
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "regions": ["cpt1"],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
        { "key": "Service-Worker-Allowed", "value": "/" }
      ]
    }
  ]
}
```

### 2. Backend — Railway

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create new project
railway init somapace-backend

# Link to project
railway link

# Set environment variables (interactive)
railway variables set DATABASE_URL="postgresql://..."
railway variables set REDIS_URL="rediss://..."
railway variables set SECRET_KEY="your-secret-key"
railway variables set GEMINI_API_KEY="AIza..."
railway variables set MPESA_CONSUMER_KEY="..."
railway variables set MPESA_CONSUMER_SECRET="..."
railway variables set R2_ACCESS_KEY_ID="..."
railway variables set R2_SECRET_ACCESS_KEY="..."
# ... set all other variables

# Deploy
railway up

# Run migrations after first deploy
railway run alembic upgrade head
```

**Dockerfile** (root of backend):
```dockerfile
FROM python:3.12-slim AS base

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libmagic1 \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend/ .

# Expose port
EXPOSE 8000

# Run with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### 3. Database — Neon

1. Create account at [neon.tech](https://neon.tech)
2. Create new project: `somapace`
3. Copy connection string (pooled)
4. Enable pgvector extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
5. Run migrations:
   ```bash
   DATABASE_URL="postgresql://..." alembic upgrade head
   ```
6. Create read replica for analytics (optional)
7. Set up branching for preview environments (optional)

### 4. Redis — Upstash

1. Create account at [upstash.com](https://upstash.com)
2. Create Redis instance (select region closest to Railway)
3. Copy Redis URL (TLS enabled)
4. Enable weekly backup
5. Set up Redis CLI for debugging:
   ```bash
   upstash-cli connect <your-instance-url>
   ```

### 5. File Storage — Cloudflare R2

1. Create Cloudflare account
2. Navigate to R2 → Create bucket: `somapace-files`
3. Configure public access:
   - Go to Settings → Public Access
   - Enable R2.dev subdomain (or configure custom domain)
4. Generate API tokens:
   - Create API token with R2 read/write permissions
   - Copy Access Key ID and Secret Access Key
5. Set CORS policy:
   ```json
   [
     {
       "AllowedOrigins": ["https://somapace.com", "https://www.somapace.com"],
       "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
       "AllowedHeaders": ["*"],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

### 6. DNS — Cloudflare

1. Add domain `somapace.com` to Cloudflare
2. Update nameservers at registrar
3. Create DNS records:
   | Type | Name | Content | Proxy |
   |------|------|---------|-------|
   | CNAME | @ | cname.vercel-dns.com | Proxied |
   | CNAME | www | cname.vercel-dns.com | Proxied |
   | CNAME | api | somapace-backend.up.railway.app | DNS only |
4. Enable SSL/TLS: Full (Strict)
5. Enable HSTS, Always Use HTTPS

### 7. SSL

- **Frontend (Vercel)**: Automatic SSL via Vercel certificates
- **Backend (Railway)**: Automatic SSL via Railway certificates
- **No manual configuration needed**

### 8. M-Pesa — Daraja API

1. Create Safaricom Developer Account: [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create new app: `SomaPace Production`
3. Enable products:
   - Lipa Na M-Pesa Online Payment
   - C2B Payment
4. Configure callback URLs:
   - Validation URL: `https://api.somapace.com/api/v1/payments/validate`
   - Confirmation URL: `https://api.somapace.com/api/v1/payments/callback`
5. Go live process:
   - Test with sandbox first
   - Submit for production approval
   - Provide business registration docs
   - Wait for Safaricom approval (1-2 weeks)

### 9. Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create API key
3. Set billing account
4. Configure quotas:
   - Requests per minute: 60
   - Tokens per minute: 1,000,000
   - Set up budget alerts at $50, $100, $200
5. Enable model access: `gemini-1.5-pro`, `gemini-1.5-flash`

---

## Cost Estimate for 10,000 Users

### Monthly Infrastructure Costs

| Service | Plan | Monthly Cost (USD) |
|---------|------|-------------------|
| Vercel | Pro | $20 |
| Railway | Starter | $5-20 |
| Neon | Pro | $19 |
| Upstash | Pay-as-you-go | $10 |
| Cloudflare R2 | Free tier + usage | $5 |
| Gemini API | Pay-per-token | ~$50-100 |
| Google Cloud TTS | Pay-per-character | ~$30-50 |
| Domain + DNS | Cloudflare | $10/year |
| Sentry | Free tier | $0 |
| **Total** | | **~$150-250/month** |

### Cost Per Student

| Metric | Value |
|--------|-------|
| Cost per student/month | ~$0.015-0.025 |
| Cost per student/year | ~$0.18-0.30 |

### Cost Breakdown by Service

```
AI Generation (Gemini):   ~40-50% of total cost
TTS (Google Cloud):       ~20-25% of total cost
Compute (Vercel+Railway): ~15-20% of total cost
Database (Neon):          ~10-15% of total cost
Storage (R2):             ~2-5% of total cost
Cache (Upstash):          ~3-5% of total cost
```

### Scaling Cost Projections

| Users | Monthly Cost | Cost/Student |
|-------|-------------|--------------|
| 1,000 | ~$80-120 | $0.08-0.12 |
| 5,000 | ~$120-180 | $0.024-0.036 |
| 10,000 | ~$150-250 | $0.015-0.025 |
| 50,000 | ~$500-800 | $0.01-0.016 |
| 100,000 | ~$900-1,500 | $0.009-0.015 |

> Note: Costs decrease per student as users scale due to shared infrastructure and content reuse caching.

---

## Revenue Projections

### At 10,000 Students

| Metric | Value |
|--------|-------|
| Subscription price | KES 700/year (~$5.40 USD) |
| Revenue at 10K students | KES 7,000,000/year (~$54,000 USD) |
| Infrastructure cost | ~$2,000-3,000/year |
| **Gross margin** | **~94-96%** |

### Revenue Scenarios

| Scenario | Students | Revenue (KES) | Revenue (USD) | Cost (USD) | Margin |
|----------|----------|---------------|---------------|------------|--------|
| Conservative | 2,000 | 1,400,000 | $10,800 | $1,200 | 89% |
| Moderate | 10,000 | 7,000,000 | $54,000 | $2,500 | 95% |
| Optimistic | 50,000 | 35,000,000 | $270,000 | $8,000 | 97% |
| Aggressive | 100,000 | 70,000,000 | $540,000 | $15,000 | 97% |

### Break-Even Analysis

- **Fixed costs**: ~$150/month (infrastructure minimum)
- **Variable cost**: ~$0.001-0.005 per active student/month (AI + TTS usage)
- **Break-even**: ~30 students at KES 700/year
- **Profitable from month 1** with minimal marketing

---

## Post-Deployment Checklist

### First Deploy

- [ ] All environment variables set correctly
- [ ] Database migrations applied
- [ ] pgvector extension enabled
- [ ] SSL certificates working (HTTPS)
- [ ] CORS configured for production domain
- [ ] M-Pesa callback URL registered and verified
- [ ] Gemini API key active with billing enabled
- [ ] R2 bucket created with correct CORS policy
- [ ] DNS records propagated
- [ ] Sentry error tracking receiving events

### Ongoing

- [ ] Monitor Sentry for errors daily
- [ ] Check Railway deployment logs weekly
- [ ] Review Neon database metrics monthly
- [ ] Audit M-Pesa transactions weekly
- [ ] Monitor Gemini API usage and costs
- [ ] Update SSL certificates (auto-renewal should handle this)
- [ ] Backup database weekly (Neon handles this)
- [ ] Review and rotate API keys quarterly

### Security

- [ ] No secrets in git repository
- [ ] All API keys stored in environment variables
- [ ] Rate limiting enabled on all endpoints
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (ORM usage)
- [ ] XSS prevention (output encoding)
- [ ] CSRF protection enabled
- [ ] Content Security Policy headers set

### Performance

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] API response time < 200ms (p95)
- [ ] Database query time < 50ms (p95)
- [ ] Image optimization enabled
- [ ] Gzip/Brotli compression enabled

---

## Rollback Procedure

### Frontend (Vercel)

```bash
# List recent deployments
vercel ls

# Promote a previous deployment
vercel promote <deployment-url>
```

### Backend (Railway)

```bash
# List recent deployments
railway logs

# Rollback to previous deployment
railway rollback
```

### Database

```bash
# Create backup before migration
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# If migration fails, restore
psql $DATABASE_URL < backup_$(date +%Y%m%d).sql
```

---

## Monitoring Alerts

### Critical Alerts (Immediate)

- Backend error rate > 5%
- Database connection failures
- M-Pesa callback failures > 10%
- API response time > 2s (p95)
- Gemini API errors > 20%

### Warning Alerts (Within 1 hour)

- Gemini API cost > $50/day
- TTS cost > $20/day
- Database storage > 80%
- Redis memory > 80%
- Failed login attempts > 50/hour

### Info Alerts (Daily digest)

- New user registrations
- Subscription conversions
- Content generation count
- Most popular subjects
- API usage summary
