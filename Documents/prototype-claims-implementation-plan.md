# LivingLink Prototype Claims Implementation Plan

Status: implementation backlog based on a repository audit on 2026-08-28  
Audience: engineering agents, product owner, security/privacy owner, clinical owner, and vendor-integration owner  
Scope: work required to support the interoperability, public-access, open-source, security, accessibility, and co-design statements in the product narrative

## 1. Purpose and Claim Policy

This document converts the following narrative into verifiable engineering and evidence work:

> Built on HL7 FHIR R4 with SMART on FHIR and CDS Hooks, it integrates natively into Epic and Cerner with no additional hardware. Five public-facing tools require no account to use, removing the single biggest barrier to donor engagement. Released under the MIT open-source license. HIPAA-compliant with AES-256 field-level encryption, append-only audit logging, and WCAG 2.1 AA accessibility throughout. Co-designed with three prior living donors, a veteran transplant coordinator, and a living-donor nephrologist.

The repository is a prototype. Until every release gate in this plan is satisfied, use qualified wording such as "designed for," "prototype support for," "HIPAA-oriented safeguards," and "WCAG 2.1 AA remediation in progress." Do not claim vendor integration, HIPAA compliance, WCAG conformance, or completed co-design based only on source code or self-authored documents.

## 2. Current-State Claim Matrix

| Claim | Current foundation | Material gap | Claim-safe status now |
|---|---|---|---|
| HL7 FHIR R4 | HAPI R4 container, hand-written resource mappers, FHIR exports and optional writes | No formal R4/US Core validation; known invalid or incomplete mappings; no production FHIR authorization | Prototype FHIR R4 mappings |
| SMART on FHIR | Discovery, authorization-code flow, PKCE, state, encrypted token storage | EHR endpoints blocked by Clerk middleware; no OIDC validation, tenant identity model, token consumption, refresh/revocation, or patient-context enforcement | SMART launch prototype |
| CDS Hooks | Discovery and patient-view card prototype | Advertised service IDs do not map to real service endpoints; nonstandard routing; static shared token; no schema, tenant, replay, or patient authorization controls | CDS Hooks prototype |
| Epic and Cerner integration | Generic SMART/CDS concepts | No Epic or Oracle Health registration, sandbox configuration, conformance run, marketplace review, or production approval | Not implemented/verified |
| No additional hardware | Web/serverless/container architecture | Production topology and supported browser/EHR client matrix not documented or tested | Software-only design intent |
| Five public tools need no account | `/could-i-qualify`, `/ripple`, `/waitlist-map`, `/stories`, `/start-conversation` are middleware-public | Anonymous regression tests are absent; AI tool depends on OpenAI; stale API declarations and privacy wording exist | Largely implemented, not release-gated |
| MIT open source | Root `LICENSE` contains MIT text | Package metadata, governance, contribution/security docs, release provenance, SBOM, dependency-license review missing | MIT license file present |
| HIPAA compliant | Auth, selected AES-256-GCM fields, audit table and immutability trigger, security headers | Technical, administrative, physical, vendor, operational, retention, incident-response, and evidence gaps | Do not claim compliance |
| AES-256 field-level encryption | `lib/field-encryption.ts` uses AES-256-GCM with versioned keys | Incomplete PHI coverage, local key material, no KMS/envelope encryption/AAD/rotation job, unsafe ciphertext bypass | Selected fields encrypted |
| Append-only audit logging | Audit model, helper, and UPDATE/DELETE trigger | Audit failures are swallowed; coverage incomplete; no TRUNCATE/DDL protection, separate authority, WORM sink, alerting, or retention evidence | Database-level prototype |
| WCAG 2.1 AA throughout | Skip link, focus styles, semantic controls, axe dependencies | Nested main landmarks, duplicate IDs, contrast failures, incorrect ARIA, focus/title gaps, and very limited tests | Do not claim conformance |
| Co-designed with named participant mix | `Documents/co-design.md` describes personas and feedback | No primary evidence in repository; internal contradictions about donor status, timing, recruitment, and methods | Unverified; do not repeat publicly |

## 3. Non-Negotiable Release Gates

The full narrative may be used only when all applicable gates have named approvers and stored evidence.

| Gate | Required approver | Minimum evidence |
|---|---|---|
| Interoperability | Integration lead and clinical informaticist | FHIR validator results, SMART/CDS contract tests, Epic sandbox report, Oracle Health sandbox report |
| Security | Security/privacy owner | Risk analysis, remediation register, penetration test, recovery exercise, access review, key-rotation evidence |
| HIPAA | Authorized organizational/legal owner | Applicable entity determination, policies, BAAs, workforce controls, incident/contingency evidence; code review alone is insufficient |
| Accessibility | Accessibility owner or qualified independent assessor | Automated reports plus manual WCAG 2.1 AA audit, assistive-technology matrix, remediated findings, signed conformance statement/VPAT if needed |
| Open source | Maintainer/legal owner | License ownership review, dependency attribution/license scan, release artifacts, public repository/release provenance |
| Co-design | Research/product owner | Consent and permission records, participant-category verification, dated session evidence, traceability matrix, contradiction resolution |

## 4. Target Architecture Decisions

Resolve these decisions before schema-heavy implementation begins. Record outcomes in Architecture Decision Records under `Documents/adr/`.

