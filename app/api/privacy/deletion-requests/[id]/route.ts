import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";
import { z } from "zod";

const updateSchema = z.object({ status: z.enum(["UNDER_REVIEW", "COMPLETED", "DENIED"]) });

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const admin = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true, role: true } });
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  const { id } = await params;
  const request = await prisma.dataDeletionRequest.update({
    where: { id },
    data: { status: parsed.data.status, resolvedAt: new Date(), resolvedById: admin.id },
  }).catch(() => null);
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  await recordAuditEvent(req, userId, "UPDATE", "DataDeletionRequest", request.id, { status: request.status });
  return NextResponse.json(request);
}
