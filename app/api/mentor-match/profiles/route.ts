import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";
import { recordAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const mentorApplicationSchema = z.object({
  donationYear: z.coerce.number().int().min(1990).max(new Date().getFullYear()),
  donationType: z.string().min(1),
  bio: z.string().min(50).max(5000),
  languages: z.array(z.string().min(1)).min(1),
  specialties: z.array(z.string().min(1)).min(1),
  acknowledgesBoundaries: z.literal(true),
});

const LANGUAGE_ALIASES: Record<string, string[]> = {
  en: ["en", "English"],
  english: ["en", "English"],
  es: ["es", "Spanish"],
  spanish: ["es", "Spanish"],
  zh: ["zh", "Chinese", "Mandarin"],
  chinese: ["zh", "Chinese", "Mandarin"],
  mandarin: ["zh", "Chinese", "Mandarin"],
  pt: ["pt", "Portuguese"],
  portuguese: ["pt", "Portuguese"],
};

const SPECIALTY_ALIASES: Record<string, string[]> = {
  laparoscopic: ["laparoscopic", "Laparoscopic (minimally invasive) surgery"],
  "laparoscopic (minimally invasive) surgery": ["laparoscopic", "Laparoscopic (minimally invasive) surgery"],
  open_surgery: ["open_surgery", "Open surgery"],
  "open surgery": ["open_surgery", "Open surgery"],
  paired_exchange: ["paired_exchange", "Paired/chain exchange"],
  "paired/chain exchange": ["paired_exchange", "Paired/chain exchange"],
  altruistic: ["altruistic", "Non-directed (altruistic) donation"],
  "non-directed (altruistic) donation": ["altruistic", "Non-directed (altruistic) donation"],
  parent_donor: ["parent_donor", "Donation as a parent"],
  "donation as a parent": ["parent_donor", "Donation as a parent"],
  financial_concerns: ["financial_concerns", "Managing financial impact"],
  "managing financial impact": ["financial_concerns", "Managing financial impact"],
  recovery_support: ["recovery_support", "Emotional recovery"],
  "emotional recovery": ["recovery_support", "Emotional recovery"],
};

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const lang = searchParams.get("lang");
  const specialty = searchParams.get("specialty");
  const verification = searchParams.get("verification");
  const languageValues = lang ? LANGUAGE_ALIASES[lang.toLowerCase()] ?? [lang] : null;
  const specialtyValues = specialty ? SPECIALTY_ALIASES[specialty.toLowerCase()] ?? [specialty] : null;
  let verificationFilter: { isVerified?: boolean } = { isVerified: true };
  if (verification === "unverified") {
    const viewer = await prisma.user.findUnique({ where: { clerkId: userId! }, select: { role: true } });
    if (!viewer || !["COORDINATOR", "ADMIN"].includes(viewer.role)) {
      return NextResponse.json({ error: "Coordinator access required" }, { status: 403 });
    }
    verificationFilter = { isVerified: false };
  }

  try {
    const mentors = await prisma.mentorProfile.findMany({
      where: {
        ...verificationFilter,
        isAvailable: true,
        ...(languageValues ? { languages: { hasSome: languageValues } } : {}),
        ...(specialtyValues ? { specialties: { hasSome: specialtyValues } } : {}),
      },
      include: { user: { select: { firstName: true, preferredLang: true } } },
    });
    await recordAuditEvent(req, userId!, "READ", "MentorProfile");
    return NextResponse.json(mentors);
  } catch {
    return NextResponse.json({ error: "Failed to fetch mentor profiles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = mentorApplicationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const clerkUser = await currentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress;
    if (!clerkUser || !email) {
      return NextResponse.json({ error: "Unable to load authenticated user" }, { status: 401 });
    }

    const user = await prisma.user.upsert({
      where: { clerkId: userId! },
      update: {},
      create: {
        clerkId: userId!,
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      },
      select: { id: true },
    });

    const profile = await prisma.mentorProfile.upsert({
      where: { userId: user.id },
      update: {
        donationYear: parsed.data.donationYear,
        donationTypes: [parsed.data.donationType],
        languages: parsed.data.languages,
        specialties: parsed.data.specialties,
        bio: parsed.data.bio,
        isAvailable: true,
        trainingAcknowledgedAt: new Date(),
      },
      create: {
        userId: user.id,
        donationYear: parsed.data.donationYear,
        donationTypes: [parsed.data.donationType],
        languages: parsed.data.languages,
        specialties: parsed.data.specialties,
        bio: parsed.data.bio,
        trainingAcknowledgedAt: new Date(),
      },
    });
    await recordAuditEvent(req, userId!, "UPDATE", "MentorProfile", profile.id, { trainingAcknowledged: true });

    return NextResponse.json({ profile, message: "Mentor application submitted for review" }, { status: 201 });
  } catch (err) {
    console.error("Mentor application error:", err);
    return NextResponse.json({ error: "Failed to save mentor application" }, { status: 500 });
  }
}
