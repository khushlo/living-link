# LivingLink Security and Pilot Readiness Remediation

Status labels: `not started`, `in progress`, `complete`, or `external dependency`.

`in progress` means repository controls exist but still need implementation, testing, deployment, or evidence. It does not mean the entire item is blocked. An item is `external dependency` only when completion requires an owner, contract, environment, or assessment outside this repository.

This document is the implementation source of truth. Public material must describe only controls marked `complete` and backed by code, configuration, or signed evidence.

## Current Gate

The prototype code is buildable. The following gates currently prevent a pilot-readiness or production-compliance claim:

- **Database deployment:** the local `kidney-x` database is now synchronized with the Prisma schema, the append-only audit triggers are installed, and all seven migration entries are reconciled. Production still requires a backed-up, reviewed, environment-specific migration deployment; no reset is approved.
- **Vendor and legal approval:** BAAs/data-processing agreements, AI PHI approval, privacy review, retention terms, and incident ownership are not repository-only changes.
- **Clinical operations:** an accountable clinical owner, on-call recipient, escalation SLA, and pilot-center agreements are not assigned.
- **Independent assurance:** penetration testing, EHR sandbox/profile validation, accessibility testing, and VPAT/ACR evidence are outstanding.

Repository work can continue independently on purge-job design, key-rotation/recovery tests, accessibility coverage, and moderation/revocation UI. Automated authorization tests are deferred by product decision and must not be described as passing evidence.

The LifeAfter timeline endpoint consumed by the donor UI is now wired to the authenticated check-in read path, so the page no longer falls through to the API catch-all.

The admin portal at `/admin/dashboard` provides server-side role-gated access to the normal donor modules plus a separate Admin navigation section for review queues, PHQ-2 escalation acknowledgment, the recent audit-log viewer, and audited pseudonymized FHIR export download. Authenticated public-tool pages resolve the same local database role so this Admin section remains available there.

The public stories API ships only two clearly labeled `Test1`/`Test2` demonstration records for prototype testing. Real public content requires consent, review, and an explicit publication step.

## 1. Claims and Product Positioning

- [ ] **in progress** Replace production-compliance claims with "prototype" or "planned for pilot" language on the website, slides, and future documents. Landing page, mentor UI, narrative, compliance plan, PDF template, and regenerated tracked submission PDF use corrected language; independent artifact review remains before release.
- [x] **complete** Add an MIT `LICENSE` file. Verify the intended public repository before claiming the project is publicly available.
- [ ] **not started** Verify every outcome statistic against a primary source and retain the source URL, date, and relevant page or table.
- [ ] **in progress** Remove claims of native Epic/Cerner integration, marketplace availability, automated OPTN/HRSA reporting, or vendor BAAs until independently verified. Landing page, planning documents, PDF template, and regenerated submission PDF now use prototype/dependency language; independent artifact review remains.

## 2. PHI and AI

- [x] **complete** Add a PHI warning, request-size limits, basic identifier detection, and in-memory abuse controls to the public conversation-practice endpoint.
- [x] **complete** Default authenticated AI and health-assessment PHI processing to deny; enable only through explicit approved deployment configuration. The enabled path also rejects caller-supplied system prompts, restricts history roles/length, bounds message size, and records non-content request audits.
- [ ] **in progress** Decide whether authenticated AI features may process PHI. ReadyCheck uses deterministic guidance by default and authenticated AI is deny-by-default; an approved vendor agreement, risk assessment, and final product decision remain.
- [ ] **external dependency** Execute a BAA or other approved data-processing agreement for each vendor that will handle PHI, then document the exact service configuration and retention terms.
- [ ] **not started** Perform prompt-injection, data-leakage, and model-output safety testing before pilot use.

## 3. Identity, Authorization, and Auditability

- [x] **complete** Correct consent persistence to use the internal user identifier required by Prisma relations.
- [x] **complete** Record audit events for consent actions without storing sensitive request content in the audit metadata.
- [x] **complete** Enforce coordinator-only, center-scoped mutation of evaluation records.
- [x] **complete** Require a configured bearer token for CDS Hooks requests that can disclose patient-associated information.
- [x] **complete** Restrict cross-center FHIR bulk export to explicitly provisioned administrators until donor-to-center export scoping exists.
- [x] **complete** Add audit events to additional clinical, financial, goal, and mentor-message writes/reads.
- [ ] **in progress** Apply audit logging and server-side authorization consistently to every PHI-touching route. Authenticated clinical, financial, goal, notification, mentor, consent, export, safety, CDS, and admin-review routes now emit non-content audit events and enforce ownership, role, or service-token checks; center-scoped CDS evaluation alerts remain disabled until a verified center-to-patient mapping exists, and failure monitoring remains.
- [ ] **not started** Add automated authorization tests proving a user cannot read or mutate another donor's or center's data. Deferred by product decision; server-side ownership and center checks remain implemented, but this prototype has no automated authorization-test evidence.
- [ ] **in progress** Configure database-level immutable audit retention and monitor audit-log delivery failures. Local append-only update/delete triggers and an admin audit-log viewer are implemented; database retention policy and audit-delivery failure monitoring remain.

