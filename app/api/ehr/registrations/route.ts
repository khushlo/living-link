import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

const registrationSchema = z.object({
  organizationName: z.string().trim().min(2).max(200),
  organizationWebsite: z.string().trim().url().max(500).optional().or(z.literal("")),
  contactName: z.string().trim().min(2).max(150),
  contactEmail: z.string().trim().email().max(254),
  contactPhone: z.string().trim().max(30).optional().or(z.literal("")),
  vendor: z.string().trim().min(2).max(100),
  productName: z.string().trim().min(2).max(150),
  environment: z.enum(["sandbox", "test", "production", "other"]),
  fhirIssuer: z.string().trim().url().max(500),
  fhirVersion: z.enum(["R4", "R4B", "unknown"]),
  smartSupported: z.boolean(),
  smartClientId: z.string().trim().max(300).optional().or(z.literal("")),
  cdsHooksSupported: z.boolean(),
  requestedScopes: z.array(z.string().trim().min(1).max(150)).max(20),
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  secret: z.string().max(0).optional(),
}).superRefine((value, context) => {
  if (!value.smartSupported && !value.cdsHooksSupported) context.addIssue({ code: z.ZodIssueCode.custom, message: "Select at least one supported integration standard" });
  if (value.smartSupported && !value.smartClientId) context.addIssue({ code: z.ZodIssueCode.custom, path: ["smartClientId"], message: "SMART client ID is required when SMART support is selected" });
});

const reviewSchema = z.discriminatedUnion("decision", [
  z.object({ id: z.string().uuid(), decision: z.literal("APPROVE"), centerId: z.string().uuid(), clientConfigurationRef: z.string().trim().max(300).optional().or(z.literal("")) }),
  z.object({ id: z.string().uuid(), decision: z.literal("REJECT"), rejectionReason: z.string().trim().min(3).max(1000) }),
]);

type LimitEntry = { count: number; resetAt: number };
const globalForRegistration = globalThis as unknown as { ehrRegistrationLimits?: Map<string, LimitEntry> };
const registrationLimits = globalForRegistration.ehrRegistrationLimits ?? new Map<string, LimitEntry>();
globalForRegistration.ehrRegistrationLimits = registrationLimits;

function normalizedUrl(value: string) {
  const url = new URL(value);
  url.hash = "";
  url.search = "";
  return url.toString().replace(/\/$/, "");
}

function rateLimit(req: NextRequest) {
  const key = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const current = registrationLimits.get(key);
  if (!current || current.resetAt <= now) {
    registrationLimits.set(key, { count: 1, resetAt: now + 60 * 60_000 });
    return null;
  }
  if (current.count >= 5) {
    return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429, headers: { "Retry-After": String(Math.ceil((current.resetAt - now) / 1000)) } });
  }
  current.count += 1;
  return null;
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req);
  if (limited) return limited;
  const parsed = registrationSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please provide valid EHR registration details", details: parsed.error.flatten().fieldErrors }, { status: 400 });

  const value = parsed.data;
  const issuer = normalizedUrl(value.fhirIssuer);
  if (process.env.NODE_ENV === "production" && new URL(issuer).protocol !== "https:") {
    return NextResponse.json({ error: "Production FHIR issuers must use HTTPS" }, { status: 400 });
  }

  const duplicate = await prisma.eHRRegistration.findFirst({
    where: { fhirIssuer: issuer, environment: value.environment, approved: false, rejectedAt: null },
    select: { id: true },
  });
  if (duplicate) return NextResponse.json({ error: "A pending registration already exists for this issuer and environment" }, { status: 409 });

  const registration = await prisma.eHRRegistration.create({
    data: {
      organizationName: value.organizationName,
      organizationWebsite: value.organizationWebsite ? normalizedUrl(value.organizationWebsite) : null,
      contactName: value.contactName,
      contactEmail: value.contactEmail.toLowerCase(),
      contactPhone: value.contactPhone || null,
      vendor: value.vendor,
      productName: value.productName,
      environment: value.environment,
      fhirIssuer: issuer,
      fhirVersion: value.fhirVersion,
      smartSupported: value.smartSupported,
      smartClientId: value.smartClientId || null,
      cdsHooksSupported: value.cdsHooksSupported,
      requestedScopes: value.requestedScopes,
      notes: value.notes || null,
      approved: false,
    },
    select: { id: true },
  });
  await recordAuditEvent(req, null, "CREATE", "EHRRegistration", registration.id, { vendor: value.vendor, environment: value.environment });
  return NextResponse.json({ id: registration.id, approved: false, message: "Registration submitted for administrator review." }, { status: 201 });
}