| ADR | Decision required | Recommended default |
|---|---|---|
| ADR-001 | Supported FHIR profile baseline | FHIR R4 4.0.1 plus one explicitly pinned US Core implementation-guide version |
| ADR-002 | EHR launch modes | EHR launch for clinician workflows; standalone launch only where a documented use case exists |
| ADR-003 | Tenant identity | Every external patient mapping and SMART/CDS session is scoped by issuer, organization/center, and environment |
| ADR-004 | FHIR data ownership | Keep PostgreSQL as application system of record; use EHR/FHIR as authorized exchange boundary unless product owner chooses otherwise |
| ADR-005 | SMART client model | Per-vendor/per-environment client registration; confidential client where vendor and hosting permit it |
| ADR-006 | Audit durability | Transactional audit/outbox plus separately administered immutable/WORM destination |
| ADR-007 | PHI encryption | Managed KMS envelope encryption with versioned keys and AAD; document queryable-field exceptions |
| ADR-008 | Hosting | BAA-capable managed services, private database/FHIR networking, infrastructure as code, documented region and recovery objectives |
| ADR-009 | Public AI | Keep public tool free of account and intentional PHI; disclose processor use and enforce distributed abuse controls |
| ADR-010 | Compliance language | No categorical HIPAA/WCAG/vendor claim without the release evidence defined above |

## 5. Delivery Phases and Dependencies

| Phase | Work packages | Depends on | Exit condition |
|---|---|---|---|
| 0. Truth and emergency hygiene | WP-00, WP-01 | None | Claims qualified; secrets rotated; release blockers tracked |
| 1. Test and data foundations | WP-02, WP-03 | Phase 0 | Reliable CI, test database, identity/consent model available |
| 2. Public and accessibility baseline | WP-04, WP-05 | WP-02 | Five anonymous tools and core flows pass automated and manual baseline |
| 3. Security engineering | WP-06 through WP-10 | WP-02, WP-03 | Encryption, authorization, audit, retention, and infrastructure controls have passing tests |
| 4. Interoperability standards | WP-11 through WP-14 | WP-02, WP-03, security controls relevant to EHR access | R4/US Core, SMART, CDS, and FHIR server behavior pass contract/security tests |
| 5. Vendor validation | WP-15, WP-16 | Phase 4 | Epic and Oracle Health sandbox reports approved |
| 6. Open-source and co-design evidence | WP-17, WP-18 | Can begin after Phase 0 | Release governance complete; co-design statement verified or narrowed |
| 7. Independent readiness | WP-19 | All preceding applicable packages | External assessments complete and launch decision recorded |

## 6. Work Packages

### WP-00: Correct Claims and Establish Evidence Register

**Priority:** P0  
**Dependencies:** none  
**Primary files:** `README.md`, `ARCHITECTURE.md`, `PLAN.md`, `Documents/narrative.md`, `Documents/co-design.md`, submission-generation templates, new `Documents/evidence-register.md`

**Tasks**

1. Find every use of `HIPAA-compliant`, `WCAG 2.1 AA`, `Epic`, `Cerner`, `Oracle Health`, `co-designed`, and equivalent categorical wording.
2. Qualify unsupported statements without deleting the intended target state.
3. Create an evidence register with fields: claim, owner, status, artifact path/link, date, environment/version, reviewer, expiry/revalidation date, and open findings.
4. Resolve documentation drift: the repository is a root Next.js application, not the Turborepo/Express architecture currently described in places.
5. Correct the FIPS 199 inconsistency: the high-water mark shown in `Documents/compliance-plan.md` is HIGH, not MODERATE.
6. Add a visible prototype disclaimer to submission material until all release gates pass.

**Acceptance criteria**

- No categorical compliance or vendor-integration claim remains without a linked evidence entry.
- Target-state language is clearly distinguished from implemented current state.
- Architecture and setup documentation match executable repository structure.
- Product, security, clinical, and legal owners are named, or explicitly marked `UNASSIGNED`.

### WP-01: Secret Rotation and Dependency Triage

**Priority:** P0  
**Dependencies:** none  
**Primary files:** local secret stores, `.env.example`, `.env.production.example`, `.github/workflows/ci.yml`, `package.json`, lockfile

**Tasks**

1. Revoke and replace the Clerk secret and OpenAI key currently present in the ignored local environment file.
2. Treat the local PHI key as exposed. Inventory encrypted development data and either discard it or perform controlled re-encryption before key retirement.
3. Move secrets to managed local/deployment secret stores. Do not commit actual secret values or rotation evidence containing values.
4. Add Gitleaks or equivalent secret scanning to pull requests and full-history scheduled scans.
5. Triage `npm audit` findings; update direct dependencies first, assess transitive runtime reachability, and document temporary risk acceptance with owner/expiry.
6. Add Dependabot or Renovate, lockfile review, and CycloneDX/SPDX SBOM generation.

**Acceptance criteria**

- Old credentials are revoked and rotation is evidenced outside source control.
- Repository and history scans produce no unapproved secrets.
- No unaccepted critical/high production dependency vulnerability remains.
- Production deployment uses managed secrets and least-privilege service credentials.

### WP-02: Establish Reliable Test and CI Foundation

**Priority:** P0  
**Dependencies:** WP-01 for secure CI values  
**Primary files:** `package.json`, `.github/workflows/ci.yml`, new Playwright/Vitest configuration, test helpers

**Tasks**

1. Choose and configure Vitest or the team-standard unit test runner; add non-optional `test`, `test:integration`, `test:a11y`, and `test:e2e` scripts.
2. Add Playwright `baseURL`, managed web-server startup, deterministic Clerk test mode/mocks, and trace/report artifacts.
3. Run PostgreSQL and HAPI FHIR service containers in integration CI; apply Prisma migrations before tests.
4. Align workflow branches with the actual default branch.
5. Add jobs for type checking, linting, unit tests, migration tests, integration tests, accessibility, FHIR validation, secret scanning, SCA, and build.
6. Remove `--if-present` behavior that silently passes when tests are absent.
7. Add test data factories for users, roles, centers, donors, external patient mappings, consents, and SMART sessions.

**Acceptance criteria**

- A clean clone can run all documented checks with one command or clearly documented command set.
- CI fails when any required suite is absent or fails.
- Integration tests run against isolated ephemeral data and do not require real production secrets.
- Build, migration, rollback/forward-migration policy, and generated Prisma client are tested.

