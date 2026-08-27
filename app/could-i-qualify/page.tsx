"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Heart, ArrowRight, CheckCircle, XCircle, AlertCircle, ChevronRight, ArrowLeft } from "lucide-react";
import { SignedIn, SignedOut, SignUpButton } from "@clerk/nextjs";
import { PublicPageShell } from "@/components/shared/public-page-shell";

type Step = "welcome" | "q1" | "q2" | "q3" | "q4" | "q5" | "result";

interface Answers {
  age: string;
  bmiRange: string;
  generalHealth: string;
  chronicConditions: string;
  interest: string;
}

const initialAnswers: Answers = {
  age: "",
  bmiRange: "",
  generalHealth: "",
  chronicConditions: "",
  interest: "",
};

function screenAnswers(a: Answers): "explore" | "review" | "prepare" {
  let score = 0;
  if (a.age === "18-59") score += 2;
  else if (a.age === "60-70") score += 1;
  else score -= 2;
  if (a.bmiRange === "18-30") score += 2;
  else if (a.bmiRange === "31-35") score += 1;
  else if (a.bmiRange === "over35") score -= 1;
  if (a.generalHealth === "excellent" || a.generalHealth === "good") score += 2;
  else if (a.generalHealth === "fair") score += 1;
  else score -= 1;
  if (a.chronicConditions === "none") score += 2;
  else if (a.chronicConditions === "managed") score += 1;
  else score -= 1;
  if (score >= 7) return "explore";
  if (score >= 4) return "review";
  return "prepare";
}

const steps: Step[] = ["welcome", "q1", "q2", "q3", "q4", "q5", "result"];

