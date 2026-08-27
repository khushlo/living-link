import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const linkSchema = z.object({
  connectionId: z.string().uuid(),
  donorProfileId: z.string().uuid(),
  externalPatientId: z.string().trim().min(1).max(256),
  confirmed: z.literal(true),
});

async function centerForUser(userId: string) {
  return prisma.centerMembership.findUnique({ where: { userId }, select: { centerId: true } });
}

export async function GET(req: NextRequest) {
  const { userId, user, error } = await requirePermission("center:patient-links:read");
  if (error || !userId || !user) return error;

  const membership = await centerForUser(user.id);
  if (!membership) return NextResponse.json({ error: "Center membership required" }, { status: 403 });

  const query = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const connections = await prisma.eHRConnection.findMany({
    where: { organizationCenterId: membership.centerId, enabled: true },
    select: {
      id: true,
      issuer: true,
      vendor: true,
      environment: true,
      externalPatientMappings: {
        where: { donorProfile: { centerAuthorizations: { some: { centerId: membership.centerId, revokedAt: null } } } },
        orderBy: { updatedAt: "desc" },
        include: { donorProfile: { select: { id: true, user: { select: { firstName: true, lastName: true, email: true } } } } },
      },
    },
  });

  const donors = query.length >= 2
    ? await prisma.donorProfile.findMany({
        where: {
          centerAuthorizations: { some: { centerId: membership.centerId, revokedAt: null } },
          user: {
            OR: [
              { email: { contains: query, mode: "insensitive" } },
              { firstName: { contains: query, mode: "insensitive" } },
              { lastName: { contains: query, mode: "insensitive" } },
            ],
          },
        },
        select: { id: true, user: { select: { firstName: true, lastName: true, email: true } } },
        take: 20,
      })
    : [];

  await recordAuditEvent(req, userId, "READ", "ExternalPatientMapping", undefined, { centerId: membership.centerId });
  return NextResponse.json({
    connections: connections.map(({ externalPatientMappings, ...connection }) => ({
      ...connection,
      mappings: externalPatientMappings.map((mapping) => ({
        id: mapping.id,
        externalPatientId: mapping.externalPatientId,
        donorProfile: mapping.donorProfile,
        updatedAt: mapping.updatedAt,
      })),
    })),
    donors: donors.map((donor) => ({ ...donor, hasEhrConsent: true })),
  });
}

export async function POST(req: NextRequest) {
  const { userId, user, error } = await requirePermission("center:patient-links:write");
  if (error || !userId || !user) return error;

  const parsed = linkSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Confirm the patient identity and provide valid linking details" }, { status: 400 });

  const membership = await centerForUser(user.id);
  if (!membership) return NextResponse.json({ error: "Center membership required" }, { status: 403 });

  const connection = await prisma.eHRConnection.findFirst({ where: { id: parsed.data.connectionId, organizationCenterId: membership.centerId, enabled: true }, select: { id: true } });
  if (!connection) return NextResponse.json({ error: "EHR connection is not available to this center" }, { status: 404 });

  const donor = await prisma.donorProfile.findFirst({
    where: { id: parsed.data.donorProfileId, centerAuthorizations: { some: { centerId: membership.centerId, revokedAt: null } } },
    select: { id: true },
  });
  if (!donor) {
    return NextResponse.json({ error: "The donor has not authorized this center" }, { status: 403 });
  }

  try {
    const mappingData = {
      connectionId: parsed.data.connectionId,
      donorProfileId: parsed.data.donorProfileId,
      externalPatientId: parsed.data.externalPatientId,
    };
    const mapping = await prisma.externalPatientMapping.create({ data: mappingData, select: { id: true, connectionId: true, donorProfileId: true, externalPatientId: true } });
    await recordAuditEvent(req, userId, "CREATE", "ExternalPatientMapping", mapping.id, { centerId: membership.centerId, connectionId: mapping.connectionId });
    return NextResponse.json(mapping, { status: 201 });
  } catch (cause) {
    if (cause instanceof Error && cause.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "That EHR patient or donor is already linked for this connection" }, { status: 409 });
    }
    return NextResponse.json({ error: "Unable to create patient link" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { userId, user, error } = await requirePermission("center:patient-links:write");
  if (error || !userId || !user) return error;
  const mappingId = req.nextUrl.searchParams.get("id");
  if (!mappingId || !z.string().uuid().safeParse(mappingId).success) return NextResponse.json({ error: "A valid link ID is required" }, { status: 400 });

  const membership = await centerForUser(user.id);
  if (!membership) return NextResponse.json({ error: "Center membership required" }, { status: 403 });
  const mapping = await prisma.externalPatientMapping.findFirst({ where: { id: mappingId, connection: { organizationCenterId: membership.centerId }, donorProfile: { centerAuthorizations: { some: { centerId: membership.centerId, revokedAt: null } } } }, select: { id: true, connectionId: true } });
  if (!mapping) return NextResponse.json({ error: "Patient link not found" }, { status: 404 });
  await prisma.externalPatientMapping.delete({ where: { id: mapping.id } });
  await recordAuditEvent(req, userId, "DELETE", "ExternalPatientMapping", mapping.id, { centerId: membership.centerId, connectionId: mapping.connectionId });
  return NextResponse.json({ ok: true });
}
