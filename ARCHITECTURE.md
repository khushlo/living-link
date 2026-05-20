# LivingLink  Technical Architecture Reference

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LivingLink Platform                           │
│                                                                     │
│  ┌──────────┐  ┌───────────┐  ┌─────────────┐  ┌───────────────┐  │
│  │  Donor   │  │  Patient  │  │ Coordinator │  │   Clinician   │  │
│  │  Portal  │  │  Portal   │  │   Portal    │  │    Portal     │  │
│  └────┬─────┘  └─────┬─────┘  └──────┬──────┘  └──────┬────────┘  │
│       └──────────────┴───────────────┴─────────────────┘           │
│                                  │                                  │
│                   ┌──────────────▼───────────────┐                 │
│                   │      LivingLink AI Engine      │                 │
│                   │   GPT-4o + custom system prompts│                │
│                   └──────────────┬───────────────┘                 │
│                                  │                                  │
│  ┌───────────────────────────────▼──────────────────────────────┐  │
│  │                   Next.js 14 / Node.js API                    │  │
│  │  MentorMatch | ReadyCheck | DonorShield | CenterFlow | LifeAfter│ │
│  └───────────────────────────────┬──────────────────────────────┘  │
│                                  │                                  │
│  ┌───────────────────────────────▼──────────────────────────────┐  │
│  │              PostgreSQL (3 schemas)                           │  │
│  │  app_data (general) | phi_data (encrypted) | audit_log       │  │
│  └───────────────────────────────┬──────────────────────────────┘  │
│                                  │                                  │
│  ┌───────────────────────────────▼──────────────────────────────┐  │
│  │                  HAPI FHIR R4 Server                          │  │
│  └───────────────────────────────┬──────────────────────────────┘  │
└──────────────────────────────────┼──────────────────────────────────┘
                                   │
         ┌─────────────────────────┼──────────────────────┐
         │                         │                      │
    Epic / Cerner             OPTN / HRSA             ONC / HHS
   (SMART on FHIR)       (Policy 18 reporting)   (Bulk FHIR export)
         │
   Cerner App Market
   Epic App Orchard
```

---

## Repository Structure

```
D:\OpenSource\kidneyX\
├── PLAN.md                     ← Full challenge + build plan
├── ARCHITECTURE.md             ← This file
├── PROGRESS.md                 ← Session resume guide
├── PLAN.md                     ← Challenge plan, milestones, features
├── package.json                ← Turborepo root
├── turbo.json                  ← Turborepo pipeline config
├── tsconfig.json               ← Root TypeScript config
├── docker-compose.yml          ← HAPI FHIR + PostgreSQL containers
├── .env.example                ← All required environment variables
│
├── apps/
│   ├── web/                    ← Next.js 14 frontend (App Router)
│   │   ├── app/
│   │   │   ├── (donor)/        ← Donor portal routes
│   │   │   │   ├── dashboard/
│   │   │   │   ├── mentor-match/
│   │   │   │   ├── ready-check/
│   │   │   │   ├── donor-shield/
│   │   │   │   └── life-after/
│   │   │   ├── (clinician)/    ← Clinician portal routes
│   │   │   │   ├── dashboard/
│   │   │   │   └── center-flow/
│   │   │   ├── (coordinator)/  ← Coordinator portal routes
│   │   │   │   ├── dashboard/
│   │   │   │   └── center-flow/
│   │   │   ├── (patient)/      ← Patient/recipient portal routes
│   │   │   │   └── dashboard/
│   │   │   ├── layout.tsx      ← Root layout
│   │   │   ├── page.tsx        ← Landing page
│   │   │   └── globals.css     ← Global styles
│   │   ├── components/
│   │   │   ├── ui/             ← shadcn/ui components
│   │   │   ├── mentor-match/
│   │   │   ├── ready-check/
│   │   │   ├── donor-shield/
│   │   │   ├── center-flow/
│   │   │   ├── life-after/
│   │   │   └── shared/         ← Nav, layout, AI assistant widget
│   │   ├── lib/
│   │   └── public/
│   │
│   └── api/                    ← Node.js + Express + Prisma API
│       ├── src/
│       │   ├── routes/
│       │   │   ├── mentor-match.ts
│       │   │   ├── ready-check.ts
│       │   │   ├── donor-shield.ts
│       │   │   ├── center-flow.ts
│       │   │   └── life-after.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   └── audit.ts
│       │   ├── fhir/
│       │   │   ├── resources/
│       │   │   └── export.ts
│       │   └── index.ts
│       └── prisma/
│           └── schema.prisma
│
├── packages/
│   ├── shared/                 ← Shared TypeScript types + utils
│   ├── fhir-client/            ← fhirclient.js wrapper + resource mappers
│   └── ai/                     ← OpenAI integration + module prompts
│
├── docker/
│   └── hapi-fhir/
│       └── application.yaml    ← HAPI FHIR config
│
└── .github/
    └── workflows/
        └── ci.yml              ← axe-core + FHIR validator on every PR