### WP-03: Correct Identity, Tenant, Role, and Consent Model

**Priority:** P0  
**Dependencies:** WP-02; ADR-002 and ADR-003  
**Primary files:** `prisma/schema.prisma`, new migration, `lib/api-auth.ts`, consent helpers, affected API/server routes

**Tasks**

1. Add an EHR connection/tenant entity containing issuer, vendor, environment, organization/center, enabled state, client configuration reference, and allowed capabilities.
2. Replace unscoped `DonorProfile.fhirPatientId` use with an external-patient mapping unique on connection/issuer plus external Patient ID.
3. Bind every SMART session to an EHR connection, launch type, local user/center where applicable, authorized patient context, granted scopes, and token metadata.
4. Choose one authoritative application role source. Implement `requireRole`, `requirePermission`, center-membership, tenant, and purpose-of-use guards.
5. Add defense-in-depth role checks to layouts, server pages, and APIs; do not rely on middleware metadata alone.
6. Implement one central consent resolver that selects the latest record for a purpose before evaluating grant/revocation.
7. Enforce consent centrally for EHR exchange, AI processing, mentor messaging, and other declared purposes.
8. Add cross-user, cross-role, cross-center, cross-issuer, revoked-consent, and privilege-drift tests.

**Acceptance criteria**

- External Patient IDs cannot collide across issuers/centers.
- A later revoked/denied consent always overrides an earlier grant.
- Every PHI route has explicit permission, tenant, and ownership tests.
- Role changes invalidate or refresh authorization promptly according to documented policy.

### WP-04: Guarantee Five No-Account Public Tools

**Priority:** P1  
**Dependencies:** WP-02  
**Primary files:** `middleware.ts`, the five page routes, public APIs, `lib/public-ai-safety.ts`, anonymous-access tests

**Canonical public tools**

| Tool | Route | Account-free requirement |
|---|---|---|
| Eligibility education screener | `/could-i-qualify` | Entire flow and results work without Clerk, database, or protected APIs |
| Ripple impact calculator | `/ripple` | Entire flow and results work client-side without account |
| Waitlist map | `/waitlist-map` | Search, sort, state detail, sources, and update date available anonymously |
| Donor stories | `/stories` | Published/demo stories load anonymously; submitting a story may remain authenticated |
| Conversation practice | `/start-conversation` | Scenario and practice work anonymously with clear service/privacy fallback |

**Tasks**

1. Add middleware and HTTP-level regression tests proving anonymous `200` responses for each page and intended public API.
2. Add negative tests proving story submission, administration, donor records, and PHI APIs remain `401/403` as designed.
3. Remove or implement stale public declarations such as `/api/waitlist-stats` and unused webhook patterns.
4. Replace hard-coded waitlist approximations with a versioned, cited data ingestion process, or label them prominently as sample data. Show source and last-updated date.
5. Replace process-local AI throttling with a shared rate limiter; add timeout, abuse controls, input-size limits, and useful `400/429/503` states.
6. State accurately that conversation content is sent to the configured AI processor; do not say "never shared" merely because it is not stored locally.
7. Ensure public tools do not load protected user data or fail when Clerk is unavailable, except optional sign-in controls.
8. Add uptime and synthetic anonymous-flow monitoring for all five routes.

**Acceptance criteria**

- Signed-out desktop and mobile browser runs complete all five canonical flows.
- Anonymous API contract tests pass; protected neighboring operations remain protected.
- AI unavailability produces a safe, understandable fallback without creating an account requirement.
- Public data sources, currency/date, and privacy wording are accurate and reviewable.

### WP-05: WCAG 2.1 AA Remediation and Conformance Process

**Priority:** P0 for blockers, P1 for full conformance  
**Dependencies:** WP-02; coordinate with WP-04  
**Primary files:** `app/layout.tsx`, `components/shared/public-page-shell.tsx`, `components/shared/public-nav.tsx`, public pages, authenticated flows, styles, accessibility tests

**Tasks**

1. Refactor landmarks so each rendered page has exactly one `main#main-content`; remove nested mains and duplicate IDs; ensure the skip link bypasses navigation.
2. Add route-specific titles for every page, especially client-rendered public tools.
3. Replace failing color combinations with tested semantic tokens meeting 4.5:1 normal text, 3:1 large text/UI component requirements as applicable.
4. Preserve native semantics. Replace the waitlist `button role="listitem"` pattern with `ul/li/button` or native buttons.
5. Guarantee visible, contrast-compliant focus indicators and remove unsafe `focus:outline-none` usage.
6. Manage focus and announcements for screener steps/results, ripple results, selected states, story loading/errors/counts, and AI errors/loading.
7. Add `aria-current`, mobile menu control relationships, Escape handling, and predictable focus return.
8. Align visible and accessible names, especially range labels; add accessible outputs and limits such as AI `maxLength`.
9. Add article headings, pressed/status behavior, accessible chart data tables, form error associations, touch targets, and reduced-motion handling.
10. Audit authenticated donor, clinician, coordinator, patient, admin, and generated-document flows, not only public pages.
11. Add axe tests for default and interactive states, duplicate-ID/landmark assertions, keyboard focus tests, mobile viewport, and anonymous/authenticated shells.
12. Perform manual testing at 320 CSS pixels, 200% and 400% zoom, keyboard only, NVDA/Chrome, VoiceOver/Safari, Windows high contrast, and reduced motion.
13. Maintain a WCAG criterion-to-evidence matrix. Obtain an independent audit before claiming conformance; create a VPAT/ACR if procurement requires it.

**Acceptance criteria**

- No serious/critical axe findings in supported flows, with reviewed exceptions documented.
- Manual WCAG 2.1 AA checklist is complete with environment, tester, date, evidence, and issue references.
- All P0/P1 accessibility findings are fixed and regression-tested.
- "Throughout" is used only if the audit covers every supported route, state, document, and viewport; otherwise scope the claim explicitly.

