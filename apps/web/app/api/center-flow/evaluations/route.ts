import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const stageSchema = z.object({
  stage: z.enum(["INITIAL_INQUIRY", "BLOODWORK", "IMAGING", "CARDIAC_EVAL", "PSYCH_EVAL", "FINAL_REVIEW", "APPROVED", "DECLINED"]),
  notes: z.string().optional(),
});

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId! },
      include: { center: true },
    });
    if (!(user?.center as any)?.centerId) {
      return NextResponse.json({ error: "Not associated with a center" }, { status: 403 });
    }
    const evaluations = await prisma.donorEvaluation.findMany({
      where: { centerId: (user!.center as any).centerId },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(evaluations);
  } catch {
    return NextResponse.json({ error: "Failed to fetch evaluations" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = stageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const evaluation = await prisma.donorEvaluation.update({
      where: { id },
      data: { stage: parsed.data.stage as any, notes: parsed.data.notes, isStalled: false },
    });
    return NextResponse.json(evaluation);
  } catch {
    return NextResponse.json({ error: "Failed to update evaluation" }, { status: 500 });
  }
}
