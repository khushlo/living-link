# LivingLink Technical Architecture Reference

> **Prototype notice:** This document separates repository-observable current state from intended target state. It is not evidence of production deployment, HIPAA compliance, Section 508/WCAG conformance, EHR-vendor integration, or clinical fitness. See `Documents/evidence-register.md`.

## Current Repository Architecture

```text
Browser
  |
  v
Next.js 15 root application
  |-- app/                 pages and layouts
  |-- app/api/             Next.js route handlers
  |-- middleware.ts        route middleware
  |-- components/          UI components
  |-- lib/                 auth, audit, encryption, consent, and FHIR helpers
  `-- prisma/              schema and migrations
          |
          v
      PostgreSQL

Optional local/external dependencies:
  Clerk authentication | OpenAI API | HAPI FHIR R4 | S3-compatible storage
```

The executable repository is a single root Next.js application. There is no `apps/web`, `apps/api`, `packages/`, Turborepo pipeline, npm workspace configuration, or Express service. Next.js route handlers provide the server API.

## Repository Structure

| Path | Current purpose |
|---|---|
| `app/` | App Router pages, layouts, and server route handlers |
| `components/` | Shared and module UI |
| `lib/` | Application utilities, authorization, audit, consent, encryption, and FHIR helpers |
| `prisma/` | Root Prisma schema and migrations |
| `docker-compose.yml` | Local PostgreSQL and HAPI FHIR services |
| `docker/` | Local database/FHIR support files |
| `tests/` | Existing test assets; presence does not establish complete coverage or conformance |
| `scripts/generate-submission-pdf/` | Submission document generator |
| `Documents/` | Plans, narrative, and evidence status |

## Runtime And Setup

- `npm run dev` starts one Next.js server on port 3000.
- `npm run build` generates the Prisma client and builds Next.js.
- `docker compose up -d postgres hapi-fhir` starts optional local dependencies on ports 5432 and 8080.
- The Prisma schema is `prisma/schema.prisma`; migrations are applied from the repository root.
- Environment-variable names and safe defaults are documented in `.env.example`.

## Current Prototype Boundaries

| Area | Repository-observable state | Evidence still required |
|---|---|---|
| Identity/access | Clerk integration and application authorization helpers exist | Deployed configuration, role/tenant tests, MFA/session evidence, security review |
| Data protection | Selected field-encryption and audit mechanisms exist | Key-management, coverage, immutability, retention, monitoring, and deployment evidence |
| FHIR | Resource mappers, write helper, export, SMART, and CDS Hooks routes exist | Conformance validation, authorized workflow testing, and production governance |
| EHR integration | Generic SMART/CDS prototype routes exist | Epic and Oracle Health registration, sandbox results, security review, and approval |
| Accessibility | Accessibility-oriented code and limited automated test assets exist | Full automated/manual audit, assistive-technology testing, remediation, and signed assessment |
| AI | OpenAI route integration exists and PHI use has a configuration gate | Vendor/legal approval, safety evaluation, monitoring, and approved deployment evidence |

## Intended Target Architecture

The intended pilot target retains the root Next.js application while adding approved managed PostgreSQL, controlled object storage, a validated FHIR endpoint, centralized audit delivery, monitoring, backups, and tenant-scoped identity. SMART on FHIR and CDS Hooks are targets for approved Epic and Oracle Health sandbox testing, not current vendor integrations. Hosting products, cloud regions, BAAs/DPAs, and security baselines remain deployment decisions until approved and evidenced.

## FHIR Target Mapping

The project intends to map module data to FHIR R4 resources including `Patient`, `Observation`, `Goal`, `RiskAssessment`, `Coverage`, `Communication`, `Organization`, `Task`, `ServiceRequest`, `CarePlan`, and `QuestionnaireResponse`. US Core, SDC, Da Vinci, SMART, CDS Hooks, and Bulk Data references describe intended alignment. They must not be read as profile conformance, certification, or production interoperability until validator and partner evidence is linked in the evidence register.

## Security And Compliance Target

The target state includes least-privilege access, MFA appropriate to risk, encryption in transit and at rest, managed keys, complete tamper-resistant audit delivery, incident response, retention controls, vendor agreements, risk analysis, and accessibility assessment. These are release requirements, not categorical current-state claims.

The provisional FIPS 199 impact values in `Documents/compliance-plan.md` are confidentiality **HIGH**, integrity **HIGH**, and availability **MODERATE**. Under the high-water-mark rule, the provisional overall impact is **HIGH**, subject to review by an authorized security owner.
