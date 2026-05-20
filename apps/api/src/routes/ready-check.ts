import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth";
import OpenAI from "openai";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const checkSchema = z.object({
  bmi: z.number().min(10).max(80).optional(),
  bpSystolic: z.number().min(60).max(250).optional(),
  bpDiastolic: z.number().min(40).max(150).optional(),
  egfr: z.number().min(0).max(200).optional(),
  smokingStatus: z.enum(["never", "former", "current"]).optional(),
  hasDiabetes: z.boolean().optional(),
  age: z.number().min(18).max(80).optional(),
});

// POST /api/ready-check/assess  submit eligibility check + get AI summary
router.post("/assess", async (req: AuthRequest, res) => {
  const parsed = checkSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkUserId! },
      include: { donorProfile: true },
    });
    if (!user?.donorProfile) return res.status(404).json({ error: "Donor profile not found" });

    // Generate AI readiness summary (informational only, not a diagnosis)
    const prompt = `You are a supportive health navigator (NOT a doctor) helping someone explore living kidney donation.

Based on these self-reported health metrics, provide an encouraging, plain-language (6th grade reading level) summary of their current readiness and actionable next steps. Never say they are "qualified" or "disqualified"  only what areas look favorable and what areas they may want to discuss with a doctor.

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
      data: {
        donorProfileId: user.donorProfile.id,
        ...parsed.data,
        aiSummary,
      },
    });

    res.status(201).json({ check, aiSummary });
  } catch (err) {
    res.status(500).json({ error: "Assessment failed" });
  }
});

// GET /api/ready-check/history  get assessment history
router.get("/history", async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkUserId! },
      include: { donorProfile: { include: { eligibilityChecks: { orderBy: { assessedAt: "desc" } } } } },
    });
    res.json(user?.donorProfile?.eligibilityChecks ?? []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// POST /api/ready-check/goals  set a health goal
const goalSchema = z.object({
  metric: z.enum(["BMI", "BLOOD_PRESSURE", "SMOKING", "BLOOD_SUGAR", "WEIGHT"]),
  targetValue: z.number(),
  targetDate: z.string().datetime().optional(),
});

router.post("/goals", async (req: AuthRequest, res) => {
  const parsed = goalSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkUserId! },
      include: { donorProfile: true },
    });
    if (!user?.donorProfile) return res.status(404).json({ error: "Donor profile not found" });

    const goal = await prisma.healthGoal.create({
      data: {
        donorProfileId: user.donorProfile.id,
        metric: parsed.data.metric as any,
        targetValue: parsed.data.targetValue,
        targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : undefined,
      },
    });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: "Failed to create goal" });
  }
});

// POST /api/ready-check/goals/:goalId/log  log progress toward a goal
router.post("/goals/:goalId/log", async (req: AuthRequest, res) => {
  const { value, note } = req.body;
  try {
    const log = await prisma.goalProgressLog.create({
      data: { goalId: req.params.goalId, value: Number(value), note },
    });
    // Update current value on goal
    await prisma.healthGoal.update({
      where: { id: req.params.goalId },
      data: { currentValue: Number(value) },
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: "Failed to log progress" });
  }
});

export default router;
