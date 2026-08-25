import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";
import { z } from "zod";
import { decryptField, encryptField } from "@/lib/field-encryption";

const requestSchema = z.object({ reason: z.string().max(1000).optional() });

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true, role: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const requests = await prisma.dataDeletionRequest.findMany({
    where: user.role === "ADMIN" ? undefined : { userId: user.id },
    orderBy: { requestedAt: "desc" },
  });
  await recordAuditEvent(req, userId, "READ", "DataDeletionRequest");
  return NextResponse.json(requests.map((request) => ({ ...request, reason: decryptField(request.reason) })));
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const request = await prisma.dataDeletionRequest.create({
    data: { userId: user.id, reason: encryptField(parsed.data.reason) },
  });
  const administrators = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await prisma.notification.createMany({
    data: administrators.map((administrator) => ({
      userId: administrator.id,
      type: "privacy_deletion_request",
      title: "Data deletion request requires review",
      body: "A user submitted a data deletion request.",
      payload: { deletionRequestId: request.id },
    })),
  });
  await recordAuditEvent(req, userId, "CREATE", "DataDeletionRequest", request.id);
  return NextResponse.json({ requestId: request.id }, { status: 201 });
}
