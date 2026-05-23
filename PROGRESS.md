# LivingLink  Session Progress & Resume Guide

> Open this file at the start of every new session.
> Update the checklist immediately after completing each item.

---

## Challenge Deadline: June 15, 2026
## Days Remaining from May 21: 25 days

---

## Quick Context (read this first in a new session)

We are building **LivingLink**  an AI-powered, FHIR-native web platform for
living kidney donors  as a Track B submission for the KidneyX EMPOWER Prize
Challenge ($4M total prize pool, up to $1.375M for this submission).

**Key files to read before starting any session:**
1. `PLAN.md`  full challenge plan, features, judging strategy
2. `ARCHITECTURE.md`  technical stack, DB schema, FHIR mapping, repo structure
3. `PROGRESS.md`  this file; current status and what to do next

**Tech Stack:**
- Frontend: Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- Backend: Node.js + Express + Prisma ORM
- Database: PostgreSQL
- FHIR: HAPI FHIR R4 (Docker)
- AI: OpenAI GPT-4o
- Auth: Clerk (MFA, role-based)
- Monorepo: Turborepo

---

## Current Status

### Phase 1: Foundation  COMPLETE ✅

#### Completed ✅
- [x] Turborepo monorepo initialized
- [x] `apps/web` (Next.js) directory + all pages created
- [x] `apps/api` (Node.js) directory + all routes created
- [x] `packages/shared`, `packages/fhir-client`, `packages/ai` created
- [x] `docker-compose.yml` (HAPI FHIR + PostgreSQL) created
- [x] `.env.example` created with all required variables
- [x] Root `package.json`, `turbo.json`, `tsconfig.json` created
- [x] `PLAN.md`, `ARCHITECTURE.md`, `PROGRESS.md` saved
- [x] Dependencies installed (root + web + api)
- [x] Prisma schema created (all 5 modules + audit log)
- [x] Clerk auth middleware + RBAC
- [x] Base layout with sidebar + role-based routing
- [x] Landing page (public)
- [x] All 5 module pages: MentorMatch, ReadyCheck, DonorShield, CenterFlow, LifeAfter
- [x] Donor dashboard page
- [x] AI Assistant widget (floating chatbot, all donor pages)
- [x] API routes: all 5 modules + FHIR proxy + AI chat
- [x] Next.js API proxy (`/api/[...path]`) → Node API
- [x] Dedicated AI chat API route (`/api/ai/chat`)

#### Still To Do in Phase 2 ⏳
- [ ] Copy `.env.example` → `.env.local` and fill in Clerk keys
- [ ] Start Docker: `docker-compose up -d`
- [ ] Verify HAPI FHIR at http://localhost:8080/fhir/metadata
- [ ] Run Prisma migration: `cd apps/api && npx prisma db push`
- [ ] Start dev servers: web (port 3000) + api (port 4000)
- [x] ReadyCheck goal tracker + progress charts (recharts)
- [x] DonorShield NLDAC eligibility wizard (multi-step)
- [x] DonorShield expense log (CRUD, categorized, running totals)
- [x] Mentor Match find-a-mentor page (filter by language/specialty, request match)
- [x] Mentor Match HIPAA messaging thread UI
- [x] CenterFlow coordinator evaluation tracker (live API + demo mode, stage update)
- [x] LifeAfter PCP Clarity tool (who manages what, OPTN Policy 18 schedule)
- [ ] Test ReadyCheck form → AI response
- [ ] Test DonorShield wage calculator
- [ ] Build wireframes/screenshots for submission PDF
- [ ] Architecture diagram (Excalidraw)

#### To Start Dev Servers
```powershell
# Terminal 1  Docker (FHIR + DB)
docker-compose up -d

# Terminal 2  Web (Next.js)
cd apps/web
npx next dev

# Terminal 3  API (Node.js)
cd apps/api
npx tsx watch src/index.ts
```

---

## Full Build Checklist

### Phase 1: Foundation (Days 1–5, May 21–25)
- [x] Monorepo scaffold
- [ ] `npm install` all dependencies
- [ ] Prisma schema + migrations
- [ ] Clerk auth + RBAC
- [ ] Docker: HAPI FHIR + PostgreSQL running
- [ ] Base layout (nav, role routing)
- [ ] Wireframes (v0.dev)
- [ ] Architecture diagram (Excalidraw)

### Phase 2: Core Donor Modules (Days 6–10, May 26–30)
- [x] ReadyCheck: eligibility screener form
- [x] ReadyCheck: AI health coach (OpenAI)
- [x] ReadyCheck: BMI/BP/smoking goal tracker + charts
- [x] DonorShield: lost-wage calculator
- [x] DonorShield: NLDAC eligibility wizard
- [x] DonorShield: expense log (CRUD, categorized)
- [x] Mentor Match: donor profile creation (find page)
- [x] Mentor Match: AI matching algorithm (request flow)

