import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } });
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  const escalations = await prisma.safetyEscalation.findMany({ include: { phq2Response: { select: { totalScore: true, completedAt: true } } }, orderBy: { createdAt: "desc" } });
  await recordAuditEvent(req, userId, "READ", "SafetyEscalation");
  return NextResponse.json(escalations);
}
