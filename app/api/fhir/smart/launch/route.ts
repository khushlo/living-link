/**
 * SMART on FHIR launch endpoint
 *
 * Implements the SMART App Launch Framework (v2.0)
 * https://docs.smarthealthit.org/
 *
 * Flow:
 *  1. EHR redirects to GET /api/fhir/smart/launch?iss=<FHIR_BASE>&launch=<LAUNCH_TOKEN>
 *  2. We redirect to EHR's /authorize endpoint
 *  3. EHR redirects back to /api/fhir/smart/callback?code=<AUTH_CODE>&state=<STATE>
 *  4. We exchange code for access token, store context in session
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptField } from "@/lib/field-encryption";

export const dynamic = "force-dynamic";

const DEFAULT_SMART_CLIENT_ID = process.env.SMART_CLIENT_ID ?? "livinglink-app";
const REDIRECT_URI    = process.env.SMART_REDIRECT_URI ?? "http://localhost:3000/api/fhir/smart/callback";
const SCOPES          = "openid fhirUser launch patient/*.read";

function isAllowedIssuer(iss: string) {
  const allowed = (process.env.SMART_ALLOWED_ISSUERS ?? "")
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
  return allowed.includes(iss.replace(/\/$/, ""));
}

function isValidEndpoint(endpoint: unknown) {
  if (typeof endpoint !== "string") return false;
  try {
    const url = new URL(endpoint);
    return process.env.NODE_ENV !== "production" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function base64Url(bytes: Uint8Array) {
  return Buffer.from(bytes).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function createPkcePair() {
  const verifier = base64Url(crypto.getRandomValues(new Uint8Array(32)));
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return { verifier, challenge: base64Url(new Uint8Array(digest)) };
}

/**
 * GET /api/fhir/smart/launch
 * Entry point when launched from an EHR (SMART launch)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const iss    = searchParams.get("iss");
  const launch = searchParams.get("launch");

  if (!iss) {
    return NextResponse.json({ error: "Missing 'iss' parameter (FHIR base URL)" }, { status: 400 });
  }
  if (!isAllowedIssuer(iss)) {
    return NextResponse.json({ error: "FHIR issuer is not registered" }, { status: 403 });
  }
  const connection = await prisma.eHRConnection.findFirst({
    where: { issuer: iss.replace(/\/$/, ""), enabled: true },
    select: { id: true, smartClientId: true },
  });
  if (!connection) return NextResponse.json({ error: "FHIR issuer is not enabled" }, { status: 403 });

  // Discover the EHR's OAuth endpoints from the SMART well-known config
  let authEndpoint: string;
  let tokenEndpoint: string;

  try {
    const wellKnown = await fetch(`${iss}/.well-known/smart-configuration`);
    if (!wellKnown.ok) throw new Error("Failed to fetch SMART well-known configuration");
    const config = await wellKnown.json();
    authEndpoint  = config.authorization_endpoint;
    tokenEndpoint = config.token_endpoint;
    if (!isValidEndpoint(authEndpoint) || !isValidEndpoint(tokenEndpoint)) throw new Error("Invalid SMART endpoints");
  } catch {
    // Fall back to standard FHIR metadata
    try {
      const meta = await fetch(`${iss}/metadata`);
      if (!meta.ok) throw new Error("Cannot reach FHIR server");
      const metadata = await meta.json();
      const smartExt = metadata?.rest?.[0]?.security?.extension?.find(
        (e: any) => e.url === "http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris"
      );
      authEndpoint  = smartExt?.extension?.find((e: any) => e.url === "authorize")?.valueUri;
      tokenEndpoint = smartExt?.extension?.find((e: any) => e.url === "token")?.valueUri;
      if (!isValidEndpoint(authEndpoint) || !isValidEndpoint(tokenEndpoint)) throw new Error("Invalid SMART endpoints");
    } catch {
      return NextResponse.json({ error: "Could not discover SMART authorization endpoints" }, { status: 502 });
    }
  }

  // Persist OAuth state server-side so neither the issuer nor PKCE verifier is browser state.
  const state = crypto.randomUUID();
  const { verifier, challenge } = await createPkcePair();
  try {
    await prisma.smartSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
    await prisma.smartSession.create({
      data: {
        state,
        issuer: iss.replace(/\/$/, ""),
        connectionId: connection.id,
        tokenEndpoint,
        pkceVerifier: encryptField(verifier) as string,
        expiresAt: new Date(Date.now() + 10 * 60_000),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to create secure SMART session" }, { status: 503 });
  }

  // Build authorization URL
  const params = new URLSearchParams({
    response_type: "code",
    client_id:     connection.smartClientId ?? DEFAULT_SMART_CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    scope:         SCOPES,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    aud:           iss,
    ...(launch ? { launch } : {}),
  });

  const response = NextResponse.redirect(`${authEndpoint}?${params}`);
  const cookieOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/api/fhir/smart",
    maxAge: 600,
  };
  response.cookies.set("smart_state", state, cookieOptions);
  return response;
}
