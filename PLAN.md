# LivingLink  KidneyX EMPOWER Prize Challenge
## Track B: Scalable Prototype Submission Plan

> **Prototype notice:** This plan includes intended capabilities and post-award targets. It is not evidence of clinical effectiveness, HIPAA compliance, Section 508/WCAG conformance, completed co-design, or Epic/Oracle Health integration. Current claim status is tracked in `Documents/evidence-register.md`.

> **Deadline:** June 15, 2026 | **Prize:** Up to $1.375M (Grand Prize + share)
> **Submit at:** kidneyxempowerchallenge.org

---

## Vision Statement

LivingLink is intended to become a FHIR-aligned, AI-assisted platform connecting
donors, patients, transplant centers, and federal health workflows. The current
repository is a prototype and has not been validated as national infrastructure.

LivingLink is designed to address all five selected friction points in one prototype; comparative market research remains pending.

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
- Private messaging prototype with selected app-layer encryption; HIPAA compliance is not claimed
- Community forum moderated by transplant coordinators
- Verified resource library (replaces Google/social media)
- Multilingual: English + Spanish (priority)
- FHIR: `Patient` and related-resource mapping scaffolding; de-identification and additional resources require validation

### Module 2: ReadyCheck (Donor Readiness & Eligibility)
- Interactive eligibility pre-screener (BMI, BP, eGFR, smoking, diabetes, age)
- NOT a diagnostic tool  it informs, navigates, and coaches only
- AI health coach: personalized 30/60/90-day goals for BMI, BP, smoking cessation
- Progress tracking with trend charts
- Transplant center locator (OPTN data) triggered when readiness thresholds approached
- CDS Hooks: authenticated alert prototype; center-scoped EHR validation remains pending
- FHIR target mapping: `Patient`, `Observation` (BMI/BP/eGFR), `Condition`, `RiskAssessment`, `Goal`; profile validation is pending

### Module 3: DonorShield (Donor Interventions)
- Lost-wage calculator (employer type, hourly/salary, recovery weeks)
- NLDAC reimbursement eligibility wizard
- State-by-state tax credit guide
- FMLA employer letter generator (downloadable PDF)
- Expense log (travel, lodging, childcare, medical) with receipt upload
- Insurance issue tracker with escalation to transplant coordinator
- Total financial impact view: estimated out-of-pocket vs. recoverable
- FHIR target mapping: `Coverage`, `Claim`, `ExplanationOfBenefit`; Da Vinci PDex conformance is pending

### Module 4: CenterFlow (Center Practices & Decision Support)
- Protocol knowledge base: searchable best-practice playbooks from high-performing centers
- Evaluation stage tracker: coordinator view with status + days elapsed + bottleneck flags
- Admin delay dashboard: center avg vs. national benchmarks
- CDS Hooks: stalled evaluation alerts (e.g., "Bloodwork pending >14 days")
- Cross-center coordinator messaging
- FHIR target mapping: `Organization`, `PractitionerRole`, `Task`, `ServiceRequest`, `Procedure`; receiving-system validation is pending

### Module 5: LifeAfter (Donor-Centered Outcomes)
- Post-donation timeline: Week 2, Month 1, Month 3, Month 6, Year 1, Year 2+
- Structured health check-ins: BP, weight, mood, energy, kidney function
- PCP vs. nephrologist clarity tool: who manages what after donation
- PHQ-2 psychological screener with mental health resource escalation
- Parent-donor specific pathway (unique stress profile, tailored content)
- FHIR export prototype for authorized follow-up-data testing; OPTN/HRSA submission is not automated
- Donor JSON/PDF export prototype; HIPAA Right of Access applicability and workflow validation are pending
- FHIR target mapping: `CarePlan`, `Observation`, `Appointment`, `QuestionnaireResponse`, `DiagnosticReport`; profile validation is pending

---

## FHIR / Interoperability Standards

| Standard | Purpose | Where Used |
|---|---|---|
| HL7 FHIR R4 | Core data exchange | All clinical modules |
| US Core IG | Planned profile alignment; validation pending | Patient, Observation |
| SMART on FHIR | Generic EHR launch prototype; Epic and Oracle Health validation pending | CenterFlow, ReadyCheck |
| CDS Hooks | Real-time clinical decision support | ReadyCheck candidate alerts |
| Da Vinci PDex | Payer data exchange | DonorShield insurance module |
| FHIR Subscriptions R4B | Real-time push notifications | Evaluation stage updates |
| FHIR Bulk Export ($export) | Pseudonymized population-data prototype; formal de-identification pending | LifeAfter outcomes testing |

