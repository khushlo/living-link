import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { clinicianNavItems } from "@/components/shared/sidebar";
import { AppShell } from "@/components/shared/app-shell";

export const dynamic = "force-dynamic";

export default async function ClinicianLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <AppShell navItems={clinicianNavItems} role="clinician">{children}</AppShell>
  );
}
