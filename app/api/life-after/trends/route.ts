import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId! },
      include: { donorProfile: { include: { checkins: { orderBy: { completedAt: "asc" } } } } },
    });

    const checkins = user?.donorProfile?.checkins ?? [];
    return NextResponse.json({
      bloodPressure: checkins.map((c) => ({ week: c.week, systolic: c.bpSystolic, diastolic: c.bpDiastolic, date: c.completedAt })),
      weight: checkins.map((c) => ({ week: c.week, value: c.weightKg, date: c.completedAt })),
      mood: checkins.map((c) => ({ week: c.week, value: c.moodScore, date: c.completedAt })),
      energy: checkins.map((c) => ({ week: c.week, value: c.energyScore, date: c.completedAt })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch trends" }, { status: 500 });
  }
}
