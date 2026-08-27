# LivingLink Security and Prototype Gap Register

This document compares the submitted LivingLink prototype PDF with the current repository implementation. It is the authoritative list of remaining work.

Status terms:

- **Missing:** no implementation was found.
- **Partial:** some code exists, but the PDF capability is incomplete.
- **Broken:** code exists but the current workflow does not work as intended.
- **Unverified:** implementation exists, but deployment, testing, or external evidence is missing.
- **External dependency:** completion requires a vendor, clinical owner, pilot center, contract, or independent assessment.

The project should be described as a **feature-rich prototype with controls in progress**, not as a production-ready HIPAA-compliant, WCAG-certified, Epic/Cerner-integrated platform. Items marked complete below were implemented in the current remediation pass; deployment and external-assurance items remain open.

## Priority 0: Fix Before Demonstration or Pilot

### 1. Fix LifeAfter timeline persistence

- **Status:** Complete
- The UI stores the complete API response as the timeline array.
- The API returns `{ timeline, phq2Count }`, so completed milestones may continue appearing as pending.
- **Evidence:** `app/(donor)/life-after/page.tsx:23-26`; `app/api/life-after/checkin/route.ts`.

### 2. Fix CenterFlow stage updates

- **Status:** Complete
- The UI sends `{ id, stage }` to `/api/center-flow/evaluations`.
- The API expects the ID in a dynamic route parameter and rejects the body because its schema does not accept `id`.
- **Evidence:** `app/(coordinator)/coordinator/center-flow/page.tsx:67-70`; `app/api/center-flow/evaluations/route.ts:44-54`.

### 3. Remove misleading production claims

- **Status:** Partial
- HIPAA compliance, WCAG 2.1 AA, Section 508, Epic/Cerner integration, automated HRSA reporting, and vendor BAAs are not fully evidenced.
- Label these capabilities as `prototype`, `in progress`, or `planned for pilot` until evidence exists.
- **Evidence:** `SECURITY_REMEDIATION.md` was previously tracking these gaps; PDF pages 8-11 make the claims.

### 4. Replace CenterFlow demo fallback with a real workflow

- **Status:** Partial
- Empty or failed API responses display six hardcoded candidates.
- Implement center onboarding, evaluation creation, live center data, loading/error states, and production-safe empty states.
- **Evidence:** `app/(coordinator)/coordinator/center-flow/page.tsx:29-35, 50-54, 100-104`.

### 5. Implement the advertised stalled-evaluation CDS Hook

- **Status:** Partial
- The service is advertised in CDS discovery but explicitly disabled.
- Add verified center-to-patient authorization and center scoping before returning stalled-evaluation data.
- **Evidence:** `app/api/cds-hooks/route.ts:41-48, 103-105`.

### 6. Correct CDS Hooks endpoint structure

- **Status:** Complete
- Documentation advertises `/api/cds-hooks/patient-view`, but only `/api/cds-hooks` exists.
- Implement service-specific CDS Hooks endpoints or update the discovery and integration contract.
- **Evidence:** `app/api/cds-hooks/route.ts:10-13`.

### 7. Complete clinical escalation operations

- **Status:** Partial / external dependency
- PHQ-2 escalation currently notifies administrators rather than a designated clinical recipient.
- Add ownership, on-call routing, response SLA, acknowledgment workflow, urgent-care guidance, and monitoring.
- **Evidence:** `SECURITY_REMEDIATION.md` prior status; `app/api/life-after/phq2/route.ts`.

## Priority 1: Core PDF Features

### 8. Complete ReadyCheck AI coaching

- **Status:** Partial
- GPT-4o is disabled by default; the app now generates personalized, bounded deterministic guidance locally and labels its source. OpenAI is used only when `ALLOW_PHI_TO_AI=true` and an API key is configured.
- Finalize AI vendor approval, PHI policy, risk assessment, prompt safety testing, and approved deployment configuration.
- **Evidence:** `app/api/ready-check/assess/route.ts:51-59`.

### 9. Add ReadyCheck 30/60/90-day plans

- **Status:** Partial
- The goal UI now provides 30/60/90-day target presets. Milestone reminders and adherence automation remain.

### 10. Add ReadyCheck trend charts

- **Status:** Partial
- Recharts progress charts exist on the dedicated goals page. A summary chart on the main ReadyCheck page and expanded accessibility evidence remain.
- **Evidence:** `app/(donor)/ready-check/page.tsx`.

### 11. Implement DonorShield receipt upload

