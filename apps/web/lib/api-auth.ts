import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "./prisma";

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

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) {
    return {
      userId,
      user: null,
      error: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }
  return { userId, user, error: null };
}
