"use client";
import { useState } from "react";
import { FileText, CheckCircle, XCircle, ChevronRight, Phone, ExternalLink, AlertCircle } from "lucide-react";
import { BackToModule } from "@/components/shared/back-to-module";

type Step = "employment" | "residency" | "surgery" | "income" | "result";

type Answers = {
  employmentType: string;
  isUSResident: boolean | null;
  hasSurgeryDate: boolean | null;
  grossIncome: string;
};

const INCOME_LIMIT = 100000; // simplified; real NLDAC uses sliding scale

export default function NLDACWizardPage() {
  const [step, setStep] = useState<Step>("employment");
  const [answers, setAnswers] = useState<Answers>({
    employmentType: "",
    isUSResident: null,
    hasSurgeryDate: null,
    grossIncome: "",
  });
  const [saved, setSaved] = useState(false);

  async function saveApplication() {
    const response = await fetch("/api/donor-shield/nldac", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...answers, status: eligible ? "ready" : "draft", grossIncome: Number(answers.grossIncome) }),
    });
    setSaved(response.ok);
  }

  function restart() {
    setStep("employment");
    setAnswers({ employmentType: "", isUSResident: null, hasSurgeryDate: null, grossIncome: "" });
  }

  const eligible =
    answers.isUSResident === true &&
    answers.hasSurgeryDate === true &&
    Number(answers.grossIncome) <= INCOME_LIMIT &&
    ["employed_fulltime", "employed_parttime", "self_employed"].includes(answers.employmentType);

  return (
    <div className="max-w-2xl space-y-8">
      <BackToModule href="/donor-shield" label="Back to DonorShield" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">NLDAC Eligibility Wizard</h1>
        <p className="mt-1 text-gray-600">
          Find out if you qualify for the National Living Donor Assistance Center&apos;s financial assistance program.
          This wizard takes about 2 minutes.
        </p>
      </div>

      {/* Progress indicator */}
      {step !== "result" && (
        <div className="flex items-center gap-2" role="list" aria-label="Wizard steps">
          {(["employment", "residency", "surgery", "income"] as Step[]).map((s, i) => {
            const steps: Step[] = ["employment", "residency", "surgery", "income"];
            const current = steps.indexOf(step);
            const idx = steps.indexOf(s);
            return (
              <div key={s} className="flex items-center gap-2" role="listitem">
                <div
                  className={`h-7 w-7 rounded-full text-xs font-bold flex items-center justify-center ${
                    idx < current
                      ? "bg-green-600 text-white"
                      : idx === current
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                  aria-current={idx === current ? "step" : undefined}
                >
                  {idx < current ? <CheckCircle className="h-4 w-4" /> : i + 1}
                </div>
                {i < 3 && <div className={`flex-1 h-0.5 w-8 ${idx < current ? "bg-green-400" : "bg-gray-200"}`} />}
              </div>
            );
          })}
        </div>
      )}

      {/* Step: Employment */}
      {step === "employment" && (
        <div className="rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">What is your employment status?</h2>
          <div className="space-y-3">
            {[
              { value: "employed_fulltime", label: "Employed full-time" },
              { value: "employed_parttime", label: "Employed part-time" },
              { value: "self_employed", label: "Self-employed" },
              { value: "unemployed", label: "Unemployed / not working" },
              { value: "retired", label: "Retired" },
              { value: "other", label: "Other" },
            ].map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50">
                <input
                  type="radio"
                  name="employment"
                  value={opt.value}
                  checked={answers.employmentType === opt.value}
                  onChange={() => setAnswers((a) => ({ ...a, employmentType: opt.value }))}
                  className="h-4 w-4 text-yellow-600"
                />
                <span className="text-sm text-gray-900">{opt.label}</span>
              </label>
            ))}
          </div>
          <button
            disabled={!answers.employmentType}
            onClick={() => setStep("residency")}
            className="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-5 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-40"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Step: Residency */}
      {step === "residency" && (
        <div className="rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Are you a U.S. citizen or lawful permanent resident?</h2>
          <p className="text-sm text-gray-500">NLDAC assistance is currently available to U.S. citizens and lawful permanent residents only.</p>
          <div className="flex gap-4">
            {["Yes", "No"].map((opt) => (
              <label key={opt} className="flex flex-1 items-center gap-3 cursor-pointer p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                <input
                  type="radio"
                  name="residency"
                  checked={answers.isUSResident === (opt === "Yes")}
                  onChange={() => setAnswers((a) => ({ ...a, isUSResident: opt === "Yes" }))}
                  className="h-4 w-4 text-yellow-600"
                />
                <span className="text-sm font-medium text-gray-900">{opt}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("employment")} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Back</button>
            <button
              disabled={answers.isUSResident === null}
              onClick={() => answers.isUSResident === false ? setStep("result") : setStep("surgery")}
              className="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-5 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step: Surgery date */}
      {step === "surgery" && (
        <div className="rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">Do you have a scheduled or completed surgery date?</h2>
          <p className="text-sm text-gray-500">NLDAC requires an established transplant center relationship and a pending or completed donation.</p>
          <div className="flex gap-4">
            {["Yes", "No"].map((opt) => (
              <label key={opt} className="flex flex-1 items-center gap-3 cursor-pointer p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                <input
                  type="radio"
                  name="surgery"
                  checked={answers.hasSurgeryDate === (opt === "Yes")}
                  onChange={() => setAnswers((a) => ({ ...a, hasSurgeryDate: opt === "Yes" }))}
                  className="h-4 w-4 text-yellow-600"
                />
                <span className="text-sm font-medium text-gray-900">{opt}</span>
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("residency")} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Back</button>
            <button
              disabled={answers.hasSurgeryDate === null}
              onClick={() => setStep("income")}
              className="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-5 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step: Income */}
      {step === "income" && (
        <div className="rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="text-lg font-semibold text-gray-900">What is your approximate annual household gross income?</h2>
          <p className="text-sm text-gray-500">NLDAC uses income to determine assistance levels. This is self-reported for eligibility screening only.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="income">Annual household income (USD)</label>
            <input
              id="income"
              type="number"
              min="0"
              step="1000"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="e.g. 55000"
              value={answers.grossIncome}
              onChange={(e) => setAnswers((a) => ({ ...a, grossIncome: e.target.value }))}
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep("surgery")} className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Back</button>
            <button
              disabled={!answers.grossIncome}
              onClick={() => setStep("result")}
              className="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-5 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:opacity-40"
            >
              See my result <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {step === "result" && (
        <div className={`rounded-xl border-2 p-6 space-y-5 ${eligible ? "border-green-300 bg-green-50" : "border-red-200 bg-red-50"}`}>
          {eligible ? (
            <>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-600 shrink-0" aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-semibold text-green-900">You appear to be eligible for NLDAC assistance</h2>
                  <p className="text-sm text-green-800 mt-1">Based on your answers, you likely qualify. NLDAC can reimburse travel, lodging, lost wages, and dependent care up to program limits.</p>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-sm font-semibold text-green-900">Next steps:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-green-800">
                  <li>Call NLDAC toll-free: <strong>1-877-696-2110</strong></li>
                  <li>Have your transplant center name and anticipated surgery date ready</li>
                  <li>Complete the official NLDAC application online or by mail</li>
                  <li>Keep all receipts - reimbursement is retroactive up to 6 months</li>
                </ol>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={saveApplication} className="inline-flex items-center gap-2 rounded-md border border-green-300 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-100">
                  {saved ? "Application saved" : "Save application progress"}
                </button>
                <a
                  href="https://www.livingdonorassistance.org/Get-Help/Application-Request"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  Apply on NLDAC <ExternalLink className="h-4 w-4" />
                </a>
                <a
                  href="tel:18776962110"
                  className="inline-flex items-center gap-2 rounded-md border border-green-300 px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-100"
                >
                  <Phone className="h-4 w-4" /> Call 1-877-696-2110
                </a>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-500 shrink-0" aria-hidden="true" />
                <div>
                  <h2 className="text-lg font-semibold text-red-900">You may not currently qualify for NLDAC</h2>
                  <p className="text-sm text-red-800 mt-1">
                    {answers.isUSResident === false
                      ? "NLDAC currently serves U.S. citizens and lawful permanent residents only."
                      : !["employed_fulltime", "employed_parttime", "self_employed"].includes(answers.employmentType)
                      ? "NLDAC lost-wage assistance requires an active employment relationship. Other reimbursable expenses (travel, lodging) may still apply."
                      : "Income or other factors may affect eligibility. Contact NLDAC directly for a full review."}
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-white border border-red-200 p-4 text-sm text-gray-700 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                  <p>Call NLDAC directly (<strong>1-877-696-2110</strong>) - they can review individual circumstances and may still be able to help, especially for travel and lodging costs.</p>
                </div>
              </div>
              <a
                href="https://www.livingdonorassistance.org/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Learn more at NLDAC.org <ExternalLink className="h-4 w-4" />
              </a>
            </>
          )}
          <button
            onClick={restart}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Start over
          </button>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400">
        This wizard is for informational purposes only and does not constitute a formal NLDAC determination.
        Contact NLDAC at 1-877-696-2110 or <a href="https://www.livingdonorassistance.org/" target="_blank" rel="noreferrer" className="underline">livingdonorassistance.org</a> for official eligibility review.
      </p>
    </div>
  );
}
