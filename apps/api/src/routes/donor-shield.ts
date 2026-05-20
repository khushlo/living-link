import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/donor-shield/records  get all financial records
router.get("/records", async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkUserId! },
      include: { donorProfile: { include: { financialRecords: { orderBy: { createdAt: "desc" } } } } },
    });
    res.json(user?.donorProfile?.financialRecords ?? []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

// POST /api/donor-shield/records  add a financial record
const recordSchema = z.object({
  itemType: z.enum(["travel", "lodging", "childcare", "medical", "lost_wage", "other"]),
  description: z.string().optional(),
  amount: z.number().positive(),
});

router.post("/records", async (req: AuthRequest, res) => {
  const parsed = recordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkUserId! },
      include: { donorProfile: true },
    });
    if (!user?.donorProfile) return res.status(404).json({ error: "Donor profile not found" });

    const record = await prisma.financialRecord.create({
      data: { donorProfileId: user.donorProfile.id, ...parsed.data },
    });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ error: "Failed to create record" });
  }
});

// GET /api/donor-shield/summary  total costs vs reimbursed
router.get("/summary", async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkUserId! },
      include: { donorProfile: { include: { financialRecords: true } } },
    });
    const records = user?.donorProfile?.financialRecords ?? [];
    const totalExpenses = records.reduce((s, r) => s + r.amount, 0);
    const totalReimbursed = records.reduce((s, r) => s + (r.reimbursedAmount ?? 0), 0);
    const byCategory = records.reduce((acc: Record<string, number>, r) => {
      acc[r.itemType] = (acc[r.itemType] ?? 0) + r.amount;
      return acc;
    }, {});

    res.json({ totalExpenses, totalReimbursed, netOutOfPocket: totalExpenses - totalReimbursed, byCategory });
  } catch (err) {
    res.status(500).json({ error: "Failed to compute summary" });
  }
});

// GET /api/donor-shield/wage-calculator  estimate lost wages
router.get("/wage-calculator", (req, res) => {
  const { hourlyRate, hoursPerWeek, recoveryWeeks } = req.query;
  const rate = Number(hourlyRate);
  const hours = Number(hoursPerWeek);
  const weeks = Number(recoveryWeeks);

  if (!rate || !hours || !weeks) {
    return res.status(400).json({ error: "hourlyRate, hoursPerWeek, recoveryWeeks required" });
  }

  const estimatedLoss = rate * hours * weeks;
  const nldacMax = 6000; // NLDAC approximate max reimbursement
  const potentialNLDACCover = Math.min(estimatedLoss, nldacMax);

  res.json({
    estimatedWageLoss: estimatedLoss,
    nldacMaxReimbursement: nldacMax,
    potentialCoverage: potentialNLDACCover,
    estimatedOutOfPocket: Math.max(0, estimatedLoss - potentialNLDACCover),
    disclaimer: "Estimates only. Contact NLDAC at nldac.org or 1-877-696-2110 for actual eligibility.",
  });
});

export default router;
