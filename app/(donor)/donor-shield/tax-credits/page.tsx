import { DollarSign, ExternalLink, Info, CheckCircle, XCircle } from "lucide-react";
import { BackToModule } from "@/components/shared/back-to-module";

export const metadata = { title: "State Tax Credits - DonorShield" };

type StateTax = {
  state: string;
  abbr: string;
  hasCredit: boolean;
  creditType?: string;
  maxAmount?: string;
  notes?: string;
  link?: string;
};

const STATE_TAX_DATA: StateTax[] = [
  { state: "Arkansas",       abbr: "AR", hasCredit: true,  creditType: "Income tax deduction", maxAmount: "$10,000",  notes: "Deduction for travel, lodging, lost wages. Must be living donor.", link: "https://www.dfa.arkansas.gov" },
  { state: "Connecticut",    abbr: "CT", hasCredit: true,  creditType: "Tax credit",            maxAmount: "$10,000",  notes: "Credit for unreimbursed expenses. Refundable.", link: "https://portal.ct.gov/DRS" },
  { state: "Georgia",        abbr: "GA", hasCredit: true,  creditType: "Income tax credit",     maxAmount: "$10,000",  notes: "Covers lost wages and expenses not covered by NLDAC.", link: "https://dor.georgia.gov" },
  { state: "Idaho",          abbr: "ID", hasCredit: true,  creditType: "Income tax deduction",  maxAmount: "$5,000",   notes: "Deduction for travel, lodging, lost wages.", link: "https://tax.idaho.gov" },
  { state: "Illinois",       abbr: "IL", hasCredit: true,  creditType: "Tax credit",            maxAmount: "$10,000",  notes: "Living organ donation credit. Non-refundable.", link: "https://tax.illinois.gov" },
  { state: "Iowa",           abbr: "IA", hasCredit: true,  creditType: "Tax deduction",         maxAmount: "$10,000",  notes: "Unreimbursed expenses including lost wages.", link: "https://tax.iowa.gov" },
  { state: "Kansas",         abbr: "KS", hasCredit: true,  creditType: "Income tax credit",     maxAmount: "$2,500",   notes: "Credit for lost wages only.", link: "https://www.ksrevenue.gov" },
  { state: "Louisiana",      abbr: "LA", hasCredit: true,  creditType: "Tax credit",            maxAmount: "$5,000",   notes: "Covers travel, lodging, lost wages.", link: "https://revenue.louisiana.gov" },
  { state: "Maryland",       abbr: "MD", hasCredit: true,  creditType: "Tax deduction",         maxAmount: "$7,500",   notes: "Unreimbursed living donor expenses.", link: "https://marylandtaxes.gov" },
  { state: "Massachusetts",  abbr: "MA", hasCredit: true,  creditType: "Tax deduction",         maxAmount: "$10,000",  notes: "Lost wages, travel, and lodging. File with Schedule Y.", link: "https://www.mass.gov/dor" },
  { state: "Minnesota",      abbr: "MN", hasCredit: true,  creditType: "Tax credit",            maxAmount: "$10,000",  notes: "Covers 20% of unreimbursed qualifying expenses.", link: "https://www.revenue.state.mn.us" },
  { state: "Mississippi",    abbr: "MS", hasCredit: true,  creditType: "Income tax deduction",  maxAmount: "$10,000",  notes: "Deduction for qualified organ donation expenses.", link: "https://www.dor.ms.gov" },
  { state: "Montana",        abbr: "MT", hasCredit: true,  creditType: "Tax credit",            maxAmount: "$5,000",   notes: "Non-refundable credit for living organ donors.", link: "https://mtrevenue.gov" },
  { state: "New Mexico",     abbr: "NM", hasCredit: true,  creditType: "Income tax deduction",  maxAmount: "$5,000",   notes: "Deduction for unreimbursed donor expenses.", link: "https://www.tax.newmexico.gov" },
  { state: "New York",       abbr: "NY", hasCredit: true,  creditType: "Tax credit",            maxAmount: "$10,000",  notes: "Covers 25% of qualifying unreimbursed expenses.", link: "https://www.tax.ny.gov" },
  { state: "North Dakota",   abbr: "ND", hasCredit: true,  creditType: "Tax deduction",         maxAmount: "$10,000",  notes: "Deduction for lost wages and organ donation expenses.", link: "https://www.nd.gov/tax" },
  { state: "Ohio",           abbr: "OH", hasCredit: true,  creditType: "Income tax deduction",  maxAmount: "$10,000",  notes: "Deduction from Ohio adjusted gross income.", link: "https://tax.ohio.gov" },
  { state: "Oregon",         abbr: "OR", hasCredit: true,  creditType: "Tax credit",            maxAmount: "$10,000",  notes: "Credit for unreimbursed expenses. Non-refundable.", link: "https://www.oregon.gov/dor" },
  { state: "Pennsylvania",   abbr: "PA", hasCredit: false, notes: "No state tax credit currently. Check NLDAC for federal options." },
  { state: "South Carolina", abbr: "SC", hasCredit: true,  creditType: "Income tax deduction",  maxAmount: "$10,000",  notes: "Deduction for living kidney donor expenses.", link: "https://dor.sc.gov" },
  { state: "Utah",           abbr: "UT", hasCredit: true,  creditType: "Tax credit",            maxAmount: "$10,000",  notes: "Non-refundable tax credit. Must complete UT Form TC-406.", link: "https://tax.utah.gov" },
  { state: "Virginia",       abbr: "VA", hasCredit: true,  creditType: "Income tax deduction",  maxAmount: "$5,000",   notes: "Deduction for unreimbursed living donor expenses.", link: "https://www.tax.virginia.gov" },
  { state: "Wisconsin",      abbr: "WI", hasCredit: true,  creditType: "Tax deduction",         maxAmount: "$10,000",  notes: "Deduction from Wisconsin adjusted gross income.", link: "https://www.revenue.wi.gov" },
  { state: "California",     abbr: "CA", hasCredit: false, notes: "No state-specific living donor tax credit. Federal deductions may apply." },
  { state: "Florida",        abbr: "FL", hasCredit: false, notes: "No state income tax. Check NLDAC for reimbursement options." },
  { state: "Texas",          abbr: "TX", hasCredit: false, notes: "No state income tax. Check NLDAC for reimbursement options." },
  { state: "Washington",     abbr: "WA", hasCredit: false, notes: "No state income tax. Check NLDAC for reimbursement options." },
];

