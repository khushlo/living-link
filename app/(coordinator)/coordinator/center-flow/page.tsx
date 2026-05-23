"use client";
import { useState, useEffect } from "react";
import { Activity, AlertCircle, Clock, CheckCircle, User, RefreshCw, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type Evaluation = {
  id: string;
  donorName?: string;
  stage: string;
  daysElapsed: number;
  isStalled: boolean;
  stalledReason?: string;
  updatedAt: string;
};

const STAGES = ["INITIAL_INQUIRY","BLOODWORK","IMAGING","CARDIAC_EVAL","PSYCH_EVAL","FINAL_REVIEW","APPROVED","DECLINED"] as const;

const STAGE_META: Record<string, { label: string; color: string }> = {
  INITIAL_INQUIRY: { label: "Initial inquiry", color: "bg-gray-100 text-gray-700" },
  BLOODWORK:       { label: "Bloodwork",        color: "bg-blue-100 text-blue-700" },
  IMAGING:         { label: "Imaging",          color: "bg-indigo-100 text-indigo-700" },
  CARDIAC_EVAL:    { label: "Cardiac eval",     color: "bg-yellow-100 text-yellow-700" },
  PSYCH_EVAL:      { label: "Psych eval",       color: "bg-purple-100 text-purple-700" },
  FINAL_REVIEW:    { label: "Final review",     color: "bg-orange-100 text-orange-700" },
  APPROVED:        { label: "Approved ✓",       color: "bg-green-100 text-green-700" },
  DECLINED:        { label: "Declined",         color: "bg-red-100 text-red-700" },
};

const DEMO: Evaluation[] = [
  { id: "demo-1", donorName: "Candidate A", stage: "BLOODWORK",       daysElapsed: 18, isStalled: true,  stalledReason: "Bloodwork pending >14 days", updatedAt: new Date().toISOString() },
  { id: "demo-2", donorName: "Candidate B", stage: "PSYCH_EVAL",      daysElapsed: 7,  isStalled: false, updatedAt: new Date().toISOString() },
  { id: "demo-3", donorName: "Candidate C", stage: "INITIAL_INQUIRY", daysElapsed: 3,  isStalled: false, updatedAt: new Date().toISOString() },
  { id: "demo-4", donorName: "Candidate D", stage: "CARDIAC_EVAL",    daysElapsed: 24, isStalled: true,  stalledReason: "Cardiac eval pending >21 days", updatedAt: new Date().toISOString() },
  { id: "demo-5", donorName: "Candidate E", stage: "FINAL_REVIEW",    daysElapsed: 5,  isStalled: false, updatedAt: new Date().toISOString() },
  { id: "demo-6", donorName: "Candidate F", stage: "APPROVED",        daysElapsed: 0,  isStalled: false, updatedAt: new Date().toISOString() },
];

export default function CoordinatorCenterFlowPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [filter, setFilter] = useState<"all" | "stalled" | "active">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stageOverrides, setStageOverrides] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/center-flow/evaluations");
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) { setEvaluations(data); setIsDemo(false); }
      else { setEvaluations(DEMO); setIsDemo(true); }
    } catch { setEvaluations(DEMO); setIsDemo(true); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function updateStage(id: string, stage: string) {
    if (isDemo) {
      setEvaluations((prev) => prev.map((e) => e.id === id ? { ...e, stage, isStalled: false } : e));
      setExpandedId(null); return;
    }
    setUpdatingId(id);
    try {
      await fetch(`/api/center-flow/evaluations`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, stage }),
      });
      await load();
    } finally { setUpdatingId(null); setExpandedId(null); }
  }

  const stalledCount = evaluations.filter((e) => e.isStalled).length;
  const activeCount  = evaluations.filter((e) => !["APPROVED","DECLINED"].includes(e.stage)).length;
  const completedCount = evaluations.filter((e) => ["APPROVED","DECLINED"].includes(e.stage)).length;
  const avgDays = activeCount > 0
    ? Math.round(evaluations.filter((e) => !["APPROVED","DECLINED"].includes(e.stage)).reduce((s,e) => s + e.daysElapsed, 0) / activeCount)
    : 0;

  const shown = evaluations.filter((e) =>
    filter === "stalled" ? e.isStalled :
    filter === "active"  ? !["APPROVED","DECLINED"].includes(e.stage) : true
  );

  return (
    <div className="max-w-5xl space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CenterFlow - Evaluation Tracker</h1>
          <p className="mt-1 text-gray-600">Monitor donor evaluation stages and catch bottlenecks early.</p>
        </div>
        <button onClick={load} disabled={loading}
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" /> Refresh
        </button>
      </div>

      {isDemo && (
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-200 p-3 text-sm text-blue-800">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
          Showing demo data. Connect a transplant center account to see live evaluations.
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Active",    value: activeCount,    icon: Activity,    color: "text-orange-600" },
          { label: "Stalled",   value: stalledCount,   icon: AlertCircle, color: "text-red-600" },
          { label: "Completed", value: completedCount, icon: CheckCircle, color: "text-green-600" },
          { label: "Avg days",  value: `${avgDays}d`,  icon: Clock,       color: "text-blue-600" },
        ].map((c) => (
          <Card key={c.label}><CardContent className="p-4 flex items-center gap-3">
            <c.icon className={`h-7 w-7 ${c.color} shrink-0`} aria-hidden="true" />
            <div><p className="text-xl font-bold">{c.value}</p><p className="text-xs text-gray-500">{c.label}</p></div>
          </CardContent></Card>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2" role="group" aria-label="Filter evaluations">
        {(["all","active","stalled"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${filter === f ? "bg-orange-500 text-white" : "border border-gray-300 text-gray-700 hover:bg-gray-50"}`}>
            {f === "all" ? "All" : f === "active" ? `Active (${activeCount})` : `Stalled (${stalledCount})`}
          </button>
        ))}
      </div>

      {/* Evaluation rows */}
      {loading ? <p className="text-sm text-gray-400">Loading…</p> : shown.length === 0 ? (
        <p className="text-sm text-gray-400">No evaluations match this filter.</p>
      ) : (
        <div className="space-y-3">
          {shown.map((ev) => {
            const meta = STAGE_META[ev.stage] ?? { label: ev.stage, color: "bg-gray-100 text-gray-700" };
            const overrideStage = stageOverrides[ev.id] ?? ev.stage;
            const expanded = expandedId === ev.id;
            return (
              <div key={ev.id} className={`rounded-xl border overflow-hidden ${ev.isStalled ? "border-red-300" : "border-gray-200"}`}>
                <div className="flex items-center gap-4 p-4">
                  <div className="h-9 w-9 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-orange-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900 text-sm">{ev.donorName ?? `ID: ${ev.id.slice(0,8)}`}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${meta.color}`}>{meta.label}</span>
                      {ev.isStalled && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-2 py-0.5 text-xs font-medium">
                          <AlertCircle className="h-3 w-3" aria-hidden="true" /> Stalled
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ev.daysElapsed} day{ev.daysElapsed !== 1 ? "s" : ""} in stage
                      {ev.stalledReason && <span className="text-red-500"> · {ev.stalledReason}</span>}
                    </p>
                  </div>
                  <button onClick={() => setExpandedId(expanded ? null : ev.id)} aria-expanded={expanded}
                    className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1 shrink-0">
                    Update <ChevronDown className={`h-3 w-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
                  </button>
                </div>
                {expanded && (
                  <div className="border-t border-gray-100 bg-gray-50 p-4 flex flex-wrap items-center gap-3">
                    <select value={overrideStage}
                      onChange={(e) => setStageOverrides((p) => ({ ...p, [ev.id]: e.target.value }))}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm" aria-label="Select new stage">
                      {STAGES.map((s) => <option key={s} value={s}>{STAGE_META[s].label}</option>)}
                    </select>
                    <button disabled={updatingId === ev.id} onClick={() => updateStage(ev.id, overrideStage)}
                      className="rounded-md bg-orange-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-60">
                      {updatingId === ev.id ? "Saving…" : "Save"}
                    </button>
                    <button onClick={() => setExpandedId(null)} className="text-sm text-gray-400 hover:text-gray-700">Cancel</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* National benchmark callout */}
      <div className="rounded-xl bg-orange-50 border border-orange-200 p-5 space-y-2">
        <h3 className="text-sm font-semibold text-orange-900">National benchmarks (OPTN)</h3>
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          {[
            { label: "Avg eval time",       value: "6–8 weeks"  },
            { label: "Expedited protocol",  value: "< 3 weeks"  },
            { label: "Dropout rate (avg)",  value: "~40%"       },
            { label: "With nurse navigator",value: "~28%"       },
          ].map((item) => (
            <div key={item.label}>
              <dt className="text-xs text-orange-600 font-medium">{item.label}</dt>
              <dd className="text-orange-900 font-bold">{item.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
