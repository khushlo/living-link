import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";
import { z } from "zod";
import { encryptField } from "@/lib/field-encryption";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;

  const { goalId } = await params;
  const parsed = z.object({
    value: z.number().finite(),
    note: z.string().max(1000).optional(),
    loggedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const goal = await prisma.healthGoal.findFirst({
      where: { id: goalId, donorProfile: { user: { clerkId: userId } } },
      select: { id: true, donorProfileId: true, metric: true },
    });
    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    const dayStart = new Date(`${parsed.data.loggedOn}T00:00:00.000Z`);
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    if (Number.isNaN(dayStart.getTime())) return NextResponse.json({ error: "Invalid log date" }, { status: 400 });

    const log = await prisma.$transaction(async (transaction) => {
      await transaction.goalProgressLog.deleteMany({
        where: {
          loggedAt: { gte: dayStart, lt: dayEnd },
          goal: { donorProfileId: goal.donorProfileId, metric: goal.metric },
        },
      });
      const dailyLog = await transaction.goalProgressLog.create({
        data: {
          goalId,
          value: parsed.data.value,
          note: encryptField(parsed.data.note),
          // Noon UTC preserves the selected calendar date across common US time zones.
          loggedAt: new Date(`${parsed.data.loggedOn}T12:00:00.000Z`),
        },
      });
      await transaction.healthGoal.updateMany({
        where: { donorProfileId: goal.donorProfileId, metric: goal.metric },
        data: { currentValue: parsed.data.value },
      });
      return dailyLog;
    });
    await recordAuditEvent(req, userId, "CREATE", "GoalProgressLog", log.id);
    return NextResponse.json(log, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to log progress" }, { status: 500 });
  }
}
