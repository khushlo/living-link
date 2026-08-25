import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type AuditAction = "READ" | "CREATE" | "UPDATE" | "DELETE" | "EXPORT" | "CONSENT";

export async function recordAuditEvent(
  req: NextRequest,
  clerkId: string | null,
  action: AuditAction,
  resourceType: string,
  resourceId?: string,
  metadata: Record<string, string | number | boolean | null> = {}
) {
  try {
    const user = clerkId
      ? await prisma.user.findUnique({ where: { clerkId }, select: { id: true } })
      : null;

    await prisma.auditLog.create({
      data: {
        userId: user?.id,
        action,
        resourceType,
        resourceId,
        ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
        userAgent: req.headers.get("user-agent"),
        metadata,
      },
    });
  } catch (error) {
    // Audit failures must be observable but must not expose internal details to users.
    console.error("Audit event could not be recorded", error);
  }
}
