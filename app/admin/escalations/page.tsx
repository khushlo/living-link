"use client";

import { useEffect, useState } from "react";

type Escalation = { id: string; status: string; createdAt: string; acknowledgedAt: string | null; phq2Response: { totalScore: number; completedAt: string } };

export default function AdminEscalationsPage() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [message, setMessage] = useState("");
  async function load() { const response = await fetch("/api/life-after/escalations"); if (response.ok) setEscalations(await response.json()); else setMessage("Unable to load escalations."); }
  useEffect(() => { load().catch(() => setMessage("Unable to load escalations.")); }, []);
  async function update(id: string, status: "ACKNOWLEDGED" | "CLOSED") { const response = await fetch(`/api/life-after/escalations/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); if (!response.ok) { setMessage("Unable to update escalation."); return; } await load(); }
  return <div className="mx-auto max-w-4xl space-y-6"><div><h1 className="text-3xl font-bold text-gray-900">Safety escalations</h1><p className="mt-2 text-gray-600">Administrative acknowledgment tracking only. This tool is not monitored for emergencies and does not replace designated clinical on-call procedures.</p></div>{message && <p role="alert" className="text-sm text-red-600">{message}</p>}<ul className="divide-y rounded-xl border border-gray-200 bg-white">{escalations.length === 0 ? <li className="p-5 text-sm text-gray-500">No escalations found.</li> : escalations.map((item) => <li key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-medium text-gray-900">PHQ-2 total score: {item.phq2Response.totalScore}</p><p className="text-sm text-gray-500">Submitted {new Date(item.phq2Response.completedAt).toLocaleString()} · Status: {item.status}</p></div><div className="flex gap-2"><button onClick={() => update(item.id, "ACKNOWLEDGED")} className="rounded border border-blue-200 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50">Acknowledge</button><button onClick={() => update(item.id, "CLOSED")} className="rounded border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50">Close</button></div></li>)}</ul></div>;
}
