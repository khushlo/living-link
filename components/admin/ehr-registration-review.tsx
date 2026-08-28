"use client";

import { useEffect, useState } from "react";

type Center = { id: string; name: string; city: string; state: string };
type Registration = {
  id: string; organizationName: string; organizationWebsite: string | null; contactName: string; contactEmail: string; contactPhone: string | null;
  vendor: string; productName: string; environment: string; fhirIssuer: string; fhirVersion: string; smartSupported: boolean; cdsHooksSupported: boolean;
  smartClientId: string | null;
  requestedScopes: string[]; notes: string | null; approved: boolean; approvedAt: string | null; rejectedAt: string | null; rejectionReason: string | null; createdAt: string;
};

export function EHRRegistrationReview() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [centers, setCenters] = useState<Center[]>([]);
  const [centerByRegistration, setCenterByRegistration] = useState<Record<string, string>>({});
  const [configurationRefs, setConfigurationRefs] = useState<Record<string, string>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/ehr/registrations", { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (response.ok) { setRegistrations(data.registrations ?? []); setCenters(data.centers ?? []); }
    else setMessage(data?.error ?? "Unable to load registrations.");
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function review(registration: Registration, decision: "APPROVE" | "REJECT") {
    setMessage("");
    const body = decision === "APPROVE"
      ? { id: registration.id, decision, centerId: centerByRegistration[registration.id], clientConfigurationRef: configurationRefs[registration.id] ?? "" }
      : { id: registration.id, decision, rejectionReason: reasons[registration.id] ?? "" };
    const response = await fetch("/api/ehr/registrations", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await response.json().catch(() => null);
    setMessage(response.ok ? `Registration ${decision === "APPROVE" ? "approved" : "rejected"}.` : data?.error ?? "Review failed.");
    if (response.ok) await load();
  }

  const pending = registrations.filter((item) => !item.approved && !item.rejectedAt);
  const reviewed = registrations.filter((item) => item.approved || item.rejectedAt);

  return <div className="mx-auto max-w-6xl space-y-8">
    <div><h1 className="text-3xl font-bold text-gray-950">EHR registration review</h1><p className="mt-2 text-gray-600">Review external EHR tenant requests before creating an enabled LivingLink connection.</p></div>
    {message && <p role="status" className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">{message}</p>}
    {loading ? <p className="text-sm text-gray-600">Loading registrations...</p> : <>
      <section aria-labelledby="pending-heading"><h2 id="pending-heading" className="text-xl font-semibold text-gray-950">Pending ({pending.length})</h2>
        {pending.length === 0 ? <p className="mt-3 rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600">No registrations are awaiting review.</p> : <div className="mt-4 space-y-4">{pending.map((registration) => <article key={registration.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold text-gray-950">{registration.organizationName}</h3><p className="text-sm text-gray-600">{registration.vendor} {registration.productName} · {registration.environment} · {registration.fhirVersion}</p></div><time className="text-xs text-gray-500">{new Date(registration.createdAt).toLocaleString()}</time></div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="font-medium text-gray-700">FHIR issuer</dt><dd className="break-all text-gray-600">{registration.fhirIssuer}</dd></div><div><dt className="font-medium text-gray-700">Contact</dt><dd className="text-gray-600">{registration.contactName} · {registration.contactEmail}{registration.contactPhone ? ` · ${registration.contactPhone}` : ""}</dd></div><div><dt className="font-medium text-gray-700">Capabilities</dt><dd className="text-gray-600">{[registration.smartSupported ? "SMART" : null, registration.cdsHooksSupported ? "CDS Hooks" : null].filter(Boolean).join(", ")}</dd></div><div><dt className="font-medium text-gray-700">SMART client ID</dt><dd className="break-all text-gray-600">{registration.smartClientId ?? "Not applicable"}</dd></div><div><dt className="font-medium text-gray-700">Requested scopes</dt><dd className="break-words text-gray-600">{registration.requestedScopes.join(" ") || "None supplied"}</dd></div></dl>
          {registration.notes && <p className="mt-3 rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{registration.notes}</p>}
          <div className="mt-5 grid gap-3 md:grid-cols-2"><label className="text-sm font-medium text-gray-700">Assign transplant center<select value={centerByRegistration[registration.id] ?? ""} onChange={(event) => setCenterByRegistration((current) => ({ ...current, [registration.id]: event.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 p-2"><option value="">Select center</option>{centers.map((center) => <option key={center.id} value={center.id}>{center.name} · {center.city}, {center.state}</option>)}</select></label><label className="text-sm font-medium text-gray-700">Managed client configuration reference (optional)<input value={configurationRefs[registration.id] ?? ""} onChange={(event) => setConfigurationRefs((current) => ({ ...current, [registration.id]: event.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 p-2" placeholder="secret-manager/ehr/client" /></label></div>
          <div className="mt-4 flex flex-wrap items-end gap-3"><button disabled={!centerByRegistration[registration.id]} onClick={() => review(registration, "APPROVE")} className="rounded-md bg-green-700 px-4 py-2 text-sm font-semibold text-white hover:bg-green-800 disabled:opacity-50">Approve and enable</button><label className="min-w-64 flex-1 text-sm font-medium text-gray-700">Rejection reason<input value={reasons[registration.id] ?? ""} onChange={(event) => setReasons((current) => ({ ...current, [registration.id]: event.target.value }))} className="mt-1 block w-full rounded-md border border-gray-300 p-2" /></label><button disabled={(reasons[registration.id] ?? "").trim().length < 3} onClick={() => review(registration, "REJECT")} className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50">Reject</button></div>
        </article>)}</div>}
      </section>
      <section aria-labelledby="reviewed-heading"><h2 id="reviewed-heading" className="text-xl font-semibold text-gray-950">Recently reviewed</h2><div className="mt-3 overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead className="border-b bg-gray-50"><tr><th className="p-3">Organization</th><th className="p-3">Vendor</th><th className="p-3">Issuer</th><th className="p-3">Status</th></tr></thead><tbody>{reviewed.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="p-3">{item.organizationName}</td><td className="p-3">{item.vendor}</td><td className="max-w-xs break-all p-3">{item.fhirIssuer}</td><td className="p-3 font-medium">{item.approved ? "Approved" : "Rejected"}</td></tr>)}</tbody></table></div></section>
    </>}
  </div>;
}
