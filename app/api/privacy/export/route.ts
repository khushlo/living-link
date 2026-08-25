import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuthWithUser } from "@/lib/api-auth";
import { decryptField } from "@/lib/field-encryption";
import { recordAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Personal export only. It never accepts a donor ID or center filter from the client.
export async function GET(req: NextRequest) {
  const { userId, user, error } = await requireAuthWithUser();
  if (error || !userId || !user) return error;

  const profile = await prisma.donorProfile.findUnique({
    where: { userId: user.id },
    include: {
      eligibilityChecks: true,
      healthGoals: { include: { progressLogs: true } },
      financialRecords: true,
      checkins: true,
      phq2Responses: { include: { escalation: true } },
      consentRecords: true,
    },
  });

  const exportData = {
    exportedAt: new Date().toISOString(),
    format: "LivingLink personal data export v1",
    account: { email: user.email, firstName: user.firstName, lastName: user.lastName },
    donorProfile: profile ? {
      id: profile.id,
      donationStatus: profile.donationStatus,
      consentedAt: profile.consentedAt,
      consentVersion: profile.consentVersion,
      researchConsent: profile.researchConsent,
      eligibilityChecks: profile.eligibilityChecks,
      healthGoals: profile.healthGoals.map((goal) => ({
        ...goal,
        progressLogs: goal.progressLogs.map((log) => ({ ...log, note: decryptField(log.note) })),
      })),
      financialRecords: profile.financialRecords.map((record) => ({ ...record, description: decryptField(record.description) })),
      checkins: profile.checkins.map((checkin) => ({ ...checkin, notes: decryptField(checkin.notes) })),
      phq2Responses: profile.phq2Responses,
      consentRecords: profile.consentRecords,
    } : null,
  };

  await recordAuditEvent(req, userId, "EXPORT", "PersonalDataExport");
  return NextResponse.json(exportData, {
    headers: { "Content-Disposition": 'attachment; filename="livinglink-personal-data.json"' },
  });
}
