# LivingLink — KidneyX EMPOWER Prize Track B Submission Narrative

> **PROTOTYPE - NOT FOR CLINICAL USE OR REAL PHI.** LivingLink is not a medical device, diagnostic service, production clinical system, or verified EHR integration. HIPAA compliance, Section 508/WCAG conformance, Epic/Oracle Health connectivity, clinical outcomes, and completed co-design have not been established. Claims and evidence gaps are tracked in `Documents/evidence-register.md`.

**Team:** LivingLink  
**Track:** Track B — Living Organ Donor Economic and Emotional Platform  
**Prize:** Up to $1,375,000  
**Submission Deadline:** June 15, 2026  

---

## Executive Summary

LivingLink is an open-source prototype designed around FHIR R4 concepts to address persistent barriers to living kidney donation: financial uncertainty, emotional isolation, fragmented post-donation care, and transplant center workflows. Five purpose-built modules explore how a web application could make the donor journey more supported and navigable; effectiveness has not been clinically evaluated.

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
Donors enter BMI, blood pressure, eGFR estimate, and smoking status. ReadyCheck provides deterministic, non-diagnostic guidance by default; any authenticated AI processing is disabled unless explicitly enabled by approved deployment configuration. Health metrics can be mapped to prototype FHIR Observation resources for future validation.

**Impact target:** 30% increase in donors who arrive at evaluation already within recommended health parameters.

### 2. DonorShield — Financial Advocacy Suite
A six-feature toolkit: (1) NLDAC eligibility wizard with real-time income calculation, (2) expense log with receipt upload scaffolding, (3) state tax credit reference, (4) FMLA letter generator with printable PDF, (5) insurance issue escalation tracker, and (6) pseudonymized FHIR bulk export for authorized operational testing. OPTN Policy 18 reporting is not automated.

**Impact target:** Triple NLDAC application completion rate from 26% to 75% among LivingLink users.

### 3. Mentor Match — Peer Support Network
Private prototype messaging between prospective donors and verified prior donors, with selected message fields encrypted before storage. Mentors are filtered by language and specialty. Matching is coordinator-facilitated or self-initiated; HIPAA compliance is not claimed.

**Impact target:** Reduce donor withdrawal rate by 20% through peer support (evidence: Rodrigue et al., 2014 RCT showing 23% increase in donation with peer education).

### 4. CenterFlow — Evaluation Workflow Intelligence
Coordinators and clinicians track donor evaluations through configured stages. CenterFlow can surface stalled cases (>14 days without progress). CDS Hooks provides authenticated prototype alerts; center-scoped EHR validation remains pending.

**Impact target:** Reduce average evaluation duration by 6 weeks through proactive bottleneck resolution.

### 5. LifeAfter — Post-Donation Continuity
Structured monthly check-ins (BP, eGFR, weight, symptoms) with trend charts. PHQ-2 screener with automatic coordinator alert for scores ≥3. PCP Clarity Tool disambiguates who manages hypertension, medication changes, and annual labs post-donation. Timeline view maps 1-month, 6-month, 1-year, and lifetime milestones.

**Impact target:** Double 2-year nephrologist follow-up rate from 59% to 85%.

---

## FHIR & Interoperability

LivingLink includes prototype FHIR R4 mappings and endpoints; conformance and receiving-system validation are pending:

- **SMART on FHIR:** Launch sequence (`/api/fhir/smart/launch`) provides an EHR-launch prototype; approved sandbox validation remains pending
- **CDS Hooks:** Authenticated `patient-view` alert prototype; unscoped stalled-evaluation alerts remain disabled
- **Bulk Export:** Pseudonymized NDJSON export for authorized testing; formal de-identification and OPTN submission validation remain pending
- **Resource Coverage:** Patient (US Core), Observation (BMI/BP/eGFR — LOINC coded), Goal, RiskAssessment, CarePlan, QuestionnaireResponse (PHQ-2 LOINC 55757-9), Coverage, Task, Communication, Bundle

---

## Co-Design & Lived Experience

`Documents/co-design.md` contains an account of proposed or previously described participant input from three donor personas, one coordinator, and one nephrologist. The repository does not contain primary recruitment, consent, session, analysis, or traceability records, so completed co-design and participant attributes are not claimed. Human verification and ethical/privacy review are required before this account is used externally. Donor-facing copy targets a sixth-grade reading level; a complete readability review is pending.

---

## Health Equity

- **Language:** Spanish interface in roadmap (Q1 2027); current AI assistant responds in user's input language
- **Digital literacy target:** 6th-grade reading level and plain language; full-corpus testing is pending
- **Device access target:** Responsive mobile access; complete device and assistive-technology testing is pending
- **Financial access:** Free to donors; open-source MIT license enables transplant centers to self-host at zero software cost
- **Geographic equity:** State tax credit guide and NLDAC wizard surface resources for all 50 states

---

## Privacy & Compliance

| Requirement | Implementation |
|---|---|
| HIPAA Security Rule | Selected AES-256-GCM fields, application audit logging, and deployment-dependent transport/storage controls; compliance is not claimed |
| HIPAA Privacy Rule | Consent management at `/consent`; legal/privacy review and operational policies remain pending |
| Section 508 | Accessibility is in progress; limited axe-core coverage exists, with authenticated/manual testing and VPAT/ACR assessment pending |
| FIPS 199 | Provisional HIGH impact categorization under the documented high-water mark; authorized review pending |
| 21st Century Cures Act | FHIR export prototype; legal applicability and conformance are not established |

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
