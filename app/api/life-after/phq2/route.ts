import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";
import { z } from "zod";

export const dynamic = "force-dynamic";

const phq2Schema = z.object({ q1Score: z.number().min(0).max(3), q2Score: z.number().min(0).max(3) });

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = phq2Schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId: userId! },
      include: { donorProfile: true },
    });
    if (!user?.donorProfile) return NextResponse.json({ error: "Donor profile not found" }, { status: 404 });

    const total = parsed.data.q1Score + parsed.data.q2Score;
    const isEscalated = total >= 3;

    const response = await prisma.pHQ2Response.create({
      data: {
        donorProfileId: user.donorProfile.id,
        q1Score: parsed.data.q1Score,
        q2Score: parsed.data.q2Score,
        totalScore: total,
        isEscalated,
      },
    });
    let escalationId: string | null = null;
    if (isEscalated) {
      const escalation = await prisma.safetyEscalation.create({
        data: { phq2ResponseId: response.id },
      });
      escalationId = escalation.id;

      const administrators = await prisma.user.findMany({
        where: { role: "ADMIN" },
        select: { id: true },
      });
      if (administrators.length > 0) {
        await prisma.notification.createMany({
          data: administrators.map((administrator) => ({
            userId: administrator.id,
            type: "safety_escalation",
            title: "Safety escalation requires review",
            body: "A donor screening response requires timely clinical review.",
            payload: { escalationId },
          })),
        });
      }
    }
    await recordAuditEvent(req, userId, "CREATE", "PHQ2Response", response.id, {
      escalated: isEscalated,
    });

    return NextResponse.json({
      ...response,
      escalationId,
      message: isEscalated
        ? "Your responses suggest you may benefit from speaking with a mental health professional. If you may harm yourself or feel unsafe, call or text 988 in the United States or contact local emergency services. A designated LivingLink reviewer has been notified, but this tool is not monitored for emergencies."
        : "Thank you for completing your check-in.",
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit PHQ-2" }, { status: 500 });
  }
}
