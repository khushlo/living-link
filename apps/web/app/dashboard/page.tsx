import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Redirect /dashboard to the role-specific portal
export default async function DashboardRedirect() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const role = (sessionClaims?.metadata as { role?: string })?.role ?? "donor";

  switch (role) {
    case "clinician":
      redirect("/clinician/dashboard");
    case "coordinator":
      redirect("/coordinator/dashboard");
    case "patient":
      redirect("/patient/dashboard");
    default:
      redirect("/donor/dashboard");
  }
}
