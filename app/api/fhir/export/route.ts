/**
 * FHIR Bulk Data Export - LifeAfter Outcomes
 *
 * Implements FHIR Bulk Data Access IG (R4):
 * https://hl7.org/fhir/uv/bulkdata/
 *
 * Endpoint: POST /api/fhir/export
 * Returns NDJSON (newline-delimited JSON) for:
 *   - Patient (pseudonymized; not HIPAA de-identified)
 *   - Observation (BP, weight, mood, energy from post-donation check-ins)
 *   - QuestionnaireResponse (PHQ-2)
 *   - CarePlan (post-donation timeline)
 *
 * Used for OPTN Policy 18 automated outcomes reporting → HRSA
 * and approved operational analytics workflows
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/api-auth";
import { recordAuditEvent } from "@/lib/audit";
import {
  mapDonorToFHIRPatient,
  mapBPToFHIRObservation,
  mapPHQ2ToFHIRQuestionnaireResponse,
  mapPostDonationCarePlan,
  createFHIRBundle,
} from "@/lib/fhir/mappers";

export const dynamic = "force-dynamic";

// This removes direct identifiers but is only pseudonymization, not HIPAA de-identification.
function pseudonymizePatient(patient: ReturnType<typeof mapDonorToFHIRPatient>) {
  const { name: _name, birthDate: _dob, telecom: _tel, ...deidentified } = patient;
  return {
    ...deidentified,
    id: `anon-${Buffer.from(patient.id).toString("base64").slice(0, 8)}`,
  };
}

export async function POST(req: NextRequest) {
  const { userId, error } = await requireAuth();
  if (error) return error;

  // Cross-center export remains restricted to an explicitly provisioned system administrator
  // until donor-to-center data scoping is implemented.
  const user = await prisma.user.findUnique({ where: { clerkId: userId! } });
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Insufficient permissions for bulk export" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const outputFormat = searchParams.get("_outputFormat") ?? "application/fhir+ndjson";
  const since        = searchParams.get("_since");

  const sinceDate = since ? new Date(since) : new Date(0);

  try {
    // Load all donor profiles with check-ins and PHQ-2
    const profiles = await prisma.donorProfile.findMany({
      where: { updatedAt: { gte: sinceDate } },
      include: {
        user: true,
        checkins: { orderBy: { completedAt: "asc" } },
        phq2Responses:        { orderBy: { completedAt: "asc" } },
      },
    });

    const patientResources:  object[] = [];
    const observationResources: object[] = [];
    const qrResources:       object[] = [];
    const carePlanResources: object[] = [];

    for (const profile of profiles) {
      const donorRecord = {
        id: profile.id,
        firstName: undefined, // de-identified
        lastName:  undefined,
        dateOfBirth: undefined,
        gender: undefined,
        preferredLang: profile.user.preferredLang,
      };

      const patient = mapDonorToFHIRPatient(donorRecord as any);
      const exportPatient = pseudonymizePatient(patient);
      const exportPatientId = exportPatient.id;
      patientResources.push(exportPatient);

      // BP + vitals observations from check-ins
      for (const checkin of profile.checkins) {
        if (checkin.bpSystolic && checkin.bpDiastolic) {
          observationResources.push(
            mapBPToFHIRObservation(exportPatientId, checkin.bpSystolic, checkin.bpDiastolic, checkin.completedAt)
          );
        }
        if (checkin.weightKg) {
          observationResources.push({
            resourceType: "Observation",
            id: `weight-${checkin.id}`,
            status: "final",
            code: { coding: [{ system: "http://loinc.org", code: "29463-7", display: "Body weight" }] },
            subject: { reference: `Patient/${exportPatientId}` },
            effectiveDateTime: checkin.completedAt.toISOString(),
            valueQuantity: { value: checkin.weightKg, unit: "kg", system: "http://unitsofmeasure.org", code: "kg" },
          });
        }
      }

      // PHQ-2 responses
      for (const phq2 of profile.phq2Responses) {
        qrResources.push(
          mapPHQ2ToFHIRQuestionnaireResponse(
            exportPatientId, phq2.id, phq2.q1Score, phq2.q2Score, phq2.completedAt
          )
        );
      }

      // CarePlan
      if (profile.checkins.length > 0) {
        carePlanResources.push(
          mapPostDonationCarePlan(
            exportPatientId,
            profile.checkins.map((c) => ({ id: c.id, weekNumber: String(c.week) }))
          )
        );
      }
    }

    // Return as FHIR Bundle or NDJSON depending on _outputFormat
    if (outputFormat === "application/fhir+ndjson") {
      const allResources = [...patientResources, ...observationResources, ...qrResources, ...carePlanResources];
      const ndjson = allResources.map((r) => JSON.stringify(r)).join("\n");
      await recordAuditEvent(req, userId, "EXPORT", "FHIRBulkExport", undefined, {
        format: "ndjson",
        resourceCount: allResources.length,
      });

      return new NextResponse(ndjson, {
        headers: {
          "Content-Type": "application/fhir+ndjson",
          "Content-Disposition": `attachment; filename="livinglink-bulk-export-${new Date().toISOString().split("T")[0]}.ndjson"`,
          "X-Total-Resources": String(allResources.length),
          "X-FHIR-Release": "R4",
          "X-Export-Timestamp": new Date().toISOString(),
        },
      });
    }

    // Default: return as FHIR transaction Bundle
    const bundle = createFHIRBundle("collection", [
      ...patientResources,
      ...observationResources,
      ...qrResources,
      ...carePlanResources,
    ]);
    await recordAuditEvent(req, userId, "EXPORT", "FHIRBulkExport", undefined, {
      format: "bundle",
      resourceCount: bundle.entry?.length ?? 0,
    });

    return NextResponse.json(bundle, {
      headers: { "Content-Type": "application/fhir+json" },
    });
  } catch (err) {
    console.error("[FHIR Export]", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

/**
 * GET /api/fhir/export - capability statement for bulk export
 */
export async function GET() {
  return NextResponse.json({
    resourceType: "CapabilityStatement",
    status: "active",
    kind: "capability",
    software: { name: "LivingLink", version: "1.0" },
    rest: [
      {
        mode: "server",
        operation: [
          {
            name:       "$export",
            definition: "http://hl7.org/fhir/uv/bulkdata/OperationDefinition/group-export",
            documentation: "Export pseudonymized LifeAfter outcomes for authorized operational workflows.",
          },
        ],
      },
    ],
  });
}
