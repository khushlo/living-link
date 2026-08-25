import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";
import { z } from "zod";

const updateSchema = z.object({ status: z.enum(["APPROVED", "REJECTED"]) });

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const admin = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true, role: true } });
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const { id } = await params;
  const submission = await prisma.storySubmission.update({
    where: { id },
    data: { status: parsed.data.status, reviewedAt: new Date(), reviewedById: admin.id },
    select: { id: true, status: true, reviewedAt: true, reviewedById: true },
  }).catch(() => null);
  if (!submission) return NextResponse.json({ error: "Story submission not found" }, { status: 404 });
  await recordAuditEvent(req, userId, "UPDATE", "StorySubmission", submission.id, { status: submission.status });
  return NextResponse.json(submission);
}
