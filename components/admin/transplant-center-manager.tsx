"use client";

import { FormEvent, useEffect, useState } from "react";

type Center = { id: string; name: string; city: string; state: string; optnId: string | null; fhirOrgId: string | null; _count: { members: number; ehrConnections: number; evaluations: number } };
type Form = { name: string; city: string; state: string; optnId: string; fhirOrgId: string };
const empty: Form = { name: "", city: "", state: "", optnId: "", fhirOrgId: "" };

export function TransplantCenterManager() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [form, setForm] = useState<Form>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/transplant-centers", { cache: "no-store" });
    const data = await response.json().catch(() => null);
    if (response.ok) setCenters(data);
    else setError(data?.error ?? "Unable to load centers.");
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  function update(field: keyof Form, value: string) { setForm((current) => ({ ...current, [field]: field === "state" ? value.toUpperCase().slice(0, 2) : value })); }
  function edit(center: Center) { setEditingId(center.id); setForm({ name: center.name, city: center.city, state: center.state, optnId: center.optnId ?? "", fhirOrgId: center.fhirOrgId ?? "" }); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function reset() { setEditingId(null); setForm(empty); }
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(""); setError("");
    const response = await fetch(editingId ? `/api/admin/transplant-centers/${editingId}` : "/api/admin/transplant-centers", { method: editingId ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json().catch(() => null);
    if (!response.ok) setError(data?.error ?? "Unable to save center.");
    else { setMessage(editingId ? "Transplant center updated." : "Transplant center created."); reset(); await load(); }
    setSaving(false);
  }

  return <div className="mx-auto max-w-6xl space-y-8">
    <div><h1 className="text-3xl font-bold text-gray-950">Transplant centers</h1><p className="mt-2 text-gray-600">Maintain real center records used to assign EHR registrations and manage center access. No demo centers are created automatically.</p></div>
    {message && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">{message}</p>}
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    <form onSubmit={save} className="rounded-xl border border-gray-200 bg-white p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-gray-950">{editingId ? "Edit center" : "Create center"}</h2>{editingId && <button type="button" onClick={reset} className="text-sm text-gray-600 underline">Cancel edit</button>}</div><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-gray-700">Center name<input required maxLength={200} value={form.name} onChange={(e) => update("name", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 p-2.5" /></label><label className="text-sm font-medium text-gray-700">City<input required maxLength={100} value={form.city} onChange={(e) => update("city", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 p-2.5" /></label><label className="text-sm font-medium text-gray-700">State<input required maxLength={2} value={form.state} onChange={(e) => update("state", e.target.value)} placeholder="IL" className="mt-1 block w-full rounded-md border border-gray-300 p-2.5 uppercase" /></label><label className="text-sm font-medium text-gray-700">OPTN ID (optional)<input maxLength={30} value={form.optnId} onChange={(e) => update("optnId", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 p-2.5" /></label><label className="text-sm font-medium text-gray-700 sm:col-span-2">FHIR Organization ID (optional)<input maxLength={256} value={form.fhirOrgId} onChange={(e) => update("fhirOrgId", e.target.value)} className="mt-1 block w-full rounded-md border border-gray-300 p-2.5" /></label></div><button type="submit" disabled={saving} className="mt-5 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50">{saving ? "Saving..." : editingId ? "Update center" : "Create center"}</button></form>
    <section aria-labelledby="centers-heading"><h2 id="centers-heading" className="text-xl font-semibold text-gray-950">Registered centers ({centers.length})</h2>{loading ? <p className="mt-3 text-sm text-gray-600">Loading centers...</p> : centers.length === 0 ? <p className="mt-3 rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600">No real transplant centers have been added yet.</p> : <div className="mt-3 overflow-x-auto rounded-xl border border-gray-200 bg-white"><table className="w-full text-left text-sm"><thead className="border-b bg-gray-50"><tr><th className="p-3">Center</th><th className="p-3">Location</th><th className="p-3">Identifiers</th><th className="p-3">Usage</th><th className="p-3"><span className="sr-only">Actions</span></th></tr></thead><tbody>{centers.map((center) => <tr key={center.id} className="border-b last:border-0"><td className="p-3 font-medium">{center.name}</td><td className="p-3">{center.city}, {center.state}</td><td className="p-3">{center.optnId ? `OPTN ${center.optnId}` : "No OPTN ID"}{center.fhirOrgId ? ` · FHIR ${center.fhirOrgId}` : ""}</td><td className="p-3 text-gray-600">{center._count.members} members · {center._count.ehrConnections} EHR · {center._count.evaluations} evaluations</td><td className="p-3 text-right"><button onClick={() => edit(center)} className="rounded-md px-3 py-1.5 font-medium text-blue-700 hover:bg-blue-50">Edit</button></td></tr>)}</tbody></table></div>}</section>
  </div>;
}
