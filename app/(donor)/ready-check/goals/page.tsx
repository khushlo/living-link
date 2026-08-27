"use client";
import { useState, useEffect } from "react";
import { Target, TrendingUp, Plus, CheckCircle, Clock, RotateCcw } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";
import { BackToModule } from "@/components/shared/back-to-module";

type Goal = {
  id: string;
  metric: string;
  targetValue: number;
  currentValue: number | null;
  targetDate: string | null;
  status: "ACTIVE" | "ACHIEVED" | "PAUSED";
  progressLogs: { id: string; value: number; note: string | null; loggedAt: string }[];
};

const METRIC_META: Record<string, { label: string; unit: string; color: string; ideal: string }> = {
  BMI: { label: "BMI", unit: "", color: "#10b981", ideal: "18.5 – 24.9" },
  BLOOD_PRESSURE: { label: "Systolic BP", unit: "mmHg", color: "#3b82f6", ideal: "< 130" },
  SMOKING: { label: "Cigarettes / day", unit: "cigs", color: "#ef4444", ideal: "0" },
  BLOOD_SUGAR: { label: "Blood Sugar", unit: "mg/dL", color: "#f59e0b", ideal: "70 – 100 fasting" },
  WEIGHT: { label: "Weight", unit: "kg", color: "#8b5cf6", ideal: "Varies" },
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [logGoalId, setLogGoalId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    metric: "BMI",
    targetValue: "",
    targetDate: "",
    horizon: "custom",
  });
  const [logForm, setLogForm] = useState({ value: "", note: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const availableMetrics = Object.entries(METRIC_META).filter(
    ([metric]) => !goals.some((goal) => goal.metric === metric)
  );

  function openCreateGoal() {
    const firstMetric = availableMetrics[0]?.[0];
    if (!firstMetric) return;
    setFormError("");
    setCreateForm({ metric: firstMetric, targetValue: "", targetDate: "", horizon: "custom" });
    setShowCreate(true);
  }

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/ready-check/goals");
      setGoals(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function createGoal(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      const response = await fetch("/api/ready-check/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metric: createForm.metric,
          targetValue: Number(createForm.targetValue),
          targetDate: createForm.horizon !== "custom"
            ? new Date(Date.now() + Number(createForm.horizon) * 86400000).toISOString()
            : createForm.targetDate ? new Date(createForm.targetDate).toISOString() : undefined,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Unable to create goal");
      }
      setShowCreate(false);
      setCreateForm({ metric: "BMI", targetValue: "", targetDate: "", horizon: "custom" });
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function logProgress(e: React.FormEvent) {
    e.preventDefault();
    if (!logGoalId) return;
    setSaving(true);
    try {
      const today = new Date();
      const loggedOn = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const response = await fetch(`/api/ready-check/goals/${logGoalId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: Number(logForm.value), note: logForm.note || undefined, loggedOn }),
      });
      if (!response.ok) throw new Error("Unable to save today's reading");
      setLogGoalId(null);
      setLogForm({ value: "", note: "" });
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(goal: Goal) {
    setSaving(true);
    try {
      const res = await fetch(`/api/ready-check/goals/${goal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: goal.status === "ACHIEVED" ? "ACTIVE" : "ACHIEVED" }),
      });
      if (!res.ok) throw new Error("Unable to update goal status");
      await load();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create goal");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <BackToModule href="/ready-check" label="Back to ReadyCheck" />
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Goals</h1>
          <p className="mt-1 text-gray-600">Track your progress toward donation readiness milestones.</p>
        </div>
        <button
          onClick={openCreateGoal}
          disabled={availableMetrics.length === 0}
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> {availableMetrics.length === 0 ? "All metrics added" : "New goal"}
        </button>
      </div>

      {/* Create goal modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="create-goal-title">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 id="create-goal-title" className="text-lg font-semibold mb-4">Create a new health goal</h2>
            <form onSubmit={createGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="metric">Metric</label>
                <select
                  id="metric"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={createForm.metric}
                  onChange={(e) => setCreateForm((f) => ({ ...f, metric: e.target.value }))}
                >
                  {availableMetrics.map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="targetValue">
                  Target value ({METRIC_META[createForm.metric].unit || createForm.metric})
                  <span className="ml-2 text-xs text-gray-400">Ideal: {METRIC_META[createForm.metric].ideal}</span>
                </label>
                <input
                  id="targetValue"
                  type="number"
                  step="0.1"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={createForm.targetValue}
                  onChange={(e) => setCreateForm((f) => ({ ...f, targetValue: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="horizon">Planning horizon</label>
                <select id="horizon" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm" value={createForm.horizon} onChange={(e) => setCreateForm((f) => ({ ...f, horizon: e.target.value }))}>
                  <option value="custom">Choose a target date</option>
                  <option value="30">30-day target</option>
                  <option value="60">60-day target</option>
                  <option value="90">90-day target</option>
                </select>
              </div>
              {createForm.horizon === "custom" && <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="targetDate">Target date (optional)</label>
                <input
                  id="targetDate"
                  type="date"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={createForm.targetDate}
                  onChange={(e) => setCreateForm((f) => ({ ...f, targetDate: e.target.value }))}
                />
              </div>}
              {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 rounded-md bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60">
                  {saving ? "Saving…" : "Create goal"}
                </button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log progress modal */}
      {logGoalId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="log-title">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h2 id="log-title" className="text-lg font-semibold mb-4">Log progress</h2>
            <form onSubmit={logProgress} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="log-value">Today&apos;s value</label>
                <input
                  id="log-value"
                  type="number"
                  step="0.1"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={logForm.value}
                  onChange={(e) => setLogForm((f) => ({ ...f, value: e.target.value }))}
                />
                <p className="mt-1 text-xs text-slate-500">Logging again today replaces today&apos;s existing reading for this metric.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="log-note">Note (optional)</label>
                <input
                  id="log-note"
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder="e.g. went for a 30-min walk"
                  value={logForm.note}
                  onChange={(e) => setLogForm((f) => ({ ...f, note: e.target.value }))}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 rounded-md bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-60">
                  {saving ? "Saving…" : "Log it"}
                </button>
                <button type="button" onClick={() => setLogGoalId(null)} className="flex-1 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals list */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading goals…</p>
      ) : goals.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
          <Target className="mx-auto h-10 w-10 text-gray-300 mb-3" aria-hidden="true" />
          <p className="text-gray-500 text-sm">No goals yet. Create your first health goal to start tracking progress.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal, goalIndex) => {
            const meta = METRIC_META[goal.metric] ?? { label: goal.metric, unit: "", color: "#6b7280", ideal: "" };
            const metricGoals = goals.filter((item) => item.metric === goal.metric);
            const metricLogs = metricGoals
              .flatMap((item) => item.progressLogs)
              .sort((a, b) => new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime());
            const chartData = metricLogs.map((l) => ({
              date: new Date(l.loggedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              value: l.value,
            }));
            const showsMetricGraph = goals.findIndex((item) => item.metric === goal.metric) === goalIndex;
            const targetGoal = metricGoals.find((item) => item.status === "ACTIVE") ?? metricGoals[0];

            return (
              <div key={goal.id} className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        <span className="font-semibold text-gray-900">{meta.label}</span>
                        <span className="text-xs text-gray-400">Ideal: {meta.ideal}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${goal.status === "ACHIEVED" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                          {goal.status === "ACHIEVED" ? "Completed" : "Active"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Target: <strong>{goal.targetValue} {meta.unit}</strong>
                        {goal.currentValue != null && (
                          <> · Current: <strong>{goal.currentValue} {meta.unit}</strong></>
                        )}
                        {goal.targetDate && (
                          <> · By {new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</>
                        )}
                      </p>
                      <p className="mt-3 text-xs text-slate-500">Readings update the chart only. You decide when this goal is complete.</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { setLogGoalId(goal.id); setLogForm({ value: "", note: "" }); }}
                        className="rounded-md bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                      >
                        Log
                      </button>
                      <button
                        onClick={() => updateStatus(goal)}
                        disabled={saving}
                        className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium disabled:opacity-60 ${goal.status === "ACHIEVED" ? "border-slate-200 text-slate-600 hover:bg-slate-50" : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`}
                      >
                        {goal.status === "ACHIEVED" ? <><RotateCcw className="h-3.5 w-3.5" /> Reopen</> : <><CheckCircle className="h-3.5 w-3.5" /> Complete</>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* One combined chart for every reading of this metric. */}
                {showsMetricGraph && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5">
                    {chartData.length === 0 ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        Log your first reading to start the value chart.
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-gray-500" aria-hidden="true" />
                          <span className="text-sm font-medium text-gray-700">All {meta.label} readings</span>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <ReferenceLine y={targetGoal.targetValue} stroke={meta.color} strokeDasharray="4 4" label={{ value: "Active target", fontSize: 10, fill: meta.color }} />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke={meta.color}
                              strokeWidth={2}
                              dot={{ r: 4, fill: meta.color }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                        <ol className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white px-4" aria-label={`${meta.label} reading history`}>
                          {metricLogs.map((log) => <li key={log.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"><span className="font-semibold text-slate-800">{log.value} {meta.unit}</span><span className="text-xs text-slate-500">{new Date(log.loggedAt).toLocaleString()}</span>{log.note && <span className="w-full text-xs text-slate-500">{log.note}</span>}</li>)}
                        </ol>
                      </>
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