STATE_TAX_DATA.sort((a, b) => a.state.localeCompare(b.state));
const withCredit = STATE_TAX_DATA.filter((s) => s.hasCredit);
const withoutCredit = STATE_TAX_DATA.filter((s) => !s.hasCredit);

export default function TaxCreditsPage() {
  return (
    <div className="max-w-4xl space-y-10">
      <BackToModule href="/donor-shield" label="Back to DonorShield" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">State Tax Credit Guide</h1>
        <p className="mt-1 text-gray-600">
          Many states offer tax deductions or credits for living organ donors. Find your state below and learn what financial relief is available.
        </p>
      </div>

      {/* Summary banner */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "States with tax benefits", value: withCredit.length, color: "text-green-600" },
          { label: "Max credit (highest)", value: "$10,000", color: "text-blue-600" },
          { label: "Also check NLDAC", value: "All states", color: "text-yellow-600" },
        ].map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-200 p-4 text-center">
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Important note */}
      <div className="flex items-start gap-3 rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-800">
        <Info className="h-5 w-5 shrink-0 mt-0.5 text-yellow-600" aria-hidden="true" />
        <div>
          <strong>Important:</strong> Tax laws change frequently. This guide was last reviewed May 2026. Always verify current rules with your state tax authority or a CPA before filing. These benefits are separate from - and stackable with - NLDAC reimbursements.
        </div>
      </div>

      {/* States WITH credit */}
      <section aria-labelledby="with-credit">
        <h2 id="with-credit" className="text-lg font-semibold text-gray-900 mb-4">
          States with living donor tax benefits ({withCredit.length})
        </h2>
        <div className="space-y-3">
          {withCredit.map((s) => (
            <div key={s.abbr} className="rounded-xl border border-green-200 bg-green-50 p-4 flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex items-center gap-3 sm:w-48 shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold text-green-900">{s.state}</p>
                  <span className="text-xs text-green-700 bg-green-100 rounded-full px-2 py-0.5">{s.abbr}</span>
                </div>
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">{s.creditType}</span>
                  {s.maxAmount && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white border border-green-300 px-2 py-0.5 text-xs font-bold text-green-700">
                      <DollarSign className="h-3 w-3" aria-hidden="true" /> Up to {s.maxAmount}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{s.notes}</p>
              </div>
              {s.link && (
                <a href={s.link} target="_blank" rel="noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 text-xs text-green-700 underline hover:text-green-900">
                  State tax site <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* States WITHOUT credit */}
      <section aria-labelledby="no-credit">
        <h2 id="no-credit" className="text-lg font-semibold text-gray-900 mb-4">
          States without a specific living donor tax benefit ({withoutCredit.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {withoutCredit.map((s) => (
            <div key={s.abbr} className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex items-start gap-3">
              <XCircle className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{s.state}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Federal & NLDAC note */}
      <section className="rounded-xl bg-blue-50 border border-blue-200 p-5 space-y-3">
        <h3 className="font-semibold text-blue-900">Federal options available to all donors</h3>
        <ul className="space-y-2 text-sm text-blue-800" role="list">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" aria-hidden="true" />
            <span><strong>NLDAC (all states):</strong> Reimburses travel, lodging, lost wages, and dependent care up to program limits. Call 1-877-696-2110.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" aria-hidden="true" />
            <span><strong>Medical expense deduction (Schedule A):</strong> If total medical expenses exceed 7.5% of AGI, unreimbursed donation costs may be deductible federally.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-blue-600" aria-hidden="true" />
            <span><strong>FMLA:</strong> Employers with 50+ employees must grant up to 12 weeks unpaid leave. Use the FMLA letter generator in DonorShield.</span>
          </li>
        </ul>
        <a href="/donor-shield/nldac" className="inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Check NLDAC eligibility →
        </a>
      </section>

      <p className="text-xs text-gray-400">
        Source: NLDAC State Benefits Guide, National Kidney Foundation, individual state revenue departments. Not tax advice.
        Consult a licensed CPA or tax professional for advice specific to your situation.
      </p>
    </div>
  );
}