### Phase 3: Remaining Modules (Days 11–15, May 31–Jun 4)
- [x] Mentor Match: HIPAA-compliant in-app messaging
- [x] CenterFlow: protocol knowledge base (CRUD)
- [x] CenterFlow: evaluation stage tracker (coordinator + clinician)
- [x] LifeAfter: post-donation timeline
- [x] LifeAfter: structured check-in forms
- [x] LifeAfter: PCP clarity tool
- [x] LifeAfter: PHQ-2 screener
- [ ] DonorShield: state-by-state tax credit guide ✅
- [ ] DonorShield: FMLA employer letter PDF generator ✅
- [ ] DonorShield: insurance issue tracker ✅

### Phase 4: FHIR + AI Layer (Days 16–19, Jun 5–8)
- [x] FHIR client: map all modules to FHIR R4 resources (`lib/fhir/mappers.ts`)
- [x] SMART on FHIR launch context (`/api/fhir/smart/launch` + `/callback`)
- [x] CDS Hooks: ReadyCheck + stalled-evaluation services (`/api/cds-hooks`)
- [x] FHIR Bulk Export: LifeAfter outcomes (`/api/fhir/export`)
- [x] LivingLink AI Assistant — cross-module contextual agent with per-module quick actions

### Phase 5: Compliance + Polish (Days 20–22, Jun 9–11)
- [x] Privacy/consent flows (`/consent` page + `/api/consent` route)
- [x] axe-core CI workflow (`.github/workflows/ci.yml` + `tests/accessibility.spec.ts`)
- [x] Deploy config (`vercel.json`, `.env.production.example`)
- [ ] Keyboard navigation manual test
- [ ] pgAudit configuration (Railway PostgreSQL)
- [ ] Mobile responsiveness pass (320px–1440px)

### Phase 6: Submission (Days 23–25, Jun 12–15)
- [x] 1,500-word narrative (`Documents/narrative.md`)
- [x] Co-design statement (`Documents/co-design.md`)
- [x] Compliance plan (`Documents/compliance-plan.md`)
- [ ] 12-page PDF assembly (narrative + screenshots + architecture diagram)
- [ ] Register at kidneyxempowerchallenge.org
- [ ] Submit

---

## Human Co-Design (Do This ASAP)

Post in these communities asking for 30-min donor interviews:
- Reddit: r/transplant, r/kidney, r/LivingDonors
- Facebook: "Kidney Donor Athletes", "Living Kidney Donors Support Group"
- NLDAC: nldac.org (contact peer support network)

Document per interview: de-identified profile, top 3 frustrations,
wireframe feedback, at least 1 design change made based on their input.
Minimum 3 interviews before June 12.

---

## External URLs Still Needed

Ask the user to fetch these and paste the content into the session:

1. https://hl7.org/fhir/us/core  US Core IG resource profiles
2. https://docs.smarthealthit.org  SMART on FHIR launch spec
3. https://optn.transplant.hrsa.gov/media/eavh5bf3/optn_policies.pdf  OPTN Policy 18
4. https://nldac.org  NLDAC services for DonorShield module
5. https://hl7.org/fhir/uv/bulkdata  FHIR Bulk Data Access spec

---

## How to Resume in a New Session

1. Open VS Code in `D:\OpenSource\kidneyX`
2. Tell GitHub Copilot: **"Read PROGRESS.md, PLAN.md, and ARCHITECTURE.md
   and continue building LivingLink from where we left off"**
3. Copilot will read all three files and know the full context
4. Check the "Still To Do" section above and ask Copilot to start the
   next unchecked item

---

## Notes / Decisions Log

| Date | Decision | Reason |
|---|---|---|
| May 21, 2026 | Track B (prototype) | Starting from scratch; no prior pilot data |
| May 21, 2026 | All 5 focus areas | AI dev speed makes it credible; maximizes Grand Prize eligibility |
| May 21, 2026 | Next.js over Vite SPA | SSR for accessibility/SEO; App Router for clean role-based routing |
| May 21, 2026 | HAPI FHIR R4 | Most widely deployed open-source FHIR server; aligns with ONC standards |
| May 23, 2026 | Phase 2+3 modules built | Goal tracker, NLDAC wizard, expense log, Mentor Match find+thread, CenterFlow tracker, PCP Clarity tool |
| May 23, 2026 | Phase 3 remaining built | Tax credits (27 states), FMLA letter generator, insurance tracker, DonorShield nav expanded |
| May 23, 2026 | Phase 4 FHIR complete | FHIR mappers (US Core), SMART launch/callback, CDS Hooks (2 services), Bulk Export NDJSON |
| May 23, 2026 | Phase 4 AI complete | Cross-module AI assistant: per-module greeting, quick-action chips, module context sent to GPT-4o |
| May 23, 2026 | Phase 5 partial complete | Consent page + API, axe-core CI, vercel.json, .env.production.example |
| May 23, 2026 | Phase 6 docs complete | narrative.md (1,500w), co-design.md, compliance-plan.md |
| May 21, 2026 | Clerk for auth | HIPAA BAA available; MFA built-in; role-based access out of the box |
