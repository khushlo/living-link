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
- [ ] ReadyCheck: eligibility screener form
- [ ] ReadyCheck: AI health coach (OpenAI)
- [ ] ReadyCheck: BMI/BP/smoking goal tracker + charts
- [ ] DonorShield: lost-wage calculator
- [ ] DonorShield: NLDAC eligibility wizard
- [ ] DonorShield: expense log + S3 receipt upload
- [ ] Mentor Match: donor profile creation
- [ ] Mentor Match: AI matching algorithm

### Phase 3: Remaining Modules (Days 11–15, May 31–Jun 4)
- [ ] Mentor Match: HIPAA-compliant in-app messaging
- [ ] CenterFlow: protocol knowledge base (CRUD)
- [ ] CenterFlow: evaluation stage tracker
- [ ] LifeAfter: post-donation timeline
- [ ] LifeAfter: structured check-in forms
- [ ] LifeAfter: PCP clarity tool
- [ ] LifeAfter: PHQ-2 screener

### Phase 4: FHIR + AI Layer (Days 16–19, Jun 5–8)
- [ ] FHIR client: map all modules to FHIR R4 resources
- [ ] SMART on FHIR launch context (test with SMART sandbox)
- [ ] CDS Hooks: ReadyCheck candidate alert
- [ ] FHIR Bulk Export: LifeAfter outcomes ($export)
- [ ] LivingLink AI Assistant (cross-module conversational agent)

### Phase 5: Compliance + Polish (Days 20–22, Jun 9–11)
- [ ] axe-core audit on all pages; fix violations
- [ ] Keyboard navigation test
- [ ] Privacy/consent flows
- [ ] pgAudit configuration
- [ ] Deploy to Vercel + Railway (public demo URL)
- [ ] Mobile responsiveness pass (320px–1440px)

### Phase 6: Submission (Days 23–25, Jun 12–15)
- [ ] Write 1,500-word narrative
- [ ] Finalize co-design statement (donor interviews)
- [ ] Compliance plan write-up
- [ ] 12-page PDF assembly
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
| May 21, 2026 | Clerk for auth | HIPAA BAA available; MFA built-in; role-based access out of the box |
