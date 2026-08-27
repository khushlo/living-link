import { prisma } from "@/lib/prisma";

export type ConsentPurpose = "platform" | "research" | "mentor_messaging" | "ai_processing" | "ehr_exchange";

/** Returns the newest decision, including a later denial or revocation. */
export async function resolveLatestConsent(donorProfileId: string, purpose: ConsentPurpose) {
  return prisma.consentRecord.findFirst({
    where: { donorProfileId, purpose },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function hasLatestConsent(donorProfileId: string, purpose: ConsentPurpose) {
  if (!donorProfileId) return false;
  const record = await resolveLatestConsent(donorProfileId, purpose);
  return Boolean(record?.granted && !record.revokedAt);
}
