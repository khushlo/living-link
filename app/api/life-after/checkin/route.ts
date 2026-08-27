import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";
import { decryptField, encryptField } from "@/lib/field-encryption";
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

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId! },
      include: { donorProfile: { include: { checkins: true, phq2Responses: true, lifeAfterReminders: true } } },
    });

    const milestones = ["WEEK_2", "MONTH_1", "MONTH_3", "MONTH_6", "YEAR_1", "YEAR_2_PLUS"];
    const completedWeeks = new Set(user?.donorProfile?.checkins.map((c) => c.week));
    const timeline = milestones.map((week) => ({
      week,
      completed: completedWeeks.has(week as any),
      phq2Completed: user?.donorProfile?.phq2Responses.some((response) => response.week === week) ?? false,
      reminder: user?.donorProfile?.lifeAfterReminders.find((reminder) => reminder.week === week) ?? null,
      checkin: user?.donorProfile?.checkins.find((c) => c.week === week) ?? null,
    }));
    await recordAuditEvent(req, userId!, "READ", "PostDonationCheckin");

    return NextResponse.json({
      timeline: timeline.map((entry) => ({
        ...entry,
        checkin: entry.checkin ? { ...entry.checkin, notes: decryptField(entry.checkin.notes) } : null,
      })),
      phq2Count: user?.donorProfile?.phq2Responses.length ?? 0,
      isParentDonor: user?.donorProfile?.isParentDonor ?? false,
    });
    if (user?.donorProfile) {
      const base = user.donorProfile.donatedAt ?? new Date();
      const offsets: Record<string, number> = { WEEK_2: 14, MONTH_1: 30, MONTH_3: 90, MONTH_6: 180, YEAR_1: 365, YEAR_2_PLUS: 730 };
      await prisma.lifeAfterReminder.createMany({
        data: Object.entries(offsets).map(([week, days]) => ({ donorProfileId: user.donorProfile!.id, week: week as any, dueAt: new Date(base.getTime() + days * 86400000) })),
        skipDuplicates: true,
      });
    }
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

    const checkin = await prisma.postDonationCheckin.upsert({
      where: { donorProfileId_week: { donorProfileId: user.donorProfile.id, week: parsed.data.week } },
      update: {
        ...(parsed.data as any),
        notes: encryptField(parsed.data.notes),
      },
      create: {
        donorProfileId: user.donorProfile.id,
        ...(parsed.data as any),
        notes: encryptField(parsed.data.notes),
      },
    });
    const offsets: Record<string, number> = { WEEK_2: 14, MONTH_1: 30, MONTH_3: 90, MONTH_6: 180, YEAR_1: 365, YEAR_2_PLUS: 730 };
    await prisma.lifeAfterReminder.upsert({
      where: { donorProfileId_week: { donorProfileId: user.donorProfile.id, week: parsed.data.week } },
      update: { completedAt: new Date() },
      create: { donorProfileId: user.donorProfile.id, week: parsed.data.week, dueAt: new Date(Date.now() + offsets[parsed.data.week] * 86400000), completedAt: new Date() },
    });
    await recordAuditEvent(req, userId, "CREATE", "PostDonationCheckin", checkin.id);
    return NextResponse.json(checkin, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit check-in" }, { status: 500 });
  }
}
