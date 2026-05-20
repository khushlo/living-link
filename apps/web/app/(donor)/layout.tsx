import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar, donorNavItems } from "@/components/shared/sidebar";
import { AIAssistant } from "@/components/shared/ai-assistant";

export const dynamic = "force-dynamic";

export default async function DonorLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar navItems={donorNavItems} role="donor" />
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