- **Status:** Missing
- Add receipt photo upload, private encrypted AWS S3 storage, malware scanning, upload authorization, and short-lived signed download URLs.
- **Evidence:** `app/(donor)/donor-shield/expenses/page.tsx`; `app/api/donor-shield/records/route.ts`.

### 12. Implement reimbursement tracking

- **Status:** Partial
- Expense records now persist reimbursement status, paid amount, and notes, with donor-scoped updates at `/api/donor-shield/nldac/reimbursements`. Receipt upload and official claim submission remain.
- **Evidence:** `prisma/schema.prisma`; `app/api/donor-shield/nldac/reimbursements/route.ts`.

### 13. Complete the NLDAC application workflow

- **Status:** Partial
- The wizard now saves a donor-scoped application draft/ready record and links to the official NLDAC application. Requirement guidance, document checklist, and official submission integration remain.
- Add requirement-by-requirement guidance, income verification, employment status, transplant-center confirmation, document checklist, and pre-filled PDF application generation.
- **Evidence:** `app/(donor)/donor-shield/nldac/page.tsx`.

### 14. Validate and maintain tax-credit data

- **Status:** Partial
- The 27-state table is hardcoded and lacks primary-source links per state, effective dates, annual update ownership, and validation.
- **Evidence:** `app/(donor)/donor-shield/tax-credits/page.tsx`.

### 15. Upgrade the FMLA letter generator

- **Status:** Partial
- The current implementation invokes browser printing instead of generating a real accessible PDF.
- Obtain legal/template review and implement downloadable, tagged PDF output.
- **Evidence:** `app/(donor)/donor-shield/fmla-letter/page.tsx:32-50`.

### 16. Implement a persistent Insurance Issue Tracker

- **Status:** Complete
- Current issues exist only in React state and disappear on refresh.
- Add a database model, API routes, coordinator escalation, status history, notifications, and audit logging.
- **Evidence:** `app/(donor)/donor-shield/insurance/page.tsx:34-60`; no insurance API route exists.

### 17. Complete MentorMatch AI ranking

- **Status:** Partial
- Matching currently uses database filters only.
- Add GPT-4o compatibility ranking, explainable match scores, coordinator confirmation, and a real 48-hour operational SLA.
- **Evidence:** `app/api/mentor-match/profiles/route.ts`; `app/api/mentor-match/request/route.ts`.

### 18. Populate the donor story library

- **Status:** Partial
- Public stories currently contain only `Test1` and `Test2` demonstration records.
- Add consented, reviewed, verified stories and persist helpful votes.
- **Evidence:** `app/api/stories/route.ts:17-45`; `app/stories/page.tsx:155-177`.

### 19. Add CORS to the stories API

- **Status:** Complete
- The PDF claims cross-site embedding support, but the stories response does not return `Access-Control-Allow-Origin`.
- **Evidence:** `app/api/stories/route.ts:48-60`.

### 20. Implement all LifeAfter trend charts

- **Status:** Complete at prototype level
- The UI now renders BP, weight, mood, and energy charts when data is available.
- **Evidence:** `app/(donor)/life-after/page.tsx`; `app/api/life-after/trends/route.ts`.

### 21. Tie PHQ-2 to milestones

- **Status:** Partial
- PHQ-2 is currently one independent form, not a required assessment attached to each LifeAfter milestone.
- Add milestone/check-in association and enforce screening at the required check-ins.
- **Evidence:** `app/(donor)/life-after/page.tsx:143-172`; `app/api/life-after/phq2/route.ts`.

### 22. Add LifeAfter reminders and lifetime automation

- **Status:** Partial
- LifeAfter creates milestone reminder records, closes them when the check-in or PHQ-2 is completed, and the admin maintenance endpoint sends due notifications. Scheduler invocation, retries, delivery status, and monitoring remain.

### 23. Complete the parent-donor pathway

- **Status:** Partial
- The LifeAfter page now shows parent-donor-specific emotional-support guidance when `DonorProfile.isParentDonor` is enabled. Dedicated content, referral routing, profile controls, and tests remain.

## Priority 2: FHIR and EHR Interoperability

### 24. Expand FHIR writes beyond ReadyCheck

- **Status:** Partial
- Only Patient, BMI, BP, and eGFR resources are currently written.
- Add validated writes for DonorShield Coverage/Claim/ExplanationOfBenefit; MentorMatch de-identified Patient/Communication; CenterFlow Organization/PractitionerRole/Task/ServiceRequest/Procedure; and LifeAfter CarePlan/Observation/Appointment/QuestionnaireResponse/DiagnosticReport.
- **Evidence:** `app/api/ready-check/assess/route.ts:64-77`; `lib/fhir/mappers.ts`; PDF pages 6-10.

