# LivingLink — Security & Pilot Readiness Plan

This is a prototype planning document, not evidence of HIPAA, Section 508, or WCAG conformance. Items below are proposed controls and dependencies that require deployment evidence, review, and assigned ownership before pilot use.

## 1. FIPS 199 Security Categorization

| Information Type | Confidentiality | Integrity | Availability |
|---|---|---|---|
| Donor PHI (health metrics, PHQ-2) | HIGH | HIGH | MODERATE |
| Financial records (income, NLDAC docs) | HIGH | HIGH | MODERATE |
| Mentor communications | MODERATE | HIGH | MODERATE |
| Evaluation workflow data | MODERATE | HIGH | MODERATE |
| Public educational content | LOW | LOW | LOW |
| **Overall System Categorization** | **HIGH** | **HIGH** | **MODERATE** |

FIPS 199 overall categorization: **MODERATE** (per high-water mark, availability caps at MODERATE).

---

## 2. HIPAA Safeguards

### Administrative Safeguards
- **Security Officer:** Designated before pilot launch
- **Workforce Training:** Annual HIPAA training required for all contributors with PHI access
- **Risk Assessment:** Required before pilot; no completed HIPAA risk analysis is claimed here
- **Business Associate Agreements:**
  - Vercel (hosting) — BAA/configuration requires contract review
  - Neon/Railway (database) — BAA and production configuration required before PHI storage
  - OpenAI (AI processing) — approved DPA/BAA and explicit AI PHI decision required; disabled by default
  - Clerk (authentication) — BAA and production configuration require verification

### Technical Safeguards
- **Access Control:** Clerk-issued JWTs; role-based (`donor`, `coordinator`, `clinician`, `patient`)
- **Audit Logs:** Covered routes log `userId + action + timestamp`; full coverage, immutable retention, and delivery monitoring remain pending
- **Encryption at Rest:** AES-256 (Neon managed encryption)
- **Encryption in Transit:** TLS 1.2+ enforced; HSTS header on all responses
- **Automatic Logoff:** Clerk session expires after 24 hours of inactivity
- **Authentication:** MFA available via Clerk; required for coordinator/clinician roles

### Physical Safeguards (Deployment Dependency)
- Production hosting, region, physical safeguards, and SOC evidence require vendor and deployment verification
- The demo is not evidence of a production PHI hosting configuration

---

## 3. Section 508 / WCAG 2.1 AA Compliance

### Planned Automated Testing
- **axe-core** is present for limited public-page testing
- Authenticated-flow coverage and CI execution require verification
- A passing axe scan is not a WCAG 2.1 AA or Section 508 conformance claim

### Manual Testing Checklist
- [ ] Keyboard navigation: all interactive elements reachable without mouse
- [ ] Screen reader testing: NVDA + Chrome, VoiceOver + Safari
- [ ] Color contrast: all text ≥4.5:1 (normal) or ≥3:1 (large) against backgrounds
- [ ] Focus indicators: visible focus ring on all focusable elements
- [ ] Error messages: associate with form fields via `aria-describedby`
- [ ] Images: all meaningful images have descriptive `alt` text
- [ ] Forms: all inputs have visible `<label>` or `aria-label`
- [ ] Dynamic content: `aria-live` regions on chat, alerts, and toast notifications
- [ ] PDF outputs (FMLA letter): accessible PDF via browser print or flagged as supplement

### Known Gaps & Remediation Timeline
| Gap | Priority | Target |
|---|---|---|
| Recharts charts lack ARIA data tables | HIGH | Sprint 1 post-award |
| PDF (FMLA) not screen-reader accessible | MEDIUM | Sprint 2 post-award |
| Mobile touch target sizes (some < 44×44 px) | MEDIUM | Sprint 1 post-award |

---

## 4. Proposed Data Minimization & Retention

The retention periods below are proposed planning values, not implemented purge schedules or legal determinations.

| Data Type | Retention | Deletion Mechanism |
|---|---|---|
| Donor health metrics | To be determined with clinical/legal owners | Deletion workflow exists; purge job pending |
| Financial records | To be determined with legal/tax owners | Deletion workflow exists; purge job pending |
| PHQ-2 results | To be determined with clinical/legal owners | Deletion workflow exists; purge job pending |
| Mentor messages | To be determined with safety/legal owners | Scheduled deletion pending |
| AI chat (transient) | Not persisted | Never stored |
| Auth tokens | Session duration only | Clerk-managed |

---

## 5. Proposed Incident Response

The following is a draft workflow and is not an implemented or tested incident-response program.

1. **Detection:** Automated anomaly alerts via Vercel + Neon monitoring
2. **Triage:** Security officer notified within 1 hour
3. **Notification:** Affected individuals notified within 60 days (HIPAA Breach Notification Rule)
4. **HHS Reporting:** Breaches affecting ≥500 individuals reported to HHS within 60 days
5. **Documentation:** Incident log maintained in private security repository

---

## 6. Vendor Risk Summary (Requires Verification)

| Vendor | Role | BAA? | SOC 2? | Data Location |
|---|---|---|---|---|
| Vercel | Frontend hosting | Requires contract review | Requires evidence | Deployment dependent |
| Neon | PostgreSQL | Requires contract review | Requires evidence | Deployment dependent |
| Railway | FHIR server (HAPI) | Requires contract review | Requires evidence | Deployment dependent |
| Clerk | Authentication | Requires contract review | Requires evidence | Deployment dependent |
| OpenAI | AI processing | Requires approved DPA/BAA | Requires evidence | Deployment dependent |
