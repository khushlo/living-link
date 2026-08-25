import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shared/sidebar";
import { AIAssistant } from "@/components/shared/ai-assistant";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DonorLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? clerkUser?.emailAddresses[0]?.emailAddress;
  if (!email) redirect("/sign-in?error=missing_email");
  const user = await prisma.user.upsert({
    where: { clerkId: userId },
    update: { firstName: clerkUser.firstName, lastName: clerkUser.lastName },
    create: { clerkId: userId, email, firstName: clerkUser.firstName, lastName: clerkUser.lastName },
    select: { role: true },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role={user?.role.toLowerCase() ?? "donor"} includeAdmin={user?.role === "ADMIN"} />
      <div className="lg:pl-64">
        <main id="main-content" className="p-6 lg:p-8" tabIndex={-1}>
          {children}
        </main>
      </div>
      {/* LivingLink AI Assistant  available on all donor pages */}
      <AIAssistant />
    </div>
  );
}
