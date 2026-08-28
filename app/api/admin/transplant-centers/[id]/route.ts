import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";

const centerSchema = z.object({
  name: z.string().trim().min(2).max(200),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  optnId: z.string().trim().max(30).optional().or(z.literal("")),
  fhirOrgId: z.string().trim().max(256).optional().or(z.literal("")),
});

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId, error } = await requirePermission("admin:write");
  if (error || !userId) return error;
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) return NextResponse.json({ error: "Invalid center ID" }, { status: 400 });
  const parsed = centerSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Provide valid center details" }, { status: 400 });
  const center = await prisma.transplantCenter.update({ where: { id }, data: { name: parsed.data.name, city: parsed.data.city, state: parsed.data.state, optnId: parsed.data.optnId || null, fhirOrgId: parsed.data.fhirOrgId || null } }).catch(() => null);
  if (!center) return NextResponse.json({ error: "Center not found or OPTN ID is already in use" }, { status: 404 });
  await recordAuditEvent(req, userId, "UPDATE", "TransplantCenter", center.id, { state: center.state });
  return NextResponse.json(center);
}
