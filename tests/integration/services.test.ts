import { afterAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/prisma";

afterAll(() => prisma.$disconnect());

describe("CI services", () => {
  it("connects to PostgreSQL after migrations", async () => {
    await expect(prisma.$queryRaw`SELECT 1`).resolves.toEqual([{ "?column?": 1 }]);
  });

  it("connects to the HAPI FHIR capability endpoint", async () => {
    const baseUrl = process.env.FHIR_SERVER_URL;
    expect(baseUrl).toBeTruthy();

    const response = await fetch(`${baseUrl}/metadata`);
    expect(response.ok).toBe(true);
    await expect(response.json()).resolves.toMatchObject({ resourceType: "CapabilityStatement" });
  });
});
