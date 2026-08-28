/**
 * SMART on FHIR OAuth callback
 * Exchanges auth code for access token and stores FHIR context
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptField, encryptField } from "@/lib/field-encryption";

export const dynamic = "force-dynamic";

const DEFAULT_SMART_CLIENT_ID = process.env.SMART_CLIENT_ID ?? "livinglink-app";
const REDIRECT_URI    = process.env.SMART_REDIRECT_URI ?? "http://localhost:3000/api/fhir/smart/callback";

function isAllowedIssuer(iss: string) {
  const allowed = (process.env.SMART_ALLOWED_ISSUERS ?? "").split(",").map((value) => value.trim().replace(/\/$/, "")).filter(Boolean);
  return allowed.includes(iss.replace(/\/$/, ""));
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`/sign-in?fhir_error=${encodeURIComponent(error)}`);
  }

  const storedState = req.cookies.get("smart_state")?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.json({ error: "Invalid SMART callback state" }, { status: 400 });
  }
  const session = await prisma.smartSession.findUnique({ where: { state } });
  if (!session || session.consumedAt || session.expiresAt <= new Date() || !isAllowedIssuer(session.issuer)) {
    return NextResponse.json({ error: "Expired SMART callback state" }, { status: 400 });
  }
  const connection = session.connectionId
    ? await prisma.eHRConnection.findFirst({ where: { id: session.connectionId, issuer: session.issuer, enabled: true }, select: { id: true, smartClientId: true } })
    : null;
  if (!connection) return NextResponse.json({ error: "SMART connection is not enabled" }, { status: 403 });
  const verifier = decryptField(session.pkceVerifier);

  // Exchange code for token
  const tokenRes = await fetch(session.tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:   "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id:    connection.smartClientId ?? DEFAULT_SMART_CLIENT_ID,
      code_verifier: verifier,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!tokenRes.ok) {
    return NextResponse.json({ error: "Token exchange failed" }, { status: 502 });
  }

  const tokenData = await tokenRes.json();
  const {
    access_token,
    patient,
    expires_in,
  } = tokenData;
  if (typeof access_token !== "string" || access_token.length < 1 || access_token.length > 10_000) {
    return NextResponse.json({ error: "Token response missing access token" }, { status: 502 });
  }
  const tokenLifetime = Number(expires_in ?? 3600);
  if (!Number.isFinite(tokenLifetime) || tokenLifetime <= 0) {
    return NextResponse.json({ error: "Invalid token expiry" }, { status: 502 });
  }
  if (tokenData.token_type && tokenData.token_type.toLowerCase() !== "bearer") {
    return NextResponse.json({ error: "Unsupported token type" }, { status: 502 });
  }
  if (patient !== undefined && (typeof patient !== "string" || patient.length > 256)) {
    return NextResponse.json({ error: "Invalid patient context" }, { status: 502 });
  }

  const sessionExpiry = new Date(Date.now() + Math.min(tokenLifetime, 3600) * 1_000);
  // Consume state atomically so two concurrent callbacks cannot reuse the same code.
  const consumed = await prisma.smartSession.updateMany({
    where: { id: session.id, consumedAt: null, expiresAt: { gt: new Date() } },
    data: {
      accessTokenEncrypted: encryptField(access_token) as string,
      patientIdEncrypted: patient ? encryptField(patient) : null,
      authorizedPatientContext: patient ? encryptField(patient) as string : null,
      grantedScopes: typeof tokenData.scope === "string" ? tokenData.scope.split(/\s+/).filter(Boolean) : [],
      tokenMetadata: { tokenType: tokenData.token_type ?? "Bearer", hasRefreshToken: typeof tokenData.refresh_token === "string" },
      expiresAt: sessionExpiry,
      consumedAt: new Date(),
    },
  });
  if (consumed.count !== 1) {
    return NextResponse.json({ error: "SMART callback state was already consumed" }, { status: 400 });
  }

  const response = NextResponse.redirect(new URL("/clinician/center-flow", req.nextUrl.origin));
  response.cookies.set("smart_session_id", session.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: Math.floor((sessionExpiry.getTime() - Date.now()) / 1_000),
  });

  // Clear SMART handshake cookies
  response.cookies.delete("smart_state");

  return response;
}