### Federal Connectivity
```
LivingLink FHIR API
    ├── SMART on FHIR ──────► Future approved EHR sandbox validation
    ├── US Core IG ──────────► Target profile alignment; validation pending
    ├── FHIR R4 API ─────────► Future OPTN / HRSA workflow validation
    ├── Da Vinci PDex ────────► Payer / Insurance Systems
    └── FHIR Bulk Export ─────► HHS / CMS / ONC (national analytics)
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Application | Root Next.js 15 App Router application + Tailwind CSS |
| UI Components | shadcn/ui + USWDS color tokens |
| Server API | Next.js route handlers (`app/api/`) + Prisma ORM; no Express service |
| Database | PostgreSQL via the root Prisma schema; logical/schema controls require deployment verification |
| FHIR Server | Optional local HAPI FHIR R4 Docker service; production endpoint pending |
| FHIR Client | fhirclient.js |
| AI Engine | OpenAI GPT-4o API (LivingLink Assistant) |
| Auth | Clerk authentication; BAA and deployment configuration require verification |
| File Storage | AWS S3 (encrypted, private) |
| Hosting (demo) | Deployment-dependent; verify the current deployment before making hosting claims |
| Hosting (target) | Approved hosting selected through security, legal, and procurement review |
| Accessibility | axe-core prototype coverage; authenticated/manual and VPAT/ACR assessment pending |
| CI/CD | GitHub Actions |

---

## Compliance Plan

### Section 508 / WCAG 2.1 AA Target
The following are intended release criteria, not current conformance claims:
- Semantic HTML + ARIA roles on all components
- Color contrast: 4.5:1 normal text, 3:1 large text
- Full keyboard navigation; no mouse-only interactions
- `aria-live` regions for all dynamic content
- Session timeout warnings with extension option
- Skip-navigation links on every page
- All form inputs have associated `<label>` elements
- axe-core in CI pipeline on every pull request
- `<html lang="en">` and `<html lang="es">` for Spanish views

### Provisional FIPS 199 Security Categorization
- Confidentiality: **HIGH** (donor health + financial + psychosocial data)
- Integrity: **HIGH** (inaccurate eligibility or workflow data could affect clinical decisions)
- Availability: **MODERATE** (disruptive but not immediately life-threatening)
- Overall: **HIGH** (high water mark rule, FIPS 199 §2.1)

### Intended HIGH-Baseline Controls (NIST SP 800-53 Rev. 5)
These controls require implementation and operating-effectiveness evidence:
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
| **Clinical Feasibility** | **25** | Generic SMART/CDS prototypes; Epic/Oracle Health sandbox validation and OPTN Policy 18 workflow validation are target states |
| **Technical Sustainability** | **25** | Open-source HAPI FHIR core; SaaS subscriptions post-prize; FHIR ensures EHR-agnostic longevity |
| **Alignment** | **15** | All 5 EMPOWER focus areas; cites EO 13879; aligns with ONC interoperability mandate |

**Intended positioning:** A prototype addressing five friction points with a planned
FHIR interoperability layer. Comparative uniqueness, federal-grade readiness, and
national-infrastructure suitability require independent evidence.

---

## Human Co-Design Plan

No completed co-design is claimed. The participant account in `Documents/co-design.md` remains unverified until primary records and review are linked in the evidence register.

- Post in: r/transplant, r/kidney, r/LivingDonors on Reddit
- Facebook Groups: "Kidney Donor Athletes", "Living Kidney Donors Support Group"
- NLDAC peer support network (nldac.org)
- Target: 3–5 interviews of 30 minutes each
- Document: de-identified profile, top 3 frustrations, wireframe feedback, design changes made
- Output: 1-page co-design summary as appendix to submission PDF

---

## 25-Day Build Plan

### Days 1–5: Foundation (May 21–25)
- [x] Initialize root Next.js 15 application with TypeScript
- [x] Add root Prisma/PostgreSQL schema and local services; deployed controls remain unverified
- [x] Add Clerk auth and application roles; MFA/deployment evidence remains pending
- [x] Scaffold base layout with shadcn/ui
- [x] Configure HAPI FHIR R4 as an optional local Docker service
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
| 7–9 | Target: validate SMART/CDS workflows in approved Epic and Oracle Health sandboxes and pursue applicable marketplace review |
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
