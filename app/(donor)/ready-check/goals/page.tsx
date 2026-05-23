"use client";
import { useState, useEffect } from "react";
import { Target, TrendingUp, Plus, CheckCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
} from "recharts";

type Goal = {
  id: string;
  metric: string;
  targetValue: number;
  currentValue: number | null;
  targetDate: string | null;
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
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [logGoalId, setLogGoalId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    metric: "BMI",
    targetValue: "",
    targetDate: "",
  });
  const [logForm, setLogForm] = useState({ value: "", note: "" });
  const [saving, setSaving] = useState(false);

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
    try {
      await fetch("/api/ready-check/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metric: createForm.metric,
          targetValue: Number(createForm.targetValue),
          targetDate: createForm.targetDate ? new Date(createForm.targetDate).toISOString() : undefined,
        }),
      });
      setShowCreate(false);
      setCreateForm({ metric: "BMI", targetValue: "", targetDate: "" });
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
      await fetch(`/api/ready-check/goals/${logGoalId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: Number(logForm.value), note: logForm.note || undefined }),
      });
      setLogGoalId(null);
      setLogForm({ value: "", note: "" });
      await load();
    } finally {
      setSaving(false);
    }
  }

  const pct = (goal: Goal) => {
    if (!goal.currentValue || !goal.targetValue) return 0;
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Goals</h1>
          <p className="mt-1 text-gray-600">Track your progress toward donation readiness milestones.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> New goal
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
                  {Object.entries(METRIC_META).map(([k, v]) => (
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
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="targetDate">Target date (optional)</label>
                <input
                  id="targetDate"
                  type="date"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={createForm.targetDate}
                  onChange={(e) => setCreateForm((f) => ({ ...f, targetDate: e.target.value }))}
                />
              </div>
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
          {goals.map((goal) => {
            const meta = METRIC_META[goal.metric] ?? { label: goal.metric, unit: "", color: "#6b7280", ideal: "" };
            const expanded = expandedId === goal.id;
            const progress = pct(goal);
            const chartData = goal.progressLogs.map((l) => ({
              date: new Date(l.loggedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              value: l.value,
            }));

            return (
              <div key={goal.id} className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Target className="h-4 w-4 text-gray-400" aria-hidden="true" />
                        <span className="font-semibold text-gray-900">{meta.label}</span>
                        <span className="text-xs text-gray-400">Ideal: {meta.ideal}</span>
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
                      {/* Progress bar */}
                      <div className="mt-3" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${meta.label} progress`}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{progress}% toward target</span>
                          {progress >= 100 && (
                            <span className="flex items-center gap-1 text-green-600 font-medium">
                              <CheckCircle className="h-3 w-3" /> Goal reached!
                            </span>
                          )}
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${progress}%`, backgroundColor: meta.color }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => { setLogGoalId(goal.id); setLogForm({ value: "", note: "" }); }}
                        className="rounded-md bg-green-50 border border-green-200 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                      >
                        Log
                      </button>
                      <button
                        onClick={() => setExpandedId(expanded ? null : goal.id)}
                        aria-expanded={expanded}
                        aria-label="Toggle chart"
                        className="rounded-md border border-gray-200 p-1.5 text-gray-500 hover:bg-gray-50"
                      >
                        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                {expanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-5">
                    {chartData.length < 2 ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="h-4 w-4" aria-hidden="true" />
                        Log at least 2 readings to see your trend chart.
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="h-4 w-4 text-gray-500" aria-hidden="true" />
                          <span className="text-sm font-medium text-gray-700">Progress over time</span>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                          <LineChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <ReferenceLine y={goal.targetValue} stroke={meta.color} strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: meta.color }} />
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
                        {goal.progressLogs.slice(-1)[0]?.note && (
                          <p className="mt-2 text-xs text-gray-400 italic">Last note: &ldquo;{goal.progressLogs.slice(-1)[0].note}&rdquo;</p>
                        )}
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
