import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/shared/sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } });
  if (user?.role !== "ADMIN") redirect("/dashboard");
  return <div className="min-h-screen bg-gray-50"><Sidebar role="admin" includeAdmin /><div className="lg:pl-64"><main id="main-content" className="p-6 lg:p-8" tabIndex={-1}>{children}</main></div></div>;
}
