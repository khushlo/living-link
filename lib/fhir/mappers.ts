/**
 * LivingLink FHIR R4 Resource Mappers
 * Maps application domain models → HL7 FHIR R4 resources (US Core profiles)
 *
 * References:
 *  - US Core Patient:         https://hl7.org/fhir/us/core/StructureDefinition-us-core-patient.html
 *  - US Core Observation BMI: https://hl7.org/fhir/us/core/StructureDefinition-us-core-bmi.html
 *  - US Core Observation BP:  https://hl7.org/fhir/us/core/StructureDefinition-us-core-blood-pressure.html
 *  - US Core Goal:            https://hl7.org/fhir/us/core/StructureDefinition-us-core-goal.html
 */

// ─── Base Types ───────────────────────────────────────────────────────────────

export type FHIRCoding = { system: string; code: string; display?: string };
export type FHIRCodeableConcept = { coding: FHIRCoding[]; text?: string };
export type FHIRReference = { reference: string; display?: string };
export type FHIRQuantity = { value: number; unit: string; system: string; code: string };

// ─── Patient (US Core) ────────────────────────────────────────────────────────

export interface DonorRecord {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  dateOfBirth?: Date | null;
  gender?: string | null;
  phoneNumber?: string | null;
  preferredLang?: string | null;
}

export function mapDonorToFHIRPatient(donor: DonorRecord) {
  return {
    resourceType: "Patient" as const,
    id: donor.id,
    meta: {
      profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-patient"],
    },
    identifier: [
      {
        system: "https://livinglink.app/donors",
        value: donor.id,
      },
    ],
    name: donor.firstName || donor.lastName
      ? [{ use: "official", given: donor.firstName ? [donor.firstName] : [], family: donor.lastName ?? "" }]
      : undefined,
    birthDate: donor.dateOfBirth ? donor.dateOfBirth.toISOString().split("T")[0] : undefined,
    gender: donor.gender?.toLowerCase() as "male" | "female" | "other" | "unknown" | undefined,
    telecom: donor.phoneNumber
      ? [{ system: "phone", value: donor.phoneNumber, use: "mobile" }]
      : undefined,
    communication: donor.preferredLang
      ? [{ language: { coding: [{ system: "urn:ietf:bcp:47", code: donor.preferredLang }] }, preferred: true }]
      : undefined,
  };
}

// ─── Observation: BMI (US Core BMI Profile) ───────────────────────────────────

