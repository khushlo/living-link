"use client";
import { useState, useEffect } from "react";
import { Heart, CheckCircle, Clock, AlertCircle, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const MILESTONES = [
  { week: "WEEK_2", label: "2 Weeks Post-Donation", desc: "Wound check, initial recovery" },
  { week: "MONTH_1", label: "1 Month", desc: "Return to light activity" },
  { week: "MONTH_3", label: "3 Months", desc: "Full recovery evaluation" },
  { week: "MONTH_6", label: "6 Months", desc: "Kidney function labs" },
  { week: "YEAR_1", label: "1 Year", desc: "Annual health evaluation" },
  { week: "YEAR_2_PLUS", label: "2+ Years", desc: "Ongoing annual monitoring" },
];

export default function LifeAfterPage() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [showCheckin, setShowCheckin] = useState<string | null>(null);
  const [checkinForm, setCheckinForm] = useState({ bpSystolic: "", bpDiastolic: "", weightKg: "", moodScore: "7", energyScore: "7", notes: "" });
  const [phq2, setPhq2] = useState({ q1: "0", q2: "0" });
  const [phq2Result, setPhq2Result] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);

  useEffect(() => {
    fetch("/api/life-after/timeline").then((r) => r.json()).then(setTimeline).catch(() => {});
    fetch("/api/life-after/trends").then((r) => r.json()).then(setTrends).catch(() => {});
  }, []);

  async function submitCheckin(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/life-after/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week: showCheckin, ...checkinForm,
        bpSystolic: checkinForm.bpSystolic ? Number(checkinForm.bpSystolic) : undefined,
        bpDiastolic: checkinForm.bpDiastolic ? Number(checkinForm.bpDiastolic) : undefined,
        weightKg: checkinForm.weightKg ? Number(checkinForm.weightKg) : undefined,
        moodScore: Number(checkinForm.moodScore), energyScore: Number(checkinForm.energyScore),
      }),
    });
    setShowCheckin(null);
  }

  async function submitPHQ2(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/life-after/phq2", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q1Score: Number(phq2.q1), q2Score: Number(phq2.q2) }) });
    const data = await res.json();
    setPhq2Result(data);
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">LifeAfter</h1>
        <p className="mt-1 text-gray-600">Your post-donation health journey. Track check-ins, monitor trends, and stay connected with your care team.</p>
      </div>

      {/* Timeline */}
      <section aria-labelledby="timeline-heading">
        <h2 id="timeline-heading" className="text-lg font-semibold text-gray-900 mb-4">Your Follow-Up Timeline</h2>
        <div className="space-y-3">
          {MILESTONES.map((m) => {
            const entry = timeline.find?.((t: any) => t.week === m.week);
            const done = entry?.completed;
            return (
              <div key={m.week} className={`rounded-xl border p-4 flex items-center justify-between ${done ? "border-green-200 bg-green-50" : "border-gray-200 bg-white"}`}>
                <div className="flex items-center gap-3">
                  {done ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" aria-label="Completed" /> : <Clock className="h-5 w-5 text-gray-400 flex-shrink-0" aria-label="Pending" />}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                    <p className="text-xs text-gray-500">{m.desc}</p>
                  </div>
                </div>
                {!done && (
                  <button onClick={() => setShowCheckin(m.week)} className="rounded-md bg-hope-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-hope-700">
                    Complete check-in
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Check-in form */}
      {showCheckin && (
        <div role="dialog" aria-modal="true" aria-labelledby="checkin-dialog-title" className="rounded-xl border border-hope-200 bg-hope-50 p-6">
          <h2 id="checkin-dialog-title" className="font-semibold text-gray-900 mb-4">
            Complete: {MILESTONES.find((m) => m.week === showCheckin)?.label}
          </h2>
          <form onSubmit={submitCheckin} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="ci-bp-sys" className="block text-sm font-medium text-gray-700">Blood pressure (top)</label>
                <input id="ci-bp-sys" type="number" value={checkinForm.bpSystolic} onChange={(e) => setCheckinForm({ ...checkinForm, bpSystolic: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. 120" />
              </div>
              <div>
                <label htmlFor="ci-bp-dia" className="block text-sm font-medium text-gray-700">Blood pressure (bottom)</label>
                <input id="ci-bp-dia" type="number" value={checkinForm.bpDiastolic} onChange={(e) => setCheckinForm({ ...checkinForm, bpDiastolic: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="e.g. 80" />
              </div>
              <div>
                <label htmlFor="ci-mood" className="block text-sm font-medium text-gray-700">Mood (1–10)</label>
                <input id="ci-mood" type="range" min="1" max="10" value={checkinForm.moodScore} onChange={(e) => setCheckinForm({ ...checkinForm, moodScore: e.target.value })} className="mt-1 w-full" />
                <span className="text-xs text-gray-500">Selected: {checkinForm.moodScore}/10</span>
              </div>
              <div>
                <label htmlFor="ci-energy" className="block text-sm font-medium text-gray-700">Energy (1–10)</label>
                <input id="ci-energy" type="range" min="1" max="10" value={checkinForm.energyScore} onChange={(e) => setCheckinForm({ ...checkinForm, energyScore: e.target.value })} className="mt-1 w-full" />
                <span className="text-xs text-gray-500">Selected: {checkinForm.energyScore}/10</span>
              </div>
            </div>
            <div>
              <label htmlFor="ci-notes" className="block text-sm font-medium text-gray-700">How are you feeling? (optional)</label>
              <textarea id="ci-notes" rows={3} value={checkinForm.notes} onChange={(e) => setCheckinForm({ ...checkinForm, notes: e.target.value })} className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm" placeholder="Anything you want to note..." maxLength={1000} />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowCheckin(null)} className="flex-1 rounded-md border border-gray-300 py-2 text-sm font-medium text-gray-700">Cancel</button>
              <button type="submit" className="flex-1 rounded-md bg-hope-600 py-2 text-sm font-semibold text-white hover:bg-hope-700">Submit check-in</button>
            </div>
          </form>
        </div>
      )}

      {/* Mood/Energy trend chart */}
      {trends?.mood?.length > 0 && (
        <section aria-labelledby="trends-heading">
          <h2 id="trends-heading" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-hope-600" aria-hidden="true" /> Health Trends
          </h2>
          <div className="rounded-xl border border-gray-200 p-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trends.mood}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 10]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#2563eb" name="Mood" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* PHQ-2 screener */}
      <section aria-labelledby="phq2-heading" className="rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Heart className="h-5 w-5 text-kidney-600" aria-hidden="true" />
          <h2 id="phq2-heading" className="font-semibold text-gray-900">Mental well-being check</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">Over the past 2 weeks, how often have you been bothered by...</p>
        {!phq2Result ? (
          <form onSubmit={submitPHQ2} className="space-y-4">
            {[{ id: "q1", label: "Little interest or pleasure in doing things?" }, { id: "q2", label: "Feeling down, depressed, or hopeless?" }].map((q) => (
              <div key={q.id}>
                <label htmlFor={q.id} className="block text-sm font-medium text-gray-700">{q.label}</label>
                <select id={q.id} value={phq2[q.id as "q1" | "q2"]} onChange={(e) => setPhq2({ ...phq2, [q.id]: e.target.value })}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm">
                  <option value="0">Not at all</option>
                  <option value="1">Several days</option>
                  <option value="2">More than half the days</option>
                  <option value="3">Nearly every day</option>
                </select>
              </div>
            ))}
            <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">Submit</button>
          </form>
        ) : (
          <div className={`rounded-lg p-4 ${phq2Result.isEscalated ? "bg-orange-50 border border-orange-200" : "bg-green-50 border border-green-200"}`} aria-live="polite">
            {phq2Result.isEscalated && <AlertCircle className="h-5 w-5 text-orange-600 mb-2" aria-hidden="true" />}
            <p className="text-sm font-medium">{phq2Result.isEscalated ? "Support resources available" : "Thank you for checking in!"}</p>
            <p className="text-sm text-gray-600 mt-1">{phq2Result.message}</p>
          </div>
        )}
      </section>

      {/* PCP Clarity Tool link */}
      <section aria-labelledby="pcp-heading" className="rounded-xl bg-blue-50 border border-blue-200 p-5 flex items-start gap-4">
        <span className="text-2xl" aria-hidden="true">🩺</span>
        <div className="flex-1">
          <h2 id="pcp-heading" className="font-semibold text-blue-900">Who manages what after donation?</h2>
          <p className="text-sm text-blue-800 mt-1">
            Understand exactly what your primary care doctor handles vs. your nephrologist - so nothing falls through the cracks.
          </p>
          <a href="/life-after/pcp-clarity" className="mt-3 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Open PCP Clarity tool →
          </a>
        </div>
      </section>
    </div>
  );
}
