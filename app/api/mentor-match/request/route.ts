import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const matchSchema = z.object({ mentorId: z.string().uuid() });

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = matchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const candidate = await prisma.user.findUnique({ where: { clerkId: userId! } });
    if (!candidate) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { id: parsed.data.mentorId },
      select: { userId: true, isAvailable: true },
    });
    if (!mentorProfile) return NextResponse.json({ error: "Mentor not found" }, { status: 404 });
    if (mentorProfile.userId === candidate.id) {
      return NextResponse.json({ error: "You cannot request yourself as a mentor" }, { status: 400 });
    }
    if (!mentorProfile.isAvailable) {
      return NextResponse.json({ error: "This mentor is currently unavailable" }, { status: 409 });
    }

    const existingMatch = await prisma.mentorMatch.findFirst({
      where: { candidateId: candidate.id, mentorId: mentorProfile.userId, status: { in: ["pending", "active"] } },
    });
    if (existingMatch) return NextResponse.json({ error: "You already have a request with this mentor" }, { status: 409 });

    const match = await prisma.$transaction(async (tx) => {
      const createdMatch = await tx.mentorMatch.create({
        data: { candidateId: candidate.id, mentorId: mentorProfile.userId, status: "pending" },
      });
      await tx.messageThread.create({ data: { matchId: createdMatch.id } });
      await tx.notification.create({
        data: {
          userId: mentorProfile.userId,
          type: "mentor_request",
          title: "New mentor request",
          body: `${candidate.firstName ?? "A donor"} would like to connect with you as a mentor.`,
          payload: { matchId: createdMatch.id },
        },
      });
      return createdMatch;
    });

    return NextResponse.json(match, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create mentor match" }, { status: 500 });
  }
}
