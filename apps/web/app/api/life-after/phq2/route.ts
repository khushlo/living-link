import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const phq2Schema = z.object({ q1Score: z.number().min(0).max(3), q2Score: z.number().min(0).max(3) });

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = phq2Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId! },
      include: { donorProfile: true },
    });
    if (!user?.donorProfile) return NextResponse.json({ error: "Donor profile not found" }, { status: 404 });

    const total = parsed.data.q1Score + parsed.data.q2Score;
    const isEscalated = total >= 3;

    const response = await prisma.pHQ2Response.create({
      data: {
        donorProfileId: user.donorProfile.id,
        q1Score: parsed.data.q1Score,
        q2Score: parsed.data.q2Score,
        totalScore: total,
        isEscalated,
      },
    });

    return NextResponse.json({
      ...response,
      message: isEscalated
        ? "Your responses suggest you may benefit from speaking with a mental health professional. Your transplant coordinator can connect you with support resources."
        : "Thank you for completing your check-in.",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit PHQ-2" }, { status: 500 });
  }
}
