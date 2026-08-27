import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

type AuditAction = "READ" | "CREATE" | "UPDATE" | "DELETE" | "EXPORT" | "CONSENT";
type AuditMetadata = Record<string, string | number | boolean | null>;

export type AuditResult = { recorded: true } | { recorded: false; error: "delivery_failed" };

type AuditHealth = {
  attempted: number;
  recorded: number;
  failed: number;
  consecutiveFailures: number;
  lastFailureAt: string | null;
};

const auditHealth: AuditHealth = {
  attempted: 0,
  recorded: 0,
  failed: 0,
  consecutiveFailures: 0,
  lastFailureAt: null,
};

export function getAuditHealth(): AuditHealth {
  return { ...auditHealth };
}

function requestContext(req: NextRequest) {
  return {
    requestId: req.headers.get("x-request-id") ?? req.headers.get("x-correlation-id") ?? null,
    source: req.headers.get("x-audit-source") ?? "http",
  };
}

export async function recordAuditEvent(
  req: NextRequest,
  clerkId: string | null,
  action: AuditAction,
  resourceType: string,
  resourceId?: string,
  metadata: AuditMetadata = {}
): Promise<AuditResult> {
  auditHealth.attempted += 1;
  const context = requestContext(req);
  const auditMetadata = { ...metadata, ...context };

  for (let attempt = 1; attempt <= 2; attempt += 1) {
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
          metadata: auditMetadata,
        },
      });
      auditHealth.recorded += 1;
      auditHealth.consecutiveFailures = 0;
      return { recorded: true };
    } catch (error) {
      if (attempt === 2) {
        auditHealth.failed += 1;
        auditHealth.consecutiveFailures += 1;
        auditHealth.lastFailureAt = new Date().toISOString();
        // Keep request responses safe while exposing a searchable delivery failure.
        console.error("Audit event delivery failed", {
          action,
          resourceType,
          requestId: context.requestId,
          attempts: attempt,
          error: error instanceof Error ? error.name : "unknown",
        });
        return { recorded: false, error: "delivery_failed" };
      }
    }
  }

  return { recorded: false, error: "delivery_failed" };
}
