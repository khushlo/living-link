import axios from "axios";

const FHIR_BASE = process.env.HAPI_FHIR_URL || "http://localhost:8080/fhir";

export const fhirClient = axios.create({
  baseURL: FHIR_BASE,
  headers: {
    "Content-Type": "application/fhir+json",
    Accept: "application/fhir+json",
  },
});

// ── Resource helpers ──────────────────────────────────────────────────────────

export async function createResource<T>(resource: T): Promise<T> {
  const resourceType = (resource as Record<string, unknown>).resourceType as string;
  const { data } = await fhirClient.post(`/${resourceType}`, resource);
  return data;
}

export async function getResource<T>(resourceType: string, id: string): Promise<T> {
  const { data } = await fhirClient.get(`/${resourceType}/${id}`);
  return data;
}

export async function searchResource<T>(
  resourceType: string,
  params: Record<string, string>
): Promise<T[]> {
  const query = new URLSearchParams(params).toString();
  const { data } = await fhirClient.get(`/${resourceType}?${query}`);
  return data.entry?.map((e: { resource: T }) => e.resource) ?? [];
}

export async function updateResource<T>(resource: T): Promise<T> {
  const r = resource as Record<string, unknown>;
  const { data } = await fhirClient.put(`/${r.resourceType}/${r.id}`, resource);
  return data;
}

// ── LOINC code constants ──────────────────────────────────────────────────────
export const LOINC = {
  BMI: "39156-5",
  BP_SYSTOLIC: "8480-6",
  BP_DIASTOLIC: "8462-4",
  EGFR: "48643-1",
  WEIGHT: "29463-7",
  MOOD: "55758-7",
  SMOKING_STATUS: "72166-2",
} as const;

// ── Observation builders ──────────────────────────────────────────────────────
export function buildObservation(params: {
  patientId: string;
  loincCode: string;
  display: string;
  value: number;
  unit: string;
  ucumCode: string;
}) {
  return {
    resourceType: "Observation",
    status: "final",
    code: {
      coding: [{ system: "http://loinc.org", code: params.loincCode, display: params.display }],
    },
    subject: { reference: `Patient/${params.patientId}` },
    valueQuantity: {
      value: params.value,
      unit: params.unit,
      system: "http://unitsofmeasure.org",
      code: params.ucumCode,
    },
    effectiveDateTime: new Date().toISOString(),
  };
}

export function buildGoal(params: {
  patientId: string;
  description: string;
  targetValue: number;
  targetUnit: string;
  targetDate: string;
}) {
  return {
    resourceType: "Goal",
    lifecycleStatus: "active",
    description: { text: params.description },
    subject: { reference: `Patient/${params.patientId}` },
    target: [
      {
        detailQuantity: { value: params.targetValue, unit: params.targetUnit },
        dueDate: params.targetDate,
      },
    ],
  };
}

// ── FHIR Bulk Export ($export) ────────────────────────────────────────────────
export async function kickOffBulkExport(since?: string): Promise<string> {
  const params = since ? `?_since=${since}` : "";
  const response = await fhirClient.get(`/Patient/$export${params}`, {
    headers: { Prefer: "respond-async" },
  });
  // Returns the Content-Location polling URL
  return response.headers["content-location"] ?? "";
}
