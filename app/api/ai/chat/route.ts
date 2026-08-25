import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { recordAuditEvent } from "@/lib/audit";
import { z } from "zod";

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(1_000),
  history: z.array(z.object({
    role: z.enum(["user", "assistant"]),
    content: z.string().max(1_000),
  })).max(12).default([]),
  module: z.enum(["ready-check", "donor-shield", "mentor-match", "center-flow", "life-after", "dashboard"]).optional(),
}).strict();

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const BASE_SYSTEM_PROMPT = `You are the LivingLink Assistant - a compassionate, knowledgeable guide for the living kidney donation journey.

You help donors, patients, caregivers, transplant coordinators, and clinicians by:
- Answering questions about the donation process in plain, 6th-grade reading level language
- Explaining medical terms without being alarmist
- Guiding users to the right LivingLink module
- Providing emotional support and encouragement (trauma-informed, inclusive)
- Referring to real resources (NLDAC 1-877-696-2110, OPTN, NKF, HRSA) when appropriate

You are NOT a doctor. Do NOT provide medical diagnoses or specific medical advice. Always recommend consulting a transplant team for medical decisions.

LivingLink modules:
- **ReadyCheck**: Health readiness screening (BMI, BP, eGFR, smoking), AI health coach, personal goal tracker with charts
- **DonorShield**: Financial planning - lost-wage calculator, NLDAC eligibility wizard, expense log, state tax credit guide, FMLA letter generator, insurance issue tracker
- **Mentor Match**: Connect with approved prior living donors; browse mentors by language/specialty; private messaging
- **CenterFlow**: Evaluation stage tracker for coordinators and clinicians; protocol knowledge base; bottleneck detection
- **LifeAfter**: Post-donation timeline, structured health check-ins, PHQ-2 mental health screener, PCP clarity tool (who manages what after donation)

Keep responses concise (under 180 words unless the user specifically asks for detail). Be warm, encouraging, and never judgmental.`;

function buildModuleContext(module?: string): string {
  if (!module) return "";
  const context: Record<string, string> = {
    "ready-check":   "The user is currently in the ReadyCheck module, exploring their health readiness for donation.",
    "donor-shield":  "The user is currently in DonorShield, working on the financial side of donation.",
    "mentor-match":  "The user is currently in Mentor Match, looking to connect with a peer mentor.",
    "center-flow":   "The user is currently in CenterFlow, a transplant center coordinator or clinician tracking evaluations.",
    "life-after":    "The user is currently in LifeAfter, managing their post-donation health journey.",
    "dashboard":     "The user is on the donor dashboard, getting an overview of all modules.",
  };
  return context[module] ? `\n\nCurrent context: ${context[module]}` : "";
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const parsed = chatRequestSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Invalid AI request" }, { status: 400 });

    if (process.env.ALLOW_PHI_TO_AI !== "true") {
      return NextResponse.json(
        { error: "AI processing is disabled until an approved PHI-processing agreement and pilot configuration are in place." },
        { status: 503 }
      );
    }

    const systemPrompt = BASE_SYSTEM_PROMPT + buildModuleContext(parsed.data.module);
    const history: OpenAI.Chat.ChatCompletionMessageParam[] = parsed.data.history.map((entry) =>
      entry.role === "user"
        ? { role: "user" as const, content: entry.content }
        : { role: "assistant" as const, content: entry.content }
    );

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: parsed.data.message },
    ];

    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages,
      max_tokens: 350,
      temperature: 0.7,
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "I'm sorry, I couldn't process that. Please try again.";

    await recordAuditEvent(req, userId, "CREATE", "AIConversation", undefined, { model: process.env.OPENAI_MODEL || "gpt-4o" });
    return NextResponse.json({ reply, usage: completion.usage });
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json({ error: "AI assistant unavailable" }, { status: 503 });
  }
}
