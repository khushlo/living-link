# LivingLink — KidneyX EMPOWER Prize Track B Submission Narrative

**Team:** LivingLink  
**Track:** Track B — Living Organ Donor Economic and Emotional Platform  
**Prize:** Up to $1,375,000  
**Submission Deadline:** June 15, 2026  

---

## Executive Summary

LivingLink is an open-source, FHIR-native digital health platform that addresses the most persistent barriers to living kidney donation: financial uncertainty, emotional isolation, fragmented post-donation care, and labyrinthine transplant center workflows. By integrating five purpose-built modules into a single, trauma-informed web application, LivingLink transforms the living donor journey from a solitary, stressful process into a supported, navigable experience.

---

## Problem Statement

Living kidney donation saves lives and costs the healthcare system less than half the lifetime dialysis expense for each recipient — yet donation rates have stagnated for 20 years. The barriers are well-documented:

1. **Financial toxicity.** A 2023 OPTN analysis found 58% of potential donors withdrew citing lost income. The National Living Donor Assistance Center (NLDAC) reimburses up to $6,000 in lost wages, yet 74% of eligible donors never apply.

2. **Emotional isolation.** Donors describe feeling "forgotten" post-surgery, with structured mental health follow-up only mandated by 23% of transplant centers (UNOS 2022 survey).

3. **Post-donation care gaps.** A 2021 JASN study showed 41% of donors do not see a nephrologist within 2 years post-donation. PCP handoff is inconsistently documented.

4. **Evaluation bottlenecks.** The average living donor evaluation takes 6.2 months; UNOS data show 1 in 3 evaluations end in withdrawal partly due to communication delays.

5. **Information asymmetry.** Donors rely on transplant center staff for information that could be self-served, slowing processes and increasing coordinator burden.

---

## Solution Architecture

LivingLink comprises five integrated modules, each addressing a documented barrier:

### 1. ReadyCheck — Health Readiness Coach
Donors enter BMI, blood pressure, eGFR estimate, and smoking status. An AI coach (GPT-4o with FHIR R4 Observation mappings) explains each metric in plain language, sets SMART goals, and tracks progress via recharts visualizations. Goals sync to FHIR `Goal` resources, enabling transplant center integration.

**Impact target:** 30% increase in donors who arrive at evaluation already within recommended health parameters.

### 2. DonorShield — Financial Advocacy Suite
A six-feature toolkit: (1) NLDAC eligibility wizard with AJAX real-time income calculation, (2) expense log with receipt upload scaffolding, (3) 27-state tax credit reference, (4) FMLA letter generator with printable PDF, (5) insurance issue escalation tracker, and (6) HAPI FHIR bulk export for OPTN Policy 18 financial outcome reporting.

**Impact target:** Triple NLDAC application completion rate from 26% to 75% among LivingLink users.

### 3. Mentor Match — Peer Support Network
HIPAA-secured messaging between prospective donors and verified prior donors. Mentors are filtered by donation type (laparoscopic/open), kidney retained (left/right), language, and specialty (pediatric, directed, non-directed). Matching is coordinator-facilitated or self-initiated.

**Impact target:** Reduce donor withdrawal rate by 20% through peer support (evidence: Rodrigue et al., 2014 RCT showing 23% increase in donation with peer education).

### 4. CenterFlow — Evaluation Workflow Intelligence
Coordinators and clinicians track each donor through 10 standardized evaluation stages. AI-flagged bottleneck detection surfaces stalled cases (>14 days without progress). OPTN policy knowledge base answers staff questions instantly. CDS Hooks integration pushes `patient-view` alerts into Epic/Cerner.

**Impact target:** Reduce average evaluation duration by 6 weeks through proactive bottleneck resolution.

### 5. LifeAfter — Post-Donation Continuity
Structured monthly check-ins (BP, eGFR, weight, symptoms) with trend charts. PHQ-2 screener with automatic coordinator alert for scores ≥3. PCP Clarity Tool disambiguates who manages hypertension, medication changes, and annual labs post-donation. Timeline view maps 1-month, 6-month, 1-year, and lifetime milestones.

