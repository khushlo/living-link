import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Patient Dashboard" };

export default async function PatientDashboard() {
  const user = await currentUser();
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome, {user?.firstName ?? "there"} 👋
        </h1>
        <p className="mt-1 text-gray-500">Track your transplant journey and care plan.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Days on waitlist", value: "—", icon: Calendar, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Match score", value: "—", icon: TrendingUp, color: "text-teal-700", bg: "bg-teal-50" },
          { label: "Next appointment", value: "—", icon: Heart, color: "text-rose-700", bg: "bg-rose-50" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="bg-white/80">
              <CardContent className="flex items-center gap-3 p-5">
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.bg}`}><Icon className={`h-5 w-5 ${s.color}`} /></span>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
