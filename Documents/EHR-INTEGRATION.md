# LivingLink EHR Integration Guide

Status: vendor-neutral integration runbook for the current prototype and target production workflow  
Audience: EHR integration engineers, transplant-center IT teams, security teams, and LivingLink maintainers  
Standards: HL7 FHIR R4, SMART App Launch, OAuth 2.0/OIDC, and CDS Hooks

## 1. Scope and Current Status

LivingLink is designed to integrate with any EHR that supports the required standards. It is not limited to Epic or Oracle Health/Cerner. Candidate systems may include Epic, Oracle Health Millennium, MEDITECH Expanse, Altera/Allscripts Sunrise, Paragon, athenahealth, eClinicalWorks, and other FHIR R4/SMART-capable products.

Compatibility is not automatic. Every EHR product, customer tenant, version, and environment may expose different FHIR resources, scopes, launch behavior, embedded-browser restrictions, and CDS Hooks capabilities. Each integration must be registered, configured, tested, and approved separately.

The repository currently provides a prototype foundation:

- SMART EHR launch and callback routes.
- Issuer allowlisting and an `EHRConnection` database model.
- SMART discovery, OAuth state, and PKCE S256.
- Encrypted SMART token and patient-context storage.
- Tenant-scoped external Patient mappings.
- Center-authorized patient-linking UI and API.
- CDS Hooks discovery and two `patient-view` services.
- FHIR R4 mapping, export, and optional write helpers.

The repository does not yet provide a vendor-certified production integration. Important gaps are listed in Section 16.

## 2. Direct Answers

### Does the EHR need to register or provide details to LivingLink?

Yes. The center or vendor must provide or configure at least:

- EHR FHIR R4 issuer/base URL.
- Vendor and tenant/environment identity.
- SMART application client ID.
- Client authentication method and credential, if required.
- Exact redirect URI allowlist.
- Supported SMART capabilities and scopes.
- Authorization and token endpoints, normally exposed through SMART discovery.
- Supported FHIR resources, profiles, search parameters, and terminology.
- Launch context behavior, including `patient`, `encounter`, and `fhirUser` support.
- EHR frame/embedding origins if LivingLink is embedded.
- CDS Hooks support, discovery/service registration process, and authentication method.
- Sandbox/test users and synthetic patients.
- Production approval and operational contacts.

The EHR should not send LivingLink a permanent patient list, database credentials, or unrestricted access token.

### Must LivingLink be created as a SMART app on the EHR platform?

Yes. For SMART launch, LivingLink must be registered as an application in the vendor developer portal or the healthcare organization's EHR administration environment.

Registration normally creates a client ID and binds it to:

- Application name and owner.
- Launch URL.
- OAuth redirect URI.
- Public or confidential client type.
- Requested scopes.
- Launch mode: EHR launch, standalone launch, or both.
- Supported FHIR version.
- Logo, support contact, privacy policy, and terms.
- Allowed customer tenants or organizations.

Vendor registration and LivingLink tenant registration are separate steps. Both are required.

### Does LivingLink expose its own `.well-known/smart-configuration`?

No. In the current EHR-launch architecture, the EHR is the FHIR authorization server. LivingLink consumes the EHR's discovery document:

```text
{EHR_FHIR_ISSUER}/.well-known/smart-configuration
```

LivingLink would expose its own SMART discovery document only if it operated as a FHIR authorization server for other applications, which it currently does not.

## 3. Parties and Responsibilities

| Party | Responsibilities |
|---|---|
| EHR vendor | Documents FHIR/SMART/CDS capabilities, provides developer registration and sandbox where available |
| Transplant-center EHR administrator | Enables the app for its tenant, approves scopes, configures launch points and CDS services |
| Transplant-center security/privacy team | Reviews data use, access, agreements, user roles, incident handling, and production approval |
| LivingLink administrator | Registers the EHR tenant in LivingLink and references its managed client credentials |
| LivingLink integration service | Performs SMART discovery, OAuth exchange, patient-context validation, FHIR access, and CDS processing |
| Center clinician/coordinator | Confirms patient linking only through an approved identity-verification process |
| Donor | Supplies LivingLink profile information and grants/revokes applicable center/EHR authorization |

