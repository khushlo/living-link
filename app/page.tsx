import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight, Heart, Shield, Users, Activity, CheckCircle } from "lucide-react";

const modules = [
  {
    icon: Users,
    name: "Mentor Match",
    tagline: "Connect with donors who've walked your path",
    description:
      "AI-matched peer mentorship with prior living donors. Get real answers from real people who've been through it.",
    color: "bg-blue-50 border-blue-200 text-blue-700",
    iconColor: "text-blue-600",
  },
  {
    icon: CheckCircle,
    name: "ReadyCheck",
    tagline: "Know your eligibility before your first appointment",
    description:
      "Interactive health screener with AI coaching for BMI, blood pressure, and smoking goals. Not a diagnosis  a roadmap.",
    color: "bg-green-50 border-green-200 text-green-700",
    iconColor: "text-green-600",
  },
  {
    icon: Shield,
    name: "DonorShield",
    tagline: "Donation shouldn't cost you your financial security",
    description:
      "Lost-wage calculator, NLDAC reimbursement wizard, expense tracking, and FMLA letter generation.",
    color: "bg-purple-50 border-purple-200 text-purple-700",
    iconColor: "text-purple-600",
  },
  {
    icon: Activity,
    name: "CenterFlow",
    tagline: "Faster evaluations. Fewer delays. More donors.",
    description:
      "Protocol knowledge base and evaluation tracker for transplant coordinators. Close the gap between referral and donation.",
    color: "bg-orange-50 border-orange-200 text-orange-700",
    iconColor: "text-orange-600",
  },
  {
    icon: Heart,
    name: "LifeAfter",
    tagline: "Your health matters after donation too",
    description:
      "Structured check-ins, PHQ-2 mental health screening, PCP guidance, and automated follow-up reporting under OPTN Policy 18.",
    color: "bg-red-50 border-red-200 text-red-700",
    iconColor: "text-red-600",
  },
];

const stats = [
  { value: "100K+", label: "Americans waiting for a kidney" },
  { value: "6,500+", label: "Living donations per year" },
  { value: "1 in 4", label: "Donors face financial hardship" },
  { value: "30%", label: "Candidates lost to follow-up" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Skip nav target */}
      <a id="main-content" className="sr-only" aria-label="Main content start" />

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 fill-blue-600 text-blue-600" aria-hidden="true" />
            <span className="text-xl font-bold text-gray-900">LivingLink</span>
          </div>
          <nav aria-label="Primary navigation">
            <ul className="hidden items-center gap-6 md:flex">
              {modules.map((m) => (
                <li key={m.name}>
                  <a
                    href={`#${m.name.toLowerCase().replace(" ", "-")}`}
                    className="text-sm text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  >
                    {m.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex items-center gap-3">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors">
                  Get started
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Go to dashboard
              </Link>
            </SignedIn>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 py-24 text-center" aria-labelledby="hero-heading">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 mb-6 border border-blue-200">
            <span>KidneyX EMPOWER Prize Submission</span>
          </div>
          <h1
            id="hero-heading"
            className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl"
          >
            Living kidney donation,{" "}
            <span className="text-blue-600">reimagined</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-600">
            LivingLink is the national platform connecting donors, patients, transplant centers, and
            federal health systems  every step of the journey. FHIR-native. AI-powered.
            HIPAA-compliant.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <SignedOut>
              <SignUpButton mode="modal">
                <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-lg shadow-blue-200">
                  Start your journey
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>
              </SignUpButton>
              <Link
                href="#modules"
                className="rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Explore modules
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-lg shadow-blue-200"
              >
                Go to your dashboard
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </SignedIn>
          </div>
        </section>

        {/* Stats */}
        <section className="border-y border-gray-100 bg-gray-50 py-12" aria-label="Impact statistics">
          <div className="mx-auto max-w-6xl px-6">
            <dl className="grid grid-cols-2 gap-8 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <dt className="text-3xl font-bold text-blue-600">{stat.value}</dt>
                  <dd className="mt-1 text-sm text-gray-600">{stat.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Modules */}
        <section id="modules" className="mx-auto max-w-6xl px-6 py-24" aria-labelledby="modules-heading">
          <h2 id="modules-heading" className="text-center text-3xl font-bold text-gray-900 mb-4">
            Five modules. One journey.
          </h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            LivingLink addresses every friction point identified by the KidneyX EMPOWER Prize  the
            only platform to tackle all five.
          </p>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <article
                  key={module.name}
                  id={module.name.toLowerCase().replace(" ", "-")}
                  className={`rounded-2xl border p-6 ${module.color} transition-transform hover:-translate-y-1`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={`h-6 w-6 ${module.iconColor}`} aria-hidden="true" />
                    <h3 className="font-bold text-lg">{module.name}</h3>
                  </div>
                  <p className="font-medium text-sm mb-2">{module.tagline}</p>
                  <p className="text-sm opacity-80">{module.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        {/* FHIR / Interop section */}
        <section className="bg-gray-900 text-white py-24" aria-labelledby="fhir-heading">
          <div className="mx-auto max-w-6xl px-6">
            <h2 id="fhir-heading" className="text-3xl font-bold mb-4">
              Built for the federal health ecosystem
            </h2>
            <p className="text-gray-400 mb-12 max-w-2xl">
              LivingLink speaks FHIR R4 natively  connecting to Epic, Cerner, OPTN, HHS, and ONC
              through proven interoperability standards.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { standard: "HL7 FHIR R4", desc: "Core clinical data exchange" },
                { standard: "US Core IG", desc: "ONC 21st Century Cures compliance" },
                { standard: "SMART on FHIR", desc: "Epic App Orchard / Cerner launch" },
                { standard: "CDS Hooks", desc: "Real-time EHR decision support" },
                { standard: "Da Vinci PDex", desc: "Payer / insurance data exchange" },
                { standard: "FHIR Bulk Export", desc: "HHS / CMS population analytics" },
              ].map(({ standard, desc }) => (
                <div
                  key={standard}
                  className="rounded-xl border border-gray-700 bg-gray-800 p-4"
                >
                  <p className="font-mono font-semibold text-blue-400 text-sm">{standard}</p>
                  <p className="text-gray-400 text-sm mt-1">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-3xl px-6 py-24 text-center" aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="text-4xl font-bold text-gray-900 mb-4">
            Ready to change lives?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join LivingLink as a donor, patient, coordinator, or clinician. Your journey starts here.
          </p>
          <SignedOut>
            <SignUpButton mode="modal">
              <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-lg shadow-blue-200 mx-auto">
                Create your free account
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </SignUpButton>
          </SignedOut>
          <SignedIn>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-lg shadow-blue-200 mx-auto w-fit"
            >
              Go to dashboard <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </Link>
          </SignedIn>
        </section>
      </main>

      <footer className="border-t border-gray-100 py-8">
        <div className="mx-auto max-w-6xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 fill-blue-600 text-blue-600" aria-hidden="true" />
            <span className="text-sm font-semibold text-gray-700">LivingLink</span>
          </div>
          <p className="text-xs text-gray-500">
            LivingLink is not a medical service. Always consult with your transplant team. © 2026 LivingLink.
          </p>
        </div>
      </footer>
    </div>
  );
}
