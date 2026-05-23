"use client";
import { useState, useEffect } from "react";
import { Receipt, Plus, Trash2, DollarSign, AlertCircle } from "lucide-react";

type Record = {
  id: string;
  itemType: string;
  description: string | null;
  amount: number;
  reimbursed: boolean;
  createdAt: string;
};

type TypeMeta = { label: string; color: string };
const TYPE_LABELS: { [key: string]: TypeMeta } = {
  travel:     { label: "Travel",     color: "bg-blue-100 text-blue-700" },
  lodging:    { label: "Lodging",    color: "bg-purple-100 text-purple-700" },
  childcare:  { label: "Childcare",  color: "bg-pink-100 text-pink-700" },
  medical:    { label: "Medical",    color: "bg-red-100 text-red-700" },
  lost_wage:  { label: "Lost wages", color: "bg-orange-100 text-orange-700" },
  other:      { label: "Other",      color: "bg-gray-100 text-gray-700" },
};

export default function ExpensesPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ itemType: "travel", description: "", amount: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/donor-shield/records");
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function addRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || Number(form.amount) <= 0) { setError("Enter a valid amount."); return; }
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/donor-shield/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType: form.itemType, description: form.description || undefined, amount: Number(form.amount) }),
      });
      if (!res.ok) { setError("Failed to save. Please try again."); return; }
      setShowForm(false);
      setForm({ itemType: "travel", description: "", amount: "" });
      await load();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const totalSpent = records.reduce((s, r) => s + r.amount, 0);
  const totalReimbursed = records.filter((r) => r.reimbursed).reduce((s, r) => s + r.amount, 0);
  const outOfPocket = totalSpent - totalReimbursed;

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Log</h1>
          <p className="mt-1 text-gray-600">Track donation-related costs for NLDAC reimbursement and tax purposes.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Add expense
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total expenses", value: totalSpent, color: "text-gray-900" },
          { label: "Reimbursed", value: totalReimbursed, color: "text-green-600" },
          { label: "Out of pocket", value: outOfPocket, color: "text-red-600" },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">{card.label}</p>
            <p className={`text-xl font-bold ${card.color}`}>
              ${card.value.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Add expense form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="expense-title">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 id="expense-title" className="text-lg font-semibold mb-4">Add an expense</h2>
            {error && (
              <div className="mb-3 flex items-center gap-2 rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}
            <form onSubmit={addRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="item-type">Category</label>
                <select
                  id="item-type"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={form.itemType}
                  onChange={(e) => setForm((f) => ({ ...f, itemType: e.target.value }))}
                >
                  {Object.entries(TYPE_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">Description (optional)</label>
                <input
                  id="description"
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g. Flight to transplant center"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="amount">Amount (USD)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id="amount"
                    type="number"
                    min="0.01"
                    step="0.01"
                    required
                    className="w-full rounded-md border border-gray-300 pl-9 pr-3 py-2 text-sm"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 rounded-md bg-yellow-500 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-60">
                  {saving ? "Saving…" : "Save expense"}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setError(""); }} className="flex-1 rounded-md border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense list */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading expenses…</p>
      ) : records.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
          <Receipt className="mx-auto h-10 w-10 text-gray-300 mb-3" aria-hidden="true" />
          <p className="text-gray-500 text-sm">No expenses logged yet. Add your first expense above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec) => {
            const meta = TYPE_LABELS[rec.itemType] ?? { label: rec.itemType, color: "bg-gray-100 text-gray-700" };
            return (
              <div key={rec.id} className="flex items-center gap-4 rounded-xl border border-gray-200 p-4">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${meta.color}`}>{meta.label}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{rec.description || meta.label}</p>
                  <p className="text-xs text-gray-400">{new Date(rec.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">${rec.amount.toFixed(2)}</p>
                  {rec.reimbursed && <p className="text-xs text-green-600">Reimbursed</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400">
        Keep receipts for all expenses. NLDAC reimburses travel, lodging, lost wages, and dependent care within program limits.
        Contact NLDAC at 1-877-696-2110 or{" "}
        <a href="https://nldac.org" target="_blank" rel="noreferrer" className="underline hover:text-gray-600">nldac.org</a>.
      </p>
    </div>
  );
}
