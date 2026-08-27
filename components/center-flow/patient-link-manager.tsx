"use client";

import { FormEvent, useEffect, useState } from "react";
import { Link2, Search, Trash2 } from "lucide-react";

type Connection = { id: string; issuer: string; vendor: string; environment: string; mappings: Mapping[] };
type Mapping = { id: string; externalPatientId: string; updatedAt: string; donorProfile: { id: string; user: { firstName: string | null; lastName: string | null; email: string } } };
type Donor = { id: string; hasEhrConsent: boolean; user: { firstName: string | null; lastName: string | null; email: string } };

export function PatientLinkManager() {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [query, setQuery] = useState("");
  const [connectionId, setConnectionId] = useState("");
  const [donorProfileId, setDonorProfileId] = useState("");
  const [externalPatientId, setExternalPatientId] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(search = query) {
    setLoading(true);
    const response = await fetch(`/api/center-flow/patient-links${search ? `?q=${encodeURIComponent(search)}` : ""}`, { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (response.ok) { setConnections(data.connections ?? []); setDonors(data.donors ?? []); }
    else setMessage(data?.error ?? "Unable to load patient links.");
    setLoading(false);
  }

  useEffect(() => { load(""); }, []);

  async function searchDonors() {
    await load(query);
  }

  async function linkPatient(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch("/api/center-flow/patient-links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ connectionId, donorProfileId, externalPatientId, confirmed }) });
    const data = await response.json().catch(() => null);
    if (!response.ok) { setMessage(data?.error ?? "Unable to create link."); return; }
    setMessage("Patient linked. The connection is now available to authorized SMART/CDS workflows.");
    setExternalPatientId(""); setDonorProfileId(""); setConfirmed(false);
    await load(query);
  }

  async function unlink(id: string) {
    if (!window.confirm("Unlink this EHR patient from LivingLink? CDS cards will stop for this mapping.")) return;
    const response = await fetch(`/api/center-flow/patient-links?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setMessage(response.ok ? "Patient link removed." : "Unable to remove patient link.");
    if (response.ok) await load(query);
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3"><Link2 className="h-6 w-6 text-orange-600" aria-hidden="true" /><h1 className="text-2xl font-bold text-gray-900">Link EHR patients</h1></div>
        <p className="mt-2 max-w-3xl text-gray-600">Connect an EHR Patient ID to the correct LivingLink donor profile. This is a manual identity-confirmation step; LivingLink never globally searches EHR patients or links by name alone.</p>
      </div>

      {message && <p role="status" className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">{message}</p>}

      <section className="rounded-xl border border-gray-200 bg-white p-5" aria-labelledby="create-link-heading">
        <h2 id="create-link-heading" className="text-lg font-semibold text-gray-900">Create a patient link</h2>
        <p className="mt-1 text-sm text-gray-600">The donor must have current EHR-exchange consent before a link can be created.</p>
        <form onSubmit={linkPatient} className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">EHR connection<select required value={connectionId} onChange={(e) => setConnectionId(e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2.5"><option value="">Select a connection</option>{connections.map((connection) => <option key={connection.id} value={connection.id}>{connection.vendor} · {connection.environment} · {connection.issuer}</option>)}</select></label>
          <label className="text-sm font-medium text-gray-700">EHR Patient ID<input required value={externalPatientId} onChange={(e) => setExternalPatientId(e.target.value)} maxLength={256} className="mt-1 block w-full rounded-md border border-gray-300 p-2.5" placeholder="Patient/12345" /></label>
          <div className="md:col-span-2">
            <div className="flex gap-2"><label htmlFor="donor-search" className="sr-only">Search LivingLink donor by email or name</label><input id="donor-search" value={query} onChange={(e) => setQuery(e.target.value)} className="min-w-0 flex-1 rounded-md border border-gray-300 p-2.5" placeholder="Search donor by email or name" minLength={2} /><button type="button" onClick={searchDonors} className="inline-flex items-center gap-2 rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"><Search className="h-4 w-4" aria-hidden="true" />Search</button></div>
            {donors.length > 0 && <div className="mt-3 space-y-2">{donors.map((donor) => <label key={donor.id} className={`flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm ${donorProfileId === donor.id ? "border-orange-500 bg-orange-50" : "border-gray-200"}`}><span><input type="radio" name="donor" value={donor.id} checked={donorProfileId === donor.id} onChange={() => setDonorProfileId(donor.id)} className="mr-3" disabled={!donor.hasEhrConsent} />{donor.user.firstName} {donor.user.lastName} · {donor.user.email}</span><span className="text-xs">{donor.hasEhrConsent ? "Consent current" : "EHR consent required"}</span></label>)}</div>}
          </div>
          <label className="md:col-span-2 flex items-start gap-2 text-sm text-gray-700"><input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} required className="mt-1" />I confirmed this EHR Patient ID belongs to the selected LivingLink donor using the center’s approved identity-verification procedure.</label>
          <button type="submit" disabled={!connectionId || !donorProfileId || !confirmed} className="md:col-span-2 rounded-md bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50">Create secure link</button>
        </form>
      </section>

      <section aria-labelledby="existing-links-heading"><h2 id="existing-links-heading" className="text-lg font-semibold text-gray-900">Existing links</h2>{loading ? <p className="mt-3 text-sm text-gray-500">Loading links...</p> : connections.every((connection) => connection.mappings.length === 0) ? <p className="mt-3 rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600">No patient links have been created for this center.</p> : <div className="mt-3 space-y-4">{connections.map((connection) => connection.mappings.length > 0 && <div key={connection.id} className="rounded-xl border border-gray-200 bg-white p-4"><h3 className="font-medium text-gray-900">{connection.vendor} · {connection.environment}</h3><p className="text-xs text-gray-500">{connection.issuer}</p><ul className="mt-3 divide-y divide-gray-100">{connection.mappings.map((mapping) => <li key={mapping.id} className="flex items-center justify-between gap-4 py-3 text-sm"><span><strong>{mapping.externalPatientId}</strong> → {mapping.donorProfile.user.firstName} {mapping.donorProfile.user.lastName} ({mapping.donorProfile.user.email})</span><button onClick={() => unlink(mapping.id)} className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-red-700 hover:bg-red-50"><Trash2 className="h-4 w-4" aria-hidden="true" />Unlink</button></li>)}</ul></div>)}</div>}</section>
    </div>
  );
}
