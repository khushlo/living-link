import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Redirect /dashboard to the role-specific portal
export default async function DashboardRedirect() {
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) redirect("/sign-in?error=missing_email");
  const localUser = await prisma.user.upsert({
    where: { clerkId: userId },
    update: { firstName: clerkUser?.firstName, lastName: clerkUser?.lastName },
    create: { clerkId: userId, email, firstName: clerkUser?.firstName, lastName: clerkUser?.lastName },
    select: { role: true },
  });
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
