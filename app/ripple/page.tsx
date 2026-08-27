"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Heart, ArrowRight, Clock, Calendar, TrendingUp, Share2, DollarSign, Sparkles, Waves } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";
import { PublicPageShell } from "@/components/shared/public-page-shell";

// Average dialysis: 3x/week, 4 hrs/session + travel/recovery ~2 hrs = ~6 hrs per session
const DIALYSIS_SESSIONS_PER_WEEK = 3;
const HOURS_PER_SESSION = 6; // including travel & recovery
const WEEKS_PER_YEAR = 52;

// Average wait time without living donor: ~5 years on waitlist
// With living donor: near-immediate
const AVG_YEARS_ON_DIALYSIS_WITHOUT_DONOR = 5;

// Living donor kidney lasts ~20+ years vs. deceased donor ~12-15
const LIVING_DONOR_GRAFT_YEARS = 20;
const DECEASED_DONOR_GRAFT_YEARS = 13;

interface Stats {
  waitYears: number;
  recipientAge: number;
}

function calcRipple(s: Stats) {
  const dialysisHoursReclaimed =
    s.waitYears * WEEKS_PER_YEAR * DIALYSIS_SESSIONS_PER_WEEK * HOURS_PER_SESSION;

  const extraGraftYears = LIVING_DONOR_GRAFT_YEARS - DECEASED_DONOR_GRAFT_YEARS;

  const lifeExpectedAfterTransplant = Math.max(0, 80 - (s.recipientAge + s.waitYears));
  const yearsWithKidney = Math.min(LIVING_DONOR_GRAFT_YEARS, lifeExpectedAfterTransplant);

  const annualDialysisCost = 91000; // USD, 2024 USRDS
  const dialysisCostAvoided = s.waitYears * annualDialysisCost;

  return {
    dialysisHoursReclaimed: Math.round(dialysisHoursReclaimed),
    dialysisSessionsAvoided: Math.round(s.waitYears * WEEKS_PER_YEAR * DIALYSIS_SESSIONS_PER_WEEK),
    extraGraftYears,
    yearsWithKidney: Math.round(yearsWithKidney),
    dialysisCostAvoided,
    yearsAdded: Math.min(s.waitYears * 0.7 + extraGraftYears * 0.3, 15), // statistical estimate
  };
}

