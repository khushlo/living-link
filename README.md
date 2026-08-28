# LivingLink - Living Kidney Donor Platform

> Prototype web application supporting living kidney donors from evaluation through long-term follow-up.
> Built for the **KidneyX EMPOWER Prize - Track B**.

> **Prototype notice:** LivingLink is not a medical device, diagnostic service, production clinical system, or verified EHR integration. Do not use real patient or donor data. HIPAA compliance, Section 508/WCAG conformance, Epic/Oracle Health connectivity, and clinical effectiveness have not been established. See `Documents/evidence-register.md` for evidence status.

## Modules

| Module | Audience | Prototype scope |
|---|---|---|
| **ReadyCheck** | Donor | Non-diagnostic health readiness and goal tracking with FHIR mapping support |
| **DonorShield** | Donor | NLDAC guidance, wage estimates, and expense workflows |
| **MentorMatch** | Donor | Peer mentor profiles and prototype messaging |
| **CenterFlow** | Clinician / Coordinator | Evaluation-stage and protocol workflows |
| **LifeAfter** | Donor | Post-donation check-ins and wellbeing tracking |

## Current Architecture

- **Application:** One root Next.js 15 App Router application (`app/`), including UI and server route handlers (`app/api/`)
- **Language/UI:** TypeScript, React 19, Tailwind CSS 3, shadcn/ui/Radix components
- **Authentication:** Clerk integration with application role checks; production configuration and control evidence are pending
- **Data:** Prisma ORM with the root schema at `prisma/schema.prisma`; PostgreSQL is used for local development
- **FHIR:** FHIR R4 mapping, SMART launch, CDS Hooks, and export prototypes; profile, EHR-vendor, and production workflow validation are pending
- **AI:** Optional OpenAI integration; authenticated health-data processing is disabled unless deployment configuration explicitly allows it
- **Local services:** Docker Compose can run PostgreSQL and HAPI FHIR R4

This repository is not a Turborepo and does not contain a separate Express API.

## EHR Integration Guide

LivingLink is designed to integrate with EHR systems through HL7 FHIR R4, SMART App Launch, and CDS Hooks. The current repository contains an integration prototype. Epic and Oracle Health/Cerner sandbox registration, certification, production approval, and clinical validation are not included.

See `Documents/EHR-INTEGRATION.md` for the complete vendor-neutral registration, SMART launch, CDS Hooks, testing, and troubleshooting runbook.

### Integration Roles

| Standard | What it does in LivingLink |
|---|---|
| FHIR R4 | Defines the clinical resources exchanged by the EHR and LivingLink |
| SMART on FHIR | Securely launches LivingLink from an EHR and provides authorized patient context |
| CDS Hooks | Lets the EHR call LivingLink during a clinical workflow and receive a small decision-support card |

SMART and CDS Hooks have different purposes. SMART opens the interactive LivingLink application. CDS Hooks is an event callback that returns a card; it should not be used to send an entire donor record into the EHR.

### EHR Registration Prerequisites

The EHR organization must first register LivingLink with its vendor program and configure:

- LivingLink launch URL
- SMART redirect URI
- OAuth client ID and, where required, confidential-client credentials
- Allowed SMART scopes
- CDS Hooks service URL and service credentials
- EHR FHIR issuer URL and tenant/environment
- Approved EHR and LivingLink frame origins for embedded launch

Epic and Oracle Health/Cerner use their own developer or customer registration process. LivingLink cannot create vendor credentials and does not automatically discover unknown EHR tenants.

An EHR or health-system integration team can submit its non-secret tenant details for LivingLink review at:

```text
/ehr/register
```

Submissions are stored with `approved=false`. They do not become usable SMART/CDS connections until a LivingLink administrator reviews the request, assigns an existing transplant center, and approves it at `/admin/ehr-registrations`. The public form must never be used to submit client secrets, private keys, access tokens, patient identifiers, or PHI.