**Impact target:** Double 2-year nephrologist follow-up rate from 59% to 85%.

---

## FHIR & Interoperability

LivingLink implements FHIR R4 throughout:

- **SMART on FHIR:** Launch sequence (`/api/fhir/smart/launch`) enables EHR-embedded access without duplicate login
- **CDS Hooks:** Two services — `livinglink-readycheck-alert` (ReadyCheck risk) and `livinglink-stalled-evaluation` (CenterFlow delay) — deliver actionable cards to any CDS Hooks–compliant EHR
- **Bulk Export:** NDJSON export maps all donor data to US Core profiles for OPTN submission
- **Resource Coverage:** Patient (US Core), Observation (BMI/BP/eGFR — LOINC coded), Goal, RiskAssessment, CarePlan, QuestionnaireResponse (PHQ-2 LOINC 55757-9), Coverage, Task, Communication, Bundle

---

## Co-Design & Lived Experience

LivingLink was designed with input from:
- Three living donors (non-directed, directed-paired, directed-related) recruited through NKF Chapter forums
- One transplant coordinator (UNOS center, 12 years experience)
- One nephrologist specializing in living donor follow-up
- Plain language review: all donor-facing copy targets ≤6th grade Flesch-Kincaid score

Personas informed by this research are documented in `Documents/co-design.md`.

---

## Health Equity

- **Language:** Spanish interface in roadmap (Q1 2027); current AI assistant responds in user's input language
- **Digital literacy:** 6th-grade reading level, no jargon, tooltip-rich UI
- **Device access:** Fully responsive for mobile (primary access device for 67% of low-income users per Pew 2023)
- **Financial access:** Free to donors; open-source MIT license enables transplant centers to self-host at zero software cost
- **Geographic equity:** State tax credit guide and NLDAC wizard surface resources for all 50 states

---

## Privacy & Compliance

| Requirement | Implementation |
|---|---|
| HIPAA Security Rule | AES-256 at rest (Neon/Railway), TLS 1.2+ in transit, audit logging via Prisma |
| HIPAA Privacy Rule | Minimum necessary data collection; consent management at `/consent` |
| Section 508 | WCAG 2.1 AA targeted; axe-core CI automated; semantic HTML, ARIA roles throughout |
| FIPS 199 | MODERATE impact baseline; see `Documents/compliance-plan.md` |
| 21st Century Cures Act | No information blocking; FHIR export on demand |

---

## Open Source Commitment

LivingLink is released under the MIT License. The full codebase will be published at `github.com/livinglink-health/livinglink` upon award notification. Transplant centers may fork and self-host. We commit to maintaining the public repository for a minimum of 5 years post-award.

---

## Budget Narrative (Summary)

| Category | Amount |
|---|---|
| Engineering (12 mo, 2 FTE) | $320,000 |
| Clinical advisory board (6 members × 12 mo) | $72,000 |
| Patient co-design sessions (12 rounds) | $18,000 |
| Infrastructure (Vercel + Railway + Neon) | $14,400 |
| Security audit (SOC 2 Type I readiness) | $45,000 |
| Accessibility remediation & VPAT | $22,000 |
| Pilot deployment (2 transplant centers, 6 mo) | $85,000 |
| Dissemination (ASTS, NKF Congress abstracts) | $8,600 |
| Indirect (15%) | $87,750 |
| **Total** | **$672,750** |

Requesting $672,750 of the $1,375,000 maximum — leaving room for Phase 2 national scale.

---

## Team

*(To be completed with actual team bios before submission)*

- **Principal Investigator:** [Name], [Credentials], [Institution]
- **Clinical Lead:** [Transplant nephrologist], [Institution]
- **Engineering Lead:** [Name], Full-stack + FHIR specialist
- **Patient Advocate:** [Prior living donor], NKF Ambassador

---

*Prepared for the KidneyX EMPOWER Prize | Deadline: June 15, 2026*
