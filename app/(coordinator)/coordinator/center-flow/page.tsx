"use client";
import { useState } from "react";
import { Activity, Clock, AlertCircle, CheckCircle, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SAMPLE_EVALUATIONS = [
  { id: "D-001", name: "Candidate A", stage: "Bloodwork", daysElapsed: 18, flagged: true, flag: "Bloodwork pending >14 days" },
  { id: "D-002", name: "Candidate B", stage: "Psychological eval", daysElapsed: 7, flagged: false, flag: "" },
  { id: "D-003", name: "Candidate C", stage: "IDA meeting", daysElapsed: 3, flagged: false, flag: "" },
  { id: "D-004", name: "Candidate D", stage: "Surgical consult", daysElapsed: 22, flagged: true, flag: "Surgery consult pending >21 days" },
];

const STAGE_COLOR: Record<string, string> = {
  Bloodwork: "bg-blue-100 text-blue-700",
  "Psychological eval": "bg-purple-100 text-purple-700",
  "IDA meeting": "bg-green-100 text-green-700",
  "Surgical consult": "bg-orange-100 text-orange-700",
};

export default function CoordinatorCenterFlowPage() {
  const [filter, setFilter] = useState<"all" | "flagged">("all");
  const shown = filter === "flagged" ? SAMPLE_EVALUATIONS.filter((e) => e.flagged) : SAMPLE_EVALUATIONS;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CenterFlow</h1>
        <p className="mt-1 text-gray-600">Evaluation stage tracker with bottleneck detection.</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="h-7 w-7 text-orange-600" />
            <div>
              <p className="text-xl font-bold">{SAMPLE_EVALUATIONS.length}</p>
              <p className="text-xs text-gray-500">Active evaluations</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-7 w-7 text-red-600" />
            <div>
              <p className="text-xl font-bold">{SAMPLE_EVALUATIONS.filter((e) => e.flagged).length}</p>
              <p className="text-xs text-gray-500">Stalled / flagged</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="h-7 w-7 text-blue-600" />
            <div>
              <p className="text-xl font-bold">
                {Math.round(SAMPLE_EVALUATIONS.reduce((s, e) => s + e.daysElapsed, 0) / SAMPLE_EVALUATIONS.length)}d
              </p>
              <p className="text-xs text-gray-500">Avg days elapsed</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter toggle */}
      <div className="flex gap-2" role="group" aria-label="Filter evaluations">
        {(["all", "flagged"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 ${
              filter === f ? "bg-orange-600 text-white" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
            aria-pressed={filter === f}
          >
            {f === "all" ? "All evaluations" : "Flagged only"}
          </button>
        ))}
      </div>

      {/* Evaluation table */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm" aria-label="Donor evaluations">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Candidate</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Current stage</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Days elapsed</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {shown.map((e) => (
              <tr key={e.id} className={e.flagged ? "bg-red-50" : "bg-white hover:bg-gray-50"}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    {e.name}
                    <span className="text-xs text-gray-400">{e.id}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STAGE_COLOR[e.stage] ?? "bg-gray-100 text-gray-700"}`}>
                    {e.stage}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{e.daysElapsed} days</td>
                <td className="px-4 py-3">
                  {e.flagged ? (
                    <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {e.flag}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-green-600 text-xs">
                      <CheckCircle className="h-3.5 w-3.5" />
                      On track
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
