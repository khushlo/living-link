import { Request, Response, NextFunction } from "express";
import { createClerkClient, verifyToken } from "@clerk/backend";

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
  clerkUserId?: string;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing authorization header" });
    }

    const token = authHeader.split(" ")[1];

    // Verify with Clerk
    const payload = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY! });
    req.clerkUserId = payload.sub;

    // Get user role from Clerk metadata
    const clerkUser = await clerkClient.users.getUser(payload.sub);
    req.userRole = (clerkUser.publicMetadata?.role as string) || "DONOR";

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
}
