import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const stageSchema = z.object({
  stage: z.enum(["INITIAL_INQUIRY", "BLOODWORK", "IMAGING", "CARDIAC_EVAL", "PSYCH_EVAL", "FINAL_REVIEW", "APPROVED", "DECLINED"]),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
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
    const now = Date.now();
    await recordAuditEvent(req, userId!, "READ", "DonorEvaluation", undefined, {
      centerId: (user!.center as any).centerId,
    });
    return NextResponse.json(evaluations.map((evaluation) => ({
      ...evaluation,
      isStalled: evaluation.stage !== "APPROVED" && evaluation.stage !== "DECLINED" &&
        now - evaluation.updatedAt.getTime() > 14 * 24 * 60 * 60 * 1000,
    })));
  } catch {
    return NextResponse.json({ error: "Failed to fetch evaluations" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;

  const { id } = await params;
  const body = await req.json();
  const parsed = stageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { center: true },
    });
    if (!user?.center || user.role !== "COORDINATOR") {
      return NextResponse.json({ error: "Coordinator access required" }, { status: 403 });
    }

    const existing = await prisma.donorEvaluation.findFirst({
      where: { id, centerId: user.center.centerId },
      select: { id: true },
    });
    if (!existing) return NextResponse.json({ error: "Evaluation not found" }, { status: 404 });

    const current = await prisma.donorEvaluation.findUnique({ where: { id }, select: { stage: true, stageHistory: true } });
    const history = Array.isArray(current?.stageHistory) ? current.stageHistory : [];
    const evaluation = await prisma.donorEvaluation.update({
      where: { id },
      data: {
        stage: parsed.data.stage as any,
        notes: parsed.data.notes,
        isStalled: false,
        stageHistory: [...history, { from: current?.stage ?? null, to: parsed.data.stage, changedAt: new Date().toISOString(), changedBy: userId }],
      },
    });
    await recordAuditEvent(req, userId, "UPDATE", "DonorEvaluation", evaluation.id, {
      centerId: user.center.centerId,
      stage: parsed.data.stage,
    });
    return NextResponse.json(evaluation);
  } catch {
    return NextResponse.json({ error: "Failed to update evaluation" }, { status: 500 });
  }
}
