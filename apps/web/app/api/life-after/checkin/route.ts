import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const checkinSchema = z.object({
  week: z.enum(["WEEK_2", "MONTH_1", "MONTH_3", "MONTH_6", "YEAR_1", "YEAR_2_PLUS"]),
  bpSystolic: z.number().optional(),
  bpDiastolic: z.number().optional(),
  weightKg: z.number().optional(),
  moodScore: z.number().min(1).max(10).optional(),
  energyScore: z.number().min(1).max(10).optional(),
  notes: z.string().max(1000).optional(),
});

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId! },
      include: { donorProfile: { include: { checkins: true, phq2Responses: true } } },
    });

    const milestones = ["WEEK_2", "MONTH_1", "MONTH_3", "MONTH_6", "YEAR_1", "YEAR_2_PLUS"];
    const completedWeeks = new Set(user?.donorProfile?.checkins.map((c) => c.week));
    const timeline = milestones.map((week) => ({
      week,
      completed: completedWeeks.has(week as any),
      checkin: user?.donorProfile?.checkins.find((c) => c.week === week) ?? null,
    }));

    return NextResponse.json({ timeline, phq2Count: user?.donorProfile?.phq2Responses.length ?? 0 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch timeline" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = checkinSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId! },
      include: { donorProfile: true },
    });
    if (!user?.donorProfile) return NextResponse.json({ error: "Donor profile not found" }, { status: 404 });

    const checkin = await prisma.postDonationCheckin.create({
      data: { donorProfileId: user.donorProfile.id, ...(parsed.data as any) },
    });
    return NextResponse.json(checkin, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit check-in" }, { status: 500 });
  }
}
