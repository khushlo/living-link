import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const updateSchema = z.object({ status: z.enum(["ACTIVE", "ACHIEVED"]) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid goal status" }, { status: 400 });

  const { goalId } = await params;
  const goal = await prisma.healthGoal.findFirst({
    where: { id: goalId, donorProfile: { user: { clerkId: userId } } },
    select: { id: true },
  });
  if (!goal) return NextResponse.json({ error: "Goal not found" }, { status: 404 });

  const updated = await prisma.healthGoal.update({
    where: { id: goalId },
    data: { status: parsed.data.status },
    select: { id: true, status: true },
  });
  await recordAuditEvent(req, userId, "UPDATE", "HealthGoal", goalId, { status: updated.status });
  return NextResponse.json(updated);
}
