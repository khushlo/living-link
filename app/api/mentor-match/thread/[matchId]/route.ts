import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { hasLatestConsent } from "@/lib/consent";
import { recordAuditEvent } from "@/lib/audit";
import { decryptField, encryptField } from "@/lib/field-encryption";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { userId, error, user } = await requirePermission("mentor:message");
  if (error) return error;

  const { matchId } = await params;

  try {
    const viewer = user;
    if (!viewer || !(await hasLatestConsent(viewer.donorProfile?.id ?? "", "mentor_messaging"))) return NextResponse.json({ error: "Current mentor-messaging consent is required" }, { status: 403 });

    const thread = await prisma.messageThread.findUnique({
      where: { matchId },
      include: {
        match: { select: { candidateId: true, mentorId: true } },
        messages: {
          orderBy: { sentAt: "asc" },
          include: { sender: { select: { id: true, firstName: true, role: true } } },
        },
      },
    });
    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    if (![thread.match.candidateId, thread.match.mentorId].includes(viewer.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.message.updateMany({
      where: { threadId: thread.id, senderId: { not: viewer.id }, readAt: null },
      data: { readAt: new Date(), status: "READ" },
    });
    await recordAuditEvent(_req, userId, "READ", "MessageThread", thread.id);

    return NextResponse.json({
      ...thread,
      messages: thread.messages.map((message) => ({ ...message, content: decryptField(message.content) })),
      viewerId: viewer.id,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch thread" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { userId, error, user } = await requirePermission("mentor:message");
  if (error) return error;

  const { matchId } = await params;
  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: "Content required" }, { status: 400 });

  try {
    const thread = await prisma.messageThread.findUnique({
      where: { matchId },
      include: { match: { select: { candidateId: true, mentorId: true } } },
    });
    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    const sender = user;
    if (!sender) return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    if (!(await hasLatestConsent(sender.donorProfile?.id ?? "", "mentor_messaging"))) return NextResponse.json({ error: "Current mentor-messaging consent is required" }, { status: 403 });
    if (![thread.match.candidateId, thread.match.mentorId].includes(sender.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: { threadId: thread.id, senderId: sender.id, content: encryptField(content) as string },
    });
    await recordAuditEvent(req, userId, "CREATE", "Message", message.id);
    const recipientId = sender.id === thread.match.candidateId
      ? thread.match.mentorId
      : thread.match.candidateId;
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: "message_received",
        title: "New mentor message",
        body: `${sender.firstName ?? "Your mentor match"} sent you a message.`,
        payload: { matchId, messageId: message.id },
      },
    });
    return NextResponse.json({ ...message, content }, { status: 201 });
  } catch (err) {
    console.error("Failed to send mentor message", err);
    if (err instanceof Error && err.message.toLowerCase().includes("encryption key")) {
      return NextResponse.json({ error: "Messaging encryption is not configured on this server." }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
