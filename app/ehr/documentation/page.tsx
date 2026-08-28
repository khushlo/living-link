import Link from "next/link";
import { ArrowRight, CheckCircle2, FileText, LockKeyhole, Network } from "lucide-react";
import { PublicPageShell } from "@/components/shared/public-page-shell";

const sections = [
  ["overview", "Overview"],
  ["prerequisites", "Prerequisites"],
  ["endpoints", "Endpoints"],
  ["registration", "Registration"],
  ["smart", "SMART launch"],
  ["identity", "Patient identity"],
  ["cds", "CDS Hooks"],
  ["security", "Security"],
  ["checklist", "Go-live checklist"],
  ["limitations", "Limitations"],
];

const endpoints = [
  ["GET", "/api/fhir/smart/launch", "EHR-initiated SMART launch"],
  ["GET", "/api/fhir/smart/callback", "OAuth authorization callback"],
  ["DELETE", "/api/fhir/smart/session", "Delete local SMART session"],
  ["GET", "/api/cds-hooks", "CDS Hooks discovery"],
  ["POST", "/api/cds-hooks/livinglink-readycheck-alert", "ReadyCheck patient-view service"],
  ["POST", "/api/cds-hooks/livinglink-stalled-evaluation", "Stalled evaluation service"],
  ["POST", "/api/ehr/registrations", "Submit EHR registration for review"],
];

function CodeBlock({ children }: { children: string }) {
  return <pre className="mt-3 overflow-x-auto rounded-xl border border-slate-700 bg-slate-950 p-4 text-sm leading-6 text-slate-100"><code>{children}</code></pre>;
}

function CheckList({ items }: { items: string[] }) {
  return <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">{items.map((item) => <li key={item} className="flex gap-2"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />{item}</li>)}</ul>;
}

