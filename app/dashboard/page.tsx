import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Redirect /dashboard to the role-specific portal
export default async function DashboardRedirect() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const localUser = await prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } });
  const role = localUser?.role.toLowerCase() ?? (sessionClaims?.metadata as { role?: string })?.role ?? "donor";

  switch (role) {
    case "clinician":
      redirect("/clinician/dashboard");
    case "coordinator":
      redirect("/coordinator/dashboard");
    case "patient":
      redirect("/patient/dashboard");
    case "admin":
      redirect("/admin/dashboard");
    default:
      redirect("/donor/dashboard");
  }
}
