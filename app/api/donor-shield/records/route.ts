import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
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
    const clerkUser = await currentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress;
    if (!clerkUser || !email) {
      return NextResponse.json({ error: "Unable to load authenticated user" }, { status: 401 });
    }

    // Clerk users may not have a local row yet because provisioning is deferred.
    const user = await prisma.user.upsert({
      where: { clerkId: userId! },
      update: {},
      create: {
        clerkId: userId!,
        email,
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
      },
      select: { id: true },
    });

    // A donor profile is created lazily so first-time donors can log an expense.
    const donorProfile = await prisma.donorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id },
    });

    const record = await prisma.financialRecord.create({
      data: { donorProfileId: donorProfile.id, ...parsed.data } as any,
    });
    return NextResponse.json(record, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create record" }, { status: 500 });
  }
}
