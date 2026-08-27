import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { hasLatestConsent } from "@/lib/consent";
import { decryptField } from "@/lib/field-encryption";
import { recordAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId, error, user } = await requirePermission("mentor:message");
  if (error) return error;

  try {
    if (!user || !(await hasLatestConsent(user.donorProfile?.id ?? "", "mentor_messaging"))) return NextResponse.json({ error: "Current mentor-messaging consent is required" }, { status: 403 });

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
