import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const centerSchema = z.object({
  name: z.string().trim().min(2).max(200),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  optnId: z.string().trim().max(30).optional().or(z.literal("")),
  fhirOrgId: z.string().trim().max(256).optional().or(z.literal("")),
});

export async function GET(req: NextRequest) {
  const { userId, error } = await requirePermission("admin:read");
  if (error || !userId) return error;
  const centers = await prisma.transplantCenter.findMany({
    orderBy: [{ state: "asc" }, { name: "asc" }],
    include: { _count: { select: { members: true, ehrConnections: true, evaluations: true } } },
  });
  await recordAuditEvent(req, userId, "READ", "TransplantCenter");
  return NextResponse.json(centers);
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requirePermission("admin:write");
  if (error || !userId) return error;
  const parsed = centerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Provide a valid center name, city, two-letter state, and optional identifiers" }, { status: 400 });
  const center = await prisma.transplantCenter.create({
    data: { name: parsed.data.name, city: parsed.data.city, state: parsed.data.state, optnId: parsed.data.optnId || null, fhirOrgId: parsed.data.fhirOrgId || null },
  }).catch((cause) => {
    if (cause instanceof Error && cause.message.includes("Unique constraint")) return null;
    throw cause;
  });
  if (!center) return NextResponse.json({ error: "A center with that OPTN ID already exists" }, { status: 409 });
  await recordAuditEvent(req, userId, "CREATE", "TransplantCenter", center.id, { state: center.state });
  return NextResponse.json(center, { status: 201 });
}
