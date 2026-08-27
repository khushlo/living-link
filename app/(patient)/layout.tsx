import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { patientNavItems } from "@/components/shared/sidebar";
import { AppShell } from "@/components/shared/app-shell";

export const dynamic = "force-dynamic";

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <AppShell navItems={patientNavItems} role="patient">{children}</AppShell>
  );
}
