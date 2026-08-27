"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { PublicNav } from "@/components/shared/public-nav";
import { donorNavItems } from "@/components/shared/sidebar";
import { AppShell } from "@/components/shared/app-shell";
import { PublicFooter } from "@/components/shared/public-footer";
import { AIAssistant } from "@/components/shared/ai-assistant";

interface PublicPageShellProps {
  children: React.ReactNode;
}

/**
 * Wraps every public tool page.
 * - Logged out: sticky PublicNav header + white bg
 * - Logged in:  full donor sidebar + offset content + AI assistant
 *               (same experience as the authenticated portal)
 */
export function PublicPageShell({ children }: PublicPageShellProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const [role, setRole] = useState("donor");

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/session/role")
      .then((response) => response.ok ? response.json() : null)
      .then((data) => { if (typeof data?.role === "string") setRole(data.role); })
      .catch(() => setRole("donor"));
  }, [isSignedIn]);

  // While Clerk is hydrating, show the public layout to avoid layout shift
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNav />
        <main id="main-content" className="public-content" tabIndex={-1}>{children}</main>
        <PublicFooter />
      </div>
    );
  }

  // Authenticated: full portal experience with sidebar
  return (
    <AppShell navItems={donorNavItems} role={role} includeAdmin={role === "admin"} mainClassName="p-0 pt-[4.5rem] lg:pt-0">
      {children}
      <AIAssistant />
    </AppShell>
  );
}
