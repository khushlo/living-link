# LivingLink — Security & Compliance Plan

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
- **Risk Assessment:** Conducted quarterly; findings tracked in private security repo
- **Business Associate Agreements:**
  - Vercel (hosting) — BAA available on Enterprise plan
  - Neon/Railway (database) — BAA obtained before PHI storage
  - OpenAI (AI processing) — Enterprise Data Processing Agreement; PHI minimized in prompts
  - Clerk (authentication) — BAA available on Pro plan

### Technical Safeguards
- **Access Control:** Clerk-issued JWTs; role-based (`donor`, `coordinator`, `clinician`, `patient`)
- **Audit Logs:** All PHI-touching API routes log `userId + action + timestamp` to append-only audit table
- **Encryption at Rest:** AES-256 (Neon managed encryption)
- **Encryption in Transit:** TLS 1.2+ enforced; HSTS header on all responses
- **Automatic Logoff:** Clerk session expires after 24 hours of inactivity
- **Authentication:** MFA available via Clerk; required for coordinator/clinician roles

### Physical Safeguards
- All data stored in Neon/Railway US-East data centers (SOC 2 Type II certified facilities)
- No local PHI storage; Next.js runs stateless

---

## 3. Section 508 / WCAG 2.1 AA Compliance

### Automated Testing
- **axe-core** integrated in CI pipeline (`.github/workflows/ci.yml`)
- Playwright-based accessibility test runs on every PR targeting `main`
- Target: 0 WCAG 2.1 AA violations on all public and authenticated pages

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

## 4. Data Minimization & Retention

| Data Type | Retention | Deletion Mechanism |
|---|---|---|
| Donor health metrics | 7 years post-donation (OPTN requirement) | Automated cron job + manual request |
| Financial records | 7 years (IRS) | Same |
| PHQ-2 results | 7 years | Same |
| Mentor messages | 3 years post match closure | Scheduled deletion |
| AI chat (transient) | Not persisted | Never stored |
| Auth tokens | Session duration only | Clerk-managed |

---

## 5. Incident Response

1. **Detection:** Automated anomaly alerts via Vercel + Neon monitoring
2. **Triage:** Security officer notified within 1 hour
3. **Notification:** Affected individuals notified within 60 days (HIPAA Breach Notification Rule)
4. **HHS Reporting:** Breaches affecting ≥500 individuals reported to HHS within 60 days
5. **Documentation:** Incident log maintained in private security repository

---

## 6. Vendor Risk Summary

| Vendor | Role | BAA? | SOC 2? | Data Location |
|---|---|---|---|---|
| Vercel | Frontend hosting | Enterprise | Yes (Type II) | US-East |
| Neon | PostgreSQL | Enterprise | Yes (Type II) | US-East |
| Railway | FHIR server (HAPI) | Via DPA | In progress | US-East |
| Clerk | Authentication | Pro plan | Yes (Type II) | US |
| OpenAI | AI processing | Enterprise DPA | Yes | US |