The configured issuer must be added to the `EHRConnection` table. Each connection contains the vendor, environment, issuer, center association, enabled state, and allowed capabilities. Secrets belong in a deployment secret manager; `EHRConnection` stores only a non-secret configuration reference.

### SMART App Launch

LivingLink's SMART endpoints are:

```text
GET /api/fhir/smart/launch
GET /api/fhir/smart/callback
```

The EHR launches LivingLink from the current chart with an issuer and short-lived launch context:

```text
https://livinglink.example.com/api/fhir/smart/launch?iss={EHR_FHIR_ISSUER}&launch={OPAQUE_LAUNCH_CONTEXT}
```

`iss` identifies the EHR FHIR server. `launch` is an opaque value created by the EHR; it should not be treated as a patient identifier by LivingLink.

LivingLink discovers the EHR's OAuth endpoints at:

```text
{EHR_FHIR_ISSUER}/.well-known/smart-configuration
```

For example, if the issuer is:

```text
https://ehr.example.com/FHIR/R4
```

the discovery URL is:

```text
https://ehr.example.com/FHIR/R4/.well-known/smart-configuration
```

The discovery response should provide at least:

```json
{
  "authorization_endpoint": "https://ehr.example.com/oauth2/authorize",
  "token_endpoint": "https://ehr.example.com/oauth2/token"
}
```

LivingLink then:

1. Validates the issuer against the configured allowlist and enabled EHR connection.
2. Fetches SMART discovery metadata, with a FHIR `metadata` fallback.
3. Generates server-side OAuth state and a PKCE S256 verifier.
4. Redirects the clinician to the EHR authorization endpoint.
5. Receives an authorization code at `/api/fhir/smart/callback`.
6. Exchanges the code for an access token at the EHR token endpoint.
7. Stores the encrypted token, patient context, issuer, scopes, expiry, and connection reference in a short-lived SMART session.
8. Redirects the clinician to the authorized CenterFlow application.

The configured prototype scope is:

```text
openid fhirUser launch patient/*.read
```

The final scope must be reduced to the minimum resources required by the approved clinical workflow. Production deployments also need complete OIDC ID-token validation, vendor-specific client authentication, refresh/revocation handling, and vendor sandbox testing.

### Patient Context and Linking

The current patient is supplied by the EHR after authorization, normally in the token response:

```json
{
  "access_token": "...",
  "token_type": "Bearer",
  "scope": "openid fhirUser launch patient/*.read",
  "patient": "12345",
  "fhirUser": "Practitioner/987"
}
```

LivingLink must not search every donor using `patient` alone. The identity boundary is:

```text
EHR issuer/tenant + external Patient ID -> LivingLink donor profile
```

Mappings are stored in `ExternalPatientMapping` and are scoped to an `EHRConnection`:

```text
connectionId
donorProfileId
externalPatientId
```

Authorized center staff can manage mappings at:

```text
/coordinator/patient-links
/clinician/patient-links
```

The linking workflow is:

1. The center user selects its configured EHR connection.
2. The user enters the EHR Patient ID received from the EHR workflow.
3. The user searches LivingLink donor profiles by name or email within the user's center authorization scope.
4. The user verifies the identity using the center's approved procedure.
5. The user confirms the mapping explicitly.
6. LivingLink requires current EHR-exchange authorization and records an audit event.

The workflow does not use SSN or automatic name-only matching. If there is no mapping, no center authorization, or no current EHR-exchange consent, LivingLink must return no donor-specific data.

### Donor Profile Data

Donors manage their profile at:

```text
/donor/profile
```

The profile is persisted in PostgreSQL through Prisma. Account email is read from the authenticated Clerk account. The donor profile form collects:

- First and last name
- Account email (read-only)
- Phone number
- Date of birth, when needed for identity matching
- Donation status: exploring, in evaluation, approved, donated, or declined
- Donation date, required when status is `DONATED`
- Donation type: directed, non-directed, or paired exchange
- Recipient relationship
- Transplant center name


