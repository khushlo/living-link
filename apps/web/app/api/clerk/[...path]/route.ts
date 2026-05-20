import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// All Clerk API calls proxy through api.clerk.com
const CLERK_API_URL = "https://api.clerk.com";

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathStr = path.join("/");
  const search = req.nextUrl.search;
  const url = `${CLERK_API_URL}/${pathStr}${search}`;

  const headers = new Headers();
  // Forward relevant headers
  req.headers.forEach((value, key) => {
    if (![
      "host", "connection", "transfer-encoding",
      "content-length", "expect"
    ].includes(key.toLowerCase())) {
      headers.set(key, value);
    }
  });
  headers.set("x-clerk-proxy-url", process.env.NEXT_PUBLIC_APP_URL + "/api/clerk");

  const body = req.method !== "GET" && req.method !== "HEAD"
    ? await req.text()
    : undefined;

  const response = await fetch(url, {
    method: req.method,
    headers,
    body,
  });

  const resHeaders = new Headers(response.headers);
  // Don't forward encoding headers — Next.js handles that
  resHeaders.delete("content-encoding");
  resHeaders.delete("transfer-encoding");

  const text = await response.text();
  return new Response(text, {
    status: response.status,
    headers: resHeaders,
  });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
