import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET() {
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

    return NextResponse.json({ viewerId: user.id, conversations });
  } catch {
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}
