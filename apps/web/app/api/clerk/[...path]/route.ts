import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const CLERK_API_URL = "https://api.clerk.com";

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  const search = req.nextUrl.search;
  const url = `${CLERK_API_URL}/${pathStr}${search}`;

  const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const PROXY_URL = `${process.env.NEXT_PUBLIC_APP_URL}/api/clerk`;

  const headers = new Headers();
  const skipHeaders = new Set([
    "host", "connection", "transfer-encoding", "content-length",
    "expect", "te", "trailer", "upgrade", "authorization",
  ]);

  req.headers.forEach((value, key) => {
    if (!skipHeaders.has(key.toLowerCase())) {
      headers.set(key, value);
    }
  });

  // Clerk proxy required headers
  headers.set("authorization", `Bearer ${PUBLISHABLE_KEY}`);
  headers.set("x-publishable-key", PUBLISHABLE_KEY);
  headers.set("x-clerk-proxy-url", PROXY_URL);

  const body = req.method !== "GET" && req.method !== "HEAD"
    ? await req.text()
    : undefined;

  const response = await fetch(url, {
    method: req.method,
    headers,
    body,
  });

  const resHeaders = new Headers(response.headers);
  resHeaders.delete("content-encoding");
  resHeaders.delete("transfer-encoding");

  const text = await response.text();
  return new Response(text, {
    status: response.status,
    headers: resHeaders,
  });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
