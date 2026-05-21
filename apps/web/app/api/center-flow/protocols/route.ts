import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const protocolSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  focusArea: z.enum(["PUBLIC_AWARENESS", "DONOR_READINESS", "DONOR_INTERVENTIONS", "CENTER_PRACTICES", "DONOR_OUTCOMES"]),
  tags: z.array(z.string()).default([]),
});

export async function GET(req: NextRequest) {
  const { error } = await requireAuth();
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
  const { userId, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = protocolSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId! },
      include: { center: true },
    });
    const protocol = await prisma.protocol.create({
      data: {
        ...parsed.data,
        focusArea: parsed.data.focusArea as any,
        centerId: (user?.center as any)?.centerId ?? null,
        isPublished: false,
      },
    });
    return NextResponse.json(protocol, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create protocol" }, { status: 500 });
  }
}