### 25. Validate FHIR resources against claimed profiles

- **Status:** Missing
- Add validator dependencies, fixtures, CI validation, and evidence for HL7 FHIR R4, US Core, Da Vinci PDex, and Bulk Data profiles.
- **Evidence:** `ARCHITECTURE.md:270-279`; `SECURITY_REMEDIATION.md` prior status.

### 26. Complete SMART on FHIR end-to-end integration

- **Status:** Partial
- OAuth launch/callback scaffolding exists, but no clinical UI consumes the stored token and patient context.
- Add EHR launch-context routing, token use, logout/revocation, and sandbox tests.

### 27. Bind SMART sessions to local users

- **Status:** Partial
- The callback stores EHR token/session data without clearly binding the SMART session to an authenticated local user.
- Add identity linking and authorization checks.
- **Evidence:** `app/api/fhir/smart/callback/route.ts`.

### 28. Validate Epic and Cerner integration

- **Status:** External dependency
- No EHR sandbox testing, App Orchard submission, Cerner onboarding, or marketplace evidence exists.
- **Evidence:** `SECURITY_REMEDIATION.md` prior status; PDF pages 3, 8-10.

### 29. Complete standard FHIR Bulk Data export

- **Status:** Partial
- The current implementation is a synchronous custom `POST /api/fhir/export`.
- Implement asynchronous kickoff, status polling, manifest/output URLs, lifecycle management, and system/group/patient `$export` operations.
- Correct `_since` handling so individual child-resource changes are not missed.
- **Evidence:** `app/api/fhir/export/route.ts:41-167`.

### 30. Correct Bulk Export role behavior

- **Status:** Partial
- The PDF claims admin, clinician, and coordinator access, but code permits only `ADMIN`.
- Implement center-scoped clinician/coordinator access or correct the documented claim.
- **Evidence:** `app/api/fhir/export/route.ts:45-50`.

### 31. Complete the de-identification process

- **Status:** Unverified / external dependency
- Current export is pseudonymized, not formally HIPAA Safe Harbor or expert-determination de-identified.
- Add formal methodology, review, documentation, and release approval.
- **Evidence:** `app/api/fhir/export/route.ts:32-39`; prior remediation status.

## Priority 3: Security, Compliance, and Operations

### 32. Complete private document controls

- **Status:** Missing
- Implement private object storage, malware scanning, upload authorization, encrypted documents, and signed download URLs.

### 33. Complete encryption key management

- **Status:** Partial
- AES-256-GCM exists for selected text fields, but managed keys, rotation, plaintext migration, backup recovery, and document encryption remain incomplete.
- **Evidence:** `lib/field-encryption.ts`; `SECURITY_REMEDIATION.md` prior status.

### 34. Make audit logging fail-safe

- **Status:** Partial
- Audit failures are logged but swallowed, allowing requests to continue.
- Add failure monitoring, alerting, retention policy, and operational review.
- **Evidence:** `lib/audit.ts:30-33`.

### 35. Finish database audit immutability deployment

- **Status:** Partial
- Local append-only migration triggers exist, but production synchronization, retention, backups, and monitoring are incomplete.
- **Evidence:** `prisma/migrations/20260824003000_make_audit_log_immutable/migration.sql`; `docker/postgres/init.sql`.

### 36. Add automated authorization tests

- **Status:** Missing
- Test cross-donor, cross-center, coordinator, clinician, admin, CDS, SMART, and export access boundaries.
- **Evidence:** no authorization test suite; prior remediation status.

### 37. Complete consent/settings management

- **Status:** Partial
- Consent history and revocation exist, but a dedicated settings route, production migration deployment, and retention policy remain needed.

### 38. Complete mentor safety operations

- **Status:** Partial / external dependency
- Reporting and moderation endpoints exist, but mentor training evidence, moderation ownership, response SLAs, and revocation procedures remain incomplete.

### 39. Complete HIPAA and operational governance

- **Status:** External dependency
- Required work includes vendor BAAs/DPAs, HIPAA risk analysis, privacy/security officers, incident response, breach testing, clinical escalation ownership, pilot-center agreements, data-use agreements, and penetration testing.

## Priority 4: Accessibility, Data Quality, and Release Readiness

### 40. Expand accessibility testing

