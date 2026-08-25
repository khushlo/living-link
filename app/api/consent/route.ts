import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";

const CONSENT_VERSION = "2.0";
const CONSENT_PURPOSES = ["platform", "research", "mentor_messaging", "ai_processing", "ehr_exchange"] as const;

function normalizeConsents(consents: unknown) {
  const selected = new Set(Array.isArray(consents) ? consents.filter((value): value is string => typeof value === "string") : []);
  return {
    platform: selected.has("hipaa") || selected.has("platform"),
    research: selected.has("data_use") || selected.has("research"),
    mentor_messaging: selected.has("messaging") || selected.has("mentor_messaging"),
    ai_processing: selected.has("ai_use") || selected.has("ai_processing"),
    ehr_exchange: selected.has("ehr_exchange"),
  };
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { consents } = await req.json();
  const selected = normalizeConsents(consents);
  if (!selected.platform) {
    return NextResponse.json({ error: "Platform privacy acknowledgment is required" }, { status: 400 });
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress;
  if (!clerkUser || !email) return NextResponse.json({ error: "Unable to load authenticated user" }, { status: 401 });

  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: {},
    create: { clerkId: userId, email, firstName: clerkUser.firstName, lastName: clerkUser.lastName },
    select: { id: true },
  });
  const now = new Date();
  const profile = await prisma.donorProfile.upsert({
    where: { userId: user.id },
    update: { consentedAt: now, consentVersion: CONSENT_VERSION, researchConsent: selected.research },
    create: { userId: user.id, consentedAt: now, consentVersion: CONSENT_VERSION, researchConsent: selected.research },
  });

  await prisma.consentRecord.createMany({
    data: CONSENT_PURPOSES.map((purpose) => ({
      donorProfileId: profile.id,
      purpose,
      version: CONSENT_VERSION,
      granted: selected[purpose],
      grantedAt: selected[purpose] ? now : null,
      revokedAt: selected[purpose] ? null : now,
    })),
  });

  await recordAuditEvent(req, userId, "CONSENT", "DonorProfile", profile.id, {
    researchConsent: selected.research,
    consentVersion: CONSENT_VERSION,
  });
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
  if (!user) return NextResponse.json({ consentedAt: null, consentRecords: [] });

  const profile = await prisma.donorProfile.findUnique({
    where: { userId: user.id },
    select: { consentedAt: true, consentVersion: true, researchConsent: true, consentRecords: { orderBy: { createdAt: "desc" } } },
  });
  await recordAuditEvent(req, userId, "READ", "ConsentRecord");
  return NextResponse.json(profile ?? { consentedAt: null, consentRecords: [] });
}
