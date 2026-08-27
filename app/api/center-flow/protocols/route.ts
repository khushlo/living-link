import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { z } from "zod";
import { recordAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const protocolSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  focusArea: z.enum(["PUBLIC_AWARENESS", "DONOR_READINESS", "DONOR_INTERVENTIONS", "CENTER_PRACTICES", "DONOR_OUTCOMES"]),
  tags: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  const { error } = await requirePermission("center:evaluations:read");
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const focusArea = searchParams.get("focusArea");
  const search = searchParams.get("search");

  try {
    const protocols = await prisma.protocol.findMany({
      where: {
        isPublished: true,
        ...(focusArea ? { focusArea: focusArea as any } : {}),
        ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
      },
      orderBy: { publishedAt: "desc" },
    });
    return NextResponse.json(protocols);
  } catch {
    return NextResponse.json({ error: "Failed to fetch protocols" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId, error, user } = await requirePermission("center:protocols:write");
  if (error) return error;

  const body = await req.json();
  const parsed = protocolSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const member = user!.role === "ADMIN" ? null : await prisma.centerMembership.findUnique({ where: { userId: user!.id } });
    const protocol = await prisma.protocol.create({
      data: {
        ...parsed.data,
        focusArea: parsed.data.focusArea as any,
        centerId: member?.centerId ?? null,
        isPublished: false,
      } as any,
    });
    await recordAuditEvent(req, userId, "CREATE", "Protocol", protocol.id);
    return NextResponse.json(protocol, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create protocol" }, { status: 500 });
  }
}
