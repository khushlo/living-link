import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "./auth";

export async function auditMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // Log PHI-touching routes only
  const phiRoutes = ["/ready-check", "/donor-shield", "/life-after"];
  const isPhiRoute = phiRoutes.some((r) => req.path.startsWith(r));

  if (isPhiRoute && req.clerkUserId) {
    try {
      await prisma.auditLog.create({
        data: {
          action: req.method === "GET" ? "READ" : "WRITE",
          resourceType: req.path.split("/")[1] ?? "unknown",
          ipAddress: req.ip,
          userAgent: req.headers["user-agent"] ?? null,
          metadata: { method: req.method, path: req.path },
        },
      });
    } catch {
      // Audit failure should never block the request
      console.error("Audit log write failed");
    }
  }
  next();
}
