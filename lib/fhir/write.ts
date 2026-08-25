import { createFHIRBundle } from "@/lib/fhir/mappers";

export async function writeFHIRResources(resources: object[]) {
  if (process.env.FHIR_WRITE_ENABLED !== "true") return { attempted: false, written: false };
  const baseUrl = process.env.FHIR_SERVER_URL;
  if (!baseUrl) throw new Error("FHIR_SERVER_URL is required when FHIR writes are enabled");
  const token = process.env.FHIR_SERVER_TOKEN;
  if (!token) throw new Error("FHIR_SERVER_TOKEN is required when FHIR writes are enabled");
  if (process.env.NODE_ENV === "production" && !baseUrl.startsWith("https://")) {
    throw new Error("FHIR_SERVER_URL must use HTTPS in production");
  }

  const response = await fetch(baseUrl.replace(/\/$/, ""), {
    method: "POST",
    headers: {
      "Content-Type": "application/fhir+json",
      Accept: "application/fhir+json",
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(10_000),
    body: JSON.stringify(createFHIRBundle("transaction", resources)),
  });
  if (!response.ok) throw new Error(`FHIR write failed with status ${response.status}`);
  return { attempted: true, written: true };
}