export default function EHRDocumentationPage() {
  return (
    <PublicPageShell>
      <div className="bg-slate-50">
        <section className="border-b border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 px-6 py-16 text-white">
          <div className="mx-auto max-w-6xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-300/30 bg-teal-300/10 px-3 py-1 text-sm text-teal-100"><FileText className="h-4 w-4" aria-hidden="true" /> Integration reference</div>
            <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">Connect your EHR to LivingLink</h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">Vendor-neutral documentation for FHIR R4, SMART App Launch, patient identity mapping, and CDS Hooks. Every EHR product, tenant, and version requires separate registration and validation.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/ehr/register" className="inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-3 font-semibold text-slate-950 hover:bg-teal-300">Register an EHR <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link><a href="#endpoints" className="rounded-xl border border-white/20 px-5 py-3 font-semibold hover:bg-white/10">View endpoints</a></div>
          </div>
        </section>

        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 lg:grid-cols-[14rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-24 lg:self-start"><nav aria-label="Documentation sections" className="rounded-xl border border-slate-200 bg-white p-3 text-sm"><p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">On this page</p>{sections.map(([id, label]) => <a key={id} href={`#${id}`} className="block rounded-lg px-3 py-2 text-slate-600 hover:bg-slate-50 hover:text-teal-800">{label}</a>)}</nav></aside>

          <article className="min-w-0 space-y-14">
            <section id="overview" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-950">Overview</h2>
              <p className="mt-3 leading-7 text-slate-600">FHIR R4 defines clinical data. SMART App Launch authorizes and opens LivingLink in a patient chart. CDS Hooks sends workflow events and receives concise cards. These standards can support Epic, Oracle Health, MEDITECH, Sunrise, Paragon, and other compatible EHRs, but compatibility is not automatic.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-3">{[["FHIR R4", "Clinical resources and REST exchange"], ["SMART on FHIR", "OAuth launch and patient context"], ["CDS Hooks", "Patient-view events and cards"]].map(([title, body]) => <div key={title} className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-semibold text-slate-950">{title}</h3><p className="mt-2 text-sm text-slate-600">{body}</p></div>)}</div>
              <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Prototype status:</strong> LivingLink is not vendor certified. Sandbox, security, privacy, clinical, and production approval are still required.</p>
            </section>

            <section id="prerequisites" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-950">What the EHR must provide</h2>
              <p className="mt-3 leading-7 text-slate-600">LivingLink must first be registered as a SMART application in the vendor portal or customer EHR environment.</p>
              <CheckList items={["FHIR issuer/base URL", "Vendor, product, version, and environment", "Vendor-issued SMART client ID", "Client authentication method", "Exact redirect URI allowlist", "Supported scopes and launch context", "Patient and practitioner context behavior", "CDS Hooks support and registration process", "Sandbox users and synthetic patients", "Technical and security contacts"]} />
              <p className="mt-4 text-sm text-slate-600">Never submit client secrets, private keys, access tokens, patient identifiers, or PHI through the public registration form.</p>
            </section>

            <section id="endpoints" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-950">Endpoint reference</h2>
              <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 bg-white"><table className="w-full min-w-[42rem] text-left text-sm"><thead className="border-b bg-slate-100"><tr><th className="p-3">Method</th><th className="p-3">Endpoint</th><th className="p-3">Purpose</th></tr></thead><tbody className="divide-y">{endpoints.map(([method, path, purpose]) => <tr key={`${method}${path}`}><td className="p-3 font-semibold text-teal-800">{method}</td><td className="p-3 font-mono text-xs">{path}</td><td className="p-3 text-slate-600">{purpose}</td></tr>)}</tbody></table></div>
            </section>

            <section id="registration" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-950">Two-sided registration</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2"><div className="rounded-xl border bg-white p-5"><span className="text-xs font-bold uppercase tracking-wider text-blue-700">Step A</span><h3 className="mt-2 font-semibold">Register LivingLink in the EHR</h3><p className="mt-2 text-sm leading-6 text-slate-600">Configure launch URL, callback URL, client type, scopes, chart location, and CDS services.</p></div><div className="rounded-xl border bg-white p-5"><span className="text-xs font-bold uppercase tracking-wider text-teal-700">Step B</span><h3 className="mt-2 font-semibold">Register the EHR in LivingLink</h3><p className="mt-2 text-sm leading-6 text-slate-600">Submit at <Link href="/ehr/register" className="font-semibold text-teal-800 underline">/ehr/register</Link>. It remains <code>approved=false</code> until an admin assigns a real center and approves it.</p></div></div>
              <CodeBlock>{["EHR launch URL", "https://livinglink.example.com/api/fhir/smart/launch", "", "OAuth redirect URI", "https://livinglink.example.com/api/fhir/smart/callback", "", "CDS discovery", "https://livinglink.example.com/api/cds-hooks"].join("\n")}</CodeBlock>
            </section>

            <section id="smart" className="scroll-mt-24">
              <div className="flex items-center gap-3"><Network className="h-6 w-6 text-teal-700" aria-hidden="true" /><h2 className="text-2xl font-bold text-slate-950">SMART App Launch</h2></div>
              <ol className="mt-5 space-y-3 text-sm leading-6 text-slate-700">{["Clinician opens a patient chart and selects LivingLink.", "EHR launches LivingLink with iss and an opaque launch value.", "LivingLink validates the issuer and enabled EHR connection.", "LivingLink reads SMART discovery and creates state plus PKCE S256.", "EHR authenticates the clinician and returns an authorization code.", "LivingLink exchanges the code and receives patient, practitioner, scope, and token context.", "LivingLink resolves connection plus Patient ID to one donor mapping.", "LivingLink opens the authorized patient-specific workflow."].map((step, index) => <li key={step} className="flex gap-3"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-100 font-bold text-teal-900">{index + 1}</span>{step}</li>)}</ol>
              <h3 className="mt-7 font-semibold">Launch request</h3><CodeBlock>{["GET /api/fhir/smart/launch", "  ?iss=https%3A%2F%2Fehr.example%2FFHIR%2FR4", "  &launch=opaque-short-lived-value"].join("\n")}</CodeBlock>
              <h3 className="mt-7 font-semibold">EHR SMART discovery URL</h3><CodeBlock>{["GET {EHR_FHIR_ISSUER}/.well-known/smart-configuration", "", "{", "  \"authorization_endpoint\": \"https://ehr.example/oauth2/authorize\",", "  \"token_endpoint\": \"https://ehr.example/oauth2/token\"", "}"].join("\n")}</CodeBlock>
              <h3 className="mt-7 font-semibold">Relevant token context</h3><CodeBlock>{["{", "  \"access_token\": \"opaque-token\",", "  \"token_type\": \"Bearer\",", "  \"scope\": \"openid fhirUser launch patient/*.read\",", "  \"patient\": \"12345\",", "  \"fhirUser\": \"Practitioner/987\"", "}"].join("\n")}</CodeBlock>
            </section>

            <section id="identity" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-950">Patient identity and linking</h2>
              <p className="mt-3 leading-7 text-slate-600">A Patient ID is unique only inside its EHR tenant. LivingLink always includes the issuer-scoped connection.</p>
              <CodeBlock>{["EHR issuer/tenant + external Patient ID", "  -> EHRConnection", "  -> ExternalPatientMapping", "  -> DonorProfile"].join("\n")}</CodeBlock>
              <p className="mt-4 leading-7 text-slate-600">Center users link patients through <code>/coordinator/patient-links</code> or <code>/clinician/patient-links</code>. Linking requires center membership, an enabled center-owned connection, active donor-center authorization, explicit identity confirmation, uniqueness checks, and audit logging.</p>
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-950"><strong>Never:</strong> search every donor from an EHR request, match by name alone, use SSN, or disclose donor data when mapping or authorization is absent.</p>
            </section>

            <section id="cds" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-950">CDS Hooks workflow</h2>
              <p className="mt-3 leading-7 text-slate-600">When supported, the EHR calls a LivingLink <code>patient-view</code> service as a clinician opens a chart. SMART support alone does not guarantee CDS Hooks support.</p>
              <h3 className="mt-6 font-semibold">Request</h3><CodeBlock>{["POST /api/cds-hooks/livinglink-readycheck-alert", "Authorization: Bearer {service-credential}", "Content-Type: application/json", "", "{", "  \"hook\": \"patient-view\",", "  \"hookInstance\": \"unique-event-id\",", "  \"fhirServer\": \"https://ehr.example/FHIR/R4\",", "  \"context\": {", "    \"userId\": \"Practitioner/987\",", "    \"patientId\": \"12345\"", "  }", "}"].join("\n")}</CodeBlock>
              <p className="mt-4 leading-7 text-slate-600">LivingLink validates service credentials, hook, issuer, center, mapping, and donor authorization before evaluating readiness or stalled-evaluation data.</p>
              <h3 className="mt-6 font-semibold">Response</h3><CodeBlock>{["{", "  \"cards\": [{", "    \"summary\": \"LivingLink: Living Donor Candidate Active\",", "    \"detail\": \"This patient has an active donor-readiness workflow.\",", "    \"indicator\": \"info\",", "    \"source\": { \"label\": \"LivingLink\" }", "  }]", "}"].join("\n")}</CodeBlock>
              <p className="mt-4 text-sm text-slate-600">No authorized match returns <code>{`{"cards":[]}`}</code>. Cards must not contain access tokens, complete histories, unrelated financial information, or unnecessary PHI.</p>
            </section>

            <section id="security" className="scroll-mt-24">
              <div className="flex items-center gap-3"><LockKeyhole className="h-6 w-6 text-teal-700" aria-hidden="true" /><h2 className="text-2xl font-bold text-slate-950">Security boundaries</h2></div>
              <CheckList items={["Clerk protects interactive LivingLink sessions.", "SMART uses issuer allowlisting, state, PKCE, EHR OAuth, and connection validation.", "CDS uses service authentication plus issuer, center, mapping, and authorization checks.", "Tokens and patient context are encrypted and never logged.", "Client secrets and private keys remain in managed secret storage.", "Every disclosure is minimum necessary and authorization is checked at use time.", "Development and sandbox testing uses synthetic patients only."]} />
            </section>

            <section id="checklist" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-950">Go-live checklist</h2>
              <div className="mt-5 grid gap-5 md:grid-cols-2">{[["EHR setup", ["Create SMART app", "Register exact URLs", "Approve minimum scopes", "Configure chart launch", "Configure CDS if supported", "Provide sandbox users"]], ["LivingLink setup", ["Create real center", "Approve EHR registration", "Store credentials securely", "Create center authorization", "Link Patient ID", "Verify audit controls"]], ["SMART tests", ["Correct context", "Unknown issuer rejected", "Replay rejected", "Scope downgrade safe", "Cross-tenant lookup rejected", "Expiry tested"]], ["CDS tests", ["Discovery accepted", "Services resolve", "Expected card returned", "Unknown patient gets no cards", "Invalid credential rejected", "Clinical wording approved"]]].map(([title, items]) => <div key={title as string} className="rounded-xl border bg-white p-5"><h3 className="font-semibold">{title as string}</h3><ul className="mt-3 space-y-2 text-sm text-slate-600">{(items as string[]).map((item) => <li key={item}>[ ] {item}</li>)}</ul></div>)}</div>
            </section>

            <section id="limitations" className="scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-950">Current limitations</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700"><li>Complete OIDC ID-token and practitioner identity validation remains pending.</li><li>The token-backed FHIR read client and patient-specific CenterFlow view remain pending.</li><li>Refresh, provider revocation, and EHR logout remain pending.</li><li>Tenant-specific confidential-client and CDS OAuth identities remain pending.</li><li>CDS prefetch, replay protection, and distributed limits remain pending.</li><li>Every named vendor requires separate sandbox evidence and approval.</li></ul>
              <div className="mt-8 rounded-2xl bg-teal-900 p-6 text-white"><h3 className="text-xl font-semibold">Ready for sandbox review?</h3><p className="mt-2 text-sm text-teal-100">Submit non-secret tenant details. Registrations remain disabled until administrator approval.</p><Link href="/ehr/register" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-teal-950">Open registration <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
            </section>
          </article>
        </div>
      </div>
    </PublicPageShell>
  );
}