### WP-06: Build PHI Inventory and Encryption Boundary

**Priority:** P0  
**Dependencies:** WP-03; ADR-007  
**Primary files:** `prisma/schema.prisma`, `lib/field-encryption.ts`, API read/write paths, new data-classification document and migrations

**Tasks**

1. Create a field-by-field data inventory classifying PHI/PII, purpose, owner, query need, retention, encryption method, and downstream disclosures.
2. Resolve plaintext fields including identity, donation relationship, health metrics, goals, income/financial details, evaluation history/notes, PHQ-2, notification content, and FHIR identifiers.
3. For fields requiring database queries, document compensating controls or use blind indexes/tokenization where justified; do not encrypt blindly and break clinical queries.
4. Introduce envelope encryption with a managed KMS/HSM KEK and versioned DEKs. Keep raw production keys out of environment variables where possible.
5. Bind AES-256-GCM ciphertext with AAD containing tenant, table, record ID, field, and key version.
6. Remove the generic "already encrypted" prefix bypass from untrusted input paths. Strictly parse scheme, version, IV, tag, and ciphertext lengths.
7. Create idempotent backfill/re-encryption jobs with checkpoints, dry-run mode, metrics, and rollback/recovery procedure.
8. Add tests for round trips, tampering, wrong AAD, malformed values, unknown versions, legacy migration, active-key writes, old-key reads, and plaintext detection.
9. Verify database, backup, object storage, queue, log, and transport encryption separately; field encryption does not replace these controls.

**Acceptance criteria**

- Every inventoried sensitive field has an approved protection decision.
- No designated field is written in plaintext, verified by integration tests and a database scanner.
- Key rotation and restore using old key versions are demonstrated in a non-production environment.
- Key access is least privilege, logged, monitored, and separated from routine database administration.

### WP-07: Centralize Authorization, CSRF, and Abuse Protection

**Priority:** P0  
**Dependencies:** WP-03  
**Primary files:** auth helpers, middleware, all API routes, rate-limit helper, security tests

**Tasks**

1. Apply central role/permission/tenant/purpose guards to every route and server action.
2. Add same-origin/CSRF protection for cookie-authenticated state changes; document webhook and EHR callback exceptions.
3. Add distributed rate limits by route risk, authenticated principal/service client, and trusted network-derived IP.
4. Add body-size, timeout, content-type, schema, and pagination limits.
5. Log allow/deny decisions with correlation IDs without logging PHI or secrets.
6. Add systematic authorization matrix tests, including IDOR and cross-center/issuer attempts.
7. Define MFA, session timeout, reauthentication, workforce provisioning/deprovisioning, emergency access, and quarterly access review controls in Clerk and organizational procedures.

**Acceptance criteria**

- Every endpoint appears in a machine-reviewable access-control inventory.
- Negative authorization and CSRF tests pass for all PHI mutations.
- Privileged roles require evidenced MFA and lifecycle controls in the deployed identity tenant.

### WP-08: Make Audit Logging Reliably Append-Only

**Priority:** P0  
**Dependencies:** WP-02, WP-03; ADR-006  
**Primary files:** `lib/audit.ts`, Prisma models/migrations, API routes, outbox/worker, infrastructure configuration

**Tasks**

1. Define auditable events: authentication, denied access, PHI read/create/update/delete/export, consent decision/use, role change, key operation, SMART/CDS calls, configuration/admin action, and deletion execution.
2. Include actor/service identity, tenant/center, purpose, action, resource category and minimized ID, outcome, authorization result, timestamp, request/correlation ID, source, and safe metadata.
3. Make business mutation and audit/outbox creation transactional where possible. Choose and document fail-closed behavior for mandatory events.
4. Replace swallowed audit failures with monitored delivery state, retry/dead-letter handling, alerts, and operator runbook.
5. Use an insert-only application role. Block UPDATE, DELETE, and TRUNCATE; restrict DDL/trigger ownership from application credentials.
6. Replicate audit events to a separately administered immutable/WORM-capable sink; consider signatures/hash chaining for tamper evidence.
7. Define retention, clock synchronization, search/access permissions, daily review, anomaly alerts, export, and legal-hold behavior.
8. Add tests for immutability, truncate denial, transaction rollback, delivery retry, denied-request capture, tampering detection, and sink outage.

**Acceptance criteria**

- Mandatory audit events cannot silently disappear while the business operation reports success.
- Application and normal admin credentials cannot alter/delete/truncate audit history.
- Immutable-copy delivery, alerting, review, retention, and restore are evidenced.
- Audit content is sufficient for investigation without unnecessarily duplicating PHI.

### WP-09: Implement Retention, Deletion, and Legal Holds

**Priority:** P1  
**Dependencies:** WP-03, WP-06, WP-08; legal/clinical retention decisions  
**Primary files:** privacy APIs, Prisma schema/migrations, maintenance jobs, storage/FHIR integrations, new retention policy/runbook

**Tasks**

1. Obtain approved retention periods by record category, jurisdiction, clinical-record ownership, and contractual requirement.
2. Replace status-only deletion requests with an idempotent orchestration workflow covering database rows, identity provider, object storage, cache, search, FHIR server, AI/vendor data where applicable, logs, replicas, and backup aging.
3. Add legal holds, dependency ordering, retries, operator review, verification, and a deletion certificate that contains no unnecessary PHI.
4. Pseudonymize audit actor references where account PII may be deleted while legally required audit evidence remains.
5. Implement scheduled retention jobs with dry runs, metrics, alerts, and fail-safe behavior.
6. Test partial failures, repeated requests, holds, backup restoration, and required-record preservation.

**Acceptance criteria**

