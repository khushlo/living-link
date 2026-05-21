import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId! },
      include: {
        donorProfile: {
          include: { eligibilityChecks: { orderBy: { assessedAt: "desc" } } },
        },
      },
    });
    return NextResponse.json(user?.donorProfile?.eligibilityChecks ?? []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}
