# LivingLink  KidneyX EMPOWER Prize Challenge
## Track B: Scalable Prototype Submission Plan

> **Deadline:** June 15, 2026 | **Prize:** Up to $1.375M (Grand Prize + share)
> **Submit at:** kidneyxempowerchallenge.org

---

## Vision Statement

LivingLink is a FHIR-native, AI-powered platform that serves as the national
infrastructure layer for living kidney donation  connecting donors, patients,
transplant centers, and federal health systems in one unified ecosystem.

No single tool currently addresses all 5 friction points. LivingLink does.

---

## Problem → Solution Map

| # | Friction Point | Focus Area | LivingLink Module |
|---|---|---|---|
| 1 | Lack of awareness, mentorship, misinformation | Public Awareness & Mentorship | **Mentor Match** |
| 2 | Clinical eligibility barriers (BMI, BP, smoking) | Donor Readiness & Eligibility | **ReadyCheck** |
| 3 | Financial, behavioral, psychosocial barriers | Donor Interventions | **DonorShield** |
| 4 | Admin delays, lack of protocols at centers | Center Practices & Decision Support | **CenterFlow** |
| 5 | Inconsistent post-donation follow-up, PCP confusion | Donor-Centered Outcomes | **LifeAfter** |

---

## Five Modules  Feature Details

### Module 1: Mentor Match (Public Awareness & Mentorship)
- AI-matched peer mentor network (candidate ↔ prior living donor)
- Profile: donation motivation, health concerns, demographics, language preference
- HIPAA-compliant in-app messaging
- Community forum moderated by transplant coordinators
- Verified resource library (replaces Google/social media)
- Multilingual: English + Spanish (priority)
- FHIR: `Patient` (de-identified), `RelatedPerson`, `Communication`

### Module 2: ReadyCheck (Donor Readiness & Eligibility)
- Interactive eligibility pre-screener (BMI, BP, eGFR, smoking, diabetes, age)
- NOT a diagnostic tool  it informs, navigates, and coaches only
- AI health coach: personalized 30/60/90-day goals for BMI, BP, smoking cessation
- Progress tracking with trend charts
- Transplant center locator (OPTN data) triggered when readiness thresholds approached
- CDS Hooks: alert inside clinician's EHR when a patient begins ReadyCheck
- FHIR: `Patient`, `Observation` (BMI/BP/eGFR), `Condition`, `RiskAssessment`, `Goal`

### Module 3: DonorShield (Donor Interventions)
- Lost-wage calculator (employer type, hourly/salary, recovery weeks)
- NLDAC reimbursement eligibility wizard
- State-by-state tax credit guide
- FMLA employer letter generator (downloadable PDF)
- Expense log (travel, lodging, childcare, medical) with receipt upload
- Insurance issue tracker with escalation to transplant coordinator
- Total financial impact view: estimated out-of-pocket vs. recoverable
- FHIR: `Coverage`, `Claim`, `ExplanationOfBenefit` (Da Vinci PDex)

### Module 4: CenterFlow (Center Practices & Decision Support)
- Protocol knowledge base: searchable best-practice playbooks from high-performing centers
- Evaluation stage tracker: coordinator view with status + days elapsed + bottleneck flags
- Admin delay dashboard: center avg vs. national benchmarks
- CDS Hooks: stalled evaluation alerts (e.g., "Bloodwork pending >14 days")
- Cross-center coordinator messaging
- FHIR: `Organization`, `PractitionerRole`, `Task`, `ServiceRequest`, `Procedure`

### Module 5: LifeAfter (Donor-Centered Outcomes)
- Post-donation timeline: Week 2, Month 1, Month 3, Month 6, Year 1, Year 2+
- Structured health check-ins: BP, weight, mood, energy, kidney function
- PCP vs. nephrologist clarity tool: who manages what after donation
- PHQ-2 psychological screener with mental health resource escalation
- Parent-donor specific pathway (unique stress profile, tailored content)
- Automated OPTN Policy 18 follow-up data submission via FHIR → HRSA
- Donor data export (HIPAA Right of Access): JSON or PDF
- FHIR: `CarePlan`, `Observation`, `Appointment`, `QuestionnaireResponse`, `DiagnosticReport`

---

## FHIR / Interoperability Standards

