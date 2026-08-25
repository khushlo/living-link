import Link from "next/link";
import { SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { ArrowRight, Heart, Shield, Users, Activity, CheckCircle, Map, TrendingUp, MessageSquare, BookOpen } from "lucide-react";
import { PublicNav } from "@/components/shared/public-nav";

const modules = [
  {
    icon: Users,
    name: "Mentor Match",
    publicHref: "/stories",       // public: read real donor stories
    authHref: "/mentor-match",    // authenticated: full peer matching
    tagline: "Connect with donors who've walked your path",
    description:
      "AI-matched peer mentorship with prior living donors. Get real answers from real people who've been through it.",
    color: "bg-blue-50 border-blue-200 text-blue-700",
    iconColor: "text-blue-600",
    publicCta: "Read donor stories",
  },
  {
    icon: CheckCircle,
    name: "ReadyCheck",
    publicHref: "/could-i-qualify", // public: 60-second screener, no account needed
    authHref: "/ready-check",       // authenticated: full health tracker
    tagline: "Know your eligibility before your first appointment",
    description:
      "Interactive health screener with AI coaching for BMI, blood pressure, and smoking goals. Not a diagnosis - a roadmap.",
    color: "bg-green-50 border-green-200 text-green-700",
    iconColor: "text-green-600",
    publicCta: "Check eligibility free",
  },
  {
    icon: Shield,
    name: "DonorShield",
    publicHref: "/ripple",        // public: see the impact of your donation
    authHref: "/donor-shield",    // authenticated: full financial tools
    tagline: "Donation shouldn't cost you your financial security",
    description:
      "Lost-wage calculator, NLDAC reimbursement wizard, expense tracking, and FMLA letter generation.",
    color: "bg-purple-50 border-purple-200 text-purple-700",
    iconColor: "text-purple-600",
    publicCta: "See the ripple effect",
  },
  {
    icon: Activity,
    name: "CenterFlow",
    publicHref: "/waitlist-map",  // public: explore the national waitlist
    authHref: "/dashboard",       // authenticated: coordinator/clinician portal
    tagline: "Faster evaluations. Fewer delays. More donors.",
    description:
      "Protocol knowledge base and evaluation tracker for transplant coordinators. Close the gap between referral and donation.",
    color: "bg-orange-50 border-orange-200 text-orange-700",
    iconColor: "text-orange-600",
    publicCta: "Explore the waitlist map",
  },
  {
    icon: Heart,
    name: "LifeAfter",
    publicHref: "/stories",       // public: read stories from donors post-donation
    authHref: "/life-after",      // authenticated: personal health timeline
    tagline: "Your health matters after donation too",
    description:
      "Structured check-ins, PHQ-2 mental health screening, PCP guidance, and pilot-ready follow-up export tools.",
    color: "bg-red-50 border-red-200 text-red-700",
    iconColor: "text-red-600",
    publicCta: "Read post-donation stories",
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

      <PublicNav />

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
            LivingLink is a prototype platform supporting donors, patients, and transplant centers
            throughout the donation journey. FHIR-ready. AI features are disabled by default for PHI.
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
                <div
                  key={module.name}
                  id={module.name.toLowerCase().replace(" ", "-")}
                  className={`rounded-2xl border p-6 ${module.color}`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Icon className={`h-6 w-6 ${module.iconColor}`} aria-hidden="true" />
                    <h3 className="font-bold text-lg">{module.name}</h3>
                  </div>
                  <p className="font-medium text-sm mb-2">{module.tagline}</p>
                  <p className="text-sm opacity-80 mb-4">{module.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {/* Public entry - no account needed */}
                    <Link
                      href={module.publicHref}
                      className={`inline-flex items-center gap-1 rounded-lg bg-white/70 px-3 py-1.5 text-xs font-semibold ${module.iconColor} hover:bg-white transition-colors border border-current/20`}
                    >
                      {module.publicCta} →
                    </Link>
                    {/* Full access - requires account */}
                    <SignedIn>
                      <Link
                        href={module.authHref}
                        className="inline-flex items-center gap-1 rounded-lg border border-gray-400/40 bg-white/50 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-white transition-colors"
                      >
                        Open full module →
                      </Link>
                    </SignedIn>
                    <SignedOut>
                      <SignUpButton mode="modal">
                        <button className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 transition-opacity`}
                          style={{ backgroundColor: "rgb(37 99 235)" }}
                        >
                          Full access (free) →
                        </button>
                      </SignUpButton>
                    </SignedOut>
                  </div>
                </div>
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
              LivingLink includes FHIR R4, SMART-on-FHIR, CDS Hooks, and export prototypes designed
              for validation with approved health-system partners.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { standard: "HL7 FHIR R4", desc: "Core clinical data exchange" },
                { standard: "US Core IG", desc: "Resource-profile mapping target" },
                { standard: "SMART on FHIR", desc: "Secure launch prototype" },
                { standard: "CDS Hooks", desc: "Authenticated service prototype" },
                { standard: "Da Vinci PDex", desc: "Planned payer-data mapping" },
                { standard: "FHIR Bulk Export", desc: "Pseudonymized operational export prototype" },
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

        {/* Awareness tools - no account required */}
        <section className="mx-auto max-w-6xl px-6 py-24" aria-labelledby="tools-heading">
          <div className="text-center mb-12">
            <h2 id="tools-heading" className="text-3xl font-bold text-gray-900 mb-4">
              Explore before you decide
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              No account needed. These free tools help you understand kidney donation, see real
              impact, and feel ready to have the conversation.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/could-i-qualify",
                icon: CheckCircle,
                title: "Could I qualify?",
                desc: "60-second screener to gauge your eligibility - no sign-up required.",
                color: "text-green-600",
                bg: "bg-green-50",
                border: "border-green-200",
              },
              {
                href: "/ripple",
                icon: TrendingUp,
                title: "Ripple Effect",
                desc: "See the cascade of hours, sessions, and years your donation creates.",
                color: "text-blue-600",
                bg: "bg-blue-50",
                border: "border-blue-200",
              },
              {
                href: "/waitlist-map",
                icon: Map,
                title: "Waitlist Map",
                desc: "Explore the kidney waitlist in every U.S. state - make it real.",
                color: "text-orange-600",
                bg: "bg-orange-50",
                border: "border-orange-200",
              },
              {
                href: "/stories",
                icon: BookOpen,
                title: "Donor Stories",
                desc: "Read first-hand accounts from living donors across the country.",
                color: "text-purple-600",
                bg: "bg-purple-50",
                border: "border-purple-200",
              },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={`group flex flex-col gap-4 rounded-2xl border ${tool.border} ${tool.bg} p-6 transition-transform hover:-translate-y-1 hover:shadow-md`}
                >
                  <div className={`w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm`}>
                    <Icon className={`h-5 w-5 ${tool.color}`} aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{tool.title}</h3>
                    <p className="text-sm text-gray-600">{tool.desc}</p>
                  </div>
                  <span className={`text-sm font-medium ${tool.color} group-hover:underline`}>
                    Try it free →
                  </span>
                </Link>
              );
            })}
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
