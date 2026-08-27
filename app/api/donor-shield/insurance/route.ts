import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";
import { decryptField, encryptField } from "@/lib/field-encryption";

export const dynamic = "force-dynamic";

const statusSchema = z.enum(["open", "in_progress", "escalated", "resolved"]);
const createSchema = z.object({
  type: z.string().min(1).max(100),
  description: z.string().min(1).max(5000),
  notes: z.string().max(2000).optional(),
});
const updateSchema = z.object({
  issueId: z.string().uuid(),
  status: statusSchema.optional(),
  notes: z.string().max(2000).optional(),
}).refine((value) => value.status !== undefined || value.notes !== undefined, { message: "status or notes is required" });

function present(issue: { id: string; type: string; description: string; status: string; notes: string | null; createdAt: Date; updatedAt: Date }) {
  return { ...issue, description: decryptField(issue.description), notes: decryptField(issue.notes) };
}

async function getDonorProfile(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId }, include: { donorProfile: true } });
  return user?.donorProfile ?? null;
}

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;

  try {
    const donorProfile = await getDonorProfile(userId);
    const issues = donorProfile ? await prisma.insuranceIssue.findMany({ where: { donorProfileId: donorProfile.id }, orderBy: { createdAt: "desc" } }) : [];
    await recordAuditEvent(req, userId, "READ", "InsuranceIssue");
    return NextResponse.json(issues.map(present));
  } catch {
    return NextResponse.json({ error: "Failed to fetch insurance issues" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const clerkUser = await currentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress;
    if (!clerkUser || !email) return NextResponse.json({ error: "Unable to load authenticated user" }, { status: 401 });
    const user = await prisma.user.upsert({
      where: { clerkId: userId }, update: {},
      create: { clerkId: userId, email, firstName: clerkUser.firstName, lastName: clerkUser.lastName },
      select: { id: true },
    });
    const donorProfile = await prisma.donorProfile.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } });
    const issue = await prisma.insuranceIssue.create({ data: { donorProfileId: donorProfile.id, type: parsed.data.type, description: encryptField(parsed.data.description) as string, notes: encryptField(parsed.data.notes) } });
    await recordAuditEvent(req, userId, "CREATE", "InsuranceIssue", issue.id);
    return NextResponse.json(present(issue), { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create insurance issue" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const donorProfile = await getDonorProfile(userId);
    if (!donorProfile) return NextResponse.json({ error: "Donor profile not found" }, { status: 404 });
    const existing = await prisma.insuranceIssue.findFirst({ where: { id: parsed.data.issueId, donorProfileId: donorProfile.id } });
    if (!existing) return NextResponse.json({ error: "Insurance issue not found" }, { status: 404 });
    const issue = await prisma.insuranceIssue.update({
      where: { id: existing.id },
      data: { ...(parsed.data.status ? { status: parsed.data.status } : {}), ...(parsed.data.notes !== undefined ? { notes: encryptField(parsed.data.notes) } : {}) },
    });
    if (parsed.data.status === "escalated" && existing.status !== "escalated") {
      const coordinators = await prisma.user.findMany({ where: { role: "COORDINATOR" }, select: { id: true } });
      await prisma.notification.createMany({ data: coordinators.map(({ id }) => ({ userId: id, type: "insurance_issue_escalated", title: "Insurance issue escalated", body: `A donor escalated a ${issue.type} for coordinator review.`, payload: { issueId: issue.id } })) });
      await recordAuditEvent(req, userId, "UPDATE", "InsuranceIssue", issue.id, { escalation: true });
    } else {
      await recordAuditEvent(req, userId, "UPDATE", "InsuranceIssue", issue.id);
    }
    return NextResponse.json(present(issue));
  } catch {
    return NextResponse.json({ error: "Failed to update insurance issue" }, { status: 500 });
  }
}
