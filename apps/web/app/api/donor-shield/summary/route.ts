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
      include: { donorProfile: { include: { financialRecords: true } } },
    });
    const records = user?.donorProfile?.financialRecords ?? [];
    const totalExpenses = records.reduce((s, r) => s + r.amount, 0);
    const totalReimbursed = records.reduce((s, r) => s + (r.reimbursedAmount ?? 0), 0);
    const byCategory = records.reduce((acc: Record<string, number>, r) => {
      acc[r.itemType] = (acc[r.itemType] ?? 0) + r.amount;
      return acc;
    }, {});

    return NextResponse.json({
      totalExpenses,
      totalReimbursed,
      netOutOfPocket: totalExpenses - totalReimbursed,
      byCategory,
    });
  } catch {
    return NextResponse.json({ error: "Failed to compute summary" }, { status: 500 });
  }
}
