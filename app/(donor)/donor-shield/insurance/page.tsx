"use client";
import { useState } from "react";
import { Shield, Plus, AlertCircle, CheckCircle, Clock, ChevronDown, Phone, ExternalLink } from "lucide-react";

type Issue = {
  id: string;
  type: string;
  description: string;
  status: "open" | "in_progress" | "escalated" | "resolved";
  createdAt: string;
  notes: string;
};

const ISSUE_TYPES = [
  "Claim denied",
  "Coverage gap / lapse",
  "Pre-authorization denied",
  "Bill incorrectly coded",
  "COBRA / continuation coverage",
  "Life insurance issue",
  "Disability insurance issue",
  "Insurance non-renewal threat",
  "Other",
];

const STATUS_META: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  open:        { label: "Open",        color: "bg-gray-100 text-gray-700",   icon: Clock },
  in_progress: { label: "In progress", color: "bg-blue-100 text-blue-700",   icon: Clock },
  escalated:   { label: "Escalated",   color: "bg-red-100 text-red-700",     icon: AlertCircle },
  resolved:    { label: "Resolved",    color: "bg-green-100 text-green-700", icon: CheckCircle },
};

let idCounter = 0;
function newId() { return `issue-${++idCounter}-${Date.now()}`; }

export default function InsurancePage() {
  const [issues, setIssues] = useState<Issue[]>([
    { id: newId(), type: "Claim denied", description: "Surgery claim denied - coded as cosmetic procedure", status: "escalated", createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), notes: "Coordinator contacted. Appeal filed 5/18." },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: ISSUE_TYPES[0], description: "", notes: "" });

  function addIssue(e: React.FormEvent) {
    e.preventDefault();
    setIssues((prev) => [
      { id: newId(), type: form.type, description: form.description, notes: form.notes, status: "open", createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setForm({ type: ISSUE_TYPES[0], description: "", notes: "" });
    setShowForm(false);
  }

  function updateStatus(id: string, status: Issue["status"]) {
    setIssues((prev) => prev.map((i) => i.id === id ? { ...i, status } : i));
  }

  function escalate(id: string) { updateStatus(id, "escalated"); }
  function resolve(id: string)  { updateStatus(id, "resolved"); }

  const openCount     = issues.filter((i) => i.status === "open").length;
  const escalatedCount = issues.filter((i) => i.status === "escalated").length;
  const resolvedCount = issues.filter((i) => i.status === "resolved").length;

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Insurance Issue Tracker</h1>
          <p className="mt-1 text-gray-600">Track insurance problems and escalate to your transplant coordinator with one click.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600">
          <Plus className="h-4 w-4" aria-hidden="true" /> Log issue
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Open",      value: openCount,      color: "text-gray-700" },
          { label: "Escalated", value: escalatedCount, color: "text-red-600"  },
          { label: "Resolved",  value: resolvedCount,  color: "text-green-600"},
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Resources callout */}
      <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-yellow-600" aria-hidden="true" />
          <h2 className="font-semibold text-yellow-900 text-sm">Need help now?</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          {[
            { label: "NLDAC", detail: "1-877-696-2110", href: "tel:18776962110", icon: Phone },
            { label: "Patient Advocate Foundation", detail: "1-800-532-5274", href: "tel:18005325274", icon: Phone },
            { label: "CMS Appeals", detail: "cms.gov/appeals", href: "https://www.cms.gov", icon: ExternalLink },
          ].map((r) => (
            <a key={r.label} href={r.href} target={r.href.startsWith("http") ? "_blank" : undefined}
              rel={r.href.startsWith("http") ? "noreferrer" : undefined}
              className="flex items-center gap-2 rounded-lg border border-yellow-200 bg-white p-3 hover:bg-yellow-50">
              <r.icon className="h-4 w-4 text-yellow-600 shrink-0" aria-hidden="true" />
              <div>
                <p className="font-medium text-yellow-900">{r.label}</p>
                <p className="text-xs text-yellow-700">{r.detail}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Add issue modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="issue-title">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 id="issue-title" className="text-lg font-semibold mb-4">Log an insurance issue</h2>
            <form onSubmit={addIssue} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="issue-type">Issue type</label>
                <select id="issue-type" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                  {ISSUE_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description *</label>
                <textarea id="description" required rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none"
                  placeholder="Describe the issue in detail (insurer, dates, what happened)"
                  value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">Notes / actions taken (optional)</label>
                <textarea id="notes" rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none"
                  placeholder="e.g. Called insurer on 5/20, rep said to file appeal"
                  value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 rounded-md bg-yellow-500 py-2 text-sm font-medium text-white hover:bg-yellow-600">Save</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 rounded-md border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue list */}
      {issues.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
          <Shield className="mx-auto h-10 w-10 text-gray-300 mb-3" aria-hidden="true" />
          <p className="text-sm text-gray-500">No insurance issues logged. Hopefully it stays that way!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => {
            const meta = STATUS_META[issue.status];
            const expanded = expandedId === issue.id;
            return (
              <div key={issue.id} className={`rounded-xl border overflow-hidden ${issue.status === "escalated" ? "border-red-300" : "border-gray-200"}`}>
                <div className="flex items-start gap-4 p-4">
                  <meta.icon className={`h-5 w-5 shrink-0 mt-0.5 ${issue.status === "escalated" ? "text-red-500" : issue.status === "resolved" ? "text-green-500" : "text-gray-400"}`} aria-hidden="true" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-medium text-sm text-gray-900">{issue.type}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}>{meta.label}</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{issue.description}</p>
                    <p className="text-xs text-gray-400 mt-1">Logged {new Date(issue.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                  <button onClick={() => setExpandedId(expanded ? null : issue.id)} aria-expanded={expanded}
                    className="shrink-0 rounded-md border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50">
                    <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </button>
                </div>

                {expanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 space-y-3">
                    {issue.notes && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">Notes / actions taken</p>
                        <p className="text-sm text-gray-700">{issue.notes}</p>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {issue.status !== "in_progress" && issue.status !== "resolved" && (
                        <button onClick={() => updateStatus(issue.id, "in_progress")}
                          className="rounded-md bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100">
                          Mark in progress
                        </button>
                      )}
                      {issue.status !== "escalated" && issue.status !== "resolved" && (
                        <button onClick={() => escalate(issue.id)}
                          className="rounded-md bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100">
                          Escalate to coordinator
                        </button>
                      )}
                      {issue.status !== "resolved" && (
                        <button onClick={() => resolve(issue.id)}
                          className="rounded-md bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100">
                          Mark resolved
                        </button>
                      )}
                    </div>
                    {issue.status === "escalated" && (
                      <div className="rounded-md bg-orange-50 border border-orange-200 p-3 text-xs text-orange-800">
                        <strong>Escalated:</strong> Contact your transplant coordinator and provide them this issue summary. They can intervene with insurers directly.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