## 4. Integration Architecture

```text
                    SMART App Launch
+----------------+  iss + launch   +--------------------+
| EHR patient    | --------------> | LivingLink launch  |
| chart          |                 | endpoint           |
+----------------+                 +---------+----------+
        ^                                    |
        |                                    | OAuth authorize
        |                                    v
        |                          +--------------------+
        |                          | EHR authorization  |
        |                          | and token server   |
        |                          +---------+----------+
        |                                    |
        |                         code/token | patient context
        |                                    v
        |                          +--------------------+
        +--------------------------| LivingLink         |
          interactive app         | CenterFlow         |
                                   +--------------------+

                     CDS Hooks
+----------------+ patient-view  +--------------------+
| EHR workflow   | ------------> | LivingLink CDS     |
| engine         | <------------ | service            |
+----------------+ CDS cards     +--------------------+
```

SMART, CDS Hooks, and FHIR have different roles:

| Standard | Role |
|---|---|
| FHIR R4 | Defines clinical resources and REST interactions |
| SMART App Launch | Authorizes and launches the interactive LivingLink application in patient context |
| CDS Hooks | Sends a workflow event to LivingLink and receives small decision-support cards |

## 5. Registration Step A: Register LivingLink in the EHR

The EHR/vendor application registration should use environment-specific values.

### LivingLink endpoints supplied to the EHR

| Setting | Value |
|---|---|
| EHR launch URL | `https://{livinglink-host}/api/fhir/smart/launch` |
| OAuth redirect URI | `https://{livinglink-host}/api/fhir/smart/callback` |
| Application landing URL | `https://{livinglink-host}/clinician/center-flow` |
| CDS discovery URL | `https://{livinglink-host}/api/cds-hooks` |
| ReadyCheck service URL | `https://{livinglink-host}/api/cds-hooks/livinglink-readycheck-alert` |
| Stalled evaluation service URL | `https://{livinglink-host}/api/cds-hooks/livinglink-stalled-evaluation` |

The redirect URI must match exactly. A mismatch in scheme, hostname, path, port, or trailing slash may cause OAuth rejection.

### Requested launch type

The current design is an EHR-launched clinician/coordinator application:

```text
EHR launch -> current clinician + current patient -> LivingLink CenterFlow
```

It is not currently a complete patient-facing standalone SMART application.

### Current prototype scopes

```text
openid fhirUser launch patient/*.read
```

This broad prototype scope must be replaced with the smallest vendor-supported scopes required by approved workflows. A target might use granular SMART v2 scopes such as `patient/Patient.rs` and selected Observation/CarePlan scopes, but exact scope syntax depends on the vendor and supported SMART version.

### Client type

Use the client type supported by the EHR and hosting architecture:

- Public client: no client secret; PKCE is mandatory.
- Confidential client: server-side credential or private-key JWT plus PKCE where supported.

Client secrets and private keys must be stored in a managed secret service. They must not be stored in source code, browser storage, `EHRConnection`, or committed environment files.

## 6. Registration Step B: Register the EHR in LivingLink

The EHR tenant must be represented by an enabled `EHRConnection` in PostgreSQL.

Current model fields:

```text
issuer
vendor
environment
organizationCenterId
enabled
clientConfigurationRef
allowedCapabilities
```

Example conceptual record:

```json
{
  "issuer": "https://ehr.example.com/FHIR/R4",
  "vendor": "VENDOR_NAME",
  "environment": "sandbox",
  "organizationCenterId": "livinglink-center-uuid",
  "enabled": true,
  "clientConfigurationRef": "secret-manager/ehr/sandbox/client",
  "allowedCapabilities": ["smart-ehr-launch", "patient-read", "cds-patient-view"]
}
```

`clientConfigurationRef` is a reference to managed configuration, not the secret itself.

Current prototype configuration also requires environment variables:

```env
SMART_CLIENT_ID=vendor-issued-client-id
SMART_REDIRECT_URI=https://livinglink.example.com/api/fhir/smart/callback
SMART_ALLOWED_ISSUERS=https://ehr.example.com/FHIR/R4
CDS_HOOKS_BEARER_TOKEN=managed-prototype-service-token
NEXT_PUBLIC_APP_URL=https://livinglink.example.com
```

If the EHR requires a confidential client, the production implementation must load its credential from the managed configuration referenced by the EHR connection.

Important current limitation: the code uses one global `SMART_CLIENT_ID` and one CDS bearer token. Production multi-tenant integration requires per-connection client IDs, authentication methods, keys/secrets, scopes, and CDS service identities.

External organizations can submit non-secret integration details at:

```text
/ehr/register
```

The public submission creates an `EHRRegistration` with `approved=false`; it does not create an active EHR connection. LivingLink administrators review requests at:

```text
/admin/ehr-registrations
```

Approval requires assigning an existing transplant center and creates or enables the corresponding `EHRConnection`. Rejection records a reason without creating a connection. Client secrets, private keys, access tokens, Patient IDs, and PHI are prohibited in the public form and must use an approved secure exchange. A broader connection-management UI for credential rotation, disablement, capability changes, and revalidation remains future work.

## 7. Exact SMART EHR Launch Flow

### Step 1: Clinician selects LivingLink

The clinician opens a patient chart and selects the configured LivingLink activity/app. The EHR sends the browser to:

```text
GET https://livinglink.example.com/api/fhir/smart/launch
    ?iss=https%3A%2F%2Fehr.example.com%2FFHIR%2FR4
    &launch=opaque-short-lived-launch-value
```

Parameters:

| Parameter | Meaning |
|---|---|
| `iss` | EHR FHIR issuer/base URL and tenant identity |
| `launch` | Opaque EHR launch context; it is not the Patient ID |

### Step 2: LivingLink validates the issuer

LivingLink normalizes the issuer, checks `SMART_ALLOWED_ISSUERS`, and requires an enabled matching `EHRConnection`.

Unknown or disabled issuers receive `403` and are not queried.

### Step 3: LivingLink performs SMART discovery

LivingLink requests:

```http
GET https://ehr.example.com/FHIR/R4/.well-known/smart-configuration
```

Minimum relevant response fields:

```json
{
  "authorization_endpoint": "https://ehr.example.com/oauth2/authorize",
  "token_endpoint": "https://ehr.example.com/oauth2/token",
  "capabilities": ["launch-ehr", "client-public", "context-ehr-patient"]
}
```

If this endpoint is unavailable, the current prototype attempts to discover OAuth URI extensions in:

```http
GET https://ehr.example.com/FHIR/R4/metadata
```

Production discovery must enforce HTTPS, timeouts, content types, response-size limits, exact issuer policy, and supported capabilities.

### Step 4: LivingLink creates state and PKCE

LivingLink creates:

- A random OAuth `state` value.
- A random PKCE `code_verifier`.
- A SHA-256 `code_challenge`.
- A short-lived server-side `SmartSession`.
- An HttpOnly `smart_state` cookie.

The verifier is encrypted before database storage. The state expires after approximately ten minutes.

### Step 5: LivingLink redirects to the EHR

Example authorization request:

```text
https://ehr.example.com/oauth2/authorize
  ?response_type=code
  &client_id=livinglink-client-id
  &redirect_uri=https://livinglink.example.com/api/fhir/smart/callback
  &scope=openid%20fhirUser%20launch%20patient/*.read
  &state=random-state
  &code_challenge=random-challenge
  &code_challenge_method=S256
  &aud=https://ehr.example.com/FHIR/R4
  &launch=opaque-short-lived-launch-value
```

The EHR authenticates the clinician, verifies policy, binds the request to the current chart, and asks for authorization where required.

### Step 6: EHR returns an authorization code

The EHR redirects to:

```text
GET https://livinglink.example.com/api/fhir/smart/callback
    ?code=short-lived-authorization-code
    &state=random-state
```

LivingLink verifies the browser state cookie and server-side session, expiry, enabled EHR connection, issuer, and one-time state use.

### Step 7: LivingLink exchanges the code

