import { describe, expect, it } from "vitest";
import { isAnonymizationVerified } from "@/lib/data-anonymization";

const pseudonym = "00000000-0000-4000-8000-000000000000";
const identity = {
  clerkId: `deleted_${pseudonym}`,
  email: `${pseudonym}@deleted.invalid`,
  firstName: null,
  lastName: null,
  phone: null,
};

describe("isAnonymizationVerified", () => {
  it("accepts a pseudonymized identity only when no deletable records remain", () => {
    expect(isAnonymizationVerified(identity, pseudonym, [0, 0, 0])).toBe(true);
  });

  it("rejects retained identifiers", () => {
    expect(isAnonymizationVerified({ ...identity, firstName: "Donor" }, pseudonym, [0])).toBe(false);
  });

  it("rejects any remaining user-owned record", () => {
    expect(isAnonymizationVerified(identity, pseudonym, [0, 1, 0])).toBe(false);
  });
});
