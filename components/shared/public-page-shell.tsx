"use client";

import { useAuth, useUser } from "@clerk/nextjs";
import { PublicNav } from "@/components/shared/public-nav";
import { Sidebar, donorNavItems } from "@/components/shared/sidebar";
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
  const { user } = useUser();

  const role =
    (user?.publicMetadata?.role as string | undefined) ?? "donor";

  // While Clerk is hydrating, show the public layout to avoid layout shift
  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNav />
        {children}
      </div>
    );
  }

  // Authenticated: full portal experience with sidebar
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar navItems={donorNavItems} role={role} />
      <div className="lg:pl-64">
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
      </div>
      <AIAssistant />
    </div>
  );
}
