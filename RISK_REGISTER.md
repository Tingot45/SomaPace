# SomaPace — Risk Register

## Risk Assessment Matrix

| Likelihood | Score | Description |
|------------|-------|-------------|
| Low | 1 | Unlikely to occur (<10% chance) |
| Medium | 2 | May occur (10-50% chance) |
| High | 3 | Likely to occur (>50% chance) |

| Impact | Score | Description |
|--------|-------|-------------|
| Low | 1 | Minor inconvenience, no revenue loss |
| Medium | 2 | Moderate disruption, some user impact |
| High | 3 | Significant disruption, revenue/user loss |
| Critical | 4 | Catastrophic, existential threat |

**Risk Score = Likelihood × Impact** (1-12 scale)

---

## Risk Register

| # | Risk | Likelihood | Impact | Score | Category | Mitigation |
|---|------|-----------|--------|-------|----------|------------|
| R1 | AI hallucination in generated content | High (3) | High (3) | **9** | Quality | Fact-check pass (second Gemini call), human review for first 100 lessons, source citations, flag uncertainty, admin approval required |
| R2 | Data privacy breach (student data) | Medium (2) | Critical (4) | **8** | Security | JWT auth, RBAC, encrypted at rest, Kenya DPA 2019 compliance, minimal data collection, no PII in logs, GDPR-aligned policies |
| R3 | Low bandwidth / slow loading | High (3) | High (3) | **9** | Technical | PWA offline caching, text-first rendering, lazy image loading, CDN for assets, compressed responses, service worker |
| R4 | M-Pesa payment failures | Medium (2) | High (3) | **6** | Financial | Retry logic, transaction status polling, SMS confirmation, manual reconciliation dashboard, alternative payment (Airtel Money, card) |
| R5 | Gemini API cost overrun | Medium (2) | Medium (2) | **4** | Financial | Batch caching, content reuse (same topic = same lesson), token budget per request, usage monitoring, Flash model for simpler tasks |
| R6 | OCR quality on scanned materials | High (3) | Medium (2) | **6** | Quality | Pre-processing (contrast, cleanup), confidence scoring, manual re-upload option, support multiple OCR engines |
| R7 | Student content piracy | Medium (2) | Low (1) | **2** | Legal | DRM-free approach (content is educational), watermarking, rate limiting on API, legal terms |
| R8 | Teacher strike / school closure | Low (1) | Medium (2) | **2** | External | Self-paced design works outside school, parent engagement features, SMS reminders |
| R9 | Regulatory changes (Kenya education) | Low (1) | High (3) | **3** | Legal | Modular curriculum system, easy to update CBC alignment, monitor policy changes |
| R10 | Server downtime | Low (1) | High (3) | **3** | Technical | Multi-region hosting, health checks, auto-restart, Sentry monitoring, status page |
| R11 | Grade/subject content gaps | High (3) | Medium (2) | **6** | Quality | Admin dashboard for gap analysis, community contributions, prioritize high-demand topics |
| R12 | Audio quality (TTS accent) | Medium (2) | Medium (2) | **4** | Quality | Multiple voice options, user feedback loop, human voice for flagship content, A/B testing |
| R13 | Mobile device fragmentation | High (3) | Medium (2) | **6** | Technical | PWA (no app store), progressive enhancement, test on real devices, Chrome DevTools responsive testing |
| R14 | Scaling beyond 10K users | Low (1) | Medium (2) | **2** | Technical | Horizontal scaling (Railway/Fly.io), CDN, database connection pooling, Redis caching, queue-based processing |
| R15 | Competitor response (e.g., Eneza, Zeraki) | Medium (2) | Medium (2) | **4** | Business | Focus on AI-powered content generation, lower price point, offline-first, CBC-specific, local language support |

---

## Risk Priority Summary

### Critical (Score 8-12) — Immediate Action Required

| # | Risk | Score | Action Owner | Deadline |
|---|------|-------|-------------|----------|
| R1 | AI hallucination in generated content | 9 | Tech Lead | Before launch |
| R2 | Data privacy breach (student data) | 8 | Security Lead | Before launch |
| R3 | Low bandwidth / slow loading | 9 | Frontend Lead | Before launch |

### High (Score 6-7) — Plan and Execute

| # | Risk | Score | Action Owner | Deadline |
|---|------|-------|-------------|----------|
| R4 | M-Pesa payment failures | 6 | Backend Lead | Before launch |
| R6 | OCR quality on scanned materials | 6 | AI Engineer | Before launch |
| R11 | Grade/subject content gaps | 6 | Content Lead | Ongoing |
| R13 | Mobile device fragmentation | 6 | Frontend Lead | Before launch |

### Medium (Score 3-5) — Monitor and Mitigate

