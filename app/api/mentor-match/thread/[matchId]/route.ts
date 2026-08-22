import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const { matchId } = await params;

  try {
    const viewer = await prisma.user.findUnique({ where: { clerkId: userId! }, select: { id: true } });
    if (!viewer) return NextResponse.json({ error: "User not found" }, { status: 404 });

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

    return NextResponse.json({ ...thread, viewerId: viewer.id });
  } catch {
    return NextResponse.json({ error: "Failed to fetch thread" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { userId, error } = await requireAuth();
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

    const sender = await prisma.user.findUnique({ where: { clerkId: userId! } });
    if (!sender) return NextResponse.json({ error: "Sender not found" }, { status: 404 });
    if (![thread.match.candidateId, thread.match.mentorId].includes(sender.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: { threadId: thread.id, senderId: sender.id, content },
    });
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
    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
