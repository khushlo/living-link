import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ goalId: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { goalId } = await params;
  const { value, note } = await req.json();

  try {
    const log = await prisma.goalProgressLog.create({
      data: { goalId, value: Number(value), note },
    });
    await prisma.healthGoal.update({
      where: { id: goalId },
      data: { currentValue: Number(value) },
    });
    return NextResponse.json(log, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to log progress" }, { status: 500 });
  }
}
