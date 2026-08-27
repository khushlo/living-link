/**
 * CDS Hooks Service - LivingLink
 *
 * Implements CDS Hooks 1.0 spec: https://cds-hooks.hl7.org/
 *
 * Hook: patient-view
 * Trigger: Clinician opens a patient chart in EHR
 * Card: Alert when patient has an active ReadyCheck or is a known living donor candidate
 *
 * Endpoints:
 *   GET  /api/cds-hooks          → CDS Hooks discovery (service manifest)
 *   POST /api/cds-hooks/patient-view → patient-view hook handler
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

function hasAuthorizedServiceToken(req: NextRequest) {
  const expectedToken = process.env.CDS_HOOKS_BEARER_TOKEN;
  if (!expectedToken) return false;
  return req.headers.get("authorization") === `Bearer ${expectedToken}`;
}

// ─── Discovery ────────────────────────────────────────────────────────────────

export async function GET() {
  return NextResponse.json({
    services: [
      {
        hook:        "patient-view",
        id:          "livinglink-readycheck-alert",
        title:       "LivingLink ReadyCheck Alert",
        description: "Alerts clinicians when the current patient is exploring living kidney donation via LivingLink's ReadyCheck module.",
        prefetch: {
          patient: "Patient/{{context.patientId}}",
        },
      },
      {
        hook:        "patient-view",
        id:          "livinglink-stalled-evaluation",
        title:       "LivingLink Stalled Evaluation Alert",
        description: "Alerts transplant coordinators when a donor evaluation has been stalled beyond threshold.",
        prefetch: {
          patient: "Patient/{{context.patientId}}",
        },
      },
    ],
  });
}

// ─── Hook Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  if (!hasAuthorizedServiceToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ cards: [] });

  const hookId    = body.hookInstance as string | undefined;
  const serviceId = body.service as string | undefined;
  const patientId = body.context?.patientId as string | undefined;
  await recordAuditEvent(req, null, "READ", "CDSHook", undefined, { hookReceived: true });

  const cards: object[] = [];

  if (!patientId) return NextResponse.json({ cards });

  try {
    // Look up donor by FHIR patient ID (stored as externalId on DonorProfile)
    const donorProfile = await prisma.donorProfile.findFirst({
      where: { fhirPatientId: patientId },
      include: { eligibilityChecks: { orderBy: { assessedAt: "desc" }, take: 1 } },
    }).catch(() => null);

    if (donorProfile) {
      const latestCheck = donorProfile.eligibilityChecks[0];

      // Card 1: Active ReadyCheck found
      cards.push({
        summary: "LivingLink: Living Donor Candidate Active",
        detail: latestCheck
          ? `This patient completed a LivingLink ReadyCheck on ${new Date(latestCheck.assessedAt).toLocaleDateString()}. AI summary available in the LivingLink portal.`
          : "This patient has an active living donor evaluation in LivingLink.",
        indicator: "info",
        source: {
          label: "LivingLink",
          url: `${process.env.NEXT_PUBLIC_APP_URL}/clinician/center-flow`,
          icon: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
        },
        links: [
          {
            label:    "View in LivingLink CenterFlow",
            url:      `${process.env.NEXT_PUBLIC_APP_URL}/clinician/center-flow`,
            type:     "absolute",
          },
        ],
      });

      if (serviceId === "livinglink-stalled-evaluation") {
        const stalled = await prisma.donorEvaluation.findFirst({
          where: {
            donorRef: patientId,
            stage: { notIn: ["APPROVED", "DECLINED"] },
            updatedAt: { lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
          },
          select: { id: true, stage: true, daysElapsed: true },
        });
        if (stalled) {
          cards.push({
            summary: "LivingLink: Evaluation is stalled",
            detail: `This donor evaluation has been in ${stalled.stage} for ${stalled.daysElapsed} days. Review CenterFlow for the blocked step.`,
            indicator: "warning",
            source: { label: "LivingLink", url: `${process.env.NEXT_PUBLIC_APP_URL}/coordinator/center-flow` },
            links: [{ label: "Open CenterFlow", url: `${process.env.NEXT_PUBLIC_APP_URL}/coordinator/center-flow`, type: "absolute" }],
          });
        }
      }
    }
  } catch {
    // Fail gracefully - CDS card failure must not break EHR workflow
    return NextResponse.json({ cards: [] });
  }

  return NextResponse.json({ cards });
}
