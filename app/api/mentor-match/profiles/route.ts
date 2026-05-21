import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const lang = searchParams.get("lang");
  const specialty = searchParams.get("specialty");

  try {
    const mentors = await prisma.mentorProfile.findMany({
      where: {
        isVerified: true,
        isAvailable: true,
        ...(lang ? { languages: { has: lang } } : {}),
        ...(specialty ? { specialties: { has: specialty } } : {}),
      },
      include: { user: { select: { firstName: true, preferredLang: true } } },
    });
    return NextResponse.json(mentors);
  } catch {
    return NextResponse.json({ error: "Failed to fetch mentor profiles" }, { status: 500 });
  }
}
