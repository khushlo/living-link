import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { matchId } = await params;

  try {
    const thread = await prisma.messageThread.findUnique({
      where: { matchId },
      include: {
        messages: {
          orderBy: { sentAt: "asc" },
          include: { sender: { select: { firstName: true, role: true } } },
        },
      },
    });
    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    return NextResponse.json(thread);
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
    const thread = await prisma.messageThread.findUnique({ where: { matchId } });
    if (!thread) return NextResponse.json({ error: "Thread not found" }, { status: 404 });

    const sender = await prisma.user.findUnique({ where: { clerkId: userId! } });
    if (!sender) return NextResponse.json({ error: "Sender not found" }, { status: 404 });

    const message = await prisma.message.create({
      data: { threadId: thread.id, senderId: sender.id, content },
    });
    return NextResponse.json(message, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
