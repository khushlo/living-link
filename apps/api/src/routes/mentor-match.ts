import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth";

const router = Router();

// GET /api/mentor-match/profiles  list available mentors
router.get("/profiles", async (req: AuthRequest, res) => {
  try {
    const { lang, specialty } = req.query;
    const mentors = await prisma.mentorProfile.findMany({
      where: {
        isVerified: true,
        isAvailable: true,
        ...(lang ? { languages: { has: lang as string } } : {}),
        ...(specialty ? { specialties: { has: specialty as string } } : {}),
      },
      include: {
        user: { select: { firstName: true, preferredLang: true } },
      },
    });
    res.json(mentors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch mentor profiles" });
  }
});

// POST /api/mentor-match/request  request a mentor match
const matchSchema = z.object({ mentorId: z.string().uuid() });

router.post("/request", async (req: AuthRequest, res) => {
  const parsed = matchSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const candidate = await prisma.user.findUnique({
      where: { clerkId: req.clerkUserId! },
    });
    if (!candidate) return res.status(404).json({ error: "User not found" });

    const match = await prisma.mentorMatch.create({
      data: {
        candidateId: candidate.id,
        mentorId: parsed.data.mentorId,
        status: "pending",
      },
    });

    // Create a message thread for this match
    await prisma.messageThread.create({ data: { matchId: match.id } });

    res.status(201).json(match);
  } catch (err) {
    res.status(500).json({ error: "Failed to create mentor match" });
  }
});

// GET /api/mentor-match/thread/:matchId  get messages in a thread
router.get("/thread/:matchId", async (req: AuthRequest, res) => {
  try {
    const thread = await prisma.messageThread.findUnique({
      where: { matchId: req.params.matchId },
      include: {
        messages: {
          orderBy: { sentAt: "asc" },
          include: { sender: { select: { firstName: true, role: true } } },
        },
      },
    });
    if (!thread) return res.status(404).json({ error: "Thread not found" });
    res.json(thread);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch thread" });
  }
});

// POST /api/mentor-match/thread/:matchId/message  send a message
const msgSchema = z.object({ content: z.string().min(1).max(2000) });

router.post("/thread/:matchId/message", async (req: AuthRequest, res) => {
  const parsed = msgSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });

  try {
    const thread = await prisma.messageThread.findUnique({
      where: { matchId: req.params.matchId },
    });
    if (!thread) return res.status(404).json({ error: "Thread not found" });

    const sender = await prisma.user.findUnique({
      where: { clerkId: req.clerkUserId! },
    });
    if (!sender) return res.status(404).json({ error: "Sender not found" });

    const message = await prisma.message.create({
      data: {
        threadId: thread.id,
        senderId: sender.id,
        content: parsed.data.content, // TODO: encrypt before storing
      },
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
