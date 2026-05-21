import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

export const dynamic = "force-dynamic";

const recordSchema = z.object({
  itemType: z.enum(["travel", "lodging", "childcare", "medical", "lost_wage", "other"]),
  description: z.string().optional(),
  amount: z.number().positive(),
});

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId! },
      include: { donorProfile: { include: { financialRecords: { orderBy: { createdAt: "desc" } } } } },
    });
    return NextResponse.json(user?.donorProfile?.financialRecords ?? []);
  } catch {
    return NextResponse.json({ error: "Failed to fetch records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = recordSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId! },
      include: { donorProfile: true },
    });
    if (!user?.donorProfile) return NextResponse.json({ error: "Donor profile not found" }, { status: 404 });

    const record = await prisma.financialRecord.create({
      data: { donorProfileId: user.donorProfile.id, ...parsed.data } as any,
    });
    return NextResponse.json(record, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