| # | Risk | Score | Action Owner | Deadline |
|---|------|-------|-------------|----------|
| R5 | Gemini API cost overrun | 4 | Backend Lead | Monthly review |
| R9 | Regulatory changes (Kenya education) | 3 | Product Lead | Quarterly review |
| R12 | Audio quality (TTS accent) | 4 | Content Lead | Ongoing |
| R15 | Competitor response | 4 | Product Lead | Quarterly review |

### Low (Score 1-2) — Accept and Monitor

| # | Risk | Score | Action Owner | Deadline |
|---|------|-------|-------------|----------|
| R7 | Student content piracy | 2 | Legal | As needed |
| R8 | Teacher strike / school closure | 2 | Product Lead | As needed |
| R10 | Server downtime | 3 | DevOps | Ongoing |
| R14 | Scaling beyond 10K users | 2 | Tech Lead | When needed |

---

## Detailed Risk Descriptions

### R1: AI Hallucination in Generated Content (Score: 9)

**Description**: Gemini generates factually incorrect content, wrong formulas, incorrect historical dates, or misleading explanations that students may learn from.

**Impact**: Students learn incorrect information, damages credibility, potential liability.

**Mitigation Strategy**:
1. **Two-pass generation**: Generate content, then validate with a second Gemini call against source material
2. **Source citation**: Always link generated content back to source material sections
3. **Confidence scoring**: Flag low-confidence generations for human review
4. **Admin approval**: All generated content requires admin approval before going live
5. **User feedback**: Students can flag incorrect content ("Report Error" button)
6. **Human review**: First 100 lessons reviewed manually to calibrate quality
7. **Testing**: Automated fact-checking against known correct answers in quizzes

**Residual Risk**: Medium (3) — Some hallucinations may slip through, but user feedback loop catches them quickly.

---

### R2: Data Privacy Breach (Score: 8)

**Description**: Unauthorized access to student personal data (phone numbers, names, grades, learning progress).

**Impact**: Legal liability under Kenya Data Protection Act 2019, loss of trust, potential fines.

**Mitigation Strategy**:
1. **Minimal data collection**: Only collect phone number, name, and grade — no unnecessary PII
2. **Encryption at rest**: PostgreSQL encrypted storage, R2 server-side encryption
3. **Encryption in transit**: TLS 1.3 for all connections
4. **JWT authentication**: Short-lived tokens (15 min), refresh token rotation
5. **RBAC**: Students can only access their own data
6. **No PII in logs**: Structured logging with PII scrubbing
7. **Kenya DPA 2019 compliance**: Data processing agreement, consent mechanisms, right to deletion
8. **GDPR-aligned policies**: Even though Kenya-focused, follow GDPR best practices
9. **Regular audits**: Monthly security review, quarterly penetration testing
10. **Incident response plan**: Documented breach notification procedure

**Residual Risk**: Medium (2) — Strong controls in place, but human error always possible.

---

### R3: Low Bandwidth / Slow Loading (Score: 9)

**Description**: Students in rural Kenya have limited bandwidth (often 2G/3G), causing slow load times and poor experience.

**Impact**: High bounce rate, low engagement, student churn.

**Mitigation Strategy**:
1. **PWA with offline caching**: Core content available offline after first load
2. **Text-first rendering**: Lesson text loads before images/audio
3. **Lazy loading**: Images and audio load on demand, not upfront
4. **CDN**: Cloudflare CDN serves static assets from edge locations
5. **Compression**: Brotli/Gzip for all text responses
6. **Service worker**: Pre-caches critical assets, serves from cache when offline
7. **Image optimization**: WebP format, responsive sizing, blur placeholders
8. **API response optimization**: Minimal payloads, field selection (`?fields=id,title`)
9. **Progressive loading**: Skeleton screens, incremental content display
10. **Network-aware**: Detect connection quality, adjust content delivery accordingly

**Residual Risk**: Low (1) — PWA architecture specifically designed for this scenario.

---

### R4: M-Pesa Payment Failures (Score: 6)

**Description**: STK push fails, callback doesn't arrive, transaction times out, or duplicate charges occur.

**Impact**: Revenue loss, customer frustration, support burden.

**Mitigation Strategy**:
1. **Retry logic**: Automatic retry on timeout (max 3 attempts)
2. **Status polling**: Query M-Pesa API if callback fails
3. **SMS confirmation**: Cross-reference M-Pesa SMS with transaction record
4. **Manual reconciliation**: Admin dashboard for payment discrepancy resolution
5. **Idempotency**: Unique transaction IDs prevent duplicate charges
6. **Alternative payments**: Plan for Airtel Money, card payments in v2
7. **Grace period**: 24-hour grace period for failed payments before subscription deactivation
8. **Customer support**: WhatsApp-based support for payment issues

**Residual Risk**: Low (1) — M-Pesa is mature, failures are rare and handleable.

---

### R5: Gemini API Cost Overrun (Score: 4)

**Description**: Unexpected spike in AI generation requests causes Gemini API costs to exceed budget.

