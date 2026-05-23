"use client";
import { useState } from "react";
import { Shield, Calculator, FileText, Receipt, ExternalLink, DollarSign } from "lucide-react";

export default function DonorShieldPage() {
  const [wages, setWages] = useState({ hourlyRate: "", hoursPerWeek: "40", recoveryWeeks: "4" });
  const [wageResult, setWageResult] = useState<any>(null);

  async function calcWages(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(wages);
    const res = await fetch(`/api/donor-shield/wage-calculator?${params}`);
    const data = await res.json();
    setWageResult(data);
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">DonorShield</h1>
        <p className="mt-1 text-gray-600">
          Understand and manage the financial side of donation. No surprise costs, no unanswered questions.
        </p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: "/donor-shield/expenses",    icon: Receipt,     label: "Track expenses",        color: "text-yellow-600", bg: "bg-yellow-50" },
          { href: "/donor-shield/nldac",       icon: FileText,    label: "NLDAC wizard",           color: "text-yellow-600", bg: "bg-yellow-50" },
          { href: "/donor-shield/tax-credits", icon: DollarSign,  label: "State tax credits",      color: "text-green-600",  bg: "bg-green-50"  },
          { href: "/donor-shield/fmla-letter", icon: FileText,    label: "FMLA letter",            color: "text-blue-600",   bg: "bg-blue-50"   },
          { href: "/donor-shield/insurance",   icon: Shield,      label: "Insurance tracker",      color: "text-red-600",    bg: "bg-red-50"    },
          { href: "https://nldac.org",         icon: ExternalLink, label: "NLDAC website",         color: "text-yellow-600", bg: "bg-yellow-50" },
        ].map((link) => (
          <a key={link.label} href={link.href} target={link.href.startsWith("http") ? "_blank" : undefined}
            rel={link.href.startsWith("http") ? "noreferrer" : undefined}
            className="flex items-center gap-3 rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
            <div className={`rounded-lg p-2 ${link.bg}`} aria-hidden="true">
              <link.icon className={`h-5 w-5 ${link.color}`} />
            </div>
            <span className="text-sm font-medium text-gray-900">{link.label}</span>
          </a>
        ))}
      </div>

      {/* Lost wage calculator */}
      <section aria-labelledby="calculator-heading" className="rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="h-5 w-5 text-yellow-600" aria-hidden="true" />
          <h2 id="calculator-heading" className="text-lg font-semibold text-gray-900">Lost Wage Calculator</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Estimate how much income you might lose during recovery, and how much NLDAC may cover.
        </p>
        <form onSubmit={calcWages} className="space-y-4" aria-label="Lost wage calculator">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="hourly-rate" className="block text-sm font-medium text-gray-700">Hourly rate ($)</label>
              <input id="hourly-rate" type="number" step="0.01" min="0" required value={wages.hourlyRate}
                onChange={(e) => setWages({ ...wages, hourlyRate: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-hope-500 focus:outline-none focus:ring-1 focus:ring-hope-500"
                placeholder="e.g. 25.00" />
            </div>
            <div>
              <label htmlFor="hours-per-week" className="block text-sm font-medium text-gray-700">Hours per week</label>
              <input id="hours-per-week" type="number" min="1" max="80" value={wages.hoursPerWeek}
                onChange={(e) => setWages({ ...wages, hoursPerWeek: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-hope-500 focus:outline-none focus:ring-1 focus:ring-hope-500" />
            </div>
            <div>
              <label htmlFor="recovery-weeks" className="block text-sm font-medium text-gray-700">Recovery weeks</label>
              <input id="recovery-weeks" type="number" min="1" max="12" value={wages.recoveryWeeks}
                onChange={(e) => setWages({ ...wages, recoveryWeeks: e.target.value })}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-hope-500 focus:outline-none focus:ring-1 focus:ring-hope-500" />
            </div>
          </div>
          <button type="submit" className="rounded-md bg-yellow-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-yellow-700">
            Calculate
          </button>
        </form>

        {wageResult && (
          <div className="mt-6 rounded-lg bg-yellow-50 p-4 space-y-2" aria-live="polite" aria-label="Calculation results">
            <h3 className="font-semibold text-yellow-900">Your estimate</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-yellow-800">Estimated wage loss:</span>
              <span className="font-semibold text-yellow-900">${wageResult.estimatedWageLoss?.toLocaleString()}</span>
              <span className="text-yellow-800">NLDAC may cover up to:</span>
              <span className="font-semibold text-green-700">${wageResult.potentialCoverage?.toLocaleString()}</span>
              <span className="text-yellow-800">Estimated out-of-pocket:</span>
              <span className="font-semibold text-yellow-900">${wageResult.estimatedOutOfPocket?.toLocaleString()}</span>
            </div>
            <p className="text-xs text-yellow-700 mt-2">{wageResult.disclaimer}</p>
          </div>
        )}
      </section>

      {/* FMLA letter */}
      <div className="rounded-xl bg-gray-50 border border-gray-200 p-6">
        <Shield className="h-6 w-6 text-yellow-600 mb-2" aria-hidden="true" />
        <h2 className="font-semibold text-gray-900">Generate your FMLA employer letter</h2>
        <p className="text-sm text-gray-600 mt-1 mb-4">
          We'll pre-fill a professional letter for your employer explaining your FMLA rights during recovery.
        </p>
        <a href="/donor-shield/fmla-letter" className="inline-block rounded-md bg-white border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100">
          Generate letter →
        </a>
      </div>
    </div>
  );
}
