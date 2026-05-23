import { Stethoscope, UserCheck, Phone, ClipboardList, Heart, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = { title: "PCP Clarity - LivingLink LifeAfter" };

const PCP_ITEMS = [
  {
    who: "Your primary care doctor (PCP)",
    items: [
      "Annual physical exams and wellness visits",
      "Blood pressure management and medication refills",
      "Cholesterol, diabetes screening, and preventive care",
      "Flu/COVID/pneumonia vaccinations",
      "Mental health referrals",
      "Routine urinalysis and basic metabolic panels",
      "Coordinating all your non-kidney specialists",
    ],
    color: "bg-blue-50 border-blue-200",
    heading: "text-blue-900",
    badge: "bg-blue-100 text-blue-700",
    icon: UserCheck,
  },
  {
    who: "Your nephrologist (kidney specialist)",
    items: [
      "Annual kidney function tests (creatinine, eGFR, cystatin C)",
      "Urine protein monitoring (spot urine protein-to-creatinine ratio)",
      "Blood pressure goal specific to your remaining kidney",
      "Medication review for nephrotoxic drugs",
      "Long-term kidney health counseling",
      "OPTN Policy 18 mandated follow-up at 6 mo, 1 yr, 2 yr",
    ],
    color: "bg-purple-50 border-purple-200",
    heading: "text-purple-900",
    badge: "bg-purple-100 text-purple-700",
    icon: Stethoscope,
  },
];

const CONTACT_TIPS = [
  {
    scenario: "You have a cold, infection, or need a prescription refill",
    goTo: "PCP",
    color: "text-blue-700",
  },
  {
    scenario: "Your blood pressure is consistently high (>135/85)",
    goTo: "Both - PCP first, then nephrologist if not controlled",
    color: "text-orange-600",
  },
  {
    scenario: "You notice foamy or dark urine",
    goTo: "Nephrologist - within 1 week",
    color: "text-purple-700",
  },
  {
    scenario: "You feel anxious, depressed, or overwhelmed post-donation",
    goTo: "PCP for referral + use LifeAfter PHQ-2 screener",
    color: "text-green-700",
  },
  {
    scenario: "You're prescribed NSAIDs (ibuprofen, naproxen) long-term",
    goTo: "Nephrologist - NSAIDs are nephrotoxic",
    color: "text-red-700",
  },
  {
    scenario: "You're planning a pregnancy after donation",
    goTo: "Both - nephrologist + OB-GYN coordination",
    color: "text-pink-700",
  },
];

export default function PCPClarityPage() {
  return (
    <div className="max-w-3xl space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">PCP Clarity Tool</h1>
        <p className="mt-1 text-gray-600">
          After donation, two doctors share responsibility for your health. This tool clarifies who manages what so nothing falls through the cracks.
        </p>
      </div>

      {/* Two-column responsibility split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PCP_ITEMS.map((section) => (
          <div key={section.who} className={`rounded-xl border p-5 space-y-4 ${section.color}`}>
            <div className="flex items-center gap-2">
              <section.icon className={`h-5 w-5 ${section.heading}`} aria-hidden="true" />
              <h2 className={`font-semibold ${section.heading}`}>{section.who}</h2>
            </div>
            <ul className="space-y-2" role="list">
              {section.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <ClipboardList className={`h-4 w-4 shrink-0 mt-0.5 ${section.heading}`} aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* When to call whom */}
      <section aria-labelledby="scenarios-heading">
        <h2 id="scenarios-heading" className="text-lg font-semibold text-gray-900 mb-4">Who do I call for&hellip;?</h2>
        <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {CONTACT_TIPS.map((tip) => (
            <div key={tip.scenario} className="flex items-start gap-4 p-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{tip.scenario}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className={`text-sm font-semibold ${tip.color}`}>{tip.goTo}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OPTN Policy 18 follow-up schedule */}
      <section aria-labelledby="policy-heading" className="rounded-xl bg-gray-50 border border-gray-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-orange-600" aria-hidden="true" />
          <h2 id="policy-heading" className="font-semibold text-gray-900">OPTN Policy 18 - Required follow-up</h2>
        </div>
        <p className="text-sm text-gray-600">
          Federal policy requires your transplant center to collect and report your health data at these intervals.
          Your nephrologist usually coordinates this, but you can ask your PCP to assist with labs.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {[
            { time: "6 months", tests: "eGFR, BP, urine protein, BMI" },
            { time: "1 year",   tests: "eGFR, BP, urine protein, BMI, creatinine" },
            { time: "2 years",  tests: "eGFR, BP, urine protein, BMI, creatinine" },
          ].map((row) => (
            <div key={row.time} className="rounded-lg border border-orange-200 bg-orange-50 p-3">
              <p className="font-semibold text-orange-900">{row.time}</p>
              <p className="text-orange-800 text-xs mt-1">{row.tests}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">Source: OPTN Policy 18.1 (Living Donor Follow-Up). Non-compliance may affect your transplant center&apos;s accreditation.</p>
      </section>

      {/* Tips */}
      <section className="rounded-xl bg-green-50 border border-green-200 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 text-green-600" aria-hidden="true" />
          <h2 className="font-semibold text-green-900">Tips for staying on top of your care</h2>
        </div>
        <ul className="space-y-2 text-sm text-green-800" role="list">
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            At every PCP visit, remind your doctor you are a living kidney donor so they can adjust care accordingly.
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            Ask for a copy of your eGFR and creatinine results after every lab - keep a personal log in LifeAfter check-ins.
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            Avoid ibuprofen, naproxen, and other NSAIDs for chronic pain - use acetaminophen instead.
          </li>
          <li className="flex items-start gap-2">
            <ArrowRight className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            Keep your transplant center&apos;s coordinator number saved - they can help navigate specialty referrals.
          </li>
        </ul>
      </section>

      {/* CTA back to check-ins */}
      <div className="flex items-center gap-3">
        <Link
          href="/life-after"
          className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to LifeAfter dashboard
        </Link>
        <Link
          href="tel:+1"
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <Phone className="h-4 w-4" aria-hidden="true" /> Call my transplant center
        </Link>
      </div>
    </div>
  );
}