**Impact**: Budget overrun, potential service suspension.

**Mitigation Strategy**:
1. **Content caching**: Same topic = same generated content, no regeneration needed
2. **Token budget**: Hard limit on tokens per request (8K for lessons, 4K for quizzes)
3. **Flash model**: Use Gemini 1.5 Flash for simpler tasks (flashcard generation)
4. **Usage monitoring**: Real-time dashboard of API costs
5. **Budget alerts**: Email alerts at $50, $100, $200 daily spend
6. **Rate limiting**: Max 10 generations per user per day
7. **Batch processing**: Queue non-urgent generation for off-peak hours
8. **Prompt optimization**: Continuously improve prompts to reduce token usage

**Residual Risk**: Low (1) — Controls prevent runaway costs.

---

### R6: OCR Quality on Scanned Materials (Score: 6)

**Description**: Poor scan quality, handwriting, or unusual fonts cause OCR to produce garbled text.

**Impact**: Bad input leads to bad generated content, student frustration.

**Mitigation Strategy**:
1. **Pre-processing**: Auto-enhance contrast, remove noise, deskew images
2. **Confidence scoring**: OCR engine provides confidence per word/line
3. **Manual re-upload**: Students can re-upload if OCR quality is poor
4. **Multiple engines**: Support Tesseract (local) + Google Vision API (cloud)
5. **Format guidance**: Show students how to take clear photos of materials
6. **Admin review**: Low-confidence OCR flagged for manual review
7. **Partial processing**: Even partial text extraction is useful

**Residual Risk**: Low (1) — Most school materials are typed/printed, OCR works well.

---

### R11: Grade/Subject Content Gaps (Score: 6)

**Description**: Insufficient content for certain grade/subject combinations, limiting app usefulness.

**Impact**: Students in underserved subjects/grades have poor experience.

**Mitigation Strategy**:
1. **Gap analysis dashboard**: Admin tool to identify missing content
2. **Priority matrix**: Focus on high-demand subjects (Math, Science, English, Kiswahili)
3. **Community contributions**: Teachers can upload and contribute content
4. **Bulk generation**: Batch generate content for all grades/subjects
5. **User requests**: Students can request specific content
6. **Partner with schools**: Get materials from schools directly

**Residual Risk**: Medium (2) — Content generation is ongoing, gaps will narrow over time.

---

### R13: Mobile Device Fragmentation (Score: 6)

**Description**: App behaves differently across Android versions, screen sizes, and browser capabilities.

**Impact**: Inconsistent experience, some features may not work on older devices.

**Mitigation Strategy**:
1. **PWA approach**: No app store needed, works in any modern browser
2. **Progressive enhancement**: Core features work everywhere, enhanced features where supported
3. **Real device testing**: Test on popular Kenyan devices (Samsung Galaxy A series, Tecno, Infinix)
4. **Chrome DevTools**: Responsive testing for various screen sizes
5. **Browser support matrix**: Document minimum browser requirements
6. **Feature detection**: Use feature detection, not browser detection
7. **Graceful degradation**: Older devices get simplified UI

**Residual Risk**: Low (1) — PWA abstracts away most platform differences.

---

## Risk Review Schedule

| Frequency | Activity |
|-----------|----------|
| Weekly | Review critical and high risks, check mitigation progress |
| Monthly | Review all risks, update scores based on new information |
| Quarterly | Full risk assessment, identify new risks, retire resolved ones |
| Per release | Risk review for major feature releases |
| On incident | Immediate risk review after any security or quality incident |

---

## Escalation Protocol

1. **Low risk (1-2)**: Monitor, no escalation needed
2. **Medium risk (3-5)**: Team lead review, mitigation plan documented
3. **High risk (6-7)**: Project manager review, weekly status updates
4. **Critical risk (8-12)**: Immediate stakeholder notification, daily status updates, dedicated mitigation owner

---

## Risk Ownership

| Risk | Owner | Backup |
|------|-------|--------|
| R1 (AI Quality) | AI Engineer | Tech Lead |
| R2 (Privacy) | Security Lead | Tech Lead |
| R3 (Bandwidth) | Frontend Lead | Tech Lead |
| R4 (Payments) | Backend Lead | Tech Lead |
| R5 (API Costs) | Backend Lead | DevOps |
| R6 (OCR) | AI Engineer | Backend Lead |
| R7 (Piracy) | Legal | Product Lead |
| R8 (External) | Product Lead | CEO |
| R9 (Regulatory) | Legal | Product Lead |
| R10 (Downtime) | DevOps | Backend Lead |
| R11 (Content Gaps) | Content Lead | Product Lead |
| R12 (Audio) | Content Lead | AI Engineer |
| R13 (Devices) | Frontend Lead | Tech Lead |
| R14 (Scaling) | Tech Lead | DevOps |
| R15 (Competition) | Product Lead | CEO |
