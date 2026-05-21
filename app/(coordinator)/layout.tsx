import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Sidebar, coordinatorNavItems } from "@/components/shared/sidebar";

export const dynamic = "force-dynamic";

export default async function CoordinatorLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar navItems={coordinatorNavItems} role="coordinator" />
      <div className="lg:pl-64">
        <main id="main-content" className="p-6 lg:p-8" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  );
}