- Marking a request complete requires machine-verifiable completion of every applicable deletion/anonymization step.
- Retention and hold rules are approved and exercised in a representative environment.
- Restored backups reapply deletion tombstones before returning data to service.

### WP-10: Production Infrastructure and HIPAA Operational Readiness

**Priority:** P0 before PHI pilot  
**Dependencies:** WP-01 and architecture ADRs; can progress alongside application work  
**Primary files:** new infrastructure-as-code area, deployment configuration, runbooks, `Documents/compliance-plan.md`

**Tasks**

1. Select vendors/services that contractually support the intended HIPAA role and execute required BAAs/DPAs before PHI use.
2. Define infrastructure as code for private database/FHIR networking, TLS, encryption at rest, least-privilege identities, managed secrets/KMS, WAF, distributed rate limiting, monitoring, alerting, backups, and region controls.
3. Keep local HAPI/PostgreSQL development ports non-production. Production HAPI must not be anonymously exposed and must use OAuth authorization.
4. Unify security headers in one source. Remove unnecessary CSP `unsafe-eval`/`unsafe-inline` through nonces/hashes where feasible, and set PHI route cache controls independent of Vercel-only configuration.
5. Add vulnerability/container/IaC scanning, signed artifacts, deployment approvals, environment separation, migration gates, and rollback procedures.
6. Define and test RTO/RPO, backup restore, disaster recovery, emergency mode, incident response, breach analysis/notification workflow, monitoring escalation, and business continuity.
7. Complete the HIPAA Security Rule risk analysis and risk-management plan; assign security/privacy officers and workforce training/access-review processes.
8. Document minimum necessary, sanctions, device/physical safeguards, vendor evidence, and periodic evaluation.

**Acceptance criteria**

- No real PHI enters an environment lacking approved contracts and security/privacy sign-off.
- Infrastructure controls are reproducible from reviewed code and tested in staging.
- Backup/restore, incident-response, and disaster-recovery exercises have dated evidence and resolved findings.
- Legal/organizational owner, not an engineering agent, approves any HIPAA compliance statement.

### WP-11: Make FHIR R4 and US Core Output Conformant

**Priority:** P0 for interoperability  
**Dependencies:** WP-02, ADR-001, ADR-004  
**Primary files:** `lib/fhir/mappers.ts`, FHIR export/write routes, fixtures, validator tooling

**Tasks**

1. Pin FHIR R4 4.0.1 and the selected US Core package/version. Add machine-readable implementation-guide references.
2. Replace broad hand-written types with maintained R4 typings or generated profile-aware models while preserving clear domain mapping functions.
3. Correct known issues: Bundle `total` usage, CarePlan activity structure, QuestionnaireResponse canonical, unknown LOINC coding, required CapabilityStatement properties, references, identifiers, and cardinalities.
4. Decide supported resources and remove unsupported documentation claims. Candidate resources must be justified by actual workflows.
5. Add terminology mappings for LOINC/SNOMED/UCUM and validate systems, codes, units, references, profiles, and required fields.
6. Generate deterministic fixtures for each resource and Bundle. Run the official HL7 validator or equivalent profile validator in CI.
7. Parse FHIR responses and OperationOutcome. Track local/EHR write status; implement retry, reconciliation, idempotency, conditional operations, and Provenance where required.
8. Replace the custom synchronous admin export claim with either clearly named app export or a separate standards-compliant Bulk Data project. Do not call the current endpoint Bulk Data.
9. Fix pseudonymization so no original profile identifier remains; obtain privacy expert determination before claiming de-identification.

**Acceptance criteria**

- Every produced resource validates against pinned R4/profile packages with zero unapproved errors.
- All mappings have fixture, unit, round-trip/reference, terminology, and OperationOutcome tests.
- CapabilityStatement accurately describes only implemented behavior.
- Documentation specifies profile versions, extensions, identifier systems, and known limitations.

### WP-12: Complete SMART on FHIR App Launch

**Priority:** P0 for EHR integration  
**Dependencies:** WP-03, WP-07, WP-11; ADR-002, ADR-003, ADR-005  
**Primary files:** SMART launch/callback/session routes, new SMART/OIDC/FHIR client modules, Prisma models, middleware

**Tasks**

1. Exempt only required SMART launch/callback endpoints from Clerk redirects while retaining route-specific validation, rate limits, and security logging.
2. Perform strict issuer matching and bounded SMART discovery. Validate HTTPS, content type, response size, timeouts, endpoints, capabilities, and environment-specific allowlists.
3. Implement state and PKCE with atomic one-time state consumption. Add OIDC nonce and validate ID-token signature/JWKS, issuer, audience, expiry, nonce, and subject when OIDC is requested.
4. Support vendor-required client authentication securely, including private-key JWT or client secret method where applicable; never expose secrets to browsers.
5. Validate token type, scopes, issuer/audience where available, patient/encounter context, `fhirUser`, and launch context before persistence/use.
6. Build an authorized FHIR client that consumes the SMART token, restricts reads to granted scopes/context, and maps the external patient via issuer-scoped identity.
7. Implement refresh behavior, expiry handling, logout, provider token revocation where supported, local session cleanup, and safe user-facing recovery.
8. Define frame policy for approved Epic/Oracle origins instead of global `X-Frame-Options: DENY`; test third-party cookie/storage constraints and do not broadly permit framing.
9. Encrypt token material with WP-06 controls; never log tokens, authorization codes, PKCE verifiers, or PHI response bodies.
10. Add positive and negative integration tests: replayed state, expired state, issuer mismatch, PKCE failure, invalid ID token, scope downgrade, wrong patient, token expiry, refresh failure, and cross-tenant collision.

**Acceptance criteria**

- SMART test harness and both selected vendor sandboxes complete authorized launch and patient-context read.
- Replay, issuer, token, patient-context, and tenant isolation tests pass.
- Session and token lifecycle behavior is documented and observable.
- Embedded and standalone behavior is supported only where explicitly tested.

