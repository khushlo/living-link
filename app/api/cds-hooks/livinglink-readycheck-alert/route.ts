import { NextRequest } from "next/server";
import { POST as handleCDSRequest } from "../route";

export async function POST(req: NextRequest) {
  const headers = new Headers(req.headers);
  headers.set("x-livinglink-service-id", "livinglink-readycheck-alert");
  return handleCDSRequest(new NextRequest(req, { headers }));
}
