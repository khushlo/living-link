import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";

export type Permission =
  | "admin:read"
  | "admin:write"
  | "center:evaluations:read"
  | "center:evaluations:write"
  | "center:protocols:write"
  | "center:patient-links:read"
  | "center:patient-links:write"
  | "fhir:export"
  | "mentor:message"
  | "ai:process";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  ADMIN: ["admin:read", "admin:write", "center:evaluations:read", "center:evaluations:write", "center:protocols:write", "center:patient-links:read", "center:patient-links:write", "fhir:export", "mentor:message", "ai:process"],
  COORDINATOR: ["center:evaluations:read", "center:evaluations:write", "center:protocols:write", "center:patient-links:read", "center:patient-links:write", "mentor:message"],
  CLINICIAN: ["center:evaluations:read", "center:patient-links:read", "center:patient-links:write", "mentor:message"],
  DONOR: ["mentor:message", "ai:process"],
  PATIENT: ["ai:process"],
};

export async function requireAuth() {
  const { userId } = await auth();
  if (!userId) {
    return { userId: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { userId, error: null };
}

export async function requireAuthWithUser() {
  const { userId, error } = await requireAuth();
  if (error || !userId) return { userId: null, user: null, error };

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { donorProfile: true, center: true },
  });
  if (!user) {
    return {
      userId,
      user: null,
      error: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }
  return { userId, user, error: null };
}

export async function requireRole(...roles: string[]) {
  const result = await requireAuthWithUser();
  if (result.error || !result.user) return { ...result, authorized: false };
  if (!roles.includes(result.user.role)) {
    return { ...result, authorized: false, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ...result, authorized: true };
}

export async function requirePermission(permission: Permission) {
  const result = await requireAuthWithUser();
  if (result.error || !result.user) return { ...result, authorized: false };
  if (!ROLE_PERMISSIONS[result.user.role]?.includes(permission)) {
    return { ...result, authorized: false, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { ...result, authorized: true };
}
