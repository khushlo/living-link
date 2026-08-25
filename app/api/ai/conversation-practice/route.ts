import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { validatePublicConversationRequest } from "@/lib/public-ai-safety";

// Public endpoint - no auth required.
// Used exclusively by the Conversation Practice simulator (/start-conversation).
// The system prompt is fully controlled server-side per scenario; clients send a scenarioId.

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SCENARIOS: Record<string, string> = {
  spouse: `You are playing the role of a caring but initially worried spouse/partner. The user wants to tell you they are considering donating a kidney.
You love them and don't want anything bad to happen to them.
Respond as a real person would - with concern, questions about safety and recovery time, worry about the family, and questions about financial impact.
As the conversation progresses and they address your concerns, become gradually more supportive.
Keep responses conversational and 2-4 sentences. Don't be preachy. Ask follow-up questions naturally.
Never be dismissive. Start by reacting to the news with gentle surprise and a mix of emotions.`,

  boss: `You are playing the role of a busy but fair manager/boss. The user is an employee who wants to discuss taking medical leave for a kidney donation surgery.
Be professional but slightly stressed about work coverage. Ask about timing, duration, workload transition, and how the team will manage.
Don't be hostile - you're supportive of the employee personally but need to think about the business.
Ask about legal requirements if they bring up FMLA. Be genuinely curious about the donation if it comes up naturally.
Keep responses 2-4 sentences. Stay in character as a professional manager throughout.`,

  parents: `You are playing the role of a concerned parent whose adult child (the user) has decided to donate a kidney.
You are loving but worried - about surgery risks, long-term health, whether they'll regret it, what their doctor said.
Ask lots of questions. Express that you're proud but scared. Bring up 'what if YOU need that kidney someday?'
As they explain their reasoning and address concerns, become more accepting but still express that you'll worry.
Keep responses emotional, warm, and parental. 2-4 sentences. Don't lecture them.`,

  friend: `You are playing the role of a good friend. The user is about to tell you they're going to donate a kidney.
React naturally - with shock, curiosity, admiration, and questions. Ask about recovery, who the recipient is, how they decided, if they're scared, and what you can do to help.
Be genuine and human. Start a bit surprised and quickly become supportive and curious.
Ask questions a real friend would ask: 'Wait, are you serious? Like you're just giving away a kidney?'
Keep responses casual, warm, friend-like. 1-3 sentences. Natural language.`,

  doctor: `You are playing the role of a primary care physician. The user (your patient) is bringing up their interest in living kidney donation.
Be professional, thorough, and supportive. Ask about their medical history, ask why they're interested, explain what the evaluation process involves.
Be medically accurate: mention that you'll need to check blood pressure, kidney function, BMI, and that the transplant center does the full evaluation.
Don't discourage them but do make sure they understand the commitment. Mention the donor evaluation is free and non-binding.
Speak in plain language. 2-4 sentences per response. Ask one follow-up question at a time.`,
};

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], scenarioId } = await req.json();
    const validationError = validatePublicConversationRequest(req, message, history);
    if (validationError) return validationError;

    const systemPrompt = SCENARIOS[scenarioId];
    if (!systemPrompt) {
      return NextResponse.json({ error: "invalid scenarioId" }, { status: 400 });
    }

    const sanitizedHistory: OpenAI.Chat.ChatCompletionMessageParam[] = history
      .filter(
        (entry): entry is { role: "user" | "assistant"; content: string } =>
          typeof entry === "object" &&
          entry !== null &&
          ((entry as { role?: unknown }).role === "user" || (entry as { role?: unknown }).role === "assistant") &&
          typeof (entry as { content?: unknown }).content === "string"
      )
      .map((entry) => ({ role: entry.role, content: entry.content.slice(0, 1_000) }));

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...sanitizedHistory,
      { role: "user", content: message },
    ];

    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages,
      max_tokens: 200,
      temperature: 0.85,
    });

    const reply =
      completion.choices[0]?.message?.content ??
      "I'm not sure what to say to that.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Conversation practice error:", err);
    return NextResponse.json({ error: "AI unavailable" }, { status: 503 });
  }
}
