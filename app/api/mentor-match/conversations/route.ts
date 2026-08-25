import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { decryptField } from "@/lib/field-encryption";
import { recordAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({ where: { clerkId: userId! }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const conversations = await prisma.mentorMatch.findMany({
      where: { candidateId: user.id, status: { in: ["pending", "active"] } },
      orderBy: { matchedAt: "desc" },
      include: {
        mentor: { select: { firstName: true } },
        thread: {
          select: {
            id: true,
            messages: { orderBy: { sentAt: "desc" }, take: 1, select: { content: true, sentAt: true, senderId: true } },
            _count: { select: { messages: { where: { senderId: { not: user.id }, readAt: null } } } },
          },
        },
      },
    });

    await recordAuditEvent(req, userId!, "READ", "MentorMatch");
    return NextResponse.json({
      viewerId: user.id,
      conversations: conversations.map((conversation) => ({
        ...conversation,
        thread: conversation.thread
          ? {
              ...conversation.thread,
              messages: conversation.thread.messages.map((message) => ({
                ...message,
                content: decryptField(message.content),
              })),
            }
          : null,
      })),
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}