The form automatically inserts the hyphens while the donor types. Social Security numbers, insurance member IDs, government identifiers, and other unnecessary identifiers are not collected. Donor status defaults to `EXPLORING` until the donor updates it.

The profile endpoint is:

```text
GET  /api/donor/profile
POST /api/donor/profile
```

Profile updates are validated, saved transactionally, and audit logged. Database fields are defined in `User` and `DonorProfile` in `prisma/schema.prisma`; apply the corresponding migration before using a fresh database.

### Data Direction and Privacy Boundary

SMART and CDS Hooks do not allow an EHR to search all LivingLink donors. Every donor-specific operation requires an authorized patient context and an issuer/tenant-scoped mapping:

```text
EHR issuer + EHR Patient ID -> ExternalPatientMapping -> LivingLink DonorProfile
```

There are two separate data directions:

| Direction | Mechanism | Current status |
|---|---|---|
| EHR to LivingLink | SMART access token and authorized FHIR reads | Launch/session foundation exists; full patient-context read workflow remains to be completed |
| LivingLink to EHR | CDS Hooks cards and future approved FHIR write-back | CDS card prototype exists; full bidirectional synchronization remains pending |

SMART Launch itself returns an interactive application context, not a full donor record to the EHR. CDS Hooks returns a minimum-necessary card such as an active donor-readiness workflow or stalled evaluation link. Full sensitive details should remain behind the authorized LivingLink application and should never be placed in a CDS response unnecessarily.

CenterFlow uses live database results only. If the center has no evaluations, EHR connections, donor authorizations, or patient links, the UI shows an empty state or an error; it does not substitute candidates, EHR connections, or patient records with mock data.

### Reading EHR Data

After SMART authorization, the intended server-side FHIR client uses the EHR-issued token to request only permitted resources, for example:

```http
GET {EHR_FHIR_ISSUER}/Patient/{patient-id}
Authorization: Bearer {SMART_ACCESS_TOKEN}
```

Potential resources include `Patient`, `Observation`, `Condition`, `CarePlan`, `QuestionnaireResponse`, and `Task`, subject to approved scopes and clinical need.

The current prototype stores the authorized patient context and token, and has FHIR mappers and write/export prototypes. A complete production patient-context data view and bidirectional synchronization service still require implementation and validation. Do not assume that receiving a SMART token alone authorizes every resource or every patient.

### CDS Hooks

LivingLink publishes CDS discovery at:

```text
GET /api/cds-hooks
```

The current `patient-view` services are:

```text
POST /api/cds-hooks/livinglink-readycheck-alert
POST /api/cds-hooks/livinglink-stalled-evaluation
```

The EHR may call these services when a clinician opens a patient chart:

```json
{
  "hook": "patient-view",
  "hookInstance": "unique-event-id",
  "fhirServer": "https://ehr.example.com/FHIR/R4",
  "context": {
    "userId": "Practitioner/987",
    "patientId": "12345",
    "encounterId": "Encounter/789"
  }
}
```

The request is authenticated with the configured CDS service credential. LivingLink validates the hook and context, resolves the issuer to an enabled center connection, resolves the issuer-scoped Patient mapping, and checks authorization before creating cards.

Possible scenarios include:

- A mapped patient has an active donor-readiness workflow.
- A mapped donor evaluation has been stalled beyond the configured threshold.
- A mapped patient has a permitted follow-up or safety workflow requiring attention.

The response is a CDS Hooks card containing minimum-necessary information:

```json
{
  "cards": [
    {
      "summary": "LivingLink: Living Donor Candidate Active",
      "detail": "This patient has an active donor-readiness workflow.",
      "indicator": "info",
      "source": {
        "label": "LivingLink",
        "url": "https://livinglink.example.com/clinician/center-flow"
      },
      "links": [
        {
          "label": "View in LivingLink CenterFlow",
          "url": "https://livinglink.example.com/clinician/center-flow",
          "type": "absolute"
        }
      ]
    }
  ]
}
```

