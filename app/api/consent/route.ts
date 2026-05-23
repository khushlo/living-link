import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { consents } = await req.json();

  // Store consent record in DonorProfile metadata
  await prisma.donorProfile.upsert({
    where: { userId },
    update: {
      consentedAt: new Date(),
      consentVersion: "1.0",
      researchConsent: Array.isArray(consents) && consents.includes("data_use"),
    },
    create: {
      userId,
      consentedAt: new Date(),
      consentVersion: "1.0",
      researchConsent: Array.isArray(consents) && consents.includes("data_use"),
    },
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await prisma.donorProfile.findUnique({
    where: { userId },
    select: { consentedAt: true, consentVersion: true, researchConsent: true },
  });

  return NextResponse.json(profile ?? { consentedAt: null });
}
