"use client";
import { useEffect, useState } from "react";
import { Activity, TrendingUp, Target, CheckCircle, AlertCircle } from "lucide-react";

type Goal = {
  id: string;
  metric: string;
  targetValue: number;
  currentValue: number | null;
  targetDate: string | null;
  progressLogs: { id: string; value: number; note: string | null; loggedAt: string }[];
};

const GOAL_META: Record<string, { label: string; unit: string; color: string }> = {
  BMI: { label: "BMI", unit: "", color: "#10b981" },
  BLOOD_PRESSURE: { label: "Systolic BP", unit: "mmHg", color: "#3b82f6" },
  SMOKING: { label: "Cigarettes / day", unit: "cigs", color: "#ef4444" },
  BLOOD_SUGAR: { label: "Blood Sugar", unit: "mg/dL", color: "#f59e0b" },
  WEIGHT: { label: "Weight", unit: "kg", color: "#8b5cf6" },
};

export default function ReadyCheckPage() {
  const [step, setStep] = useState<"intro" | "form" | "results">("intro");
  const [form, setForm] = useState({ bmi: "", bpSystolic: "", bpDiastolic: "", egfr: "", smokingStatus: "never", hasDiabetes: false, age: "" });
  const [result, setResult] = useState<{ aiSummary: string; summarySource?: string } | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/ready-check/goals")
      .then((res) => res.json())
      .then((data) => setGoals(Array.isArray(data) ? data : []))
      .catch(() => setGoals([]));
  }, []);

  const goalProgress = (goal: Goal) => {
    if (goal.currentValue == null || goal.targetValue <= 0) return 0;
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/ready-check/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bmi: form.bmi ? Number(form.bmi) : undefined,
          bpSystolic: form.bpSystolic ? Number(form.bpSystolic) : undefined,
          bpDiastolic: form.bpDiastolic ? Number(form.bpDiastolic) : undefined,
          egfr: form.egfr ? Number(form.egfr) : undefined,
          smokingStatus: form.smokingStatus,
          hasDiabetes: form.hasDiabetes,
          age: form.age ? Number(form.age) : undefined,
        }),
      });
      const data = await res.json();
      setResult(data);
      setStep("results");
    } catch {
      alert("Assessment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">ReadyCheck</h1>
        <p className="mt-1 text-gray-600">
          See where you stand health-wise and get personalized guidance toward donation eligibility.
          <strong className="text-gray-800"> This is not a medical diagnosis.</strong>
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-6">
          {step === "intro" && (
        <div className="space-y-6">
          <div className="rounded-xl bg-green-50 border border-green-200 p-6">
            <h2 className="font-semibold text-green-900 mb-3">What ReadyCheck does</h2>
            <ul className="space-y-2 text-sm text-green-800" role="list">
              {["Reviews key health metrics that transplant centers evaluate", "Gives you AI-powered, plain-language feedback", "Suggests personal health goals to improve your readiness", "Never replaces your transplant team's evaluation"].map((item) => (
                <li key={item} className="flex gap-2"><CheckCircle className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl bg-yellow-50 border border-yellow-200 p-4 flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-yellow-800">
              All metrics are self-reported and for your reference only. Only a transplant center can determine your eligibility for donation.
            </p>
          </div>
          <button onClick={() => setStep("form")} className="w-full rounded-md bg-green-600 py-3 text-sm font-semibold text-white hover:bg-green-700">
            Start my ReadyCheck
          </button>
        </div>
          )}

          {step === "form" && (
        <form onSubmit={handleSubmit} className="space-y-6" aria-label="Eligibility self-assessment form">
          <fieldset className="space-y-4">
            <legend className="text-base font-semibold text-gray-900">Your health metrics</legend>
            <p className="text-sm text-gray-500">Enter what you know. Leave blank if you're unsure.</p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Age</label>
                <input id="age" type="number" min="18" max="80" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-hope-500 focus:outline-none focus:ring-1 focus:ring-hope-500" placeholder="e.g. 42" />
              </div>
              <div>
                <label htmlFor="bmi" className="block text-sm font-medium text-gray-700">BMI</label>
                <input id="bmi" type="number" step="0.1" min="10" max="80" value={form.bmi} onChange={(e) => setForm({ ...form, bmi: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-hope-500 focus:outline-none focus:ring-1 focus:ring-hope-500" placeholder="e.g. 26.5" />
              </div>
              <div>
                <label htmlFor="bp-systolic" className="block text-sm font-medium text-gray-700">Blood pressure (top number)</label>
                <input id="bp-systolic" type="number" value={form.bpSystolic} onChange={(e) => setForm({ ...form, bpSystolic: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-hope-500 focus:outline-none focus:ring-1 focus:ring-hope-500" placeholder="e.g. 120" />
              </div>
              <div>
                <label htmlFor="bp-diastolic" className="block text-sm font-medium text-gray-700">Blood pressure (bottom number)</label>
                <input id="bp-diastolic" type="number" value={form.bpDiastolic} onChange={(e) => setForm({ ...form, bpDiastolic: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-hope-500 focus:outline-none focus:ring-1 focus:ring-hope-500" placeholder="e.g. 80" />
              </div>
            </div>

            <div>
              <label htmlFor="smoking" className="block text-sm font-medium text-gray-700">Smoking history</label>
              <select id="smoking" value={form.smokingStatus} onChange={(e) => setForm({ ...form, smokingStatus: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-hope-500 focus:outline-none focus:ring-1 focus:ring-hope-500">
                <option value="never">Never smoked</option>
                <option value="former">Former smoker (quit more than 6 months ago)</option>
                <option value="current">Current smoker</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <input id="diabetes" type="checkbox" checked={form.hasDiabetes} onChange={(e) => setForm({ ...form, hasDiabetes: e.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-hope-600 focus:ring-hope-500" />
              <label htmlFor="diabetes" className="text-sm font-medium text-gray-700">I have been diagnosed with diabetes</label>
            </div>
          </fieldset>

          <div className="flex gap-3">
            <button type="button" onClick={() => setStep("intro")} className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Back
            </button>
            <button type="submit" disabled={loading} className="flex-1 rounded-md bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">
              {loading ? "Analyzing..." : "Get my ReadyCheck results"}
            </button>
          </div>
        </form>
          )}

          {step === "results" && result && (
        <div className="space-y-6">
          <div className="rounded-xl bg-green-50 border border-green-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="h-5 w-5 text-green-600" aria-hidden="true" />
              <h2 className="font-semibold text-green-900">Your ReadyCheck Summary</h2>
            </div>
            <p className="text-sm text-green-800 leading-relaxed whitespace-pre-wrap">{result.aiSummary}</p>
            <p className="mt-3 text-xs text-green-700" aria-live="polite">
              {result.summarySource === "approved-ai" ? "Generated with the approved AI health-coach configuration." : "Generated from your answers using local, non-diagnostic guidance."}
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("intro")} className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Retake assessment
            </button>
            <a href="/ready-check/goals" className="flex-1 rounded-md bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 text-center">
              Set health goals →
            </a>
          </div>
          <p className="text-xs text-gray-500">
            This summary is for educational purposes only and does not constitute medical advice. Please consult your transplant team for a formal evaluation.
          </p>
        </div>
          )}
        </div>

        <section aria-labelledby="goals-heading" className="rounded-xl border border-gray-200 bg-white p-5 lg:sticky lg:top-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600" aria-hidden="true" />
                <h2 id="goals-heading" className="font-semibold text-gray-900">Your health goals</h2>
              </div>
              <p className="mt-1 text-sm text-gray-500">Track the milestones you are working toward.</p>
            </div>
            <a href="/ready-check/goals" className="shrink-0 text-sm font-medium text-green-700 hover:underline">
              Manage goals
            </a>
          </div>

          {goals.length === 0 ? (
            <p className="rounded-lg bg-gray-50 p-4 text-sm text-gray-500">
              No goals yet. Create a goal to start tracking your progress.
            </p>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const meta = GOAL_META[goal.metric] ?? { label: goal.metric, unit: "", color: "#6b7280" };
                const progress = goalProgress(goal);
                const latestLog = goal.progressLogs.at(-1);
                const currentValue = goal.currentValue ?? latestLog?.value;

                return (
                  <div key={goal.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{meta.label}</p>
                        <p className="mt-1 text-sm text-gray-600">
                          Target: <strong>{goal.targetValue} {meta.unit}</strong>
                          {currentValue != null && <> · Current: <strong>{currentValue} {meta.unit}</strong></>}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{progress}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${meta.label} progress`}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: meta.color }} />
                    </div>
                    {latestLog && (
                      <p className="mt-2 text-xs text-gray-500">
                        Last logged {new Date(latestLog.loggedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        {latestLog.note ? ` · ${latestLog.note}` : ""}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
