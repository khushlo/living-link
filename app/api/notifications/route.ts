import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const user = await prisma.user.findUnique({ where: { clerkId: userId! }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
    const unreadCount = notifications.filter((notification) => !notification.readAt).length;
    await recordAuditEvent(req, userId!, "READ", "Notification");

    return NextResponse.json({ notifications, unreadCount });
  } catch {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  try {
    const { notificationId } = await req.json();
    if (!notificationId || typeof notificationId !== "string") {
      return NextResponse.json({ error: "notificationId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { clerkId: userId! }, select: { id: true } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const notification = await prisma.notification.updateMany({
      where: { id: notificationId, userId: user.id },
      data: { readAt: new Date() },
    });
    if (notification.count === 0) return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    await recordAuditEvent(req, userId!, "UPDATE", "Notification", notificationId);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