- **Status:** Partial
- Current axe coverage tests only home and sign-in.
- Add authenticated donor, patient, clinician, coordinator, admin, charts, form errors, dialogs, keyboard navigation, screen readers, and mobile viewport testing.
- **Evidence:** `tests/accessibility.spec.ts`; `.github/workflows/ci.yml:23-55`.

### 41. Make charts and PDFs accessible

- **Status:** Missing / partial
- Add accessible chart data tables or summaries and tagged, keyboard-readable PDFs.

### 42. Complete VPAT/ACR assessment

- **Status:** External dependency
- Do not claim Section 508 or WCAG 2.1 AA conformance until an independent VPAT/ACR assessment is complete.

### 43. Replace static waitlist explorer data

- **Status:** Partial
- The current feature is a searchable hardcoded list, not a verified map or authoritative OPTN/SRTR data explorer.
- Add authoritative source data, update metadata, map visualization, and validation.
- **Evidence:** `app/waitlist-map/page.tsx`.

### 44. Validate Ripple calculator assumptions

- **Status:** Partial
- Outputs use hardcoded assumptions for dialysis, life expectancy, graft longevity, and savings.
- Add source citations, methodology, disclaimers, and validation.
- **Evidence:** `app/ripple/page.tsx`.

### 45. Fix architecture and documentation drift

- **Status:** Partial
- README and architecture describe a Turborepo with `apps/web`, `apps/api`, Express, AWS RDS, and ECS.
- The actual project is a root Next.js app with Next API routes, Prisma, and root-level `app`, `lib`, and `prisma` directories.
- Update documentation to match the repository.
- **Evidence:** `README.md:32-44`; `ARCHITECTURE.md:20-23`; `package.json`.

### 46. Align production environment configuration

- **Status:** Partial
- `.env.production.example` omits variables required by current code, including FHIR write/token settings, SMART issuer allowlisting, encryption keys, and CDS authorization.
- **Evidence:** `.env.production.example`; `app/api/fhir/smart/launch/route.ts`; `lib/fhir/write.ts`.

### 47. Add HSTS

- **Status:** Missing
- The PDF claims HSTS/TLS controls, but Vercel configuration does not set `Strict-Transport-Security`.
- **Evidence:** `vercel.json:6-18`.

### 48. Complete CI/CD pipeline

- **Status:** Partial
- Current CI performs lint, type-check, build, limited axe testing, and optional tests.
- Add FHIR validation, Docker build verification, authorization/integration tests, migration checks, security scanning, and deployment steps.
- **Evidence:** `.github/workflows/ci.yml`; `ARCHITECTURE.md:270-285`.

### 49. Add reproducible deployment configuration

- **Status:** Missing
- Add Railway configuration, production HAPI FHIR deployment, Dockerfile, backup procedure, and migration deployment procedure.
- **Evidence:** no Railway or production HAPI deployment configuration was found.

## Features Substantially Present at Prototype Level

- Five module pages and role-based navigation
- ReadyCheck intake and basic goal tracking
- DonorShield wage calculator, NLDAC prototype, expenses, tax table, and FMLA page
- Mentor filtering, requests, messaging, and safety reporting
- CenterFlow protocol library and evaluation model
- LifeAfter check-ins, PHQ-2, and PCP Clarity page
- Consent persistence and revocation history
- Selected AES-256-GCM field encryption
- Basic audit logging and immutable audit migration
- SMART OAuth/PKCE scaffolding
- ReadyCheck FHIR transaction write scaffolding
- Custom pseudonymized FHIR export
- Basic public tools and public AI conversation endpoint

## Recommended Execution Order

1. Fix the broken LifeAfter and CenterFlow workflows.
2. Remove or qualify unsupported PDF claims.
3. Implement persistent Insurance Tracker, receipt storage, NLDAC application output, and LifeAfter reminders.
4. Implement and test center-scoped CDS Hooks and SMART patient-context workflows.
5. Add authorization, integration, FHIR profile, and accessibility tests.
6. Expand FHIR writes and replace the custom export with a standards-aligned export workflow.
7. Complete key management, audit monitoring, retention, incident response, BAAs, clinical ownership, and independent assessments.
8. Align documentation, environment configuration, deployment configuration, and CI/CD with the actual application.

## Claiming Rule

Before stating that a control or feature is implemented, retain evidence of deployed configuration, a passing test or review, and a responsible owner. Use **designed for**, **planned**, **prototype**, or **in progress** until that evidence exists.
