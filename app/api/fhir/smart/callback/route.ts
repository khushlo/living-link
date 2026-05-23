/**
 * SMART on FHIR OAuth callback
 * Exchanges auth code for access token and stores FHIR context
 */

import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const SMART_CLIENT_ID = process.env.SMART_CLIENT_ID ?? "livinglink-app";
const REDIRECT_URI    = process.env.SMART_REDIRECT_URI ?? "http://localhost:3000/api/fhir/smart/callback";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code  = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(`/sign-in?fhir_error=${encodeURIComponent(error)}`);
  }

  const storedState    = req.cookies.get("smart_state")?.value;
  const iss            = req.cookies.get("smart_iss")?.value;
  const tokenEndpoint  = req.cookies.get("smart_token_ep")?.value;

  if (!code || !state || state !== storedState || !tokenEndpoint) {
    return NextResponse.json({ error: "Invalid SMART callback state" }, { status: 400 });
  }

  // Exchange code for token
  const tokenRes = await fetch(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:   "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      client_id:    SMART_CLIENT_ID,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.json({ error: "Token exchange failed" }, { status: 502 });
  }

  const tokenData = await tokenRes.json();
  const {
    access_token,
    patient,
    id_token,
    expires_in,
  } = tokenData;

  // Store context in secure cookie (production: use encrypted session store)
  const redirectTo = patient ? `/clinician/center-flow?fhir_patient=${patient}` : "/clinician/center-flow";
  const response = NextResponse.redirect(new URL(redirectTo, req.nextUrl.origin));

  response.cookies.set("fhir_access_token", access_token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: expires_in ?? 3600,
    secure: process.env.NODE_ENV === "production",
  });
  if (patient) {
    response.cookies.set("fhir_patient_id", patient, { httpOnly: true, sameSite: "lax", maxAge: expires_in ?? 3600 });
  }
  if (iss) {
    response.cookies.set("fhir_iss", iss, { httpOnly: true, sameSite: "lax", maxAge: expires_in ?? 3600 });
  }

  // Clear SMART handshake cookies
  response.cookies.delete("smart_state");
  response.cookies.delete("smart_iss");
  response.cookies.delete("smart_token_ep");

  return response;
}