export async function GET() {
  const { error } = await requirePermission("admin:read");
  if (error) return error;
  const [registrations, centers] = await Promise.all([
    prisma.eHRRegistration.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.transplantCenter.findMany({ select: { id: true, name: true, city: true, state: true }, orderBy: { name: "asc" } }),
  ]);
  return NextResponse.json({ registrations, centers });
}

export async function PATCH(req: NextRequest) {
  const { userId, user, error } = await requirePermission("admin:write");
  if (error || !userId || !user) return error;
  const parsed = reviewSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid review decision" }, { status: 400 });

  const registration = await prisma.eHRRegistration.findUnique({ where: { id: parsed.data.id } });
  if (!registration) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  if (registration.approved || registration.rejectedAt) return NextResponse.json({ error: "Registration has already been reviewed" }, { status: 409 });

  if (parsed.data.decision === "REJECT") {
    const reviewed = await prisma.eHRRegistration.update({ where: { id: registration.id }, data: { approved: false, rejectedAt: new Date(), rejectionReason: parsed.data.rejectionReason, reviewedAt: new Date(), reviewedById: user.id } });
    await recordAuditEvent(req, userId, "UPDATE", "EHRRegistration", registration.id, { decision: "REJECT" });
    return NextResponse.json(reviewed);
  }

  const center = await prisma.transplantCenter.findUnique({ where: { id: parsed.data.centerId }, select: { id: true } });
  if (!center) return NextResponse.json({ error: "Transplant center not found" }, { status: 404 });
  const clientConfigurationRef = "clientConfigurationRef" in parsed.data ? parsed.data.clientConfigurationRef || null : null;
  const existingConnection = await prisma.eHRConnection.findUnique({ where: { issuer_environment: { issuer: registration.fhirIssuer, environment: registration.environment } } });
  if (existingConnection?.organizationCenterId && existingConnection.organizationCenterId !== center.id) {
    return NextResponse.json({ error: "This issuer and environment are already assigned to another center" }, { status: 409 });
  }

  const capabilities = [registration.smartSupported ? "smart-ehr-launch" : null, registration.cdsHooksSupported ? "cds-patient-view" : null].filter((item): item is string => Boolean(item));
  const reviewed = await prisma.$transaction(async (transaction) => {
    const connection = existingConnection
      ? await transaction.eHRConnection.update({ where: { id: existingConnection.id }, data: { vendor: registration.vendor, organizationCenterId: center.id, enabled: true, smartClientId: registration.smartClientId, clientConfigurationRef, allowedCapabilities: capabilities } })
      : await transaction.eHRConnection.create({ data: { issuer: registration.fhirIssuer, vendor: registration.vendor, environment: registration.environment, organizationCenterId: center.id, enabled: true, smartClientId: registration.smartClientId, clientConfigurationRef, allowedCapabilities: capabilities } });
    return transaction.eHRRegistration.update({ where: { id: registration.id }, data: { approved: true, approvedAt: new Date(), reviewedAt: new Date(), reviewedById: user.id, ehrConnectionId: connection.id } });
  });
  await recordAuditEvent(req, userId, "UPDATE", "EHRRegistration", registration.id, { decision: "APPROVE", centerId: center.id });
  return NextResponse.json(reviewed);
}