export function mapBMIToFHIRObservation(donorId: string, bmi: number, assessedAt: Date) {
  return {
    resourceType: "Observation" as const,
    id: `bmi-${donorId}-${assessedAt.getTime()}`,
    meta: {
      profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-bmi"],
    },
    status: "final" as const,
    category: [
      {
        coding: [
          { system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs", display: "Vital Signs" },
        ],
      },
    ],
    code: {
      coding: [{ system: "http://loinc.org", code: "39156-5", display: "Body mass index (BMI) [Ratio]" }],
      text: "BMI",
    },
    subject: { reference: `Patient/${donorId}` },
    effectiveDateTime: assessedAt.toISOString(),
    valueQuantity: {
      value: bmi,
      unit: "kg/m2",
      system: "http://unitsofmeasure.org",
      code: "kg/m2",
    },
  };
}

// ─── Observation: Blood Pressure (US Core BP Profile) ─────────────────────────

export function mapBPToFHIRObservation(
  donorId: string,
  systolic: number,
  diastolic: number,
  assessedAt: Date
) {
  return {
    resourceType: "Observation" as const,
    id: `bp-${donorId}-${assessedAt.getTime()}`,
    meta: {
      profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-blood-pressure"],
    },
    status: "final" as const,
    category: [
      {
        coding: [
          { system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "vital-signs", display: "Vital Signs" },
        ],
      },
    ],
    code: {
      coding: [{ system: "http://loinc.org", code: "85354-9", display: "Blood pressure panel with all children optional" }],
      text: "Blood Pressure",
    },
    subject: { reference: `Patient/${donorId}` },
    effectiveDateTime: assessedAt.toISOString(),
    component: [
      {
        code: { coding: [{ system: "http://loinc.org", code: "8480-6", display: "Systolic blood pressure" }] },
        valueQuantity: { value: systolic, unit: "mmHg", system: "http://unitsofmeasure.org", code: "mm[Hg]" },
      },
      {
        code: { coding: [{ system: "http://loinc.org", code: "8462-4", display: "Diastolic blood pressure" }] },
        valueQuantity: { value: diastolic, unit: "mmHg", system: "http://unitsofmeasure.org", code: "mm[Hg]" },
      },
    ],
  };
}

// ─── Observation: eGFR ────────────────────────────────────────────────────────

export function mapEGFRToFHIRObservation(donorId: string, egfr: number, assessedAt: Date) {
  return {
    resourceType: "Observation" as const,
    id: `egfr-${donorId}-${assessedAt.getTime()}`,
    meta: {
      profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-observation-lab"],
    },
    status: "final" as const,
    category: [
      {
        coding: [
          { system: "http://terminology.hl7.org/CodeSystem/observation-category", code: "laboratory", display: "Laboratory" },
        ],
      },
    ],
    code: {
      coding: [{ system: "http://loinc.org", code: "98979-8", display: "Glomerular filtration rate/1.73 sq M.predicted" }],
      text: "eGFR",
    },
    subject: { reference: `Patient/${donorId}` },
    effectiveDateTime: assessedAt.toISOString(),
    valueQuantity: {
      value: egfr,
      unit: "mL/min/1.73m2",
      system: "http://unitsofmeasure.org",
      code: "mL/min/{1.73_m2}",
    },
    interpretation: [
      {
        coding: [
          egfr >= 60
            ? { system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", code: "N", display: "Normal" }
            : { system: "http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation", code: "L", display: "Low" },
        ],
      },
    ],
  };
}

// ─── Goal (US Core) ───────────────────────────────────────────────────────────

const METRIC_LOINC: Record<string, { code: string; display: string; unit: string }> = {
  BMI:            { code: "39156-5", display: "Body mass index",      unit: "kg/m2" },
  BLOOD_PRESSURE: { code: "8480-6",  display: "Systolic BP target",   unit: "mmHg" },
  SMOKING:        { code: "72166-2", display: "Tobacco smoking status", unit: "cigarettes/day" },
  BLOOD_SUGAR:    { code: "2345-7",  display: "Glucose [Mass/volume]", unit: "mg/dL" },
  WEIGHT:         { code: "29463-7", display: "Body weight",           unit: "kg" },
};

export function mapGoalToFHIRGoal(
  donorId: string,
  goalId: string,
  metric: string,
  targetValue: number,
  targetDate?: Date | null
) {
  const loinc = METRIC_LOINC[metric] ?? { code: "unknown", display: metric, unit: "" };
  return {
    resourceType: "Goal" as const,
    id: goalId,
    meta: {
      profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-goal"],
    },
    lifecycleStatus: "active" as const,
    description: {
      coding: [{ system: "http://loinc.org", code: loinc.code, display: loinc.display }],
      text: `Achieve ${metric} target of ${targetValue} ${loinc.unit}`,
    },
    subject: { reference: `Patient/${donorId}` },
    target: [
      {
        measure: { coding: [{ system: "http://loinc.org", code: loinc.code }] },
        detailQuantity: { value: targetValue, unit: loinc.unit, system: "http://unitsofmeasure.org", code: loinc.unit },
        ...(targetDate ? { dueDate: targetDate.toISOString().split("T")[0] } : {}),
      },
    ],
  };
}

// ─── RiskAssessment (donor readiness) ─────────────────────────────────────────

export function mapEligibilityCheckToFHIRRiskAssessment(
  donorId: string,
  checkId: string,
  aiSummary: string,
  assessedAt: Date
) {
  return {
    resourceType: "RiskAssessment" as const,
    id: checkId,
    status: "final" as const,
    subject: { reference: `Patient/${donorId}` },
    occurrenceDateTime: assessedAt.toISOString(),
    method: {
      coding: [{ system: "https://livinglink.app/CodeSystem/assessment-method", code: "AI_SCREENER", display: "LivingLink AI Readiness Screener" }],
    },
    note: [{ text: aiSummary }],
  };
}

// ─── Communication (Mentor Match) ─────────────────────────────────────────────

export function mapMessageToFHIRCommunication(
  messageId: string,
  senderId: string,
  recipientId: string,
  content: string,
  sentAt: Date
) {
  return {
    resourceType: "Communication" as const,
    id: messageId,
    status: "completed" as const,
    category: [
      { coding: [{ system: "http://terminology.hl7.org/CodeSystem/communication-category", code: "instruction" }] },
    ],
    sender: { reference: `Patient/${senderId}` },
    recipient: [{ reference: `Patient/${recipientId}` }],
    sent: sentAt.toISOString(),
    payload: [{ contentString: content }],
  };
}

// ─── CarePlan (LifeAfter) ─────────────────────────────────────────────────────

export function mapPostDonationCarePlan(donorId: string, checkIns: Array<{ id: string; weekNumber: string }>) {
  return {
    resourceType: "CarePlan" as const,
    id: `careplan-${donorId}`,
    status: "active" as const,
    intent: "plan" as const,
    title: "Post-Donation Follow-Up Care Plan",
    description: "Structured follow-up per OPTN Policy 18 for living kidney donors.",
    subject: { reference: `Patient/${donorId}` },
    period: { start: new Date().toISOString() },
    category: [
      { coding: [{ system: "http://hl7.org/fhir/us/core/CodeSystem/careplan-category", code: "assess-plan" }] },
    ],
    activity: checkIns.map((c) => ({
      detail: {
        status: "completed" as const,
        description: `Post-donation check-in: ${c.weekNumber}`,
        code: { coding: [{ system: "https://livinglink.app/CodeSystem/checkin", code: c.weekNumber }] },
        reference: { reference: `Observation/${c.id}` },
      },
    })),
  };
}

// ─── QuestionnaireResponse (PHQ-2) ────────────────────────────────────────────

export function mapPHQ2ToFHIRQuestionnaireResponse(
  donorId: string,
  responseId: string,
  q1Score: number,
  q2Score: number,
  completedAt: Date
) {
  return {
    resourceType: "QuestionnaireResponse" as const,
    id: responseId,
    questionnaire: "http://loinc.org/vs/55757-9",
    status: "completed" as const,
    subject: { reference: `Patient/${donorId}` },
    authored: completedAt.toISOString(),
    item: [
      {
        linkId: "44250-9",
        text: "Little interest or pleasure in doing things",
        answer: [{ valueInteger: q1Score }],
      },
      {
        linkId: "44255-8",
        text: "Feeling down, depressed, or hopeless",
        answer: [{ valueInteger: q2Score }],
      },
    ],
  };
}

// ─── Coverage (DonorShield) ───────────────────────────────────────────────────

export function mapDonorToCoverage(donorId: string, employerName?: string) {
  return {
    resourceType: "Coverage" as const,
    id: `coverage-${donorId}`,
    meta: {
      profile: ["http://hl7.org/fhir/us/core/StructureDefinition/us-core-coverage"],
    },
    status: "active" as const,
    beneficiary: { reference: `Patient/${donorId}` },
    payor: employerName
      ? [{ display: employerName }]
      : [{ display: "Unknown payor" }],
  };
}

// ─── Task (CenterFlow) ────────────────────────────────────────────────────────

const STAGE_SNOMED: Record<string, string> = {
  INITIAL_INQUIRY: "306206005",
  BLOODWORK:        "396520003",
  IMAGING:          "363679005",
  CARDIAC_EVAL:     "711341004",
  PSYCH_EVAL:       "410177006",
  FINAL_REVIEW:     "308292007",
  APPROVED:         "182992009",
  DECLINED:         "105480006",
};

export function mapEvaluationToFHIRTask(
  evaluationId: string,
  donorId: string,
  centerId: string,
  stage: string,
  isStalled: boolean,
  updatedAt: Date
) {
  return {
    resourceType: "Task" as const,
    id: evaluationId,
    status: isStalled ? ("on-hold" as const) : stage === "APPROVED" || stage === "DECLINED" ? ("completed" as const) : ("in-progress" as const),
    intent: "order" as const,
    code: {
      coding: [
        {
          system: "http://snomed.info/sct",
          code: STAGE_SNOMED[stage] ?? "308292007",
          display: `Donor evaluation: ${stage}`,
        },
      ],
    },
    for: { reference: `Patient/${donorId}` },
    requester: { reference: `Organization/${centerId}` },
    lastModified: updatedAt.toISOString(),
  };
}

// ─── FHIR Bundle helper ───────────────────────────────────────────────────────

export function createFHIRBundle(
  type: "transaction" | "collection" | "searchset",
  resources: object[]
) {
  return {
    resourceType: "Bundle" as const,
    type,
    timestamp: new Date().toISOString(),
    total: resources.length,
    entry: resources.map((resource: any) => ({
      fullUrl: `https://livinglink.app/fhir/${resource.resourceType}/${resource.id}`,
      resource,
      ...(type === "transaction" ? {
        request: { method: "PUT", url: `${resource.resourceType}/${resource.id}` },
      } : {}),
    })),
  };
}