## 4. Data Protection

- [ ] **in progress** Implement authenticated field-level encryption for sensitive free text and documents using managed keys and key rotation. AES-256-GCM is implemented for mentor messages, LifeAfter notes, expense descriptions, health-goal notes, deletion-request reasons, and mentor-report details; deployment key management, rotation, migration of existing plaintext, document encryption, and recovery testing remain.
- [ ] **not started** Implement private object storage, malware scanning, short-lived signed download URLs, and upload authorization for receipts and documents.
- [ ] **in progress** Establish retention, deletion, backup restoration, and breach-response procedures, then test them. Donors can submit and track deletion requests from the authenticated Privacy & Data page, and an admin workflow is implemented; purge jobs, backup restore drills, and incident testing remain.
- [ ] **in progress** Provide donor data access/export without exposing cross-center bulk data. Donors can now download scoped JSON and FHIR exports of their own records from the normal user area; the former admin FHIR page is no longer available. Formal access-request procedures, export completeness review, and retention/legal review remain. The cross-center bulk FHIR export remains admin-only.
- [ ] **in progress** Replace the current pseudonymized export labeling with a HIPAA Safe Harbor or expert-determination process before calling exports de-identified. Export Patient, Observation, QuestionnaireResponse, and CarePlan references now consistently use the pseudonymous patient ID; formal de-identification remains required.

## 5. Clinical Safety and Consent

- [ ] **in progress** Create a PHQ-2 escalation workflow with an authorized recipient, acknowledgment, response expectation, and urgent-care instructions. Escalations now create an auditable record, notify provisioned administrators, expose an admin-only acknowledgment endpoint, and show 988/emergency guidance. The local schema and migration history are synchronized; production deployment, center assignment, on-call ownership, SLA monitoring, and clinical approval remain.
- [ ] **in progress** Add granular, versioned consent for platform use, AI processing, mentor messaging, research, and EHR exchange, including revocation. Each submission now creates immutable purpose-specific history records with grant/revocation timestamps, the consent page loads current settings and supports revocation, and EHR writes require current `ehr_exchange` consent; production migration deployment, retention policy, and a dedicated settings route remain.
- [ ] **in progress** Implement mentor training, verification, reporting, moderation, and emergency-use boundaries. Mentor boundary acknowledgment, verified/trained matching gates, safety reports, admin notifications, admin-only moderation status endpoints, and non-emergency language are implemented. The admin review page now handles story submissions, mentor safety reports, and deletion-request status updates; training evidence and operational moderation ownership remain pending.

## 6. Interoperability and Accessibility

- [ ] **in progress** Complete FHIR resource writes and validate against the profiles actually claimed by the product. ReadyCheck now creates a gated FHIR transaction bundle for Patient, BMI, BP, and eGFR resources only after EHR-exchange consent, with an environment-managed bearer token and timeout; profile validation, additional module writes, and EHR-sandbox testing remain.
- [ ] **in progress** Harden SMART-on-FHIR with issuer allowlisting, PKCE, encrypted server-side token storage, and no PHI in URLs. Issuer allowlisting, PKCE, HTTPS endpoint validation in production, validated token responses, server-side encrypted token/patient context, secure cookies, reduced read-only scopes, local session revocation, and URL cleanup are implemented; migration application, provider token revocation, scheduled expired-session cleanup, EHR sandbox validation, production key-management review, and center-scoped CDS evaluation alert validation remain.
- [ ] **external dependency** Test with an approved EHR sandbox and complete any marketplace onboarding before claiming Epic or Cerner integration.
- [ ] **not started** Expand accessibility coverage to authenticated flows, charts, form errors, keyboard operation, screen readers, mobile targets, and generated PDFs.
- [ ] **external dependency** Complete a VPAT/ACR assessment before claiming Section 508 or WCAG 2.1 AA conformance.

## 7. Governance and Pilot Gate

- [ ] **external dependency** Designate privacy and security officers, complete HIPAA risk analysis, and document incident response.
- [ ] **external dependency** Complete penetration testing and remediate material findings.
- [ ] **external dependency** Obtain pilot-center agreements, data-use agreements, and clinical escalation ownership.
- [ ] **external dependency** Complete documented co-design sessions with donors, clinicians, coordinators, and disabled users.

## Claiming Rule

Before any future statement says a control is "implemented," retain evidence of the deployed configuration, a passing test or review, and the responsible owner. "Designed for," "planned," and "prototype" are appropriate until then.
