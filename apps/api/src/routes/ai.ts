import { Router } from "express";
import OpenAI from "openai";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are the LivingLink Assistant  a compassionate, knowledgeable guide for people exploring or navigating living kidney donation. 

You help donors, patients, and caregivers by:
- Answering questions about the donation process in plain language (6th grade reading level)
- Explaining medical terms without being alarmist
- Guiding users to the right module in the LivingLink platform
- Providing emotional support and encouragement
- Referring to real resources (NLDAC, OPTN, NKF) when appropriate

You are NOT a doctor and do NOT provide medical diagnoses or advice. Always recommend consulting a transplant team for medical decisions. 

Platform modules you can guide users to:
- ReadyCheck: health readiness screening and goals
- DonorShield: financial planning and reimbursement  
- Mentor Match: connecting with prior living donors
- CenterFlow: transplant center evaluation process
- LifeAfter: post-donation monitoring and support

Keep responses concise (under 150 words unless detail is needed). Be warm, inclusive, and trauma-informed.`;

const chatSchema = z.object({
  message: z.string().min(1).max(1000),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .max(10)
    .default([]),
});

// POST /api/ai/chat  LivingLink Assistant
router.post("/chat", async (req: AuthRequest, res) => {
  const parsed = chatSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...(parsed.data.history as OpenAI.Chat.ChatCompletionMessageParam[]),
      { role: "user", content: parsed.data.message },
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o",
      messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    const reply = completion.choices[0]?.message?.content ?? "I'm sorry, I couldn't process that. Please try again.";
    res.json({ reply, usage: completion.usage });
  } catch (err) {
    res.status(500).json({ error: "AI assistant unavailable" });
  }
});

export default router;