```http
POST https://ehr.example.com/oauth2/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
code=short-lived-authorization-code
redirect_uri=https://livinglink.example.com/api/fhir/smart/callback
client_id=livinglink-client-id
code_verifier=original-pkce-verifier
```

Example token response:

```json
{
  "access_token": "opaque-access-token",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "openid fhirUser launch patient/*.read",
  "patient": "12345",
  "fhirUser": "Practitioner/987",
  "id_token": "signed-id-token"
}
```

The Patient ID comes from the validated EHR token response, not from a user-entered URL parameter.

### Step 8: LivingLink stores session context

The current `SmartSession` stores:

```text
state
issuer
connectionId
launchType
tokenEndpoint
encrypted PKCE verifier
encrypted access token
encrypted patient context
granted scopes
token metadata
expiry and consumed timestamp
optional local user/center context
```

Tokens and patient context must never be written to application logs or returned to the browser.

### Step 9: Resolve the patient

LivingLink resolves:

```text
connectionId + externalPatientId -> ExternalPatientMapping -> DonorProfile
```

If there is no mapping or active center authorization, LivingLink must show an authorized no-match/enrollment state and must not search or disclose other donor profiles.

### Step 10: Show the patient-specific application

The current callback redirects to:

```text
/clinician/center-flow
```

The intended application should load the specific mapped donor and only data permitted by role, center, purpose, and consent. The prototype does not yet consume the SMART session to render a complete patient-specific CenterFlow view; this remains required implementation.

### Step 11: Read FHIR resources

The target server-side FHIR client requests only approved resources:

```http
GET https://ehr.example.com/FHIR/R4/Patient/12345
Authorization: Bearer opaque-access-token
Accept: application/fhir+json
```

Other resources might include selected `Observation`, `Condition`, `CarePlan`, `QuestionnaireResponse`, and `Task` records. The client must enforce the authorized Patient ID and granted scopes for every request.

The current prototype stores the token and patient context but does not yet implement this complete read workflow.

### Step 12: End the session

LivingLink provides local session deletion at:

```text
DELETE /api/fhir/smart/session
```

Current deletion removes the LivingLink session and cookie. Provider-side token revocation and EHR logout require vendor-specific implementation.

## 8. Patient Linking and Center Authorization

SMART authorization tells LivingLink which EHR patient is open. It does not prove which LivingLink donor profile should be associated with that patient.

The center linking UI is available at:

```text
/coordinator/patient-links
/clinician/patient-links
```

The backing API is:

```text
GET    /api/center-flow/patient-links
POST   /api/center-flow/patient-links
DELETE /api/center-flow/patient-links?id={mapping-id}
```

The current API requires:

- Authenticated coordinator or clinician permission.
- A center membership.
- An enabled EHR connection owned by that center.
- An active `DonorCenterAuthorization` for that donor and center.
- Explicit staff confirmation of the patient identity.
- A unique external Patient mapping for that EHR connection.
- Audit events for read, create, and unlink operations.

The mapping key is not globally unique because different tenants can use the same Patient ID. The tenant/connection must always be included.

No mock EHR connections, patients, donor profiles, or evaluation records are substituted when data is unavailable.

## 9. Donor Data Available to the Workflow

LivingLink stores application data in PostgreSQL through Prisma. Relevant models include:

- `User`: Clerk ID, email, name, phone, role, and language preference.
- `DonorProfile`: donation status, donation date, type, recipient relationship, center name, and optional DOB.
- `EligibilityCheck`: BMI, blood pressure, eGFR, smoking status, diabetes, age, and summary.
- `HealthGoal` and `GoalProgressLog`.
- `DonorEvaluation`: center, stage, stage history, elapsed days, stalled status, and notes.
- `PostDonationCheckin` and `PHQ2Response`.
- `ConsentRecord` and `DonorCenterAuthorization`.
- `EHRConnection`, `ExternalPatientMapping`, and `SmartSession`.

The donor profile UI is:

```text
/donor/profile
```

DOB uses USA `MM-dd-YYYY` display/input format with automatic hyphen insertion. SSN and government identifiers are intentionally not collected.

