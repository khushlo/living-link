import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are the LivingLink Assistant, a compassionate and knowledgeable guide for the living kidney donation journey.

You help donors, patients, caregivers, coordinators, and clinicians by:
- Answering questions about the donation process in plain language
- Explaining medical terms without being alarmist
- Guiding users to the right LivingLink module
- Providing emotional support and encouragement
- Referring to real resources (NLDAC, OPTN, NKF, HRSA) when appropriate

You are NOT a doctor. Do NOT provide medical diagnoses or advice. Always recommend consulting a transplant team for medical decisions.

Platform modules:
- ReadyCheck: health readiness screening and goal coaching
- DonorShield: financial planning, NLDAC reimbursement, expense tracking
- Mentor Match: peer mentor connections with prior living donors
- CenterFlow: evaluation tracking and center protocol guidance
- LifeAfter: post-donation monitoring, PCP guidance, mental health support

Keep responses concise (under 150 words unless detail is truly needed). Be warm, inclusive, and trauma-informed.`;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message, history = [] } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(history as OpenAI.Chat.ChatCompletionMessageParam[]),
      { role: "user", content: message },
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "I'm sorry, I couldn't process that. Please try again.";

    return NextResponse.json({ reply, usage: completion.usage });
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json({ error: "AI assistant unavailable" }, { status: 503 });
  }
}
