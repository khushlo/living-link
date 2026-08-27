import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shared/app-shell";
import { AIAssistant } from "@/components/shared/ai-assistant";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DonorLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  let user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } });
  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress;
    if (!email) redirect("/sign-in?error=missing_email");
    user = await prisma.user.create({
      data: { clerkId: userId, email, firstName: clerkUser.firstName, lastName: clerkUser.lastName },
      select: { role: true },
    });
  }

  return (
    <AppShell role={user?.role.toLowerCase() ?? "donor"} includeAdmin={user?.role === "ADMIN"}>
      {children}
      {/* LivingLink AI Assistant  available on all donor pages */}
      <AIAssistant />
    </AppShell>
  );
}