Having data in LivingLink does not automatically authorize EHR access. Disclosure still requires the correct tenant, Patient mapping, center authorization, user/service permission, purpose, and current consent.

## 10. Exact CDS Hooks Integration Flow

### Step 1: Determine EHR support

Confirm that the EHR version supports CDS Hooks and the `patient-view` hook. SMART support does not guarantee CDS Hooks support.

If the EHR does not support CDS Hooks, it can still use SMART launch. The clinician opens LivingLink through a configured app activity instead of receiving an automatic card.

### Step 2: Register CDS services in the EHR

LivingLink discovery endpoint:

```text
GET https://livinglink.example.com/api/cds-hooks
```

It advertises:

```text
livinglink-readycheck-alert
livinglink-stalled-evaluation
```

Corresponding service endpoints:

```text
POST https://livinglink.example.com/api/cds-hooks/livinglink-readycheck-alert
POST https://livinglink.example.com/api/cds-hooks/livinglink-stalled-evaluation
```

The EHR administrator configures when each service runs, its service URL, authentication credential, timeout, and allowed users/locations.

### Step 3: EHR invokes `patient-view`

Example:

```http
POST /api/cds-hooks/livinglink-readycheck-alert
Authorization: Bearer prototype-service-token
Content-Type: application/json

{
  "hook": "patient-view",
  "hookInstance": "f61e7f5a-6d1c-4d24-a1f3-fd2dcf75a1c2",
  "fhirServer": "https://ehr.example.com/FHIR/R4",
  "context": {
    "userId": "Practitioner/987",
    "patientId": "12345",
    "encounterId": "Encounter/789"
  },
  "prefetch": {
    "patient": {
      "resourceType": "Patient",
      "id": "12345"
    }
  }
}
```

### Step 4: LivingLink validates the request

The current service validates:

- Prototype bearer credential.
- JSON body.
- `hook` equals `patient-view`.
- Presence of `hookInstance`.
- Presence of `context.patientId`.
- Presence of `fhirServer`.
- Known service ID.
- Enabled EHR connection associated with a center.
- Tenant-scoped external Patient mapping.
- Active center authorization for the donor.

Current limitations: prefetch is advertised but not consumed, `hookInstance` replay is not stored, and service authentication is one shared bearer token rather than tenant-specific OAuth.

### Step 5: LivingLink evaluates its data

ReadyCheck service:

- Loads the mapped donor profile.
- Reads the latest eligibility check.
- Returns an informational card when an active donor workflow exists.

Stalled-evaluation service:

- Searches the connection's center for an active evaluation.
- Uses the configured stale threshold, currently 14 days.
- Returns a warning card when the evaluation has not progressed.

The current evaluation lookup uses `DonorEvaluation.donorRef` compared with the external Patient ID. A production model should replace this free-form comparison with an explicit relation to `ExternalPatientMapping` or `DonorProfile`.

### Step 6: LivingLink returns cards

Example:

