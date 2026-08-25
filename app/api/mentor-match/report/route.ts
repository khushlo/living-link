import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";
import { z } from "zod";
import { encryptField } from "@/lib/field-encryption";
import { decryptField } from "@/lib/field-encryption";

const reportSchema = z.object({
  messageId: z.string().uuid().optional(),
  category: z.enum(["SAFETY", "HARASSMENT", "MEDICAL_ADVICE", "PRIVACY", "OTHER"]),
  details: z.string().max(1000).optional(),
});

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } });
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  const reports = await prisma.mentorSafetyReport.findMany({ orderBy: { createdAt: "desc" } });
  await recordAuditEvent(req, userId, "READ", "MentorSafetyReport");
  return NextResponse.json(reports.map((report) => ({ ...report, details: decryptField(report.details) })));
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const parsed = reportSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  const reporter = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
  if (!reporter) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (parsed.data.messageId) {
    const message = await prisma.message.findUnique({
      where: { id: parsed.data.messageId },
      include: { thread: { include: { match: true } } },
    });
    if (!message || ![message.thread.match.candidateId, message.thread.match.mentorId].includes(reporter.id)) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }
  }

  const report = await prisma.mentorSafetyReport.create({
    data: {
      reporter: { connect: { id: reporter.id } },
      messageId: parsed.data.messageId,
      category: parsed.data.category,
      details: encryptField(parsed.data.details),
    },
  });
  const administrators = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  await prisma.notification.createMany({
    data: administrators.map((administrator) => ({
      userId: administrator.id,
      type: "mentor_safety_report",
      title: "Mentor safety report requires review",
      body: "A mentor interaction was reported for review.",
      payload: { reportId: report.id, category: report.category },
    })),
  });
  await recordAuditEvent(req, userId, "CREATE", "MentorSafetyReport", report.id, { category: report.category });
  return NextResponse.json({ reportId: report.id }, { status: 201 });
}
