"use client";
import { useState } from "react";
import { Briefcase, FileText, DollarSign, CheckCircle, Download, Copy, ArrowRight } from "lucide-react";
import { BackToModule } from "@/components/shared/back-to-module";

interface EmployerForm {
  donorName: string;
  donorTitle: string;
  employerName: string;
  hrName: string;
  surgeryDate: string;
  returnDate: string;
  hourlyRate: string;
  hoursPerWeek: string;
  recoveryWeeks: string;
  surgeonName: string;
  centerName: string;
}

const NLDAC_DAILY_RATE = 420; // USD per day, 2024 NLDAC rate

export default function EmployerPacketPage() {
  const [form, setForm] = useState<EmployerForm>({
    donorName: "",
    donorTitle: "",
    employerName: "",
    hrName: "",
    surgeryDate: "",
    returnDate: "",
    hourlyRate: "",
    hoursPerWeek: "40",
    recoveryWeeks: "4",
    surgeonName: "",
    centerName: "",
  });

  const [step, setStep] = useState<"form" | "packet">("form");
  const [copied, setCopied] = useState<string | null>(null);

  const weeklyWage = (Number(form.hourlyRate) || 0) * (Number(form.hoursPerWeek) || 0);
  const totalWageLoss = weeklyWage * (Number(form.recoveryWeeks) || 4);
  const nldacCoverage = NLDAC_DAILY_RATE * 5 * (Number(form.recoveryWeeks) || 4); // 5 work days/week
  const employerGap = Math.max(0, totalWageLoss - nldacCoverage);

  function set(field: keyof EmployerForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function copyText(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const fmlaLetterText = `${new Date(form.surgeryDate || Date.now()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}

Dear ${form.hrName || "[HR Contact Name]"},
${form.employerName || "[Employer Name]"} Human Resources Department

RE: FMLA Leave Request - Living Kidney Donation

I am writing to formally request Family and Medical Leave Act (FMLA) leave in connection with a planned living kidney donation surgery.

Patient/Employee: ${form.donorName || "[Your Name]"}
Position: ${form.donorTitle || "[Your Title]"}
Planned Surgery Date: ${form.surgeryDate ? new Date(form.surgeryDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "[Date]"}
Estimated Return Date: ${form.returnDate ? new Date(form.returnDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "[Date]"}
Anticipated Leave Duration: ${form.recoveryWeeks} week(s)

Living kidney donation is a covered reason for FMLA leave under 29 CFR § 825.114, which includes planned medical treatment for a serious health condition. Organ donation surgery and recovery qualify as a serious health condition requiring continuing treatment by a healthcare provider.

Treating Surgeon: ${form.surgeonName || "[Surgeon Name]"}
Transplant Center: ${form.centerName || "[Transplant Center]"}

I have been in excellent health and my transplant team has confirmed I am a strong candidate. Living kidney donors typically return to desk work within 2–4 weeks and physically demanding work within 4–6 weeks.

I am committed to ensuring a smooth transition before my leave and will work with my team to prepare for my absence.

Enclosed with this letter:
• Healthcare Provider Certification Form (FMLA Form WH-380-E)
• Summary of NLDAC wage reimbursement program (reduces financial burden on employer and employee)

Please contact me at your earliest convenience to discuss this request.

Respectfully,
${form.donorName || "[Your Name]"}
${form.donorTitle || "[Title]"}`;

  const hrGuideText = `EMPLOYER GUIDE: Supporting a Living Kidney Donor Employee
${form.employerName || "[Your Company]"} - HR Resource

WHAT IS LIVING KIDNEY DONATION?
A living kidney donor gives one of their two kidneys to a patient with kidney failure. Donors live normal lives with one kidney. Over 6,500 Americans make this gift each year.

LEGAL OBLIGATIONS
• FMLA applies: Living organ donation is a qualifying "serious health condition" under 29 CFR § 825.114
• ADA: Donors cannot be discriminated against in hiring, promotion, or benefits
• Leave duration: Typically 2–6 weeks; most donors return to desk work in 2–3 weeks

FINANCIAL IMPACT ON YOUR COMPANY
Estimated wage loss for ${form.donorName || "this employee"}: $${totalWageLoss.toLocaleString()}
NLDAC federal reimbursement covers: $${Math.min(nldacCoverage, totalWageLoss).toLocaleString()}
Estimated net employer cost (if you provide full pay): $${employerGap.toLocaleString()}

THE NATIONAL LIVING DONOR ASSISTANCE CENTER (NLDAC)
NLDAC (nldac.org | 1-888-870-5002) is a federal program that reimburses living kidney donors for:
• Lost wages: up to $420/day (2024 rate)
• Travel expenses
• Lodging and meals
• Child care and dependent care

NLDAC applies directly to the donor, not the employer. This means your employee may recover most or all lost wages through NLDAC regardless of your company's leave policy.

RECOMMENDED EMPLOYER ACTIONS
1. Approve FMLA leave (legally required if employee qualifies)
2. Confirm benefits (health insurance) continue during leave
3. Consider voluntary paid leave supplement - the NLDAC gap is often small
4. Celebrate this employee's decision publicly if they consent - donor-supportive culture attracts talent

RESOURCES
• NLDAC: nldac.org
• HRSA living donation info: organdonor.gov
• FMLA guidance: dol.gov/agencies/whd/fmla

"Employees who donate a kidney take an average of 3.2 weeks off work and return fully to their previous capacity."
- UNOS Living Donor Follow-Up Study, 2023`;

  return (
    <div className="space-y-8 max-w-3xl">
      <BackToModule href="/donor-shield" label="Back to DonorShield" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Employer Partner Toolkit</h1>
        <p className="mt-1 text-gray-600">
          Generate a ready-to-send FMLA letter and HR information packet. Remove the #1 barrier to donation: fear of losing income.
        </p>
      </div>

      {/* Financial snapshot */}
      {form.hourlyRate && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Estimated wage loss", value: `$${totalWageLoss.toLocaleString()}`, color: "text-red-600" },
            { label: "NLDAC may cover", value: `$${Math.min(nldacCoverage, totalWageLoss).toLocaleString()}`, color: "text-green-600" },
            { label: "Employer/gap amount", value: `$${employerGap.toLocaleString()}`, color: "text-blue-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      )}

      {step === "form" && (
        <div className="space-y-6">
          {/* Donor info */}
          <section className="rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" aria-hidden="true" />
              Your information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="donorName" className="block text-sm font-medium text-gray-700">Your full name</label>
                <input id="donorName" type="text" value={form.donorName} onChange={(e) => set("donorName", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Jane Smith" />
              </div>
              <div>
                <label htmlFor="donorTitle" className="block text-sm font-medium text-gray-700">Your job title</label>
                <input id="donorTitle" type="text" value={form.donorTitle} onChange={(e) => set("donorTitle", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Senior Analyst" />
              </div>
              <div>
                <label htmlFor="surgeryDate" className="block text-sm font-medium text-gray-700">Planned surgery date</label>
                <input id="surgeryDate" type="date" value={form.surgeryDate} onChange={(e) => set("surgeryDate", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <div>
                <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700">Estimated return date</label>
                <input id="returnDate" type="date" value={form.returnDate} onChange={(e) => set("returnDate", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
            </div>
          </section>

          {/* Wage info */}
          <section className="rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" aria-hidden="true" />
              Wage & leave details
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">Hourly rate ($)</label>
                <input id="hourlyRate" type="number" min="1" value={form.hourlyRate} onChange={(e) => set("hourlyRate", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="25.00" />
              </div>
              <div>
                <label htmlFor="hoursPerWeek" className="block text-sm font-medium text-gray-700">Hours/week</label>
                <input id="hoursPerWeek" type="number" min="1" max="80" value={form.hoursPerWeek} onChange={(e) => set("hoursPerWeek", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400" />
              </div>
              <div>
                <label htmlFor="recoveryWeeks" className="block text-sm font-medium text-gray-700">Recovery weeks</label>
                <select id="recoveryWeeks" value={form.recoveryWeeks} onChange={(e) => set("recoveryWeeks", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white">
                  {["2","3","4","5","6","8"].map((w) => <option key={w} value={w}>{w} weeks</option>)}
                </select>
              </div>
            </div>
          </section>

          {/* Employer & medical info */}
          <section className="rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" aria-hidden="true" />
              Employer & medical details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="employerName" className="block text-sm font-medium text-gray-700">Employer / company name</label>
                <input id="employerName" type="text" value={form.employerName} onChange={(e) => set("employerName", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Acme Corp" />
              </div>
              <div>
                <label htmlFor="hrName" className="block text-sm font-medium text-gray-700">HR contact name</label>
                <input id="hrName" type="text" value={form.hrName} onChange={(e) => set("hrName", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Alex Johnson" />
              </div>
              <div>
                <label htmlFor="surgeonName" className="block text-sm font-medium text-gray-700">Surgeon name (optional)</label>
                <input id="surgeonName" type="text" value={form.surgeonName} onChange={(e) => set("surgeonName", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="Dr. Sarah Chen" />
              </div>
              <div>
                <label htmlFor="centerName" className="block text-sm font-medium text-gray-700">Transplant center name</label>
                <input id="centerName" type="text" value={form.centerName} onChange={(e) => set("centerName", e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  placeholder="University Medical Center" />
              </div>
            </div>
          </section>

          <button
            onClick={() => setStep("packet")}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Generate employer packet
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      )}

      {step === "packet" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 p-4">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" aria-hidden="true" />
            <p className="text-sm text-green-800">Your packet is ready. Copy each document below and send to your HR department.</p>
          </div>

          {/* FMLA Letter */}
          <section className="rounded-xl border border-gray-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" aria-hidden="true" />
                Document 1: FMLA Leave Request Letter
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copyText("fmla", fmlaLetterText)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  {copied === "fmla" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 border border-gray-200 p-4 text-xs text-gray-700 font-mono leading-relaxed max-h-64 overflow-y-auto">
              {fmlaLetterText}
            </pre>
          </section>

          {/* HR Guide */}
          <section className="rounded-xl border border-gray-200 p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-purple-600" aria-hidden="true" />
                Document 2: HR Information Guide
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => copyText("hr", hrGuideText)}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  {copied === "hr" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            <pre className="whitespace-pre-wrap rounded-lg bg-gray-50 border border-gray-200 p-4 text-xs text-gray-700 font-mono leading-relaxed max-h-64 overflow-y-auto">
              {hrGuideText}
            </pre>
          </section>

          {/* NLDAC tip */}
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex gap-3">
            <DollarSign className="h-5 w-5 text-amber-600 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-900">Don't forget NLDAC</p>
              <p className="text-xs text-amber-800 mt-1">
                NLDAC (National Living Donor Assistance Center) can reimburse up to $420/day for lost wages, travel, and childcare.
                Many donors receive this in addition to any employer pay. Apply at{" "}
                <a href="https://nldac.org" target="_blank" rel="noreferrer" className="underline font-medium">nldac.org</a>.
              </p>
            </div>
          </div>

          <button
            onClick={() => setStep("form")}
            className="text-sm text-blue-600 hover:underline focus:outline-none"
          >
            ← Edit my information
          </button>
        </div>
      )}
    </div>
  );
}
