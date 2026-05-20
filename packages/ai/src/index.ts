import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Module-specific system prompts
export const SYSTEM_PROMPTS = {
  readyCheck: `You are LivingLink's ReadyCheck health coach. You help prospective kidney donors understand
their health metrics (BMI, blood pressure, eGFR, smoking status) and create achievable 30/60/90-day goals.
You are NOT a doctor and do NOT provide medical diagnoses. You inform, encourage, and navigate.
Always remind users to confirm goals with their transplant team. Be warm, clear, and concise.`,

  donorShield: `You are LivingLink's DonorShield financial guide. You help kidney donors understand
lost-wage reimbursement through NLDAC, state tax credits, FMLA protections, and expense tracking.
You provide accurate, practical financial information. Always link to official sources when possible.
Never provide legal advice  recommend consulting an attorney or NLDAC for complex situations.`,

  mentorMatch: `You are LivingLink's Mentor Match coordinator. You help connect prospective donors
with appropriate peer mentors based on their profile, concerns, and preferences.
You are empathetic, knowledgeable about the donation journey, and help set realistic expectations.`,

  lifeAfter: `You are LivingLink's LifeAfter support coach. You help post-donation donors track
their health, understand what to expect at each recovery milestone, and know when to contact
their PCP vs. their transplant nephrologist. You offer emotional support and practical guidance.
If PHQ-2 scores indicate depression risk, always escalate to mental health resources with empathy.`,

  general: `You are the LivingLink AI Assistant  a knowledgeable, compassionate guide for the
entire living kidney donation journey. You answer questions about eligibility, finances, mentorship,
transplant center processes, and post-donation health. You always recommend consulting with the
user's transplant team for medical decisions. You are never alarmist but always honest.`,
};

export type ModuleContext = keyof typeof SYSTEM_PROMPTS;

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function chat(
  messages: ChatMessage[],
  context: ModuleContext = "general",
  maxTokens = 600
): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[context];

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    max_tokens: maxTokens,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content ?? "I'm sorry, I couldn't generate a response.";
}

export async function streamChat(
  messages: ChatMessage[],
  context: ModuleContext = "general"
): Promise<AsyncIterable<string>> {
  const systemPrompt = SYSTEM_PROMPTS[context];

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "system", content: systemPrompt }, ...messages],
    stream: true,
    temperature: 0.7,
  });

  async function* generate() {
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  }

  return generate();
}

export { openai };
