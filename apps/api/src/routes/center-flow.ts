import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/center-flow/protocols  list published protocols
router.get("/protocols", async (req: AuthRequest, res) => {
  try {
    const { focusArea, search } = req.query;
    const protocols = await prisma.protocol.findMany({
      where: {
        isPublished: true,
        ...(focusArea ? { focusArea: focusArea as any } : {}),
        ...(search ? { title: { contains: search as string, mode: "insensitive" } } : {}),
      },
      orderBy: { publishedAt: "desc" },
    });
    res.json(protocols);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch protocols" });
  }
});

// POST /api/center-flow/protocols  create a protocol (coordinator/clinician)
const protocolSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  focusArea: z.enum(["PUBLIC_AWARENESS", "DONOR_READINESS", "DONOR_INTERVENTIONS", "CENTER_PRACTICES", "DONOR_OUTCOMES"]),
  tags: z.array(z.string()).default([]),
});

router.post("/protocols", async (req: AuthRequest, res) => {
  const parsed = protocolSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkUserId! },
      include: { center: true },
    });

    const protocol = await prisma.protocol.create({
      data: {
        ...parsed.data,
        focusArea: parsed.data.focusArea as any,
        centerId: user?.center?.centerId ?? null,
        isPublished: false,
      },
    });
    res.status(201).json(protocol);
  } catch (err) {
    res.status(500).json({ error: "Failed to create protocol" });
  }
});

// GET /api/center-flow/evaluations  get evaluations for the user's center
router.get("/evaluations", async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: req.clerkUserId! },
      include: { center: true },
    });
    if (!user?.center?.centerId) return res.status(403).json({ error: "Not associated with a center" });

    const evaluations = await prisma.donorEvaluation.findMany({
      where: { centerId: user.center.centerId },
      orderBy: { updatedAt: "desc" },
    });
    res.json(evaluations);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch evaluations" });
  }
});

// PATCH /api/center-flow/evaluations/:id  advance evaluation stage
const stageSchema = z.object({
  stage: z.enum(["INITIAL_INQUIRY", "BLOODWORK", "IMAGING", "CARDIAC_EVAL", "PSYCH_EVAL", "FINAL_REVIEW", "APPROVED", "DECLINED"]),
  notes: z.string().optional(),
});

router.patch("/evaluations/:id", async (req: AuthRequest, res) => {
  const parsed = stageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const evaluation = await prisma.donorEvaluation.update({
      where: { id: req.params.id },
      data: {
        stage: parsed.data.stage as any,
        notes: parsed.data.notes,
        isStalled: false,
      },
    });
    res.json(evaluation);
  } catch (err) {
    res.status(500).json({ error: "Failed to update evaluation" });
  }
});

export default router;
