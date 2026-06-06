import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";
import OpenAI from "openai";

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

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 200,
    });

    const aiSummary = completion.choices[0]?.message?.content ?? "";

    const check = await prisma.eligibilityCheck.create({
      data: { donorProfileId: user.donorProfile.id, ...parsed.data, aiSummary },
    });

    return NextResponse.json({ check, aiSummary }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Assessment failed" }, { status: 500 });
  }
}
