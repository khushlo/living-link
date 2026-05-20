import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

// Role-specific route matchers
const isDonorRoute = createRouteMatcher(["/donor(.*)"]);
const isClinicianRoute = createRouteMatcher(["/clinician(.*)"]);
const isCoordinatorRoute = createRouteMatcher(["/coordinator(.*)"]);
const isPatientRoute = createRouteMatcher(["/patient(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) return;

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role ?? "donor";

  // Enforce role-based access
  if (isDonorRoute(req) && role !== "donor") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (isClinicianRoute(req) && role !== "clinician") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (isCoordinatorRoute(req) && role !== "coordinator") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (isPatientRoute(req) && role !== "patient") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
