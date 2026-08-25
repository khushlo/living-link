import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";
import { z } from "zod";

const updateSchema = z.object({ status: z.enum(["ACKNOWLEDGED", "CLOSED"]) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true, role: true } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  }

  const { id } = await params;
  const escalation = await prisma.safetyEscalation.update({
    where: { id },
    data: {
      status: parsed.data.status,
      acknowledgedAt: new Date(),
      acknowledgedById: user.id,
    },
  }).catch(() => null);
  if (!escalation) return NextResponse.json({ error: "Escalation not found" }, { status: 404 });

  await recordAuditEvent(req, userId, "UPDATE", "SafetyEscalation", escalation.id, {
    status: parsed.data.status,
  });
  return NextResponse.json(escalation);
}
