import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, Users, Heart, TrendingUp, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ShareAwarenessCard } from "@/components/shared/share-awareness-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

const modules = [
  {
    href: "/ready-check",
    icon: CheckCircle,
    title: "ReadyCheck",
    description: "Track your eligibility goals: BMI, blood pressure, and smoking cessation.",
    color: "text-green-600",
    bg: "bg-green-50",
    cta: "Check readiness",
  },
  {
    href: "/donor-shield",
    icon: Shield,
    title: "DonorShield",
    description: "Calculate lost wages, track expenses, and find reimbursement programs.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    cta: "Explore support",
  },
  {
    href: "/mentor-match",
    icon: Users,
    title: "Mentor Match",
    description: "Connect with a donor who has walked your path and can answer real questions.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    cta: "Find a mentor",
  },
  {
    href: "/life-after",
    icon: Heart,
    title: "LifeAfter",
    description: "Post-donation check-ins, PCP guidance, and long-term health tracking.",
    color: "text-red-600",
    bg: "bg-red-50",
    cta: "View timeline",
  },
];

export default async function DonorDashboard() {
  const user = await currentUser();
  const firstName = user?.firstName ?? "there";

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome back, {firstName} 👋</h1>
        <p className="mt-1 text-gray-500">
          Your kidney donation journey at a glance. You&apos;re making a difference.
        </p>
      </div>

      {/* Alert banner (example) */}
      <div
        className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4"
        role="alert"
        aria-live="polite"
      >
        <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" aria-hidden="true" />
        <div>
          <p className="font-medium text-amber-800 text-sm">Complete your health profile</p>
          <p className="text-amber-700 text-sm mt-0.5">
            Add your BMI and blood pressure to unlock personalized ReadyCheck coaching. Use the ReadyCheck tab in the sidebar to get started.
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Readiness score", value: "", icon: TrendingUp, color: "text-green-600" },
          { label: "Days since start", value: "0", icon: CheckCircle, color: "text-blue-600" },
          { label: "Messages", value: "0", icon: Users, color: "text-purple-600" },
          { label: "Check-ins due", value: "0", icon: Heart, color: "text-red-600" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <Icon className={`h-8 w-8 ${stat.color}`} aria-hidden="true" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Module cards */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Your modules</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Card
              key={mod.href}
              className="group hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className={`w-10 h-10 rounded-xl ${mod.bg} flex items-center justify-center mb-2`}>
                  <Icon className={`h-5 w-5 ${mod.color}`} aria-hidden="true" />
                </div>
                <CardTitle className="text-base">{mod.title}</CardTitle>
                <CardDescription>{mod.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link
                  href={mod.href}
                  className={`text-sm font-medium ${mod.color} hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded`}
                >
                  {mod.cta} →
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Spread awareness */}
      <div className="mt-8 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Spread the word</h2>
        <p className="text-sm text-gray-600 mb-4">
          Over 100,000 people are waiting for a kidney. Share a post on social media to help grow our community of donors.
        </p>
        <ShareAwarenessCard />
      </div>

      <p className="mt-6 text-center text-sm text-gray-500"><Link href="/privacy" className="text-blue-600 hover:underline">Manage privacy and data requests</Link></p>
    </div>
  );
}