```json
{
  "cards": [
    {
      "summary": "LivingLink: Living Donor Candidate Active",
      "detail": "This patient has an active living donor workflow in LivingLink.",
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

If there is no authorized mapping or applicable workflow, LivingLink returns:

```json
{
  "cards": []
}
```

This prevents the EHR from learning whether an unrelated LivingLink donor exists.

## 11. Recommended Combined Workflow

```text
1. Donor creates and maintains a LivingLink donor profile.
2. Donor authorizes a transplant center and applicable EHR exchange.
3. Center and LivingLink register the SMART app and CDS services.
4. LivingLink administrator provisions the center's EHR connection.
5. Authorized center staff verifies and links the EHR Patient ID to the donor profile.
6. Clinician opens that patient chart.
7. EHR invokes the LivingLink CDS patient-view service.
8. LivingLink validates service, issuer, center, mapping, and authorization.
9. LivingLink returns a minimum-necessary card, or no cards.
10. Clinician selects the card or configured app activity.
11. EHR starts SMART launch with `iss` and `launch`.
12. LivingLink completes OAuth/PKCE and receives authorized patient context.
13. LivingLink resolves the same tenant-scoped mapping.
14. LivingLink displays only the authorized donor workflow.
15. LivingLink reads selected EHR FHIR resources only when scopes and policy permit.
16. Audit events record access and linking operations without logging tokens or unnecessary PHI.
```

## 12. Authentication Boundaries

LivingLink uses different authentication mechanisms for different callers:

| Caller | Authentication boundary |
|---|---|
| Donor, clinician, coordinator, admin browser user | Clerk plus application role/permission and center checks |
| SMART launch/callback | EHR issuer allowlist, server-side state, PKCE, EHR OAuth, connection validation |
| CDS Hooks service caller | Prototype bearer credential plus issuer/tenant/patient/center checks |
| Future server-to-server FHIR client | Vendor-approved SMART Backend Services/OAuth identity |

SMART/CDS routes are middleware-public because they are invoked by the EHR, not by a pre-existing Clerk browser session. They must remain protected by their route-specific controls.

The current callback then redirects to a Clerk-protected clinician route. A complete EHR single-sign-on implementation must securely bind validated `fhirUser` identity to a LivingLink clinician/center authorization or define a controlled account-linking step. Otherwise the user may still be asked to authenticate with Clerk.

## 13. Data-Minimization Rules

1. Never identify a donor using Patient ID without the EHR connection/issuer.
2. Never expose a global donor search to an EHR caller.
3. Never log access tokens, authorization codes, PKCE verifiers, Patient resources, or CDS request bodies.
4. Return only minimum-necessary CDS card content.
5. Keep full financial, mental-health, and donor workflow details inside authorized application views unless a separately approved exchange requires them.
6. Enforce current consent and center authorization at use time, not only when a mapping was created.
7. Remove or disable mappings promptly when authorization is revoked.
8. Use synthetic patients in development and vendor sandboxes.
9. Do not collect SSN for SMART, CDS, FHIR, or patient linking.

## 14. Vendor-Neutral Onboarding Checklist

### Capability discovery

- [ ] Confirm FHIR R4 endpoint and supported implementation-guide version.
- [ ] Confirm SMART App Launch version and `launch-ehr` capability.
- [ ] Confirm patient and practitioner context support.
- [ ] Confirm public/confidential client options and authentication method.
- [ ] Confirm required granular scopes.
- [ ] Confirm CDS Hooks and `patient-view` support separately.
- [ ] Confirm embedded app and browser/cookie restrictions.

### EHR/vendor registration

- [ ] Create LivingLink app registration in the sandbox/customer EHR.
- [ ] Register exact launch and redirect URLs.
- [ ] Approve minimum scopes.
- [ ] Record sandbox issuer and client ID in managed configuration.
- [ ] Configure launch location in the patient chart.
- [ ] Configure CDS discovery/services if supported.
- [ ] Obtain synthetic test patients and clinician users.

### LivingLink registration

- [ ] Create transplant center and center memberships.
- [ ] Create enabled `EHRConnection` for the exact issuer/environment.
- [ ] Add issuer to `SMART_ALLOWED_ISSUERS` for the current prototype.
- [ ] Store credentials in a secret manager.
- [ ] Record the managed configuration reference.
- [ ] Grant donor center/EHR authorization.
- [ ] Create tenant-scoped external Patient mapping through the linking workflow.

### SMART validation

- [ ] Successful EHR launch.
- [ ] Correct Patient and practitioner context.
- [ ] Unknown issuer rejected.
- [ ] Redirect mismatch rejected by EHR.
- [ ] State replay and expiry rejected.
- [ ] PKCE failure rejected.
- [ ] Invalid token type/expiry rejected.
- [ ] Wrong Patient and cross-tenant mapping rejected.
- [ ] Scope downgrade handled safely.
- [ ] Session deletion and token expiry tested.

### CDS validation

- [ ] Discovery document accepted by EHR.
- [ ] Each advertised service endpoint resolves.
- [ ] Valid patient-view returns expected card.
- [ ] Unknown patient returns zero cards.
- [ ] Missing/revoked authorization returns zero cards.
- [ ] Invalid service credential rejected.
- [ ] Wrong issuer/tenant rejected without disclosure.
- [ ] Malformed context rejected safely.
- [ ] EHR workflow remains usable when LivingLink is unavailable.
- [ ] Card wording approved by a clinical owner.

## 15. No Additional Hardware Requirement

LivingLink is a web application and integration service. It does not require hardware installation in the hospital. Integration still requires software configuration, network access, vendor/customer registration, identity setup, security review, and operational support.

The phrase "no additional hardware" must not be interpreted as "no integration effort" or "works with every EHR automatically."

## 16. Current Prototype Gaps Before Production

The following work is required before describing an EHR as production integrated:

1. Add per-EHR-connection SMART client configuration and secret-manager loading.
2. Add OIDC nonce and ID-token JWKS/signature, issuer, audience, expiry, and subject validation.
3. Validate granted scopes, `fhirUser`, patient, encounter, and launch context.
4. Bind the EHR clinician identity to a LivingLink center user or approved SSO identity.
5. Implement the server-side FHIR client that consumes the stored SMART token.
6. Render a patient-specific CenterFlow view from the validated SMART session.
7. Add refresh token, provider revocation, logout, and expiry recovery where supported.
8. Implement tenant-specific CDS OAuth/service identities instead of one bearer token.
9. Validate and consume CDS prefetch or authorized `fhirAuthorization` safely.
10. Add hook replay/idempotency controls and distributed rate limiting.
11. Relate donor evaluations explicitly to donor profiles/external mappings instead of a free-form donor reference.
12. Configure a narrowly approved frame policy; the current global frame-denial policy may block embedded EHR launch.
13. Add official FHIR R4/selected US Core and CDS contract validation.
14. Add Epic, Oracle Health, MEDITECH, Sunrise, Paragon, or other vendor sandbox evidence individually before naming support.
15. Complete security, privacy, accessibility, clinical safety, monitoring, recovery, and contractual approvals.

## 17. Troubleshooting

### `FHIR issuer is not registered`

- Verify the `iss` value exactly matches `SMART_ALLOWED_ISSUERS` after trailing-slash normalization.
- Verify an enabled `EHRConnection` exists for that issuer.
- Do not broadly allow arbitrary issuers to bypass the error.

### SMART discovery fails

- Request `{iss}/.well-known/smart-configuration` directly from the LivingLink runtime network.
- Verify HTTPS certificates, proxy/firewall policy, content type, and vendor path.
- Check whether the EHR exposes OAuth URI extensions only in `{iss}/metadata`.

### EHR reports redirect mismatch

- Compare `SMART_REDIRECT_URI` to the vendor registration character by character.
- Verify scheme, host, port, path, and trailing slash.

### SMART callback state is invalid or expired

- Complete launch within the state lifetime.
- Verify browser cookie restrictions and HTTPS/SameSite behavior in the embedded EHR browser.
- Do not disable state validation.

### Launch succeeds but donor is not found

- Verify the token response contains the expected `patient` context.
- Verify the exact EHR connection and external Patient mapping.
- Verify active donor-center authorization and applicable consent.
- Never fall back to searching all donors.

### CDS returns no cards

- Verify service authentication and JSON context.
- Verify `fhirServer` matches the enabled EHR issuer.
- Verify center ownership, Patient mapping, and authorization.
- Verify an applicable readiness check or stalled evaluation exists.
- Zero cards is the correct privacy-preserving response when no authorized match exists.

## 18. Evidence Required to Claim Vendor Support

For each named EHR, retain a sanitized report containing:

- Vendor, product, version, tenant, and environment.
- LivingLink commit and configuration version.
- App registration type and approved scopes.
- SMART discovery and launch results.
- Patient/practitioner context tests.
- FHIR resource and profile validation results.
- CDS discovery, service, and card results if supported.
- Negative issuer, patient, scope, replay, and cross-tenant tests.
- Embedded browser and accessibility results.
- Known limitations and required customer configuration.
- Security, privacy, clinical, and vendor/customer approvers.
- Approval and revalidation dates.

Generic compliance with SMART/FHIR/CDS standards is not proof that LivingLink works with every deployment of a named vendor.
