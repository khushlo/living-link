import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const inquirySchema = z.object({
  name: z.string().trim().min(2).max(150),
  organization: z.string().trim().min(2).max(200),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  inquiryType: z.enum(["ehr", "transplant-center", "research", "partnership", "other"]),
  message: z.string().trim().min(10).max(2000),
  secret: z.string().max(0).optional(),
});

type LimitEntry = { count: number; resetAt: number };
const globalForContact = globalThis as unknown as { contactLimits?: Map<string, LimitEntry> };
const contactLimits = globalForContact.contactLimits ?? new Map<string, LimitEntry>();
globalForContact.contactLimits = contactLimits;

function rateLimit(req: NextRequest) {
  const key = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const current = contactLimits.get(key);
  if (!current || current.resetAt <= now) {
    contactLimits.set(key, { count: 1, resetAt: now + 60 * 60_000 });
    return null;
  }
  if (current.count >= 5) {
    return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });
  }
  current.count += 1;
  return null;
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req);
  if (limited) return limited;
  const parsed = inquirySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please provide valid contact details and a message.", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const value = parsed.data;
  const inquiry = await prisma.contactInquiry.create({
    data: {
      name: value.name,
      organization: value.organization,
      email: value.email.toLowerCase(),
      phone: value.phone || null,
      inquiryType: value.inquiryType,
      message: value.message,
    },
    select: { id: true },
  });
  await recordAuditEvent(req, null, "CREATE", "ContactInquiry", inquiry.id, { inquiryType: value.inquiryType });
  return NextResponse.json({ id: inquiry.id, message: "Thanks. Our team will be in touch soon." }, { status: 201 });
}
