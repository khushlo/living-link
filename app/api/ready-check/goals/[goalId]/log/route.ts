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
  const parsed = z.object({ value: z.number().finite(), note: z.string().max(1000).optional() }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const goal = await prisma.healthGoal.findFirst({
      where: { id: goalId, donorProfile: { user: { clerkId: userId } } },
      select: { id: true },
    });
    if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

    const log = await prisma.goalProgressLog.create({
      data: { goalId, value: parsed.data.value, note: encryptField(parsed.data.note) },
    });
    await prisma.healthGoal.update({
      where: { id: goalId },
      data: { currentValue: parsed.data.value },
    });
    await recordAuditEvent(req, userId, "CREATE", "GoalProgressLog", log.id);
    return NextResponse.json(log, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to log progress" }, { status: 500 });
  }
}
