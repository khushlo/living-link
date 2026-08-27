import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { coordinatorNavItems } from "@/components/shared/sidebar";
import { AppShell } from "@/components/shared/app-shell";

export const dynamic = "force-dynamic";

export default async function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <AppShell navItems={coordinatorNavItems} role="coordinator">{children}</AppShell>
  );
}