function AnimatedNumber({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const start = useRef(0);
  const startTime = useRef<number | null>(null);

  useEffect(() => {
    start.current = display;
    startTime.current = null;
    let frame: number;

    function animate(timestamp: number) {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start.current + (target - start.current) * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    }

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return <>{display.toLocaleString()}</>;
}

export default function RipplePage() {
  const [stats, setStats] = useState<Stats>({ waitYears: 5, recipientAge: 45 });
  const [hasCalculated, setHasCalculated] = useState(false);
  const resultsRef = useRef<HTMLElement>(null);
  const ripple = calcRipple(stats);

  function handleCalculate() {
    setHasCalculated(true);
    setTimeout(() => {
       resultsRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
       resultsRef.current?.querySelector("h2")?.focus();
    }, 100);
  }

  return (
    <PublicPageShell>
      <div className="overflow-hidden bg-slate-50">
        <section className="relative isolate border-b border-slate-200 px-5 py-16 sm:px-6 sm:py-24">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_80%_20%,rgba(45,212,191,0.2),transparent_30%),radial-gradient(circle_at_10%_80%,rgba(14,116,144,0.12),transparent_35%)]" aria-hidden="true" />
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-1.5 text-sm font-semibold text-teal-800 shadow-sm">
                <Waves className="h-4 w-4" aria-hidden="true" /> One gift, years of impact
              </div>
              <h1 className="max-w-3xl text-5xl font-bold tracking-[-0.045em] text-slate-950 sm:text-6xl">
                A kidney gives back more than time.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                It gives back school mornings, family dinners, workdays, and plans. Personalize the story to see how one donation can reshape everyday life.
              </p>
              <div className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">3 dialysis sessions each week</span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5">~6 hours per visit</span>
              </div>
            </div>

            <div className="relative mx-auto aspect-square w-full max-w-[29rem]" aria-hidden="true">
              {["inset-0 border-teal-200/60", "inset-[12%] border-teal-300/70", "inset-[24%] border-teal-400/70"].map((style) => <div key={style} className={`absolute rounded-full border ${style}`} />)}
              <div className="absolute inset-[36%] grid place-items-center rounded-full bg-slate-950 text-white shadow-2xl shadow-teal-900/30">
                <Heart className="h-12 w-12 fill-teal-400 text-teal-400" />
              </div>
              <div className="absolute right-[2%] top-[22%] rounded-2xl border border-white/80 bg-white/90 p-4 shadow-xl backdrop-blur">
                <p className="text-2xl font-bold text-slate-950">{ripple.dialysisHoursReclaimed.toLocaleString()}</p><p className="text-xs font-medium text-slate-500">hours reclaimed</p>
              </div>
              <div className="absolute bottom-[8%] left-[2%] rounded-2xl border border-white/80 bg-white/90 p-4 shadow-xl backdrop-blur">
                <p className="text-2xl font-bold text-teal-700">~{ripple.yearsWithKidney} years</p><p className="text-xs font-medium text-slate-500">with a living-donor kidney</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Personalize the ripple</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Make the numbers human</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Use a recipient’s approximate age and expected wait. These estimates are educational, not a prediction of an individual outcome.</p>
            </div>
            <div className="space-y-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-8">
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-4"><label htmlFor="waitYears" className="text-sm font-semibold text-slate-800">Expected years waiting</label><span className="text-3xl font-bold tracking-tight text-teal-700">{stats.waitYears} <span className="text-sm font-medium text-slate-500">year{stats.waitYears !== 1 ? "s" : ""}</span></span></div>
                <input id="waitYears" type="range" min={1} max={10} value={stats.waitYears} onChange={(e) => setStats({ ...stats, waitYears: Number(e.target.value) })} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-600" />
                <div className="flex justify-between text-xs text-slate-400"><span>1 year</span><span>National average ~5 years</span><span>10 years</span></div>
              </div>
              <div className="space-y-4">
                <div className="flex items-end justify-between gap-4"><label htmlFor="recipientAge" className="text-sm font-semibold text-slate-800">Recipient’s current age</label><span className="text-3xl font-bold tracking-tight text-teal-700">{stats.recipientAge} <span className="text-sm font-medium text-slate-500">years old</span></span></div>
                <input id="recipientAge" type="range" min={18} max={75} value={stats.recipientAge} onChange={(e) => setStats({ ...stats, recipientAge: Number(e.target.value) })} className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-teal-600" />
                <div className="flex justify-between text-xs text-slate-400"><span>18</span><span>75</span></div>
              </div>
              <button onClick={handleCalculate} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 py-4 text-base font-semibold text-white shadow-lg shadow-slate-900/15 transition-colors hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">
                Show this person’s ripple <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>

        {hasCalculated && (
          <section ref={resultsRef} id="results" className="bg-slate-950 py-20 text-white" aria-live="polite">
            <div className="mx-auto max-w-6xl px-5 sm:px-6">
              <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div><div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-300"><Sparkles className="h-4 w-4" /> Personalized impact</div><h2 tabIndex={-1} className="text-3xl font-bold tracking-tight sm:text-4xl">What changes when waiting ends</h2><p className="mt-3 text-slate-400">For someone age {stats.recipientAge}, facing an estimated {stats.waitYears}-year wait.</p></div>
                <button onClick={() => navigator.share?.({ title: "The ripple effect of kidney donation", text: `A kidney donation could give someone back ${ripple.dialysisHoursReclaimed.toLocaleString()} hours of life.`, url: window.location.href })} className="flex w-fit items-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/10"><Share2 className="h-4 w-4" /> Share this ripple</button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { icon: Clock, value: <AnimatedNumber target={ripple.dialysisHoursReclaimed} />, label: "hours reclaimed", note: `${Math.round(ripple.dialysisHoursReclaimed / 24)} full days`, accent: "bg-teal-400 text-slate-950" },
                  { icon: Calendar, value: <AnimatedNumber target={ripple.dialysisSessionsAvoided} />, label: "sessions avoided", note: "Freedom from a machine", accent: "bg-sky-400 text-slate-950" },
                  { icon: TrendingUp, value: <>~<AnimatedNumber target={ripple.yearsWithKidney} /></>, label: "years with the kidney", note: `About ${ripple.extraGraftYears} more graft years`, accent: "bg-violet-400 text-slate-950" },
                  { icon: DollarSign, value: <>$<AnimatedNumber target={Math.round(ripple.dialysisCostAvoided / 1000)} />K</>, label: "dialysis costs avoided", note: "Estimated system cost", accent: "bg-amber-300 text-slate-950" },
                ].map(({ icon: Icon, value, label, note, accent }) => <article key={label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5"><span className={`grid h-10 w-10 place-items-center rounded-xl ${accent}`}><Icon className="h-5 w-5" /></span><p className="mt-6 text-4xl font-bold tracking-tight">{value}</p><p className="mt-2 text-sm font-semibold text-white">{label}</p><p className="mt-1 text-xs text-slate-400">{note}</p></article>)}
              </div>
              <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl border border-teal-300/20 bg-teal-300/10 p-6 sm:flex-row sm:items-center"><div><p className="font-semibold">Could you start a ripple like this?</p><p className="mt-1 text-sm text-slate-400">Take the private 60-second eligibility check.</p></div><Link href="/could-i-qualify" className="flex shrink-0 items-center gap-2 rounded-xl bg-teal-400 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-teal-300">Check eligibility <ArrowRight className="h-4 w-4" /></Link></div>
              <p className="mt-7 text-center text-xs leading-5 text-slate-500">Based on USRDS 2024, OPTN data, and peer-reviewed literature. Individual outcomes vary; this tool is for awareness only.</p>
            </div>
          </section>
        )}

        <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Every number belongs to a person</h2>
          <p className="mx-auto mb-8 mt-4 max-w-2xl leading-7 text-slate-600">Meet people who chose to donate, learn what surprised them, and understand what life looked like on the other side.</p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/stories" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:border-teal-200 hover:text-teal-800">Read donor stories</Link>
            <SignUpButton mode="modal">
              <button className="flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 hover:bg-teal-800">Start my journey <ArrowRight className="h-4 w-4" /></button>
            </SignUpButton>
          </div>
        </section>
      </div>
    </PublicPageShell>
  );
}
