import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { decryptField, encryptField } from "@/lib/field-encryption";
import { recordAuditEvent } from "@/lib/audit";
import { z } from "zod";

const storySchema = z.object({
  body: z.string().trim().min(50).max(5000),
  donationType: z.enum(["directed", "non-directed", "paired-exchange"]),
  donationYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()),
  consent: z.literal("true"),
});

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true, role: true } });
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Administrator access required" }, { status: 403 });
  const submissions = await prisma.storySubmission.findMany({ orderBy: { createdAt: "desc" } });
  await recordAuditEvent(req, userId, "READ", "StorySubmission");
  return NextResponse.json(submissions.map((submission) => ({ ...submission, body: decryptField(submission.body) })));
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const parsed = storySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Please complete all required fields." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const submission = await prisma.storySubmission.create({
    data: {
      userId: user.id,
      body: encryptField(parsed.data.body) as string,
      donationType: parsed.data.donationType,
      donationYear: parsed.data.donationYear,
      consentedAt: new Date(),
    },
    select: { id: true, status: true, createdAt: true },
  });
  await recordAuditEvent(req, userId, "CREATE", "StorySubmission", submission.id);
  return NextResponse.json(submission, { status: 201 });
}
