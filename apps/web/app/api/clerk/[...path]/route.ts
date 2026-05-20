import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

// Decode the Clerk frontend API URL from the publishable key
function getClerkFAPI(): string {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? "";
  const b64 = key.replace(/^pk_(live|test)_/, "");
  try {
    const decoded = Buffer.from(b64, "base64").toString("utf-8").replace(/\$$/, "");
    return `https://${decoded}`;
  } catch {
    return "https://api.clerk.com";
  }
}

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const clerkFAPI = getClerkFAPI();
  const pathStr = path.join("/");
  const search = req.nextUrl.search;
  const url = `${clerkFAPI}/${pathStr}${search}`;

  const headers = new Headers(req.headers);
  headers.delete("host");

  const response = await fetch(url, {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    // @ts-expect-error duplex needed for streaming body
    duplex: "half",
  });

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  });
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as PATCH };
