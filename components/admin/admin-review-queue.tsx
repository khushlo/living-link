"use client";

import { useEffect, useState } from "react";

type Item = { id: string; status: string; createdAt?: string; requestedAt?: string; body?: string; details?: string; reason?: string; category?: string };

const endpoints = [
  { key: "stories", title: "Story submissions", url: "/api/stories/submissions", update: "/api/stories/submissions", actions: ["APPROVED", "REJECTED"] },
  { key: "reports", title: "Mentor safety reports", url: "/api/mentor-match/report", update: "/api/mentor-match/report", actions: ["ACKNOWLEDGED", "CLOSED"] },
  { key: "deletions", title: "Deletion requests", url: "/api/privacy/deletion-requests", update: "/api/privacy/deletion-requests", actions: ["UNDER_REVIEW", "COMPLETED", "DENIED"] },
] as const;

export function AdminReviewQueue() {
  const [data, setData] = useState<Record<string, Item[]>>({});
  const [message, setMessage] = useState("");

  async function load() {
    const entries = await Promise.all(endpoints.map(async (endpoint) => {
      const response = await fetch(endpoint.url);
      return [endpoint.key, response.ok ? await response.json() : []] as const;
    }));
    setData(Object.fromEntries(entries));
  }

  useEffect(() => { load().catch(() => setMessage("Unable to load review queues.")); }, []);

  async function update(endpoint: typeof endpoints[number], item: Item, status: string) {
    setMessage("");
    const response = await fetch(`${endpoint.update}/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setMessage(body?.error ?? "Unable to update review status.");
      return;
    }
    await load();
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8">
      <div><h1 className="text-3xl font-bold text-gray-900">Administrative review</h1><p className="mt-2 text-gray-600">Review prototype moderation and privacy workflow records. This page does not replace clinical, legal, or emergency review processes.</p></div>
      {message && <p role="alert" className="text-sm text-red-600">{message}</p>}
      {endpoints.map((endpoint) => <section key={endpoint.key} className="rounded-xl border border-gray-200 bg-white"><div className="border-b p-5"><h2 className="text-lg font-semibold text-gray-900">{endpoint.title}</h2></div><ul className="divide-y">{(data[endpoint.key] ?? []).length === 0 ? <li className="p-5 text-sm text-gray-500">No records to review.</li> : (data[endpoint.key] ?? []).map((item) => <li key={item.id} className="space-y-3 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-medium text-gray-900">{item.category ?? "Request"} <span className="ml-2 text-sm font-normal text-gray-500">{item.status}</span></p><p className="text-xs text-gray-500">{new Date(item.createdAt ?? item.requestedAt ?? Date.now()).toLocaleString()}</p></div><div className="flex flex-wrap gap-2">{endpoint.actions.map((status) => <button key={status} onClick={() => update(endpoint, item, status)} className="rounded border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50">{status.replaceAll("_", " ")}</button>)}</div></div>{(item.body || item.details || item.reason) && <p className="whitespace-pre-wrap rounded bg-gray-50 p-3 text-sm text-gray-700">{item.body ?? item.details ?? item.reason}</p>}</li>)}</ul></section>)}
    </main>
  );
}
