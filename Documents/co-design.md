# LivingLink — Co-Design & Lived Experience Documentation

> **UNVERIFIED RESEARCH ACCOUNT:** The repository does not contain primary evidence for the participant identities/statuses, recruitment, consent, dates, methods, quotations, analysis, or design traceability described below. Until those artifacts are reviewed and linked in `Documents/evidence-register.md`, LivingLink does not claim completed co-design. The entries are retained as hypotheses and an account requiring human verification, not as verified participant findings.

## Overview

This document preserves a previously drafted account of three design sprints involving donor personas, a coordinator, and a nephrologist. It is not currently traceable to primary evidence. Intended features and target states are preserved so that a human owner can verify, correct, or withdraw them.

---

## Research Methods

The following methods were described but are unverified:

- **Semi-structured interviews:** 45–60 min via video call; recorded with consent
- **Usability sessions:** Think-aloud walkthroughs of lo-fi Figma prototypes
- **Asynchronous feedback:** Loom screen recordings with timestamp comments
- **Recruitment:** NKF Chapter forums, NLDAC referrals, OPTN Living Donor Community of Practice

---

## Participant Profiles

*The names are presented as aliases/personas. It is not established whether each profile represents an actual participant, a composite, or a hypothetical persona. Quotations are unverified and must not be presented publicly as participant testimony without source records and consent.*

### Donor 1 — "Maria," 38, Non-Directed Donor
- **Background:** Donated to stranger through paired exchange, 2021, Midwest
- **Key insight:** "I had no idea NLDAC existed until 6 months after surgery. I lost $4,200 in wages and never got reimbursed."
- **Design impact:** NLDAC wizard placed prominently on DonorShield landing page; onboarding flow prompts all donors to check eligibility before evaluation
- **Additional feedback:** "I wish I could talk to someone who looked like me and had the same job situation." → Mentor Match language/occupation filter

### Donor 2 — "James," 52, Directed Donor (Spouse)
- **Background:** Donated to spouse, 2019, Southeast; retired early; developed hypertension
- **Key insight:** "My PCP had no idea what to do with me post-donation. He kept second-guessing my nephrologist."
- **Design impact:** LifeAfter PCP Clarity Tool lists exact conditions by responsible provider, with printable summary for PCP handoff
- **Additional feedback:** "The charts would help me show my wife I'm actually doing fine." → ReadyCheck goal tracker + trend charts

### Donor 3 — "Priya," 29, Directed Donor (Sister)
- **Background:** Donated to sibling, 2023, Northeast; first-generation South Asian immigrant
- **Key insight:** "The forms were in English only. My mother couldn't understand what I was signing."
- **Design impact:** Spanish localization on roadmap; all required consent text meets 6th-grade Flesch-Kincaid; AI assistant responds in user's language
- **Additional feedback:** "I felt guilty for weeks after surgery even though my sister was doing great." → PHQ-2 screener; LifeAfter emotional check-in section

### Coordinator — "David," 12 yrs experience, Large Academic Center
- **Background:** Managing 35–50 active evaluations simultaneously
- **Key insight:** "I lose track of who's waiting on labs vs who I just haven't emailed. There's no dashboard — it's all spreadsheets."
- **Design impact:** CenterFlow stage tracker with color-coded staleness indicators; coordinator dashboard sorted by days-since-last-update
- **Unverified additional feedback:** "I need something that plugs into Epic, not another login." → Target: generic CDS Hooks and SMART launch prototypes, followed by approved Epic/Oracle Health sandbox validation

### Nephrologist — "Dr. Chen," Living Donor Follow-Up Specialist
- **Background:** 18 yrs experience; sees 120+ prior living donors annually
- **Key insight:** "We only mandate 2-year follow-up. After that, donors fall through the cracks. OPTN collects outcomes but doesn't close the loop with the donor."
- **Design impact:** LifeAfter timeline extends to "lifetime" milestones; annual check-in reminder flow in roadmap
- **Additional feedback:** "eGFR is the number donors need to understand but it terrifies them." → ReadyCheck eGFR plain-language explainer; AI coach calibrated to de-escalate anxiety

---

## Design Principles Derived from Co-Design

These are current design hypotheses, not verified co-design findings:

1. **Tell me what I need to do, not just what exists.** → Module landing pages lead with action ("Start your NLDAC application") not information architecture
2. **Don't make me feel stupid.** → No medical jargon without tooltip; 6th-grade reading level target; AI never uses condescending reassurances
3. **I'm a whole person, not a kidney.** → Emotional check-ins integrated into every module; PHQ-2 available at all times; mentor connection not segregated
4. **Show me my progress.** → Charts, completion percentages, and goal streaks throughout ReadyCheck and LifeAfter
5. **Make it work on my phone.** → Mobile-first responsive design; bottom navigation bar on small screens
6. **I shouldn't need to start over if I switch providers.** → FHIR export and SMART on FHIR portability throughout

---

## Unverified Accessibility Notes

- Donor 3 noted: "My mother uses a screen reader for Gujarati text — I worry about the images."
  → All meaningful images have descriptive alt text; decorative images are `aria-hidden`
- David (coordinator) uses keyboard navigation due to repetitive strain: 
  → Target: complete keyboard and assistive-technology testing across CenterFlow tables and forms; evidence is pending

---

## Future Co-Design Commitments

Post-award targets, subject to funding, governance, consent, and assigned ownership:
- Quarterly lived-experience advisory board (3 prior donors paid $150/session)
- Usability testing with 10 new participants per major release
- Annual accessibility audit with disabled users recruited through National Disability Institute
