import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";
import { prisma } from "@/lib/prisma";

const decisionSchema = z.object({ centerId: z.string().uuid(), granted: z.boolean() });

export async function GET(req: NextRequest) {
  const { userId, user, error } = await requireRole("DONOR");
  if (error || !userId || !user) return error;

  const centers = await prisma.transplantCenter.findMany({
    orderBy: [{ state: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      city: true,
      state: true,
      donorAuthorizations: {
        where: { donorProfileId: user.donorProfile?.id ?? "" },
        select: { grantedAt: true, revokedAt: true },
      },
    },
  });
  await recordAuditEvent(req, userId, "READ", "DonorCenterAuthorization");
  return NextResponse.json(centers.map(({ donorAuthorizations, ...center }) => ({
    ...center,
    granted: Boolean(donorAuthorizations[0] && !donorAuthorizations[0].revokedAt),
    grantedAt: donorAuthorizations[0]?.grantedAt ?? null,
  })));
}

export async function POST(req: NextRequest) {
  const { userId, user, error } = await requireRole("DONOR");
  if (error || !userId || !user) return error;
  const parsed = decisionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "A valid center consent decision is required" }, { status: 400 });

  const center = await prisma.transplantCenter.findUnique({ where: { id: parsed.data.centerId }, select: { id: true } });
  if (!center) return NextResponse.json({ error: "Center not found" }, { status: 404 });
  const now = new Date();
  const result = await prisma.$transaction(async (transaction) => {
    const profile = await transaction.donorProfile.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id }, select: { id: true } });
    const authorization = await transaction.donorCenterAuthorization.upsert({
      where: { donorProfileId_centerId: { donorProfileId: profile.id, centerId: center.id } },
      create: { donorProfileId: profile.id, centerId: center.id, grantedAt: now, revokedAt: parsed.data.granted ? null : now },
      update: parsed.data.granted ? { grantedAt: now, revokedAt: null } : { revokedAt: now },
    });
    if (!parsed.data.granted) {
      await transaction.externalPatientMapping.deleteMany({
        where: { donorProfileId: profile.id, connection: { organizationCenterId: center.id } },
      });
    }
    return authorization;
  });
  await recordAuditEvent(req, userId, "CONSENT", "DonorCenterAuthorization", result.id, {
    centerId: center.id,
    granted: parsed.data.granted,
  });
  return NextResponse.json({ centerId: center.id, granted: parsed.data.granted, grantedAt: parsed.data.granted ? result.grantedAt : null });
}
