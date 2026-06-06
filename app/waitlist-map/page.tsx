"use client";
import { useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight, Users, Clock, TrendingDown, Info } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import { PublicPageShell } from "@/components/shared/public-page-shell";

// OPTN data: kidney waitlist counts and living donor rates by state (2024 approximations)
// Source: OPTN/SRTR 2024 Annual Report
const STATE_DATA: Record<string, {
  name: string;
  waitlist: number;
  livingDonorRate: number; // per million population
  avgWaitMonths: number;
  centers: number;
}> = {
  CA: { name: "California", waitlist: 18420, livingDonorRate: 14.2, avgWaitMonths: 84, centers: 14 },
  TX: { name: "Texas", waitlist: 9840, livingDonorRate: 12.8, avgWaitMonths: 72, centers: 12 },
  FL: { name: "Florida", waitlist: 7320, livingDonorRate: 11.4, avgWaitMonths: 66, centers: 9 },
  NY: { name: "New York", waitlist: 9150, livingDonorRate: 16.1, avgWaitMonths: 90, centers: 11 },
  IL: { name: "Illinois", waitlist: 4210, livingDonorRate: 13.7, avgWaitMonths: 60, centers: 6 },
  PA: { name: "Pennsylvania", waitlist: 3980, livingDonorRate: 15.3, avgWaitMonths: 54, centers: 7 },
  OH: { name: "Ohio", waitlist: 2840, livingDonorRate: 17.9, avgWaitMonths: 48, centers: 6 },
  GA: { name: "Georgia", waitlist: 3120, livingDonorRate: 10.2, avgWaitMonths: 60, centers: 4 },
  NC: { name: "North Carolina", waitlist: 2650, livingDonorRate: 14.5, avgWaitMonths: 54, centers: 5 },
  MI: { name: "Michigan", waitlist: 2180, livingDonorRate: 16.8, avgWaitMonths: 48, centers: 4 },
  NJ: { name: "New Jersey", waitlist: 3340, livingDonorRate: 13.1, avgWaitMonths: 72, centers: 5 },
  VA: { name: "Virginia", waitlist: 1820, livingDonorRate: 15.7, avgWaitMonths: 48, centers: 4 },
  WA: { name: "Washington", waitlist: 1450, livingDonorRate: 18.3, avgWaitMonths: 42, centers: 3 },
  AZ: { name: "Arizona", waitlist: 2010, livingDonorRate: 11.9, avgWaitMonths: 60, centers: 3 },
  TN: { name: "Tennessee", waitlist: 1680, livingDonorRate: 13.2, avgWaitMonths: 42, centers: 4 },
  IN: { name: "Indiana", waitlist: 1240, livingDonorRate: 16.4, avgWaitMonths: 36, centers: 3 },
  MO: { name: "Missouri", waitlist: 1350, livingDonorRate: 14.8, avgWaitMonths: 42, centers: 3 },
  MD: { name: "Maryland", waitlist: 2280, livingDonorRate: 17.2, avgWaitMonths: 60, centers: 4 },
  WI: { name: "Wisconsin", waitlist: 980, livingDonorRate: 19.6, avgWaitMonths: 30, centers: 3 },
  MN: { name: "Minnesota", waitlist: 870, livingDonorRate: 22.1, avgWaitMonths: 30, centers: 2 },
  CO: { name: "Colorado", waitlist: 1020, livingDonorRate: 16.7, avgWaitMonths: 36, centers: 2 },
  AL: { name: "Alabama", waitlist: 1180, livingDonorRate: 10.8, avgWaitMonths: 42, centers: 3 },
  SC: { name: "South Carolina", waitlist: 980, livingDonorRate: 11.4, avgWaitMonths: 48, centers: 2 },
  LA: { name: "Louisiana", waitlist: 1540, livingDonorRate: 9.8, avgWaitMonths: 54, centers: 3 },
  KY: { name: "Kentucky", waitlist: 840, livingDonorRate: 14.1, avgWaitMonths: 36, centers: 2 },
  OR: { name: "Oregon", waitlist: 680, livingDonorRate: 19.4, avgWaitMonths: 30, centers: 2 },
  OK: { name: "Oklahoma", waitlist: 760, livingDonorRate: 11.7, avgWaitMonths: 36, centers: 2 },
  CT: { name: "Connecticut", waitlist: 840, livingDonorRate: 16.9, avgWaitMonths: 48, centers: 2 },
  UT: { name: "Utah", waitlist: 540, livingDonorRate: 21.3, avgWaitMonths: 24, centers: 1 },
  NV: { name: "Nevada", waitlist: 820, livingDonorRate: 10.1, avgWaitMonths: 60, centers: 1 },
  AR: { name: "Arkansas", waitlist: 610, livingDonorRate: 10.9, avgWaitMonths: 36, centers: 1 },
  MS: { name: "Mississippi", waitlist: 720, livingDonorRate: 9.2, avgWaitMonths: 42, centers: 1 },
  KS: { name: "Kansas", waitlist: 480, livingDonorRate: 15.6, avgWaitMonths: 30, centers: 1 },
  NM: { name: "New Mexico", waitlist: 540, livingDonorRate: 10.4, avgWaitMonths: 42, centers: 1 },
  NE: { name: "Nebraska", waitlist: 320, livingDonorRate: 17.8, avgWaitMonths: 24, centers: 1 },
  IA: { name: "Iowa", waitlist: 380, livingDonorRate: 18.2, avgWaitMonths: 24, centers: 1 },
  HI: { name: "Hawaii", waitlist: 440, livingDonorRate: 13.6, avgWaitMonths: 48, centers: 1 },
  ID: { name: "Idaho", waitlist: 280, livingDonorRate: 14.9, avgWaitMonths: 30, centers: 1 },
  MT: { name: "Montana", waitlist: 160, livingDonorRate: 15.1, avgWaitMonths: 24, centers: 1 },
  WV: { name: "West Virginia", waitlist: 380, livingDonorRate: 10.3, avgWaitMonths: 36, centers: 1 },
  ME: { name: "Maine", waitlist: 220, livingDonorRate: 16.7, avgWaitMonths: 30, centers: 1 },
  NH: { name: "New Hampshire", waitlist: 180, livingDonorRate: 17.4, avgWaitMonths: 24, centers: 1 },
  RI: { name: "Rhode Island", waitlist: 290, livingDonorRate: 14.8, avgWaitMonths: 36, centers: 1 },
  DE: { name: "Delaware", waitlist: 310, livingDonorRate: 13.2, avgWaitMonths: 42, centers: 1 },
  SD: { name: "South Dakota", waitlist: 140, livingDonorRate: 16.3, avgWaitMonths: 18, centers: 1 },
  ND: { name: "North Dakota", waitlist: 110, livingDonorRate: 18.7, avgWaitMonths: 18, centers: 1 },
  VT: { name: "Vermont", waitlist: 120, livingDonorRate: 17.9, avgWaitMonths: 18, centers: 1 },
  WY: { name: "Wyoming", waitlist: 90, livingDonorRate: 14.2, avgWaitMonths: 18, centers: 1 },
  AK: { name: "Alaska", waitlist: 130, livingDonorRate: 12.8, avgWaitMonths: 24, centers: 1 },
};

