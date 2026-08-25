"use client";

import { FormEvent, useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";

type DeletionRequest = {
  id: string;
  status: string;
  requestedAt: string;
  resolvedAt: string | null;
};

const statusLabels: Record<string, string> = {
  OPEN: "Submitted",
  UNDER_REVIEW: "Under review",
  COMPLETED: "Completed",
  DENIED: "Unable to complete",
};

export default function PrivacyPage() {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function exportData() {
    setMessage("");
    const response = await fetch("/api/privacy/export");
    if (!response.ok) {
      setMessage("Unable to prepare your data export.");
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "livinglink-personal-data.json";
    link.click();
    URL.revokeObjectURL(url);
    setMessage("Your personal data export was downloaded.");
  }

  async function load() {
    const response = await fetch("/api/privacy/deletion-requests");
    if (response.ok) setRequests(await response.json());
  }

  useEffect(() => { load().catch(() => setMessage("Unable to load deletion request history.")); }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const response = await fetch("/api/privacy/deletion-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Unable to submit your request.");
      }
      setReason("");
      setMessage("Your request has been submitted for review.");
      await load();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to submit your request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Privacy & data</h1>
        <p className="mt-2 text-gray-600">Review your privacy options and request deletion of eligible data.</p>
      </div>

      <section className="rounded-xl border border-amber-200 bg-amber-50 p-5" aria-labelledby="deletion-heading">
        <div className="flex gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
          <div>
            <h2 id="deletion-heading" className="font-semibold text-amber-900">Request deletion of your data</h2>
            <p className="mt-1 text-sm text-amber-800">We will review your request. Some clinical, financial, or audit records may need to be retained under applicable legal or care requirements. This prototype is not monitored for emergencies.</p>
          </div>
        </div>
        <form onSubmit={submit} className="mt-5 space-y-3">
          <label htmlFor="deletion-reason" className="block text-sm font-medium text-gray-700">Optional reason</label>
          <textarea id="deletion-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} rows={4} className="w-full rounded-lg border border-gray-300 p-3 text-sm" placeholder="Tell us anything that may help us process your request." />
          <button type="submit" disabled={submitting} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-50">{submitting ? "Submitting..." : "Request data deletion"}</button>
        </form>
        {message && <p role="status" className="mt-3 text-sm text-gray-700">{message}</p>}
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5" aria-labelledby="export-heading">
        <h2 id="export-heading" className="font-semibold text-gray-900">Download your data</h2>
        <p className="mt-1 text-sm text-gray-600">Download the data associated with your account as a JSON file. This export is limited to your own records.</p>
        <button type="button" onClick={exportData} className="mt-4 rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">Download personal data</button>
      </section>

      <section aria-labelledby="history-heading">
        <h2 id="history-heading" className="text-lg font-semibold text-gray-900">Your deletion requests</h2>
        {requests.length === 0 ? <p className="mt-3 text-sm text-gray-600">You have not submitted any deletion requests.</p> : (
          <ul className="mt-3 divide-y rounded-xl border border-gray-200 bg-white">
            {requests.map((request) => <li key={request.id} className="flex items-center justify-between gap-4 p-4"><div><p className="font-medium text-gray-900">{statusLabels[request.status] ?? request.status}</p><p className="text-sm text-gray-500">Submitted {new Date(request.requestedAt).toLocaleDateString()}</p></div>{request.resolvedAt && <p className="text-sm text-gray-500">Updated {new Date(request.resolvedAt).toLocaleDateString()}</p>}</li>)}
          </ul>
        )}
      </section>
    </div>
  );
}
