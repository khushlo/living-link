import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const stageSchema = z.object({
  id: z.string().uuid(),
  stage: z.enum(["INITIAL_INQUIRY", "BLOODWORK", "IMAGING", "CARDIAC_EVAL", "PSYCH_EVAL", "FINAL_REVIEW", "APPROVED", "DECLINED"]),
  notes: z.string().optional(),
});
const createSchema = z.object({
  donorRef: z.string().min(1).max(120),
  stage: z.enum(["INITIAL_INQUIRY", "BLOODWORK", "IMAGING", "CARDIAC_EVAL", "PSYCH_EVAL", "FINAL_REVIEW", "APPROVED", "DECLINED"]).optional(),
  notes: z.string().max(5000).optional(),
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

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  try {
    const user = await prisma.user.findUnique({ where: { clerkId: userId }, include: { center: true } });
    if (!user?.center || user.role !== "COORDINATOR") return NextResponse.json({ error: "Coordinator access required" }, { status: 403 });
    const evaluation = await prisma.donorEvaluation.create({
      data: {
        centerId: user.center.centerId,
        donorRef: parsed.data.donorRef,
        stage: parsed.data.stage ?? "INITIAL_INQUIRY",
        notes: parsed.data.notes,
        stageHistory: [{ from: null, to: parsed.data.stage ?? "INITIAL_INQUIRY", changedAt: new Date().toISOString(), changedBy: userId }],
      },
    });
    await recordAuditEvent(req, userId, "CREATE", "DonorEvaluation", evaluation.id, { centerId: user.center.centerId });
    return NextResponse.json(evaluation, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create evaluation" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest
) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;

  const body = await req.json();
  const parsed = stageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const { id, ...changes } = parsed.data;
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
        stage: changes.stage as any,
        notes: changes.notes,
        isStalled: false,
        stageHistory: [...history, { from: current?.stage ?? null, to: changes.stage, changedAt: new Date().toISOString(), changedBy: userId }],
      },
    });
    await recordAuditEvent(req, userId, "UPDATE", "DonorEvaluation", evaluation.id, {
      centerId: user.center.centerId,
      stage: changes.stage,
    });
    return NextResponse.json(evaluation);
  } catch {
    return NextResponse.json({ error: "Failed to update evaluation" }, { status: 500 });
  }
}
