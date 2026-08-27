import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { validatePublicConversationRequest } from "@/lib/public-ai-safety";

function request(ip: string) {
  return new NextRequest("http://localhost/api/ai/conversation-practice", {
    headers: { "x-forwarded-for": ip },
  });
}

describe("validatePublicConversationRequest", () => {
  it("accepts an anonymous request without direct identifiers", () => {
    expect(validatePublicConversationRequest(request("192.0.2.1"), "How can I start this conversation?", [])).toBeNull();
  });

  it("rejects direct identifiers in the message or history", async () => {
    const response = validatePublicConversationRequest(
      request("192.0.2.2"),
      "Help me prepare",
      [{ content: "Email me at donor@example.com" }]
    );

    expect(response?.status).toBe(400);
    await expect(response?.json()).resolves.toMatchObject({ error: expect.stringContaining("personal identifiers") });
  });
});
