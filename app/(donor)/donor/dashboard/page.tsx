import { auth } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Shield, Users, Heart, TrendingUp, AlertCircle, ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { ShareAwarenessCard } from "@/components/shared/share-awareness-card";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

const modules = [
  {
    href: "/ready-check",
    icon: CheckCircle,
    title: "ReadyCheck",
    description: "Track your eligibility goals: BMI, blood pressure, and smoking cessation.",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "group-hover:border-emerald-200",
    cta: "Check readiness",
  },
  {
    href: "/donor-shield",
    icon: Shield,
    title: "DonorShield",
    description: "Calculate lost wages, track expenses, and find reimbursement programs.",
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "group-hover:border-violet-200",
    cta: "Explore support",
  },
  {
    href: "/mentor-match",
    icon: Users,
    title: "Mentor Match",
    description: "Connect with a donor who has walked your path and can answer real questions.",
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "group-hover:border-sky-200",
    cta: "Find a mentor",
  },
  {
    href: "/life-after",
    icon: Heart,
    title: "LifeAfter",
    description: "Post-donation check-ins, PCP guidance, and long-term health tracking.",
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "group-hover:border-rose-200",
    cta: "View timeline",
  },
];

export default async function DonorDashboard() {
  const { userId } = await auth();
  const user = userId
    ? await prisma.user.findUnique({ where: { clerkId: userId }, select: { firstName: true } })
    : null;
  const firstName = user?.firstName ?? "there";

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            Donor workspace
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Welcome back, {firstName}</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
            Everything you need for your donation journey, organized in one place.
          </p>
        </div>
        <p className="w-fit rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
          Journey started today
        </p>
      </div>

      <div
        className="mb-6 flex flex-col justify-between gap-4 rounded-2xl border border-teal-900/10 bg-gradient-to-r from-teal-950 to-slate-900 p-5 text-white shadow-lg shadow-slate-900/10 sm:flex-row sm:items-center sm:p-6"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-start gap-3.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-teal-400/15 text-teal-300 ring-1 ring-inset ring-teal-300/20">
            <AlertCircle className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold">Complete your health profile</p>
            <p className="mt-1 max-w-2xl text-sm leading-5 text-slate-300">
              Add your BMI and blood pressure to unlock personalized ReadyCheck guidance.
            </p>
          </div>
        </div>
        <Link href="/ready-check" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition-colors hover:bg-teal-300">
          Continue setup <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="mb-9 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          { label: "Readiness score", value: "Not set", icon: TrendingUp, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Days since start", value: "0", icon: CheckCircle, color: "text-sky-700", bg: "bg-sky-50" },
          { label: "Messages", value: "0", icon: Users, color: "text-violet-700", bg: "bg-violet-50" },
          { label: "Check-ins due", value: "0", icon: Heart, color: "text-rose-700", bg: "bg-rose-50" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="bg-white/80">
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${stat.bg}`}>
                  <Icon className={`h-[18px] w-[18px] ${stat.color}`} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">{stat.value}</p>
                  <p className="truncate text-[11px] font-medium text-slate-500 sm:text-xs">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mb-4 flex items-end justify-between gap-4">
        <div><h2 className="text-xl font-bold tracking-tight text-slate-900">Your next steps</h2><p className="mt-1 text-sm text-slate-500">Choose where you would like to continue.</p></div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <Card
              key={mod.href}
              className={`group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5 ${mod.border}`}
            >
              <CardHeader className="pb-3">
                <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${mod.bg}`}>
                  <Icon className={`h-5 w-5 ${mod.color}`} aria-hidden="true" />
                </div>
                <CardTitle className="text-base text-slate-900">{mod.title}</CardTitle>
                <CardDescription className="min-h-10 leading-5">{mod.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Link
                  href={mod.href}
                  className={`inline-flex items-center gap-1.5 rounded text-sm font-semibold ${mod.color} hover:underline focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2`}
                >
                  {mod.cta} <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
        <h2 className="mb-1 text-lg font-semibold text-slate-900">Spread the word</h2>
        <p className="mb-4 text-sm leading-6 text-slate-600">
          Over 100,000 people are waiting for a kidney. Share a post on social media to help grow our community of donors.
        </p>
        <ShareAwarenessCard />
      </div>

      <p className="mt-6 text-center text-sm text-slate-500"><Link href="/privacy" className="font-medium text-teal-700 hover:underline">Manage privacy and data requests</Link></p>
    </div>
  );
}