### WP-13: Rebuild CDS Hooks as a Standards-Compliant Service

**Priority:** P0 for EHR integration  
**Dependencies:** WP-03, WP-07, WP-08, WP-11  
**Primary files:** CDS discovery/service routes, request schemas, tenant/service authentication, tests

**Tasks**

1. Give each discovery service a stable ID and corresponding `POST /cds-services/{id}` endpoint. Do not route behavior using nonstandard request fields.
2. Validate `hook`, `hookInstance`, context, prefetch, `fhirServer`, and optional `fhirAuthorization` using strict schemas and bounded payloads.
3. Define independent services for donor readiness and stalled evaluation only if their trigger, context, authorization, and clinical action are valid.
4. Use prefetched resources when supplied; otherwise perform authorized FHIR reads only within granted scope.
5. Replace one shared bearer token with OAuth2 client credentials/private-key JWT or vendor-approved service identity. Bind caller to tenant/center, audience, scopes, expiry, and revocation state.
6. Resolve patients and evaluations through issuer/connection-scoped mappings; never compare global raw Patient IDs to free-form donor references.
7. Add replay/idempotency controls for `hookInstance`, rate limiting, audit attribution, safe errors, and latency monitoring.
8. Validate cards, source, links, indicators, suggestions, and extension usage against the pinned CDS Hooks version; ensure clinical language has owner approval.
9. Add contract and security tests for each service ID, malformed requests, wrong hooks, missing context, unknown patients, cross-center access, replay, invalid token, and downstream FHIR failure.

**Acceptance criteria**

- Discovery and every advertised endpoint pass CDS Hooks contract tests.
- Caller, tenant, patient, and center authorization is enforced and audited.
- Cards are clinically reviewed, actionable, non-duplicative, and meet response-time objectives.
- Vendor sandbox invocation succeeds without Clerk redirects or custom request fields.

### WP-14: Secure FHIR Server and Backend Exchange

**Priority:** P1  
**Dependencies:** WP-07, WP-08, WP-10, WP-11  
**Primary files:** FHIR write client, HAPI configuration/infrastructure, reconciliation jobs, tests

**Tasks**

1. Keep HAPI private behind an authenticated gateway; disable unused subscriptions/capabilities and default administrative endpoints.
2. Use SMART Backend Services or vendor-approved OAuth for server-to-server exchange rather than a static global token.
3. Scope service identities by tenant, resource, operation, and environment; rotate keys and validate audience/issuer.
4. Validate all inbound/outbound resources and OperationOutcome responses; enforce timeouts, retries with idempotency, circuit breaking, and reconciliation.
5. Add Provenance/source metadata and maintain mapping/version history without duplicating unnecessary PHI.
6. Add HAPI integration, authorization, failure, backup/restore, and upgrade tests.

**Acceptance criteria**

- HAPI has no anonymous production network path.
- Backend exchange uses short-lived scoped credentials and produces auditable outcomes.
- Failed writes are visible, recoverable, and reconciled without duplicate clinical records.

### WP-15: Epic Integration Validation

**Priority:** P1 after standards implementation  
**Dependencies:** WP-11 through WP-14  
**Primary artifacts:** private vendor-registration record, environment configuration, `Documents/evidence/epic-sandbox-report.md`

**Tasks**

1. Register the application through the applicable Epic developer/vendor program and obtain non-production client configuration.
2. Document intended launch points, user roles, requested SMART scopes, redirect URLs, frame origins, FHIR versions/profiles, and CDS services.
3. Configure Epic issuer/tenant records without committing credentials.
4. Test embedded launch, practitioner identity, patient and encounter context, authorized FHIR reads, scope denial, logout, token expiry/refresh behavior, browser restrictions, and error recovery.
5. Exercise each supported CDS service through the Epic environment.
6. Complete Epic-required security, privacy, usability, content, and marketplace/customer deployment review.
7. Record versions, test patients, screenshots with PHI removed, request/result matrix, unresolved limitations, reviewer, and approval date.

**Acceptance criteria**

- An Epic sandbox launch and every advertised Epic workflow pass against the release candidate.
- Production wording states the exact Epic versions/workflows validated and any customer configuration required.
- "Integrates natively into Epic" is not used based solely on generic SMART compatibility.

### WP-16: Oracle Health/Cerner Integration Validation

**Priority:** P1 after standards implementation  
**Dependencies:** WP-11 through WP-14  
**Primary artifacts:** private vendor-registration record, environment configuration, `Documents/evidence/oracle-health-sandbox-report.md`

**Tasks**

1. Use current product naming: Oracle Health/Cerner Millennium where context requires it.
2. Register the application through the Oracle Health developer/code program and obtain non-production client configuration.
3. Document Millennium launch points, scopes, tenant issuers, redirect URLs, frame origins, and supported FHIR/CDS behavior.
4. Run the same identity, patient-context, scope, token lifecycle, browser, error, and CDS matrix as WP-15, adapting to vendor capability differences.
5. Complete required security, privacy, customer deployment, and marketplace review.
6. Store a sanitized evidence report with versions, limitations, reviewer, and approval date.

**Acceptance criteria**

- An Oracle Health sandbox launch and every advertised workflow pass against the release candidate.
- Vendor differences are handled by configuration/adapters, not insecure conditionals.
- Public wording accurately scopes Oracle Health/Cerner support.

### WP-17: Complete MIT Open-Source Release Readiness

**Priority:** P1  
**Dependencies:** WP-00, WP-01, WP-02  
**Primary files:** `LICENSE`, `package.json`, `README.md`, new community/governance documents, release workflow

**Tasks**

