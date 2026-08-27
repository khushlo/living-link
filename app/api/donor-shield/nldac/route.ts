import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  status: z.enum(["draft", "ready", "submitted", "approved", "denied", "closed"]).optional(),
  employmentType: z.string().max(40).optional(),
  isUSResident: z.boolean().optional(),
  hasSurgeryDate: z.boolean().optional(),
  grossIncome: z.number().nonnegative().optional(),
  centerConfirmed: z.boolean().optional(),
  applicationRef: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
});

async function profile(clerkId: string) {
  const user = await prisma.user.findUnique({ where: { clerkId }, include: { donorProfile: true } });
  return user?.donorProfile;
}

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const donor = await profile(userId);
  if (!donor) return NextResponse.json({ application: null, reimbursements: [] });
  const [application, reimbursements] = await Promise.all([
    prisma.nLDACApplication.findFirst({ where: { donorProfileId: donor.id }, orderBy: { updatedAt: "desc" } }),
    prisma.financialRecord.findMany({ where: { donorProfileId: donor.id }, orderBy: { createdAt: "desc" } }),
  ]);
  await recordAuditEvent(req, userId, "READ", "NLDACApplication");
  return NextResponse.json({ application, reimbursements });
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const donor = await profile(userId);
  if (!donor) return NextResponse.json({ error: "Donor profile not found" }, { status: 404 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const existing = await prisma.nLDACApplication.findFirst({ where: { donorProfileId: donor.id }, orderBy: { updatedAt: "desc" } });
  const application = existing
    ? await prisma.nLDACApplication.update({ where: { id: existing.id }, data: parsed.data })
    : await prisma.nLDACApplication.create({ data: { donorProfileId: donor.id, ...parsed.data } });
  await recordAuditEvent(req, userId, "CREATE", "NLDACApplication", application.id);
  return NextResponse.json(application, { status: 201 });
}
