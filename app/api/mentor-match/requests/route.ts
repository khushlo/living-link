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

    const requests = await prisma.mentorMatch.findMany({
      where: { mentorId: user.id },
      orderBy: { matchedAt: "desc" },
      include: {
        candidate: { select: { firstName: true } },
        thread: {
          select: {
            id: true,
            _count: { select: { messages: { where: { senderId: { not: user.id }, readAt: null } } } },
          },
        },
      },
    });

    return NextResponse.json(requests);
  } catch {
    return NextResponse.json({ error: "Failed to fetch mentor requests" }, { status: 500 });
  }
}