1. Confirm copyright ownership, contributor rights, and authority to license all first-party code under MIT.
2. Review rights for PDFs, challenge materials, fonts, images, sample data, personas, quotations, trademarks, and generated submission artifacts. Exclude or separately license anything not redistributable.
3. Add accurate `license`, repository, homepage, bugs, author/maintainer, and supported Node metadata to `package.json`; decide whether `private: true` remains appropriate for a non-publishable app.
4. Add `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, governance/maintainer policy, support policy, changelog, issue/PR templates, and release process.
5. Generate SBOM and third-party notices. Add license-policy scanning and block incompatible/unapproved dependencies.
6. Rewrite setup, architecture, local services, migrations, tests, security limitations, demo-data policy, and deployment guidance to match reality.
7. Add versioned tags/releases, signed provenance/checksums where feasible, and a support/security-reporting path.

**Acceptance criteria**

- A clean-room contributor can set up, test, and understand the project from public documentation.
- Legal/maintainer review confirms the repository contents may be distributed under their stated licenses.
- Release includes SBOM, third-party attribution, change notes, security policy, and reproducible build/test evidence.

### WP-18: Verify and Operationalize Co-Design

**Priority:** P0 for truthfulness, P1 for ongoing program  
**Dependencies:** WP-00; requires human research/product owner  
**Primary files/artifacts:** `Documents/co-design.md`, private consent/evidence store, public redacted traceability matrix

**Tasks**

1. Stop repeating the current categorical co-design statement until primary records are reviewed.
2. Resolve contradictions: whether the third participant was a prior donor or considering donation; whether sessions preceded coding; interview length; recruitment channels; session count and dates.
3. Privately inventory dated notes/transcripts/recordings, recruitment records, prototype versions, consent, recording permission, quote/publication permission, compensation, facilitator attestation, and participant category credentials.
4. Do not fabricate retrospective evidence. If records do not exist, narrow/remove historical claims and conduct a new documented co-design cycle.
5. Obtain an IRB/ethics determination where applicable and define data minimization, retention, access, withdrawal, re-identification review, and secure storage.
6. Create a public redacted matrix: participant category, session date/month, artifact reviewed, key feedback, resulting issue/design change, implementation evidence, participant validation status.
7. Validate the specific mix before wording it: three people who had already donated, one coordinator meeting the stated experience criterion, and one living-donor nephrologist.
8. Establish the promised paid advisory board, quarterly cadence, usability protocol, accessibility participant recruitment, issue intake, decision records, and annual outcome report.

**Acceptance criteria**

- Every public co-design statement traces to reviewed, consented, internally consistent evidence.
- No identifying or sensitive participant material is published without explicit permission.
- If evidence is insufficient, published wording is corrected rather than inferred.
- At least one release-candidate usability round is completed with findings tracked to disposition.

### WP-19: Independent Verification and Launch Decision

**Priority:** final gate  
**Dependencies:** all work packages applicable to the release  
**Primary artifacts:** evidence register, assessment reports, risk register, launch decision record

**Tasks**

1. Freeze a release candidate and record commit, dependencies, infrastructure version, FHIR profile versions, vendor environments, and configuration baseline.
2. Commission independent penetration testing, authorization/tenant-isolation review, accessibility audit, and privacy/security architecture review.
3. Run backup restore, disaster recovery, incident tabletop, key rotation, audit sink outage, EHR outage, and deletion exercises.
4. Complete clinical safety review for donor readiness, PHQ-2 escalation, CDS cards, AI content, and emergency/disclaimer behavior.
5. Close findings or document time-limited risk acceptance with accountable owner and compensating controls.
6. Have each gate owner sign the evidence register. Legal/organizational leadership decides the exact external claims.
7. Add revalidation triggers: significant code/infrastructure/vendor change, annual review, profile/vendor version update, security incident, or material accessibility finding.

**Acceptance criteria**

- No critical/high unaccepted launch finding remains.
- Every external claim has current evidence and an accountable approver.
- Go/no-go decision, scope, limitations, rollback plan, and next review date are recorded.

## 7. Parallel Agent Execution Map

Use separate worktrees or tightly scoped branches for parallel work. Agents must not edit shared schema/auth/layout files concurrently without coordination.

| Lane | Work | Can start | Collision risk |
|---|---|---|---|
| A | WP-00 documentation truth/evidence register | Immediately | README, architecture, narrative docs |
| B | WP-01 secrets/dependencies | Immediately | Package and CI files |
| C | WP-02 test foundation | After dependency update plan is known | Package, CI, test config |
| D | WP-04 public anonymous behavior | After WP-02 harness | Middleware and public routes |
| E | WP-05 accessibility | After public shell test harness; coordinate with D | Root layout, public shell/nav, public pages |
| F | WP-03 identity/tenant/consent | After test foundation | Prisma schema, auth helpers, many routes |
| G | WP-06 encryption | After WP-03 schema direction | Prisma schema, read/write routes |
| H | WP-08 audit | After WP-03 identifiers | Prisma schema, API routes |
| I | WP-09 retention/deletion | After WP-06 and WP-08 design | Prisma schema, maintenance/privacy routes |
| J | WP-10 infrastructure/operations | Immediately after ADRs | Deployment/config/docs, minimal app collision |
| K | WP-11 FHIR conformance | After profile ADR; can start fixtures early | FHIR modules/export/write routes |
| L | WP-12 SMART | After WP-03 and WP-11 interfaces stabilize | SMART routes, middleware, schema |
| M | WP-13 CDS Hooks | After WP-03 and WP-11 interfaces stabilize | CDS routes, middleware |
| N | WP-15/WP-16 vendor validation | After SMART/CDS release candidate | Environment config and evidence only |
| O | WP-17 open-source release | After dependency/docs direction stabilizes | README, package, CI, docs |
| P | WP-18 co-design evidence | Immediately, human-led | Co-design/narrative documents |

## 8. Shared-File Coordination Rules

1. `prisma/schema.prisma`: WP-03 owns the identity migration first; WP-06 and WP-08 rebase and create separate forward migrations afterward.
2. `middleware.ts`: WP-04 defines anonymous public routes; WP-12/WP-13 add narrowly scoped EHR exceptions only after route-level controls exist.
3. `app/layout.tsx` and public shell/navigation: WP-05 owns landmark/focus architecture; feature agents consume that structure.
4. `package.json` and lockfile: WP-01 owns dependency remediation; WP-02 then adds scripts/test dependencies; later agents avoid unrelated upgrades.
5. `.github/workflows/ci.yml`: WP-02 owns workflow structure; later agents add dedicated commands/jobs through small reviewed patches.
6. `lib/api-auth.ts`: WP-03 owns authorization interfaces; route agents must use them rather than creating competing guards.
7. `lib/fhir/*`: WP-11 owns profiles and domain mapping contracts; SMART/CDS agents consume those contracts.
8. No agent may rewrite or delete another agent's unrelated working-tree changes. Re-read shared files before patching.

## 9. Required Test Matrix

| Area | Required automated tests | Required manual/external tests |
|---|---|---|
| Public tools | Anonymous page/API, complete flows, protected-neighbor negatives, mobile viewports, failure states | Plain-language/content review, current-data/source review |
| Accessibility | axe across states, landmarks/IDs, keyboard focus, titles, form errors, mobile | NVDA, VoiceOver, zoom/reflow, contrast, high contrast, reduced motion, cognitive review |
| Authorization | User/role/center/issuer matrix, IDOR, consent revocation, CSRF, rate limits | Identity-provider policy and access-review evidence |
| Encryption | Round trip, tamper/AAD, malformed values, rotation, backfill, plaintext scan | KMS access review and recovery exercise |
| Audit | Event coverage, failure/retry, immutability/TRUNCATE, transaction semantics | WORM evidence, alert/review exercise, retention verification |
| Retention | Expiry, holds, partial failure, idempotency, restore tombstones | Legal schedule approval and deletion exercise |
| FHIR | Unit fixtures, official validator, references, terminology, OperationOutcome, reconciliation | Clinical informatics review |
| SMART | Discovery, state/PKCE/nonce, OIDC, scope/context, replay, expiry/refresh, cross-tenant | Epic and Oracle Health sandbox launch/browser matrix |
| CDS Hooks | Discovery/service contracts, schemas, auth, prefetch, replay, tenancy, errors | Vendor invocation and clinical card review |
| Infrastructure | IaC policy, SAST/SCA/container/secret scans, backup automation | Pen test, restore/DR/incident exercises, vendor evidence |

## 10. Definition of Done for Every Agent Task

An agent may mark a work package complete only when:

1. Scope and dependencies were rechecked against this plan.
2. Existing behavior and migrations were inspected before edits.
3. The smallest coherent implementation was made without overwriting unrelated changes.
4. Unit/integration/security/accessibility tests appropriate to the change were added.
5. Type check, lint, relevant tests, Prisma validation/generation, and production build pass where applicable.
6. Error, timeout, unauthorized, cross-tenant, and rollback paths were tested, not only happy paths.
7. Environment examples and current architecture/runbooks were updated without secrets.
8. Evidence artifacts identify commit, environment, command/tool version, date, result, reviewer, and unresolved limitations.
9. Unsupported claims were not introduced in comments, UI, README, or submission output.
10. A concise handoff lists changed files, migration order, commands run, risks, and follow-up work.

## 11. Copy-Ready Agent Brief Template

Use this prompt when assigning one work package to a fast agent:

```text
Implement WP-XX from Documents/prototype-claims-implementation-plan.md.

First inspect the current repository and all dependencies named by the work package. Do not assume the plan's file list is exhaustive. Preserve unrelated working-tree changes. Follow existing project conventions and make the smallest coherent changes.

Required output:
1. Implement only WP-XX scope and its tests.
2. Run the relevant validation commands from the work package and Definition of Done.
3. Update accurate environment examples and documentation, but never add secrets or unsupported compliance/vendor claims.
4. Return changed files, migrations and ordering, tests/commands and results, remaining blockers, and evidence paths.

Stop and report a blocker instead of fabricating vendor credentials, legal approval, participant evidence, clinical approval, or compliance evidence.
```

## 12. Suggested Claim Evolution

Use wording aligned to achieved gates:

| Milestone | Permitted wording example |
|---|---|
| Current prototype | "A software-only prototype with FHIR R4 mappings, SMART App Launch and CDS Hooks scaffolding, five account-free public tools, selected AES-256-GCM field encryption, and an append-only audit-log prototype." |
| Standards tests pass | "Validated against the specified FHIR R4/US Core and CDS Hooks test suites; vendor validation is pending." |
| One vendor sandbox passes | "Tested in the [Epic or Oracle Health] sandbox for the listed launch and data workflows." |
| Both vendor gates pass | "Tested with the specified Epic and Oracle Health environments and workflows; customer configuration and vendor approval requirements apply." |
| Accessibility audit passes | "The defined release scope was independently evaluated against WCAG 2.1 AA on [date]; see the accessibility conformance report." |
| HIPAA readiness gates pass | Use only wording approved by organizational/legal owners and scoped to the actual production service, contracts, controls, and operating organization. |
| Co-design evidence passes | State the verified participant mix and methods exactly; avoid generalized claims beyond the evidence. |

## 13. Final Outcome

The desired end state is not merely that code contains FHIR objects, encryption calls, audit rows, and accessible attributes. It is a release in which interoperability works against named vendor environments, every PHI path has enforceable and tested safeguards, public tools remain genuinely anonymous, accessibility is independently evaluated across the supported scope, open-source rights and governance are clear, and co-design statements are backed by consented primary evidence.
