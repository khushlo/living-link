import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";
import { mapBMIToFHIRObservation, mapBPToFHIRObservation, mapDonorToFHIRPatient, mapEGFRToFHIRObservation } from "@/lib/fhir/mappers";
import { writeFHIRResources } from "@/lib/fhir/write";
import { z } from "zod";
import OpenAI from "openai";
import { hasLatestConsent } from "@/lib/consent";

export const dynamic = "force-dynamic";

const checkSchema = z.object({
  bmi: z.number().min(10).max(80).optional(),
  bpSystolic: z.number().min(60).max(250).optional(),
  bpDiastolic: z.number().min(40).max(150).optional(),
  egfr: z.number().min(0).max(200).optional(),
  smokingStatus: z.enum(["never", "former", "current"]).optional(),
  hasDiabetes: z.boolean().optional(),
  age: z.number().min(18).max(80).optional(),
});

function buildDeterministicSummary(metrics: z.infer<typeof checkSchema>) {
  const discussionTopics: string[] = [];
  const strengths: string[] = [];
  if (metrics.bmi != null) {
    (metrics.bmi >= 18.5 && metrics.bmi < 30 ? strengths : discussionTopics).push("your BMI");
  }
  if (metrics.bpSystolic != null || metrics.bpDiastolic != null) {
    const systolic = metrics.bpSystolic ?? 0;
    const diastolic = metrics.bpDiastolic ?? 0;
    (systolic < 130 && diastolic < 80 ? strengths : discussionTopics).push("your blood pressure");
  }
  if (metrics.egfr != null) (metrics.egfr >= 90 ? strengths : discussionTopics).push("your kidney function estimate");
  if (metrics.smokingStatus === "never" || metrics.smokingStatus === "former") strengths.push("your smoking history");
  if (metrics.smokingStatus === "current") discussionTopics.push("smoking cessation");
  if (metrics.hasDiabetes) discussionTopics.push("blood sugar management");

  const lines = [
    "This is a preliminary review of the information you entered, not a medical diagnosis or donation decision.",
    strengths.length ? `Areas that look encouraging from your answers: ${strengths.join(", ")}.` : "There is not enough information to identify an encouraging area yet.",
    discussionTopics.length ? `Topics to discuss with a clinician: ${discussionTopics.join(", ")}.` : "A transplant team will still need to review your full health history and testing.",
    "Next step: share these results with a transplant center or your clinician and ask what testing is needed.",
  ];
  return lines.join(" ");
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = checkSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId! },
       include: { donorProfile: true },
    });
    if (!user?.donorProfile) return NextResponse.json({ error: "Donor profile not found" }, { status: 404 });

    const prompt = `You are a supportive health navigator (NOT a doctor) helping someone explore living kidney donation.

Based on these self-reported health metrics, provide an encouraging, plain-language (6th grade reading level) summary of their current readiness and actionable next steps. Never say they are "qualified" or "disqualified" - only what areas look favorable and what areas they may want to discuss with a doctor.

Metrics:
- BMI: ${parsed.data.bmi ?? "not provided"}
- Blood Pressure: ${parsed.data.bpSystolic ?? "?"}/${parsed.data.bpDiastolic ?? "?"} mmHg
- eGFR: ${parsed.data.egfr ?? "not provided"} mL/min
- Smoking: ${parsed.data.smokingStatus ?? "not provided"}
- Diabetes: ${parsed.data.hasDiabetes ?? "not provided"}
- Age: ${parsed.data.age ?? "not provided"}

Keep response under 150 words. Be warm and encouraging. End with one specific next step they can take today.`;

    // Health metrics are PHI when linked to an authenticated donor. Keep the
    // default deployment deterministic until an approved AI PHI configuration exists.
    const useApprovedAI = process.env.ALLOW_PHI_TO_AI === "true" && Boolean(process.env.OPENAI_API_KEY) &&
      await hasLatestConsent(user.donorProfile.id, "ai_processing");
    const aiSummary = useApprovedAI
      ? (await new OpenAI({ apiKey: process.env.OPENAI_API_KEY }).chat.completions.create({
          model: process.env.OPENAI_MODEL || "gpt-4o",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200,
        })).choices[0]?.message?.content ?? ""
      : buildDeterministicSummary(parsed.data);

    const check = await prisma.eligibilityCheck.create({
      data: { donorProfileId: user.donorProfile.id, ...parsed.data, aiSummary },
    });
    const fhirResources: object[] = [
      mapDonorToFHIRPatient({ id: user.donorProfile.id, firstName: user.firstName, lastName: user.lastName, preferredLang: user.preferredLang }),
    ];
    if (check.bmi != null) fhirResources.push(mapBMIToFHIRObservation(user.donorProfile.id, check.bmi, check.assessedAt));
    if (check.bpSystolic != null && check.bpDiastolic != null) {
      fhirResources.push(mapBPToFHIRObservation(user.donorProfile.id, check.bpSystolic, check.bpDiastolic, check.assessedAt));
    }
    if (check.egfr != null) fhirResources.push(mapEGFRToFHIRObservation(user.donorProfile.id, check.egfr, check.assessedAt));
    let fhirWrite: { attempted: boolean; written: boolean; reason?: string } = { attempted: false, written: false };
    if (!(await hasLatestConsent(user.donorProfile.id, "ehr_exchange"))) {
      fhirWrite.reason = "ehr_exchange_consent_required";
    } else try {
      fhirWrite = await writeFHIRResources(fhirResources);
    } catch (fhirError) {
      console.error("FHIR write failed", fhirError);
    }
    await recordAuditEvent(req, userId, "CREATE", "EligibilityCheck", check.id);

    return NextResponse.json({ check, aiSummary, summarySource: useApprovedAI ? "approved-ai" : "deterministic-guidance", fhirWrite }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Assessment failed" }, { status: 500 });
  }
}
