import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminReviewQueue } from "@/components/admin/admin-review-queue";

export const dynamic = "force-dynamic";

export default async function AdminReviewPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const user = await prisma.user.findUnique({ where: { clerkId: userId }, select: { role: true } });
  if (user?.role !== "ADMIN") redirect("/dashboard");
  return <AdminReviewQueue />;
}
