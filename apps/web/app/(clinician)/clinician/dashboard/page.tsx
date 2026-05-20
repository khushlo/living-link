import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, TrendingUp, AlertCircle, Clock, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Clinician Dashboard" };

export default async function ClinicianDashboard() {
  const user = await currentUser();
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Clinician Dashboard
        </h1>
        <p className="mt-1 text-gray-500">Welcome, Dr. {user?.lastName ?? ""}. Manage your donor evaluations.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        {[
          { label: "Active evaluations", value: "", icon: Activity, color: "text-purple-600" },
          { label: "Avg. days to decision", value: "", icon: Clock, color: "text-orange-600" },
          { label: "Approved this month", value: "", icon: CheckCircle, color: "text-green-600" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`h-8 w-8 ${s.color}`} />
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            CenterFlow
          </CardTitle>
          <CardDescription>Protocol knowledge base and evaluation tracker.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/clinician/center-flow" className="text-sm font-medium text-purple-600 hover:underline">
            Open CenterFlow →
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
