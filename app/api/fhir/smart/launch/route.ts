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

export const dynamic = "force-dynamic";

const SMART_CLIENT_ID = process.env.SMART_CLIENT_ID ?? "livinglink-app";
const REDIRECT_URI    = process.env.SMART_REDIRECT_URI ?? "http://localhost:3000/api/fhir/smart/callback";
const SCOPES          = "openid fhirUser launch patient/*.read patient/*.write offline_access";

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

  // Discover the EHR's OAuth endpoints from the SMART well-known config
  let authEndpoint: string;
  let tokenEndpoint: string;

  try {
    const wellKnown = await fetch(`${iss}/.well-known/smart-configuration`);
    if (!wellKnown.ok) throw new Error("Failed to fetch SMART well-known configuration");
    const config = await wellKnown.json();
    authEndpoint  = config.authorization_endpoint;
    tokenEndpoint = config.token_endpoint;
    if (!authEndpoint || !tokenEndpoint) throw new Error("Missing endpoints in SMART config");
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
      if (!authEndpoint) throw new Error("Could not discover auth endpoint");
    } catch {
      return NextResponse.json({ error: "Could not discover SMART authorization endpoints" }, { status: 502 });
    }
  }

  // Generate and store state to prevent CSRF
  const state = crypto.randomUUID();

  // Build authorization URL
  const params = new URLSearchParams({
    response_type: "code",
    client_id:     SMART_CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    scope:         SCOPES,
    state,
    aud:           iss,
    ...(launch ? { launch } : {}),
  });

  // Store iss + tokenEndpoint + state in cookie for callback
  const response = NextResponse.redirect(`${authEndpoint}?${params}`);
  response.cookies.set("smart_state",    state,         { httpOnly: true, sameSite: "lax", maxAge: 600 });
  response.cookies.set("smart_iss",      iss,           { httpOnly: true, sameSite: "lax", maxAge: 600 });
  response.cookies.set("smart_token_ep", tokenEndpoint, { httpOnly: true, sameSite: "lax", maxAge: 600 });
  return response;
}
