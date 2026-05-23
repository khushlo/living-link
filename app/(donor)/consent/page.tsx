"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, FileText, Shield, Heart, BarChart2 } from "lucide-react";

const CONSENT_SECTIONS = [
  {
    id: "hipaa",
    icon: Shield,
    title: "HIPAA Authorization",
    required: true,
    body: `LivingLink collects and processes Protected Health Information (PHI) including health metrics, financial records, and mental health screening results solely to support your kidney donation journey.

Your data may be shared with:
• Your designated transplant center (with your explicit consent)
• Your mentor match (only what you choose to share)
• OPTN/UNOS for required outcome reporting (de-identified)

You have the right to access, correct, or request deletion of your data at any time. Data is stored encrypted at rest (AES-256) and in transit (TLS 1.2+).`,
  },
  {
    id: "data_use",
    icon: BarChart2,
    title: "Data Use & Research",
    required: false,
    body: `Optional: Allow LivingLink to use your anonymized, aggregated data to improve care for future living donors.

This includes:
• De-identified health metrics to refine AI coaching
• Anonymized financial patterns to improve reimbursement guidance
• Aggregate PHQ-2 trend data shared with kidney advocacy organizations

You may opt out of research use at any time without affecting your access to LivingLink services. Withdrawing research consent does not delete your existing records.`,
  },
  {
    id: "messaging",
    icon: Heart,
    title: "Mentor Match Communications",
    required: false,
    body: `If you join Mentor Match, you acknowledge:

• Messages with your mentor are private to both parties only
• LivingLink staff may access messages only under a valid court order or credible safety threat
• You will not share another donor's personal information outside this platform
• Mentors are prior living donors, not licensed medical professionals - their guidance does not substitute for your transplant team's advice`,
  },
  {
    id: "ai_use",
    icon: FileText,
    title: "AI Assistant Consent",
    required: true,
    body: `LivingLink's AI Assistant is powered by OpenAI GPT-4o. By using the assistant you agree:

• Your messages and relevant health context are transmitted to OpenAI for processing
• OpenAI processes data subject to their Enterprise Data Processing Agreement
• Conversations are not stored beyond your current session by default
• The AI Assistant provides informational guidance only - it is not a licensed medical provider
• Do not share Social Security numbers, full dates of birth, or insurance IDs with the assistant`,
  },
];

export default function ConsentPage() {
  const router = useRouter();
  const [consented, setConsented] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const allRequired = CONSENT_SECTIONS.filter((s) => s.required).every(
    (s) => consented[s.id]
  );

  async function handleSubmit() {
    if (!allRequired) return;
    setSubmitting(true);
    try {
      await fetch("/api/consent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consents: Object.entries(consented)
            .filter(([, v]) => v)
            .map(([id]) => id),
        }),
      });
      setDone(true);
      setTimeout(() => router.push("/donor/dashboard"), 2000);
    } catch {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-white p-6">
        <Card className="max-w-md w-full text-center py-12">
          <CardContent>
            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Consent Recorded</h2>
            <p className="text-gray-500 text-sm">Thank you. Redirecting to your dashboard…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Privacy & Consent</h1>
          <p className="text-gray-500 text-sm">
            Please review and acknowledge the following before using LivingLink. Items marked
            <span className="text-red-500 font-medium"> required</span> must be accepted to proceed.
          </p>
        </div>

        <div className="space-y-5">
          {CONSENT_SECTIONS.map((section) => {
            const Icon = section.icon;
            const checked = !!consented[section.id];
            return (
              <Card key={section.id} className={`border-2 transition-colors ${checked ? "border-emerald-400 bg-emerald-50/40" : "border-gray-200"}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3 text-base">
                    <Icon className="h-5 w-5 text-blue-600 shrink-0" />
                    {section.title}
                    {section.required ? (
                      <span className="ml-auto text-xs font-normal text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Required</span>
                    ) : (
                      <span className="ml-auto text-xs font-normal text-gray-400 bg-gray-100 border px-2 py-0.5 rounded-full">Optional</span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed mb-4">{section.body}</p>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div
                      className={`mt-0.5 h-5 w-5 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                        checked ? "bg-emerald-500 border-emerald-500" : "border-gray-300 group-hover:border-emerald-400"
                      }`}
                      onClick={() => setConsented((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
                    >
                      {checked && <CheckCircle className="h-3.5 w-3.5 text-white" />}
                    </div>
                    <span className="text-sm text-gray-700 select-none">
                      {section.required
                        ? "I have read and agree to the above."
                        : "I opt in to this (you can change this later in Settings)."}
                    </span>
                  </label>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {!allRequired && (
          <div className="mt-6 flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Please accept all required items to continue.
          </div>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!allRequired || submitting}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting ? "Saving…" : "Accept & Continue to Dashboard"}
          </Button>
          <Button variant="outline" onClick={() => router.back()} className="sm:w-auto">
            Back
          </Button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          LivingLink is HIPAA-aware. For questions contact{" "}
          <a href="mailto:privacy@livinglink.health" className="underline">privacy@livinglink.health</a>.
        </p>
      </div>
    </div>
  );
}
