import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error || !userId) return error;
  const admin = await prisma.user.findUnique({ where: { clerkId: userId }, select: { id: true, role: true } });
  if (!admin || admin.role !== "ADMIN") return NextResponse.json({ error: "Administrator access required" }, { status: 403 });

  const expiredSessions = await prisma.smartSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  const dueReminders = await prisma.lifeAfterReminder.findMany({
    where: { dueAt: { lte: new Date() }, sentAt: null, completedAt: null },
    include: { donorProfile: { include: { user: true } } },
  });
  if (dueReminders.length > 0) {
    await prisma.notification.createMany({ data: dueReminders.map((reminder) => ({
      userId: reminder.donorProfile.user.id,
      type: "checkin_due",
      title: "LifeAfter check-in due",
      body: `Your ${reminder.week.replaceAll("_", " ").toLowerCase()} follow-up check-in is due.`,
      payload: { week: reminder.week, reminderId: reminder.id },
    })) });
    await prisma.lifeAfterReminder.updateMany({ where: { id: { in: dueReminders.map(({ id }) => id) } }, data: { sentAt: new Date() } });
  }
  await recordAuditEvent(req, userId, "DELETE", "ExpiredSmartSessions", undefined, { count: expiredSessions.count });
  return NextResponse.json({ deletedSmartSessions: expiredSessions.count, sentLifeAfterReminders: dueReminders.length });
}