| Standard | Purpose | Where Used |
|---|---|---|
| HL7 FHIR R4 | Core data exchange | All clinical modules |
| US Core IG | ONC 21st Century Cures compliance | Patient, Observation, Condition |
| SMART on FHIR | EHR app launch (Epic, Cerner, Oracle) | CenterFlow, ReadyCheck |
| CDS Hooks | Real-time clinical decision support | ReadyCheck candidate alerts |
| Da Vinci PDex | Payer data exchange | DonorShield insurance module |
| FHIR Subscriptions R4B | Real-time push notifications | Evaluation stage updates |
| FHIR Bulk Export ($export) | De-identified population data for HHS/ONC | LifeAfter outcomes reporting |

### Federal Connectivity
```
LivingLink FHIR API
    ├── SMART on FHIR ──────► Epic App Orchard / Cerner App Market
    ├── US Core IG ──────────► ONC Certified Health IT (21st Century Cures)
    ├── FHIR R4 API ─────────► OPTN / HRSA (Policy 18 automated reporting)
    ├── Da Vinci PDex ────────► Payer / Insurance Systems
    └── FHIR Bulk Export ─────► HHS / CMS / ONC (national analytics)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| UI Components | shadcn/ui + USWDS color tokens |
| Backend API | Node.js + Express + Prisma ORM |
| Database | PostgreSQL (3 schemas: app_data, phi_data, audit_log) |
| FHIR Server | HAPI FHIR R4 (Docker container) |
| FHIR Client | fhirclient.js |
| AI Engine | OpenAI GPT-4o API (LivingLink Assistant) |
| Auth | Clerk with MFA (HIPAA BAA available) |
| File Storage | AWS S3 (encrypted, private) |
| Hosting (demo) | Vercel (frontend) + Railway (backend + HAPI FHIR) |
| Hosting (prod) | AWS GovCloud or Azure Government (FedRAMP) |
| Accessibility | axe-core (automated CI) + VoiceOver/NVDA manual |
| CI/CD | GitHub Actions |

---

## Compliance Plan

### Section 508 (WCAG 2.1 AA)
- Semantic HTML + ARIA roles on all components
- Color contrast: 4.5:1 normal text, 3:1 large text
- Full keyboard navigation; no mouse-only interactions
- `aria-live` regions for all dynamic content
- Session timeout warnings with extension option
- Skip-navigation links on every page
- All form inputs have associated `<label>` elements
- axe-core in CI pipeline on every pull request
- `<html lang="en">` and `<html lang="es">` for Spanish views

### FIPS 199 Security Categorization
- Confidentiality: **HIGH** (donor health + financial + psychosocial data)
- Integrity: **MODERATE** (inaccurate eligibility could affect clinical decisions)
- Availability: **MODERATE** (disruptive but not immediately life-threatening)
- Overall: **HIGH** (high water mark rule, FIPS 199 §2.1)

### FIPS 199 HIGH Controls (NIST SP 800-53 Rev. 5)
- MFA enforced for all accounts  IA-2
- AES-256 encryption at rest (AWS RDS + KMS)  SC-28
- TLS 1.3 on all endpoints; HSTS headers  SC-8
- Append-only audit log via pgAudit  AU-9
- RBAC: Donor / Navigator / Clinician / Admin  AC-2
- Business Associate Agreements: AWS, Clerk, OpenAI, email/SMS vendors
- Field-level AES-256 for highest-sensitivity fields (SSN, mental health notes)

---

## Judging Criteria Strategy

| Criterion | Points | Strategy |
|---|---|---|
| **Donor Experience** | **35** | 5 donor-facing modules; emotional design; financial calculator; peer mentorship; multilingual |
| **Clinical Feasibility** | **25** | SMART on FHIR inside Epic/Cerner; no specialized hardware; OPTN Policy 18 automation |
| **Technical Sustainability** | **25** | Open-source HAPI FHIR core; SaaS subscriptions post-prize; FHIR ensures EHR-agnostic longevity |
| **Alignment** | **15** | All 5 EMPOWER focus areas; cites EO 13879; aligns with ONC interoperability mandate |

**Grand Prize argument:** Only submission addressing all 5 friction points with
a federal-grade FHIR interoperability layer. Directly supports ONC's stated goal
of data standardization across the kidney care ecosystem. Positions LivingLink
as national infrastructure, not a single-center tool.

---

## Human Co-Design Plan

- Post in: r/transplant, r/kidney, r/LivingDonors on Reddit
- Facebook Groups: "Kidney Donor Athletes", "Living Kidney Donors Support Group"
- NLDAC peer support network (nldac.org)
- Target: 3–5 interviews of 30 minutes each
- Document: de-identified profile, top 3 frustrations, wireframe feedback, design changes made
- Output: 1-page co-design summary as appendix to submission PDF

---

## 25-Day Build Plan

### Days 1–5: Foundation (May 21–25)
- [x] Initialize Next.js 14 monorepo with TypeScript (Turborepo)
- [x] Set up PostgreSQL with 3-schema structure
- [x] Configure Clerk auth with MFA and 4 user roles
- [x] Scaffold base layout with shadcn/ui
- [x] Deploy HAPI FHIR R4 server in Docker
- [ ] AI-generate wireframes for all 5 modules (v0.dev)
- [ ] Draft technical architecture diagram (Excalidraw)

### Days 6–10: Core Donor Modules (May 26–30)
- [ ] ReadyCheck: eligibility screener + AI coach
- [ ] ReadyCheck: BMI/BP/smoking tracker with charts
- [ ] DonorShield: lost-wage calculator + NLDAC wizard
- [ ] DonorShield: expense log with S3 receipt upload
- [ ] Mentor Match: profile creation + AI matching

### Days 11–15: Remaining Modules (May 31–Jun 4)
- [ ] Mentor Match: in-app messaging
- [ ] CenterFlow: protocol knowledge base
- [ ] CenterFlow: evaluation stage tracker
- [ ] LifeAfter: post-donation timeline + check-in forms
- [ ] LifeAfter: PCP clarity tool + PHQ-2 screener

### Days 16–19: FHIR + AI Layer (Jun 5–8)
- [ ] FHIR client: map all modules to FHIR R4 resources
- [ ] SMART on FHIR launch context (test with SMART sandbox)
- [ ] CDS Hooks stub for ReadyCheck alerts
- [ ] FHIR Bulk Export for LifeAfter outcomes
- [ ] LivingLink AI Assistant (cross-module conversational agent)

### Days 20–22: Compliance + Polish (Jun 9–11)
- [ ] axe-core audit on all pages; fix violations
- [ ] Keyboard navigation test on all forms
- [ ] Privacy/consent flows
- [ ] pgAudit configuration; verify audit log
- [ ] Deploy to Vercel + Railway (public demo URL)
- [ ] Mobile responsiveness (320px–1440px)

### Days 23–25: Submission (Jun 12–15)
- [ ] Write 1,500-word narrative
- [ ] Finalize co-design statement
- [ ] Compliance plan write-up
- [ ] Assemble 12-page PDF
- [ ] Register + submit at kidneyxempowerchallenge.org

---

## 12-Month Post-Prize Roadmap

| Month | Milestone |
|---|---|
| 1–2 | Beta testing with 2–3 transplant centers |
| 3–4 | Iterate + full Section 508 remediation audit |
| 5–6 | Pilot at 5 centers with OPTN outcomes data |
| 7–9 | SMART on FHIR certification: Epic App Orchard + Cerner App Market |
| 10–11 | National rollout; onboard 20+ transplant centers |
| 12 | Handoff to ASN/consortium; SaaS sustainability model active |

---

## External References Still Needed

Fetch these URLs and paste content to strengthen compliance/architecture:

1. `https://hl7.org/fhir/us/core`  US Core IG (mandatory FHIR resource profiles)
2. `https://docs.smarthealthit.org`  SMART on FHIR app launch spec
3. `https://optn.transplant.hrsa.gov/media/eavh5bf3/optn_policies.pdf`  OPTN Policy 18
4. `https://nldac.org`  NLDAC services to integrate into DonorShield
5. `https://hl7.org/fhir/uv/bulkdata`  FHIR Bulk Data Access IG

---

## Eligibility Checklist

- [ ] Registered at kidneyxempowerchallenge.org
- [ ] U.S. citizen or permanent resident
- [ ] No federal funds used in development
- [ ] Submission ≤ 12 pages (excluding cover + appendixes)
- [ ] Human co-design statement included
- [ ] Compliance plan (Section 508 + FIPS 199) included
- [ ] Functional beta at public URL included
- [ ] Technical architecture diagram included
- [ ] 12-month milestone timeline included
- [ ] Submitted by June 15, 2026
