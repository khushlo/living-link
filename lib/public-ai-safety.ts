import { NextRequest, NextResponse } from "next/server";

const MAX_MESSAGE_LENGTH = 1_000;
const MAX_HISTORY_MESSAGES = 12;
const MAX_REQUESTS_PER_MINUTE = 12;
const requests = new Map<string, { count: number; resetAt: number }>();

const directIdentifierPatterns = [
  /\b\d{3}-\d{2}-\d{4}\b/, // US Social Security number
  /\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/, // Email address
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/, // US phone number
];

export function validatePublicConversationRequest(
  req: NextRequest,
  message: unknown,
  history: unknown
): NextResponse | null {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const now = Date.now();
  const entry = requests.get(ip);

  if (!entry || entry.resetAt <= now) {
    requests.set(ip, { count: 1, resetAt: now + 60_000 });
  } else if (entry.count >= MAX_REQUESTS_PER_MINUTE) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a minute before trying again." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((entry.resetAt - now) / 1_000)) } }
    );
  } else {
    entry.count += 1;
  }

  if (typeof message !== "string" || message.length === 0 || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: "Message must be between 1 and 1,000 characters." }, { status: 400 });
  }
  if (!Array.isArray(history) || history.length > MAX_HISTORY_MESSAGES) {
    return NextResponse.json({ error: "Conversation history is too long." }, { status: 400 });
  }
  const historyText = history
    .filter((entry): entry is { content: string } => typeof entry === "object" && entry !== null && typeof (entry as { content?: unknown }).content === "string")
    .map((entry) => entry.content)
    .join("\n");
  if (directIdentifierPatterns.some((pattern) => pattern.test(`${message}\n${historyText}`))) {
    return NextResponse.json(
      { error: "Please remove personal identifiers such as your email address, phone number, or Social Security number. This public practice tool is not for personal health information." },
      { status: 400 }
    );
  }
  return null;
}
