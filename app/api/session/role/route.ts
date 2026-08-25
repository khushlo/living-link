import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } });
  return NextResponse.json({ role: user?.role.toLowerCase() ?? "donor" });
}
