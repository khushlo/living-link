import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";
import { z } from "zod";

const schema = z.object({
  recordId: z.string().uuid(),
  reimbursementStatus: z.enum(["not_submitted", "submitted", "approved", "denied", "paid"]),
  reimbursedAmount: z.number().nonnegative().optional(),
  reimbursementNotes: z.string().max(2000).optional(),
});

export async function PATCH(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { donorProfile: true } });
  if (!user?.donorProfile) return NextResponse.json({ error: "Donor profile not found" }, { status: 404 });
  const existing = await prisma.financialRecord.findFirst({ where: { id: parsed.data.recordId, donorProfileId: user.donorProfile.id } });
  if (!existing) return NextResponse.json({ error: "Expense not found" }, { status: 404 });
  const record = await prisma.financialRecord.update({
    where: { id: existing.id },
    data: {
      reimbursementStatus: parsed.data.reimbursementStatus,
      isReimbursed: parsed.data.reimbursementStatus === "paid",
      reimbursedAmount: parsed.data.reimbursedAmount,
      reimbursementNotes: parsed.data.reimbursementNotes,
    },
  });
  await recordAuditEvent(req, userId, "UPDATE", "FinancialRecord", record.id, { reimbursementStatus: record.reimbursementStatus });
  return NextResponse.json(record);
}
