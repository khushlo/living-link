import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/life-after/timeline  get checkin timeline with completion status
router.get("/timeline", async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkUserId! },
      include: { donorProfile: { include: { checkins: true, phq2Responses: true } } },
    });

    const milestones = ["WEEK_2", "MONTH_1", "MONTH_3", "MONTH_6", "YEAR_1", "YEAR_2_PLUS"];
    const completedWeeks = new Set(user?.donorProfile?.checkins.map((c) => c.week));

    const timeline = milestones.map((week) => ({
      week,
      completed: completedWeeks.has(week as any),
      checkin: user?.donorProfile?.checkins.find((c) => c.week === week) ?? null,
    }));

    res.json({ timeline, phq2Count: user?.donorProfile?.phq2Responses.length ?? 0 });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch timeline" });
  }
});

// POST /api/life-after/checkin  submit a post-donation check-in
const checkinSchema = z.object({
  week: z.enum(["WEEK_2", "MONTH_1", "MONTH_3", "MONTH_6", "YEAR_1", "YEAR_2_PLUS"]),
  bpSystolic: z.number().optional(),
  bpDiastolic: z.number().optional(),
  weightKg: z.number().optional(),
  moodScore: z.number().min(1).max(10).optional(),
  energyScore: z.number().min(1).max(10).optional(),
  notes: z.string().max(1000).optional(),
});

router.post("/checkin", async (req: AuthRequest, res) => {
  const parsed = checkinSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkUserId! },
      include: { donorProfile: true },
    });
    if (!user?.donorProfile) return res.status(404).json({ error: "Donor profile not found" });

    const checkin = await prisma.postDonationCheckin.create({
      data: { donorProfileId: user.donorProfile.id, ...parsed.data as any },
    });

    res.status(201).json(checkin);
  } catch (err) {
    res.status(500).json({ error: "Failed to submit check-in" });
  }
});

// POST /api/life-after/phq2  submit PHQ-2 mental health screener
const phq2Schema = z.object({ q1Score: z.number().min(0).max(3), q2Score: z.number().min(0).max(3) });

router.post("/phq2", async (req: AuthRequest, res) => {
  const parsed = phq2Schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkUserId! },
      include: { donorProfile: true },
    });
    if (!user?.donorProfile) return res.status(404).json({ error: "Donor profile not found" });

    const total = parsed.data.q1Score + parsed.data.q2Score;
    const isEscalated = total >= 3; // PHQ-2 threshold for further evaluation

    const response = await prisma.pHQ2Response.create({
      data: {
        donorProfileId: user.donorProfile.id,
        q1Score: parsed.data.q1Score,
        q2Score: parsed.data.q2Score,
        totalScore: total,
        isEscalated,
      },
    });

    res.status(201).json({
      ...response,
      message: isEscalated
        ? "Your responses suggest you may benefit from speaking with a mental health professional. Your transplant coordinator can connect you with support resources."
        : "Thank you for completing your check-in.",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit PHQ-2" });
  }
});

// GET /api/life-after/trends  get health trends for charts
router.get("/trends", async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkUserId! },
      include: { donorProfile: { include: { checkins: { orderBy: { completedAt: "asc" } } } } },
    });

    const checkins = user?.donorProfile?.checkins ?? [];
    const trends = {
      bloodPressure: checkins.map((c) => ({ week: c.week, systolic: c.bpSystolic, diastolic: c.bpDiastolic, date: c.completedAt })),
      weight: checkins.map((c) => ({ week: c.week, value: c.weightKg, date: c.completedAt })),
      mood: checkins.map((c) => ({ week: c.week, value: c.moodScore, date: c.completedAt })),
      energy: checkins.map((c) => ({ week: c.week, value: c.energyScore, date: c.completedAt })),
    };
    res.json(trends);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trends" });
  }
});

export default router;
