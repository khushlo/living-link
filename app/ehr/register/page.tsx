"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Network } from "lucide-react";
import { PublicPageShell } from "@/components/shared/public-page-shell";

type RegistrationForm = {
  organizationName: string;
  organizationWebsite: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  vendor: string;
  productName: string;
  environment: "sandbox" | "test" | "production" | "other";
  fhirIssuer: string;
  fhirVersion: "R4" | "R4B" | "unknown";
  smartSupported: boolean;
  smartClientId: string;
  cdsHooksSupported: boolean;
  requestedScopes: string;
  notes: string;
  secret: string;
};

const initialForm: RegistrationForm = {
  organizationName: "",
  organizationWebsite: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  vendor: "",
  productName: "",
  environment: "sandbox",
  fhirIssuer: "",
  fhirVersion: "R4",
  smartSupported: true,
  smartClientId: "",
  cdsHooksSupported: false,
  requestedScopes: "openid fhirUser launch patient/*.read",
  notes: "",
  secret: "",
};

const inputClass = "mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900";

export default function EHRRegisterPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registrationId, setRegistrationId] = useState("");

  function update<K extends keyof RegistrationForm>(field: K, value: RegistrationForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const response = await fetch("/api/ehr/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        requestedScopes: form.requestedScopes.split(/[\s,]+/).map((value) => value.trim()).filter(Boolean),
      }),
    });
    const data = await response.json().catch(() => null);
    if (response.ok) setRegistrationId(data.id);
    else setError(data?.error ?? "Unable to submit the registration.");
    setSubmitting(false);
  }

  return (
    <PublicPageShell>
      <div className="bg-slate-50 px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
              <Network className="h-4 w-4" aria-hidden="true" /> Vendor-neutral integration
            </div>
            <h1 className="text-3xl font-bold text-gray-950 sm:text-4xl">Register an EHR with LivingLink</h1>
            <p className="mt-3 text-gray-600">Submit your FHIR tenant and technical contact for SMART App Launch or CDS Hooks review. Submission does not activate an integration. A LivingLink administrator must review and approve it.</p>
          </div>

          {registrationId ? (
            <div className="rounded-2xl border border-green-200 bg-white p-8 shadow-sm" role="status">
              <CheckCircle2 className="h-10 w-10 text-green-600" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold text-gray-950">Registration submitted</h2>
              <p className="mt-2 text-gray-600">Your registration is pending administrator review and is not enabled.</p>
              <p className="mt-4 rounded-lg bg-gray-50 p-3 font-mono text-sm text-gray-700">Reference: {registrationId}</p>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}

              <section aria-labelledby="organization-heading">
                <h2 id="organization-heading" className="text-lg font-semibold text-gray-950">Organization and contact</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-gray-700">Organization name<input required maxLength={200} value={form.organizationName} onChange={(event) => update("organizationName", event.target.value)} className={inputClass} /></label>
                  <label className="text-sm font-medium text-gray-700">Organization website (optional)<input type="url" maxLength={500} placeholder="https://health-system.example" value={form.organizationWebsite} onChange={(event) => update("organizationWebsite", event.target.value)} className={inputClass} /></label>
                  <label className="text-sm font-medium text-gray-700">Technical contact name<input required maxLength={150} value={form.contactName} onChange={(event) => update("contactName", event.target.value)} className={inputClass} /></label>
                  <label className="text-sm font-medium text-gray-700">Technical contact email<input required type="email" maxLength={254} value={form.contactEmail} onChange={(event) => update("contactEmail", event.target.value)} className={inputClass} /></label>
                  <label className="text-sm font-medium text-gray-700">Technical contact phone (optional)<input type="tel" maxLength={30} value={form.contactPhone} onChange={(event) => update("contactPhone", event.target.value)} className={inputClass} /></label>
                </div>
              </section>

              <section aria-labelledby="ehr-heading">
                <h2 id="ehr-heading" className="text-lg font-semibold text-gray-950">EHR tenant</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-gray-700">Vendor<input required maxLength={100} placeholder="Epic, Oracle Health, MEDITECH, Altera..." value={form.vendor} onChange={(event) => update("vendor", event.target.value)} className={inputClass} /></label>
                  <label className="text-sm font-medium text-gray-700">Product and version<input required maxLength={150} placeholder="Product name and deployed version" value={form.productName} onChange={(event) => update("productName", event.target.value)} className={inputClass} /></label>
                  <label className="text-sm font-medium text-gray-700">Environment<select value={form.environment} onChange={(event) => update("environment", event.target.value as RegistrationForm["environment"])} className={inputClass}><option value="sandbox">Sandbox</option><option value="test">Test</option><option value="production">Production</option><option value="other">Other</option></select></label>
                  <label className="text-sm font-medium text-gray-700">FHIR version<select value={form.fhirVersion} onChange={(event) => update("fhirVersion", event.target.value as RegistrationForm["fhirVersion"])} className={inputClass}><option value="R4">FHIR R4</option><option value="R4B">FHIR R4B</option><option value="unknown">Unknown</option></select></label>
                  <label className="text-sm font-medium text-gray-700 sm:col-span-2">FHIR issuer/base URL<input required type="url" maxLength={500} placeholder="https://ehr.example/FHIR/R4" value={form.fhirIssuer} onChange={(event) => update("fhirIssuer", event.target.value)} className={inputClass} /><span className="mt-1 block text-xs font-normal text-gray-500">LivingLink will use this issuer for SMART discovery. Do not enter an access token or secret.</span></label>
                </div>
              </section>

              <section aria-labelledby="capabilities-heading">
                <h2 id="capabilities-heading" className="text-lg font-semibold text-gray-950">Capabilities</h2>
                <div className="mt-4 space-y-3">
                  <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 text-sm text-gray-700"><input type="checkbox" checked={form.smartSupported} onChange={(event) => update("smartSupported", event.target.checked)} className="mt-1" /><span><strong className="block text-gray-900">SMART App Launch</strong>EHR launch with patient and practitioner context</span></label>
                  {form.smartSupported && <label className="block text-sm font-medium text-gray-700">Vendor-issued SMART client ID<input required maxLength={300} value={form.smartClientId} onChange={(event) => update("smartClientId", event.target.value)} className={inputClass} /><span className="mt-1 block text-xs font-normal text-gray-500">A client ID is not secret. Never submit the corresponding client secret here.</span></label>}
                  <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 text-sm text-gray-700"><input type="checkbox" checked={form.cdsHooksSupported} onChange={(event) => update("cdsHooksSupported", event.target.checked)} className="mt-1" /><span><strong className="block text-gray-900">CDS Hooks</strong>Workflow-triggered `patient-view` services</span></label>
                  <label className="block text-sm font-medium text-gray-700">Requested SMART scopes<input maxLength={1500} value={form.requestedScopes} onChange={(event) => update("requestedScopes", event.target.value)} className={inputClass} /><span className="mt-1 block text-xs font-normal text-gray-500">Space- or comma-separated. Final scopes are reviewed and minimized before approval.</span></label>
                  <label className="block text-sm font-medium text-gray-700">Integration notes (optional)<textarea rows={5} maxLength={2000} value={form.notes} onChange={(event) => update("notes", event.target.value)} className={inputClass} placeholder="Describe supported launch contexts, CDS configuration process, sandbox access, or technical constraints." /></label>
                </div>
              </section>

              <div className="hidden" aria-hidden="true"><label>Leave this field empty<input tabIndex={-1} autoComplete="off" value={form.secret} onChange={(event) => update("secret", event.target.value)} /></label></div>
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Do not submit credentials.</strong> Client secrets, private keys, access tokens, patient identifiers, and PHI must be exchanged only through an approved secure channel after review.</div>
              <button type="submit" disabled={submitting || (!form.smartSupported && !form.cdsHooksSupported)} className="w-full rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Submitting..." : "Submit for review"}</button>
            </form>
          )}
        </div>
      </div>
    </PublicPageShell>
  );
}
