import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAuthWithUser } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  dateOfBirth: z.string().regex(/^\d{2}-\d{2}-\d{4}$/).optional().or(z.literal("")),
  donationStatus: z.enum(["EXPLORING", "IN_EVALUATION", "APPROVED", "DONATED", "DECLINED"]),
  donationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  donationType: z.enum(["DIRECTED", "NON_DIRECTED", "PAIRED_EXCHANGE", "UNKNOWN"]).optional().or(z.literal("")),
  recipientRelation: z.string().trim().max(100).optional().or(z.literal("")),
  transplantCenterName: z.string().trim().max(200).optional().or(z.literal("")),
}).superRefine((value, context) => {
  if (value.donationStatus === "DONATED" && !value.donationDate) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["donationDate"], message: "Donation date is required for donated status" });
  }
});

function parseDate(value?: string) {
  if (!value) return null;
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);
  if (!match) return null;
  const [, month, day, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return date.getUTCFullYear() === Number(year) && date.getUTCMonth() === Number(month) - 1 && date.getUTCDate() === Number(day) ? date : null;
}

function formatDate(value: Date | null | undefined) {
  if (!value) return "";
  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${month}-${day}-${value.getUTCFullYear()}`;
}

function serialize(user: { firstName: string | null; lastName: string | null; email: string; phone: string | null; donorProfile: { id: string; dateOfBirth: Date | null; donationStatus: string; donatedAt: Date | null; donationType: string | null; recipientRelation: string | null; transplantCenterName: string | null } | null }) {
  return {
    firstName: user.firstName ?? "",
    lastName: user.lastName ?? "",
    email: user.email,
    phone: user.phone ?? "",
    dateOfBirth: formatDate(user.donorProfile?.dateOfBirth),
    donationStatus: user.donorProfile?.donationStatus ?? "EXPLORING",
    donationDate: user.donorProfile?.donatedAt?.toISOString().slice(0, 10) ?? "",
    donationType: user.donorProfile?.donationType ?? "",
    recipientRelation: user.donorProfile?.recipientRelation ?? "",
    transplantCenterName: user.donorProfile?.transplantCenterName ?? "",
  };
}

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      donorProfile: {
        select: {
          id: true,
          dateOfBirth: true,
          donationStatus: true,
          donatedAt: true,
          donationType: true,
          recipientRelation: true,
          transplantCenterName: true,
        },
      },
    },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  // Do not hold the profile response open while the audit write completes.
  void recordAuditEvent(req, userId, "READ", "DonorProfile", user.donorProfile?.id, {}, user.id);
  return NextResponse.json(serialize(user));
}

export async function POST(req: NextRequest) {
  const { userId, user, error } = await requireAuthWithUser();
  if (error || !userId || !user) return error;
  const parsed = profileSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please complete the required donor profile fields", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const values = parsed.data;
  const profile = await prisma.$transaction(async (transaction) => {
    await transaction.user.update({ where: { id: user.id }, data: { firstName: values.firstName, lastName: values.lastName, phone: values.phone || null } });
    return transaction.donorProfile.upsert({
      where: { userId: user.id },
      update: { dateOfBirth: parseDate(values.dateOfBirth), donationStatus: values.donationStatus, donatedAt: parseDate(values.donationDate), donationType: values.donationType || null, recipientRelation: values.recipientRelation || null, transplantCenterName: values.transplantCenterName || null },
      create: { userId: user.id, dateOfBirth: parseDate(values.dateOfBirth), donationStatus: values.donationStatus, donatedAt: parseDate(values.donationDate), donationType: values.donationType || null, recipientRelation: values.recipientRelation || null, transplantCenterName: values.transplantCenterName || null },
      select: { id: true },
    });
  });
  await recordAuditEvent(req, userId, "UPDATE", "DonorProfile", profile.id, { donationStatus: values.donationStatus });
  return NextResponse.json({ ok: true });
}