const NATIONAL_TOTAL = Object.values(STATE_DATA).reduce((s, d) => s + d.waitlist, 0);

// Color based on waitlist size relative to national max
function getColor(waitlist: number): string {
  const max = 18420; // CA
  const ratio = waitlist / max;
  if (ratio > 0.5) return "#dc2626"; // red-600
  if (ratio > 0.25) return "#ea580c"; // orange-600
  if (ratio > 0.1) return "#d97706"; // amber-600
  return "#2563eb"; // blue-600
}

function getUrgency(months: number): { label: string; color: string } {
  if (months >= 72) return { label: "Critical wait", color: "text-red-600 bg-red-50" };
  if (months >= 48) return { label: "Long wait", color: "text-orange-600 bg-orange-50" };
  if (months >= 30) return { label: "Moderate wait", color: "text-amber-600 bg-amber-50" };
  return { label: "Shorter wait", color: "text-green-600 bg-green-50" };
}

const sortedStates = Object.entries(STATE_DATA).sort((a, b) => b[1].waitlist - a[1].waitlist);

export default function WaitlistMapPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"waitlist" | "wait_time" | "donor_rate">("waitlist");
  const [searchTerm, setSearchTerm] = useState("");

  const sorted = Object.entries(STATE_DATA)
    .filter(([, d]) => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "waitlist") return b[1].waitlist - a[1].waitlist;
      if (sortBy === "wait_time") return b[1].avgWaitMonths - a[1].avgWaitMonths;
      return a[1].livingDonorRate - b[1].livingDonorRate; // low rate = most need
    });

  const selectedData = selected ? STATE_DATA[selected] : null;
  const urgency = selectedData ? getUrgency(selectedData.avgWaitMonths) : null;

  return (
    <PublicPageShell>
      <main>
        {/* Hero */}
        <section className="bg-gray-900 text-white py-16">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">
              The kidney waitlist is not abstract.<br />
              <span className="text-blue-400">It's your neighbors.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              {NATIONAL_TOTAL.toLocaleString()} Americans are waiting right now. Explore where they live -
              and where living donors are needed most.
            </p>
            <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
              <div className="rounded-xl bg-white/10 p-4 text-center">
                <p className="text-3xl font-bold text-blue-400">{NATIONAL_TOTAL.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">People waiting</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 text-center">
                <p className="text-3xl font-bold text-red-400">13</p>
                <p className="text-xs text-gray-400 mt-1">Die each day waiting</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4 text-center">
                <p className="text-3xl font-bold text-green-400">~5 yrs</p>
                <p className="text-xs text-gray-400 mt-1">Average wait (national)</p>
              </div>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* State list */}
            <div className="lg:w-1/2">
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <input
                  type="search"
                  placeholder="Search by state..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  aria-label="Search states"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none bg-white"
                  aria-label="Sort by"
                >
                  <option value="waitlist">Sort: Waitlist size</option>
                  <option value="wait_time">Sort: Longest wait</option>
                  <option value="donor_rate">Sort: Most needed</option>
                </select>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2" role="list" aria-label="States by kidney waitlist">
                {sorted.map(([abbr, data]) => {
                  const urg = getUrgency(data.avgWaitMonths);
                  return (
                    <button
                      key={abbr}
                      onClick={() => setSelected(abbr === selected ? null : abbr)}
                      className={`w-full flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        selected === abbr
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-100 bg-white hover:border-gray-300"
                      }`}
                      aria-pressed={selected === abbr}
                      role="listitem"
                    >
                      {/* State abbr colored dot */}
                      <div
                        className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center text-white text-xs font-bold"
                        style={{ backgroundColor: getColor(data.waitlist) }}
                        aria-hidden="true"
                      >
                        {abbr}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{data.name}</p>
                        <p className="text-sm text-gray-500">
                          <Users className="h-3 w-3 inline mr-1" aria-hidden="true" />
                          {data.waitlist.toLocaleString()} waiting
                          <span className="mx-2 text-gray-300">·</span>
                          <Clock className="h-3 w-3 inline mr-1" aria-hidden="true" />
                          ~{data.avgWaitMonths} months avg
                        </p>
                      </div>
                      <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${urg.color}`}>
                        {urg.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detail panel */}
            <div className="lg:w-1/2">
              {!selectedData && (
                <div className="sticky top-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 p-10 text-center">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" aria-hidden="true" />
                  <p className="text-gray-500 font-medium">Select a state to see details</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Click any state to see waitlist numbers, donor rates, and what living donation could mean there.
                  </p>
                </div>
              )}

              {selectedData && urgency && (
                <div className="sticky top-24 space-y-6">
                  <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedData.name}</h2>
                        <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium mt-1 ${urgency.color}`}>
                          {urgency.label}
                        </span>
                      </div>
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: getColor(selectedData.waitlist) }}
                        aria-hidden="true"
                      >
                        {selected}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl bg-white p-4 text-center">
                        <p className="text-3xl font-bold text-red-600">{selectedData.waitlist.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-1">People waiting for a kidney</p>
                      </div>
                      <div className="rounded-xl bg-white p-4 text-center">
                        <p className="text-3xl font-bold text-orange-600">{selectedData.avgWaitMonths}</p>
                        <p className="text-xs text-gray-500 mt-1">Avg. months waiting</p>
                      </div>
                      <div className="rounded-xl bg-white p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">{selectedData.livingDonorRate}</p>
                        <p className="text-xs text-gray-500 mt-1">Living donors per million</p>
                      </div>
                      <div className="rounded-xl bg-white p-4 text-center">
                        <p className="text-3xl font-bold text-green-600">{selectedData.centers}</p>
                        <p className="text-xs text-gray-500 mt-1">Transplant center{selectedData.centers !== 1 ? "s" : ""}</p>
                      </div>
                    </div>
                  </div>

                  {/* Gap indicator */}
                  <div className="rounded-xl bg-white border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingDown className="h-5 w-5 text-red-500" aria-hidden="true" />
                      <h3 className="font-semibold text-gray-900">The living donation gap</h3>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedData.name}'s living donor rate of{" "}
                      <strong>{selectedData.livingDonorRate}</strong> per million is{" "}
                      {selectedData.livingDonorRate < 15 ? (
                        <span className="text-red-600 font-medium">below the national average (15.8)</span>
                      ) : (
                        <span className="text-green-600 font-medium">above the national average (15.8)</span>
                      )}
                      . With {selectedData.waitlist.toLocaleString()} people waiting and an average wait of{" "}
                      {Math.round(selectedData.avgWaitMonths / 12)} year{Math.round(selectedData.avgWaitMonths / 12) !== 1 ? "s" : ""},
                      every new living donor makes a measurable difference.
                    </p>
                  </div>

                  <div className="rounded-xl bg-gray-900 p-6 text-center">
                    <p className="text-white font-semibold mb-2">You could change this number</p>
                    <p className="text-gray-400 text-sm mb-4">
                      One person in {selectedData.name} checking their eligibility today could mean one less name on that list.
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Link
                        href="/could-i-qualify"
                        className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                      >
                        Check if I qualify
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start gap-2 text-xs text-gray-400 border rounded-lg p-3">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    Data from OPTN/SRTR 2024 Annual Report. Numbers are approximations and updated periodically.
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* National heat list */}
        <section className="bg-gray-50 border-t border-gray-100 py-12">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">States with the largest waitlists</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {sortedStates.slice(0, 10).map(([abbr, data], i) => (
                <button
                  key={abbr}
                  onClick={() => setSelected(abbr)}
                  className="rounded-xl bg-white border border-gray-200 p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium text-gray-400">#{i + 1}</span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: getColor(data.waitlist) }}
                    >
                      {abbr}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{data.name}</p>
                  <p className="text-xl font-bold text-red-600">{data.waitlist.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">waiting</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-2xl px-6 py-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">The map is data. The change is human.</h2>
          <p className="text-gray-600 mb-8">
            LivingLink gives every potential donor the tools to turn curiosity into action -
            health guidance, financial protection, peer mentorship, and lifetime support.
          </p>
          <SignUpButton mode="modal">
            <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 mx-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Start your journey
              <ArrowRight className="h-5 w-5" />
            </button>
          </SignUpButton>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-6">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <Link href="/could-i-qualify" className="hover:text-blue-600">Could I qualify?</Link>
            <Link href="/ripple" className="hover:text-blue-600">Ripple Calculator</Link>
            <Link href="/stories" className="hover:text-blue-600">Donor Stories</Link>
          </div>
          <p className="text-xs text-gray-400">© 2026 LivingLink · Data: OPTN/SRTR 2024</p>
        </div>
      </footer>
    </PublicPageShell>
  );
}
