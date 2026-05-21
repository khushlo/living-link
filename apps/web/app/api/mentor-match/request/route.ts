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

    const match = await prisma.mentorMatch.create({
      data: { candidateId: candidate.id, mentorId: parsed.data.mentorId, status: "pending" },
    });
    await prisma.messageThread.create({ data: { matchId: match.id } });

    return NextResponse.json(match, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create mentor match" }, { status: 500 });
  }
}
