import { NextRequest, NextResponse } from "next/server";
import { requireAuthWithUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";
import { mapBMIToFHIRObservation, mapBPToFHIRObservation, mapDonorToFHIRPatient, mapEGFRToFHIRObservation, createFHIRBundle } from "@/lib/fhir/mappers";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { userId, user, error } = await requireAuthWithUser();
  if (error || !userId || !user) return error;
  const profile = await prisma.donorProfile.findUnique({ where: { userId: user.id }, include: { eligibilityChecks: true } });
  const resources: object[] = [];
  if (profile) {
    resources.push(mapDonorToFHIRPatient({ id: profile.id, firstName: user.firstName, lastName: user.lastName, preferredLang: user.preferredLang }));
    for (const check of profile.eligibilityChecks) {
      if (check.bmi != null) resources.push(mapBMIToFHIRObservation(profile.id, check.bmi, check.assessedAt));
      if (check.bpSystolic != null && check.bpDiastolic != null) resources.push(mapBPToFHIRObservation(profile.id, check.bpSystolic, check.bpDiastolic, check.assessedAt));
      if (check.egfr != null) resources.push(mapEGFRToFHIRObservation(profile.id, check.egfr, check.assessedAt));
    }
  }
  await recordAuditEvent(req, userId, "EXPORT", "PersonalFHIRExport", profile?.id);
  return NextResponse.json(createFHIRBundle("collection", resources), { headers: { "Content-Disposition": 'attachment; filename="livinglink-personal-fhir.json"' } });
}