Cards should contain a short summary, severity, source, and an actionable link. They should not contain access tokens, complete medical histories, unrelated financial information, or unnecessary PHI. The current implementation uses a configured bearer token as a prototype service credential; production deployments should use vendor-approved OAuth2 client credentials or private-key JWT with service identity, audience, expiry, scopes, replay protection, rate limits, and caller-specific audit attribution.

### Combined Workflow

The intended Epic or Oracle Health workflow is:

```text
1. Clinician opens a patient chart.
2. EHR calls LivingLink CDS Hooks patient-view.
3. LivingLink validates issuer, service identity, patient mapping, center authorization, and consent.
4. LivingLink returns a small readiness or stalled-evaluation card.
5. Clinician selects the card link.
6. EHR launches LivingLink through SMART on FHIR.
7. LivingLink receives authorized clinician and patient context.
8. LivingLink displays the permitted CenterFlow workflow.
9. LivingLink uses the EHR token only for approved, minimum-necessary FHIR reads.
```

CDS Hooks is the notification path. SMART is the interactive application-launch path. FHIR is the data model used by both systems.

### Configuration Checklist

For each EHR tenant and environment, configure secrets and values outside source control:

```env
SMART_CLIENT_ID=vendor-issued-client-id
SMART_CLIENT_SECRET=managed-secret-if-required
SMART_REDIRECT_URI=https://livinglink.example.com/api/fhir/smart/callback
SMART_ALLOWED_ISSUERS=https://ehr.example.com/FHIR/R4
CDS_HOOKS_BEARER_TOKEN=managed-service-credential
NEXT_PUBLIC_APP_URL=https://livinglink.example.com
```

Also create an enabled `EHRConnection`, associate it with the correct transplant center, and create mappings only through the authorized center linking workflow. Never commit client secrets, access tokens, patient identifiers, or real PHI.

### Integration Limitations

The repository currently provides a secure-oriented prototype, not a vendor-certified integration. Before production use, complete and evidence:

- Epic and Oracle Health/Cerner sandbox registration and launch tests
- FHIR R4 and selected US Core profile validation
- Full SMART OIDC, token, patient-context, refresh, and revocation handling
- CDS Hooks contract, service identity, replay, and cross-tenant tests
- Complete authorized FHIR read/write/reconciliation workflows
- Clinical review of CDS card content and escalation behavior
- Production secrets, private networking, monitoring, backup, and recovery controls
- HIPAA, privacy, accessibility, and vendor/legal approvals

## Project Structure

```text
app/                 # Next.js pages, layouts, and route handlers
components/          # Shared and feature UI
lib/                 # Server/application utilities and FHIR helpers
prisma/              # Prisma schema and migrations
docker/              # Local service configuration
scripts/             # Submission PDF generation
Documents/           # Planning, claims, and evidence documentation
tests/               # Current test assets
```

## Getting Started

### Prerequisites

- Node.js 20+
- Docker, if using the local PostgreSQL and HAPI FHIR services
- Clerk development credentials for authenticated routes
- OpenAI API credentials only if testing optional AI features

### Install And Configure

```bash
git clone https://github.com/khushlo/living-link.git
cd living-link
npm install
```

Copy `.env.example` to `.env.local`, fill in development values, and keep `FHIR_WRITE_ENABLED=false` and `ALLOW_PHI_TO_AI=false` unless an approved test configuration requires otherwise. Never use production PHI in this prototype.

### Start Local Dependencies

```bash
docker compose up -d postgres hapi-fhir
npx prisma migrate deploy
```

### Run The Application

```bash
npm run dev
```

The single Next.js development server runs at `http://localhost:3000`; there is no Express server on port 4000.

## Status And Claims

Implemented source code is not, by itself, evidence of deployed behavior, regulatory compliance, accessibility conformance, vendor integration, clinical validity, or completed co-design. Current and target claims, evidence gaps, and revalidation fields are recorded in `Documents/evidence-register.md`.

## License

MIT