```

---

## Database Schema Design

### schema: app_data (non-PHI)
```sql
users           (id, clerk_id, role, created_at)
mentor_profiles (id, user_id, donation_year, languages, specialties)
mentor_matches  (id, candidate_id, mentor_id, status, matched_at)
messages        (id, thread_id, sender_id, content_encrypted, sent_at)
protocols       (id, center_id, focus_area, title, content, published_at)
forum_posts     (id, author_id, category, title, content, created_at)
notifications   (id, user_id, type, payload, read_at, created_at)
```

### schema: phi_data (AES-256 encrypted at field level)
```sql
donor_profiles        (id, user_id, dob_enc, ssn_enc, health_summary_enc)
eligibility_checks    (id, donor_id, bmi, bp_systolic, bp_diastolic,
                       egfr, smoking_status, assessed_at)
health_goals          (id, donor_id, metric, target_value, target_date,
                       current_value, updated_at)
financial_records     (id, donor_id, item_type, amount, receipt_s3_key,
                       reimbursed, created_at)
post_donation_checkins(id, donor_id, week_number, bp, weight, mood_score,
                       energy_score, notes_enc, submitted_at)
phq2_responses        (id, donor_id, q1_score, q2_score, total,
                       escalated, completed_at)
```

### schema: audit_log (append-only via pgAudit)
```sql
audit_entries (id, user_id, action, resource_type, resource_id,
               ip_address, user_agent, timestamp)
-- INSERT only. Never UPDATE or DELETE.
```

---

## FHIR Resource Mapping

| Module | FHIR Resource | US Core Profile |
|---|---|---|
| ReadyCheck | Patient | US Core Patient |
| ReadyCheck | Observation (BMI) | US Core BMI Profile |
| ReadyCheck | Observation (Blood Pressure) | US Core Blood Pressure Profile |
| ReadyCheck | Observation (eGFR) | US Core Observation Lab |
| ReadyCheck | Goal |  |
| ReadyCheck | RiskAssessment |  |
| DonorShield | Coverage | US Core Coverage |
| DonorShield | ExplanationOfBenefit | Da Vinci PDex |
| DonorShield | Claim |  |
| Mentor Match | Patient (de-identified) | US Core Patient |
| Mentor Match | Communication |  |
| CenterFlow | Organization | US Core Organization |
| CenterFlow | Task |  |
| CenterFlow | ServiceRequest | US Core ServiceRequest |
| LifeAfter | CarePlan |  |
| LifeAfter | Observation | US Core Observation |
| LifeAfter | Appointment |  |
| LifeAfter | QuestionnaireResponse | SDC IG |
| LifeAfter | DiagnosticReport | US Core DiagnosticReport |

---

## Security Architecture

```
Browser (HTTPS/TLS 1.3)
    │
    ▼
Vercel Edge (HSTS, CSP headers)
    │
    ▼
Next.js App
    │
    ├── Clerk (MFA/OIDC/PKCE)  ←── All auth flows
    │
    ▼
Node.js API (Express)
    ├── JWT validation middleware
    ├── RBAC middleware (role check per route)
    ├── Audit log middleware (every PHI access)
    │
    ▼
PostgreSQL (AWS RDS)
    ├── Encrypted volumes (KMS)
    ├── phi_data fields: AES-256 column-level
    ├── pgAudit extension (audit_log schema)
    └── VPC isolated (no public access)
    │
    ▼
HAPI FHIR Server (Docker / ECS)
    └── Internal VPC only; API layer proxies all FHIR requests
```

### RBAC Permissions Matrix

| Feature | Donor | Patient | Coordinator | Clinician |
|---|---|---|---|---|
| Own health profile | RW | R | R | R |
| Mentor Match | RW | R | R |  |
| DonorShield | RW |  | R |  |
| ReadyCheck | RW |  | R | R |
| CenterFlow protocols | R |  | RW | R |
| LifeAfter check-ins | RW |  | R | R |
| PHI of other donors |  |  |  |  |
| Audit logs |  |  |  | Admin only |

---

## Environment Variables

```bash
# ── Auth (Clerk) ──────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# ── Database ──────────────────────────────────
DATABASE_URL=postgresql://user:pass@host:5432/livinglink

# ── FHIR ──────────────────────────────────────
FHIR_SERVER_URL=http://localhost:8080/fhir
SMART_CLIENT_ID=
SMART_REDIRECT_URI=http://localhost:3000/api/fhir/callback

# ── AI ────────────────────────────────────────
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o

# ── Storage (AWS S3) ──────────────────────────
AWS_S3_BUCKET=livinglink-receipts
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# ── App ───────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
API_URL=http://localhost:4000
NODE_ENV=development

# ── Encryption ────────────────────────────────
PHI_ENCRYPTION_KEY=          # AES-256 key for field-level encryption
```

---

## CI/CD Pipeline (GitHub Actions)

```yaml
# On every PR:
1. TypeScript type check (tsc --noEmit)
2. ESLint
3. Unit tests (Vitest)
4. axe-core accessibility audit (against local dev server)
5. FHIR resource validation (fhir-validator-cli against US Core IG)
6. Docker build check

# On merge to main:
7. Deploy frontend → Vercel
8. Deploy API → Railway
9. HAPI FHIR server → Railway (Docker)
```
