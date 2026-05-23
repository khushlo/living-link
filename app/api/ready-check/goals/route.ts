import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId! },
      include: {
        donorProfile: {
          include: {
            healthGoals: {
              include: { progressLogs: { orderBy: { loggedAt: "asc" } } },
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    });
    return NextResponse.json(user?.donorProfile?.healthGoals ?? []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch goals" }, { status: 500 });
  }
}

const goalSchema = z.object({
  metric: z.enum(["BMI", "BLOOD_PRESSURE", "SMOKING", "BLOOD_SUGAR", "WEIGHT"]),
  targetValue: z.number(),
  targetDate: z.string().datetime().optional(),
});

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = goalSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId! },
      include: { donorProfile: true },
    });
    if (!user?.donorProfile) return NextResponse.json({ error: "Donor profile not found" }, { status: 404 });

    const goal = await prisma.healthGoal.create({
      data: {
        donorProfileId: user.donorProfile.id,
        metric: parsed.data.metric as any,
        targetValue: parsed.data.targetValue,
        targetDate: parsed.data.targetDate ? new Date(parsed.data.targetDate) : undefined,
      },
    });
    return NextResponse.json(goal, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
