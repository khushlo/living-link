import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireRole("ADMIN");
  if (error || !userId) return error;
  const logs = await prisma.auditLog.findMany({ select: { id: true, action: true, resourceType: true, resourceId: true, metadata: true, timestamp: true, user: { select: { email: true } } }, orderBy: { timestamp: "desc" }, take: 100 });
  await recordAuditEvent(req, userId, "READ", "AuditLog");
  return NextResponse.json(logs);
}