export default function CouldIQualifyPage() {
  const [step, setStep] = useState<Step>("welcome");
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const headingRef = useRef<HTMLHeadingElement>(null);

  function next(nextStep: Step) {
    setStep(nextStep);
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const discussionTopics = [
    answers.age === "under18" || answers.age === "over70" ? "Age requirements and center-specific policies" : null,
    answers.bmiRange === "over35" || answers.bmiRange === "unsure" ? "BMI and whether additional measurements are needed" : null,
    answers.generalHealth === "fair" || answers.generalHealth === "poor" ? "Current health conditions and available support" : null,
    answers.chronicConditions !== "none" ? "How your conditions are managed and what testing may be needed" : null,
  ].filter((topic): topic is string => Boolean(topic));
  const result = screenAnswers(answers);
  const progress = ((steps.indexOf(step)) / (steps.length - 1)) * 100;

  return (
    <PublicPageShell>
      <div className="mx-auto max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
        {step !== "welcome" && step !== "result" && (
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span>Question {steps.indexOf(step)} of 5</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100" role="progressbar" aria-label="Screener progress" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
              <div
                className="h-2 rounded-full bg-blue-600 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Welcome */}
        {step === "welcome" && (
          <div className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-xl shadow-slate-900/5 sm:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-semibold text-teal-800">
              60-second check · No account needed
            </div>
             <h1 ref={headingRef} tabIndex={-1} className="text-4xl font-bold leading-tight tracking-[-0.035em] text-slate-950 sm:text-5xl">
              Could you be a<br />
              <span className="text-teal-700">living kidney donor?</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
               5 quick questions can help you prepare for a conversation with a transplant team. They cannot
               determine whether you are eligible, but they can highlight topics to discuss.
            </p>
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={() => next("q1")}
                className="flex items-center gap-2 rounded-xl bg-slate-950 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-slate-900/15 transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Find out in 60 seconds
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
              <p className="text-xs text-gray-400">Not a medical assessment · Always consult your doctor</p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                 { value: "60 sec", label: "Informational screener" },
                 { value: "5", label: "Topics to consider" },
                 { value: "Free", label: "No account required" },
              ].map(({ value, label }) => (
                <div key={label} className="rounded-xl bg-gray-50 border border-gray-100 p-4 text-center">
                  <p className="text-2xl font-bold text-blue-600">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Q1: Age */}
        {step === "q1" && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Question 1 of 5</p>
               <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900">How old are you?</h2>
              <p className="text-gray-500 mt-1 text-sm">Transplant centers generally consider donors between 18–70 years old.</p>
            </div>
            <div className="space-y-3">
              {[
                { value: "under18", label: "Under 18" },
                { value: "18-59", label: "18 – 59 years old" },
                { value: "60-70", label: "60 – 70 years old" },
                { value: "over70", label: "Over 70" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => { setAnswers({ ...answers, age: value }); next("q2"); }}
                  className="flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-5 py-4 text-left text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {label}
                  <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Q2: BMI */}
        {step === "q2" && (
          <div className="space-y-6">
            <button onClick={() => next("q1")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Question 2 of 5</p>
               <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900">What's your approximate BMI?</h2>
              <p className="text-gray-500 mt-1 text-sm">BMI = weight (lbs) ÷ height (in)² × 703. Most centers prefer BMI under 35. Not sure? Pick your best estimate.</p>
            </div>
            <div className="space-y-3">
              {[
                { value: "18-30", label: "Under 30 - healthy range" },
                { value: "31-35", label: "31 – 35" },
                { value: "over35", label: "Over 35" },
                { value: "unsure", label: "I'm not sure" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => { setAnswers({ ...answers, bmiRange: value }); next("q3"); }}
                  className="flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-5 py-4 text-left text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {label}
                  <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Q3: General health */}
        {step === "q3" && (
          <div className="space-y-6">
            <button onClick={() => next("q2")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Question 3 of 5</p>
               <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900">How would you describe your overall health?</h2>
            </div>
            <div className="space-y-3">
              {[
                { value: "excellent", label: "Excellent - I feel great, no health concerns" },
                { value: "good", label: "Good - generally healthy, minor issues occasionally" },
                { value: "fair", label: "Fair - managing some health conditions" },
                { value: "poor", label: "Poor - significant ongoing health issues" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => { setAnswers({ ...answers, generalHealth: value }); next("q4"); }}
                  className="flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-5 py-4 text-left text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {label}
                  <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Q4: Chronic conditions */}
        {step === "q4" && (
          <div className="space-y-6">
            <button onClick={() => next("q3")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Question 4 of 5</p>
               <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900">Do you have any of these conditions?</h2>
              <p className="text-gray-500 mt-1 text-sm">Diabetes, kidney disease, high blood pressure, or cancer.</p>
            </div>
            <div className="space-y-3">
              {[
                { value: "none", label: "None of the above" },
                { value: "managed", label: "Yes, but well-controlled with medication" },
                { value: "active", label: "Yes, and currently active / not fully controlled" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => { setAnswers({ ...answers, chronicConditions: value }); next("q5"); }}
                  className="flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-5 py-4 text-left text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {label}
                  <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Q5: Interest */}
        {step === "q5" && (
          <div className="space-y-6">
            <button onClick={() => next("q4")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-4 w-4" /> Back
            </button>
            <div>
              <p className="text-sm font-medium text-blue-600 mb-1">Question 5 of 5</p>
               <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-gray-900">What best describes you right now?</h2>
            </div>
            <div className="space-y-3">
              {[
                { value: "curious", label: "Just curious - exploring the idea" },
                { value: "considering", label: "Seriously considering it" },
                { value: "specific", label: "I have someone specific in mind to help" },
                { value: "directed", label: "A doctor or coordinator suggested I look into this" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => { setAnswers({ ...answers, interest: value }); next("result"); }}
                  className="flex w-full items-center justify-between rounded-xl border-2 border-gray-200 bg-white px-5 py-4 text-left text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {label}
                  <ChevronRight className="h-4 w-4 text-gray-400" aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Result */}
        {step === "result" && (
          <div className="space-y-8">
            {result === "explore" && (
              <>
                <div className="rounded-2xl bg-green-50 border-2 border-green-300 p-8 text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" aria-hidden="true" />
                   <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-green-900 mb-2">You may be a potential donor</h2>
                  <p className="text-green-800">
                     Your answers line up with several common starting factors transplant teams consider. This is
                     only an initial screen, not an eligibility decision. A transplant center evaluation is the only way to know.
                  </p>
                </div>
                <div className="rounded-xl bg-white border border-gray-200 p-6 space-y-3">
                  <h3 className="font-semibold text-gray-900">Your recommended next steps</h3>
                  {[
                     "Create a free LivingLink account to organize questions and health information for a transplant team",
                    "Connect with a real donor who matches your background through Mentor Match",
                     "Review possible financial support and reimbursement programs before making decisions",
                  ].map((s, i) => (
                    <div key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      {s}
                    </div>
                  ))}
                </div>
              </>
            )}

            {result === "review" && (
              <>
                <div className="rounded-2xl bg-blue-50 border-2 border-blue-300 p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" aria-hidden="true" />
                    <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-blue-900 mb-2">Donation may be possible</h2>
                  <p className="text-blue-800">
                     Your answers suggest that donation may be worth exploring, with some topics to review with a
                     transplant team. This screen cannot confirm eligibility or predict an evaluation outcome.
                   </p>
                   {discussionTopics.length > 0 && <div className="mt-4 rounded-lg bg-white/70 p-4 text-left"><h3 className="font-semibold text-blue-900">Topics to ask about</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-blue-800">{discussionTopics.map((topic) => <li key={topic}>{topic}</li>)}</ul></div>}
                </div>
                <div className="rounded-xl bg-white border border-gray-200 p-6 space-y-3">
                  <h3 className="font-semibold text-gray-900">What to do next</h3>
                  {[
                     "Use LivingLink's ReadyCheck to organize non-diagnostic health goals before your evaluation",
                    "Talk to a prior donor who had similar questions - they've been through it",
                    "A transplant center evaluation is free and you can stop at any point",
                  ].map((s, i) => (
                    <div key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      {s}
                    </div>
                  ))}
                </div>
              </>
            )}

            {result === "prepare" && (
              <>
                <div className="rounded-2xl bg-amber-50 border-2 border-amber-300 p-8 text-center">
                  <XCircle className="h-12 w-12 text-amber-600 mx-auto mb-4" aria-hidden="true" />
                    <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-amber-900 mb-2">You may need more review first</h2>
                  <p className="text-amber-800">
                     Your answers point to age or health topics that may need closer review. This does not mean
                     donation is impossible, and you should not change treatment based on this screen.
                  </p>
                </div>
                <div className="rounded-xl bg-white border border-gray-200 p-6 space-y-3">
                  <h3 className="font-semibold text-gray-900">How LivingLink can help</h3>
                  {[
                    "ReadyCheck gives you a personalized health roadmap with measurable goals",
                     "Use plain-language education to prepare questions for your clinician",
                     "Ask a transplant team what evaluation steps and support are available for you",
                  ].map((s, i) => (
                    <div key={i} className="flex gap-3 text-sm text-gray-700">
                      <span className="flex-shrink-0 h-5 w-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">{i + 1}</span>
                      {s}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* CTA */}
            <div className="rounded-2xl bg-gray-900 p-8 text-center space-y-4">
              <h3 className="text-xl font-bold text-white">Ready for your full evaluation?</h3>
              <p className="text-gray-400 text-sm">
                LivingLink gives you everything you need - health goals, financial protection,
                peer mentorship, and lifetime support.
              </p>
               <SignedIn>
                 <Link href="/dashboard" className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors mx-auto focus:outline-none focus:ring-2 focus:ring-blue-400">
                   Continue to your dashboard
                   <ArrowRight className="h-4 w-4" aria-hidden="true" />
                 </Link>
               </SignedIn>
               <SignedOut>
                 <SignUpButton mode="modal">
                   <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-500 transition-colors mx-auto focus:outline-none focus:ring-2 focus:ring-blue-400">
                     Create your free account
                     <ArrowRight className="h-4 w-4" aria-hidden="true" />
                   </button>
                 </SignUpButton>
               </SignedOut>
              <p className="text-xs text-gray-500">Free · No credit card · No commitment</p>
            </div>

            <div className="text-center">
              <button
                onClick={() => { setAnswers(initialAnswers); setStep("welcome"); }}
                className="text-sm text-blue-600 hover:underline focus:outline-none"
              >
                Start over
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center border-t pt-4">
              This screener is for informational purposes only. It is not a medical assessment and does not
              constitute medical advice. Only a transplant center can evaluate your eligibility for living kidney donation.
            </p>
          </div>
        )}
      </div>

    </PublicPageShell>
  );
}
