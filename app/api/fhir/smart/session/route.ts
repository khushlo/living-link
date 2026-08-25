import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

// Revokes the local SMART session. Provider-side token revocation still depends
// on the EHR's revocation endpoint and is not claimed by this prototype.
export async function DELETE(req: NextRequest) {
  const sessionId = req.cookies.get("smart_session_id")?.value;
  if (!sessionId) return NextResponse.json({ ok: true });

  const deleted = await prisma.smartSession.deleteMany({ where: { id: sessionId } });
  await recordAuditEvent(req, null, "DELETE", "SmartSession", deleted.count ? sessionId : undefined);

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("smart_session_id");
  return response;
}
