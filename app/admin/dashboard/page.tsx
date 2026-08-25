import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [openStories, openReports, openDeletions, openEscalations] = await Promise.all([
    prisma.storySubmission.count({ where: { status: "PENDING" } }),
    prisma.mentorSafetyReport.count({ where: { status: "OPEN" } }),
    prisma.dataDeletionRequest.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.safetyEscalation.count({ where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } } }),
  ]);
  const cards = [
    ["Story submissions", openStories, "/admin/review"],
    ["Mentor safety reports", openReports, "/admin/review"],
    ["Deletion requests", openDeletions, "/admin/review"],
    ["Safety escalations", openEscalations, "/admin/escalations"],
  ];
  return <div className="mx-auto max-w-5xl space-y-8"><div><h1 className="text-3xl font-bold text-gray-900">Admin dashboard</h1><p className="mt-2 text-gray-600">Operational review for the LivingLink prototype. This dashboard does not replace clinical, privacy, or emergency workflows.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, count, href]) => <Link key={String(label)} href={String(href)} className="rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300 hover:shadow-sm"><p className="text-3xl font-bold text-gray-900">{count}</p><p className="mt-1 text-sm text-gray-600">{label}</p></Link>)}</div><div className="grid gap-4 md:grid-cols-2"><Link href="/admin/audit" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300"><h2 className="font-semibold text-gray-900">Audit log</h2><p className="mt-1 text-sm text-gray-600">Review recent recorded access and mutation events.</p></Link><Link href="/admin/fhir-export" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-blue-300"><h2 className="font-semibold text-gray-900">FHIR export</h2><p className="mt-1 text-sm text-gray-600">Create an audited pseudonymized export for authorized workflows.</p></Link></div></div>;
}
