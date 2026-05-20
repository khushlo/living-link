"use client";
import { useState, useEffect } from "react";
import { Activity, Search, Clock, AlertCircle, CheckCircle, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const PLAYBOOKS = [
  {
    title: "Expedited Evaluation Protocol",
    source: "High-Volume Center Best Practice",
    summary: "Consolidate workup visits into 1–2 days. Reduces avg evaluation time from 6 to 8 weeks to under 3 weeks.",
    tags: ["evaluation", "efficiency"],
  },
  {
    title: "Nurse Navigator Model",
    source: "UNOS Best Practice Library",
    summary: "Dedicated donor nurse navigator reduces dropout rate by 30% by proactively managing follow-up and scheduling.",
    tags: ["staffing", "retention"],
  },
  {
    title: "Independent Donor Advocate Checklist",
    source: "OPTN Policy 14",
    summary: "Ensure IDA contact occurs before surgical consent. Document in EMR. Reduces compliance risk.",
    tags: ["compliance", "ida"],
  },
  {
    title: "Financial Coordinator Touchpoint",
    source: "LivingLink Best Practice",
    summary: "Introduce financial coordinator at evaluation Day 1. Reduces withdrawal due to financial concerns by 22%.",
    tags: ["financial", "retention"],
  },
];

export default function ClinicianCenterFlowPage() {
  const [search, setSearch] = useState("");
  const filtered = PLAYBOOKS.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CenterFlow</h1>
        <p className="mt-1 text-gray-600">Protocol knowledge base and evaluation decision support.</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          placeholder="Search protocols, tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Search protocols"
        />
      </div>

      {/* Playbooks */}
      <section aria-labelledby="playbooks-heading">
        <h2 id="playbooks-heading" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-purple-600" />
          Protocol Playbooks
        </h2>
        <div className="space-y-3">
          {filtered.map((p) => (
            <Card key={p.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{p.title}</CardTitle>
                <CardDescription className="text-xs">{p.source}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-gray-600 mb-3">{p.summary}</p>
                <div className="flex gap-2 flex-wrap">
                  {p.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-purple-50 border border-purple-200 px-2.5 py-0.5 text-xs text-purple-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-8">No protocols match your search.</p>
          )}
        </div>
      </section>

      {/* CDS Hooks alert section */}
      <section aria-labelledby="alerts-heading">
        <h2 id="alerts-heading" className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-orange-600" />
          Active Alerts
        </h2>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
          <p className="text-sm text-orange-800">
            No active CDS Hooks alerts. Connect your EHR via SMART on FHIR to receive real-time stalled evaluation alerts.
          </p>
        </div>
      </section>
    </div>
  );
}
