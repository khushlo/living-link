"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Heart, ArrowRight, Clock, Calendar, TrendingUp, Share2 } from "lucide-react";
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

    function animate(timestamp: number) {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start.current + (target - start.current) * eased));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
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
      <div>
        {/* Hero */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-red-50 border border-red-200 px-4 py-1.5 text-sm font-medium text-red-700 mb-6">
            <Heart className="h-4 w-4 fill-red-500" aria-hidden="true" />
            One donation. A lifetime of ripples.
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            See what your donation<br />
            <span className="text-red-500">would actually mean</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dialysis steals 13+ hours every week. A living kidney donation gives those hours back -
            for years. Enter someone's situation and see the real math.
          </p>
        </section>

        {/* Calculator */}
        <section className="mx-auto max-w-2xl px-6 pb-16">
          <div className="rounded-2xl border-2 border-gray-200 bg-gray-50 p-8 space-y-8">
            <h2 className="text-lg font-bold text-gray-900">Personalize the calculation</h2>

            {/* Wait time slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="waitYears" className="text-sm font-medium text-gray-700">
                  Years on the kidney waitlist
                </label>
                <span className="text-2xl font-bold text-blue-600">{stats.waitYears} yr{stats.waitYears !== 1 ? "s" : ""}</span>
              </div>
              <input
                id="waitYears"
                type="range"
                min={1}
                max={10}
                value={stats.waitYears}
                onChange={(e) => setStats({ ...stats, waitYears: Number(e.target.value) })}
                className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                aria-label="Years on waitlist"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>1 year</span>
                <span className="text-gray-500">National avg: ~5 years</span>
                <span>10 years</span>
              </div>
            </div>

            {/* Recipient age slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="recipientAge" className="text-sm font-medium text-gray-700">
                  Recipient's current age
                </label>
                <span className="text-2xl font-bold text-blue-600">{stats.recipientAge} yrs old</span>
              </div>
              <input
                id="recipientAge"
                type="range"
                min={18}
                max={75}
                value={stats.recipientAge}
                onChange={(e) => setStats({ ...stats, recipientAge: Number(e.target.value) })}
                className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                aria-label="Recipient age"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>18</span>
                <span>75</span>
              </div>
            </div>

            <button
              onClick={handleCalculate}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-base font-semibold text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg shadow-blue-200"
            >
              Calculate the ripple effect
              <ArrowRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </section>

        {/* Results */}
        {hasCalculated && (
           <section ref={resultsRef} id="results" className="bg-gray-900 py-20" aria-live="polite">
            <div className="mx-auto max-w-4xl px-6">
               <h2 tabIndex={-1} className="text-center text-3xl font-bold text-white mb-3">
                Your donation's ripple effect
              </h2>
              <p className="text-center text-gray-400 mb-12">
                For a {stats.recipientAge}-year-old who has been waiting {stats.waitYears} year{stats.waitYears !== 1 ? "s" : ""}
              </p>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                {/* Hours reclaimed */}
                <div className="rounded-2xl bg-blue-600 p-6 text-center text-white">
                  <Clock className="h-8 w-8 mx-auto mb-3 opacity-80" aria-hidden="true" />
                  <p className="text-5xl font-bold mb-2">
                    <AnimatedNumber target={ripple.dialysisHoursReclaimed} />
                  </p>
                  <p className="text-blue-200 text-sm font-medium">hours of life reclaimed</p>
                  <p className="text-blue-300 text-xs mt-2">
                    {Math.round(ripple.dialysisHoursReclaimed / 24)} full days no longer spent in a dialysis chair
                  </p>
                </div>

                {/* Sessions avoided */}
                <div className="rounded-2xl bg-green-600 p-6 text-center text-white">
                  <Calendar className="h-8 w-8 mx-auto mb-3 opacity-80" aria-hidden="true" />
                  <p className="text-5xl font-bold mb-2">
                    <AnimatedNumber target={ripple.dialysisSessionsAvoided} />
                  </p>
                  <p className="text-green-200 text-sm font-medium">dialysis sessions avoided</p>
                  <p className="text-green-300 text-xs mt-2">
                    {stats.waitYears} year{stats.waitYears !== 1 ? "s" : ""} × 3 sessions/week = freedom from a machine
                  </p>
                </div>

                {/* Years with a kidney */}
                <div className="rounded-2xl bg-purple-600 p-6 text-center text-white">
                  <TrendingUp className="h-8 w-8 mx-auto mb-3 opacity-80" aria-hidden="true" />
                  <p className="text-5xl font-bold mb-2">
                    ~<AnimatedNumber target={ripple.yearsWithKidney} />
                  </p>
                  <p className="text-purple-200 text-sm font-medium">years with your kidney</p>
                  <p className="text-purple-300 text-xs mt-2">
                    Living donor kidneys last ~20 years vs. ~13 for deceased donors
                  </p>
                </div>

                {/* Extra graft years */}
                <div className="rounded-2xl bg-white/10 border border-white/20 p-6 text-center text-white">
                  <Heart className="h-8 w-8 mx-auto mb-3 fill-red-400 text-red-400" aria-hidden="true" />
                  <p className="text-5xl font-bold mb-2">
                    +<AnimatedNumber target={ripple.extraGraftYears} />
                  </p>
                  <p className="text-gray-300 text-sm font-medium">extra years vs. waitlist kidney</p>
                  <p className="text-gray-400 text-xs mt-2">
                    A living donor kidney outlasts the next best option by ~7 years on average
                  </p>
                </div>

                {/* Cost avoided */}
                <div className="rounded-2xl bg-white/10 border border-white/20 p-6 text-center text-white">
                  <div className="text-2xl mb-2" aria-hidden="true">💰</div>
                  <p className="text-4xl font-bold mb-2">
                    $<AnimatedNumber target={Math.round(ripple.dialysisCostAvoided / 1000)} />K
                  </p>
                  <p className="text-gray-300 text-sm font-medium">in dialysis costs avoided</p>
                  <p className="text-gray-400 text-xs mt-2">
                    Dialysis costs ~$91,000/year (USRDS 2024). Transplant costs less over time.
                  </p>
                </div>

                {/* Share card */}
                <div className="rounded-2xl bg-red-600 p-6 text-center text-white flex flex-col items-center justify-center gap-4">
                  <p className="text-lg font-bold">Could you be the one to make this happen?</p>
                  <Link
                    href="/could-i-qualify"
                    className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Check if you qualify
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: "The ripple effect of kidney donation",
                          text: `A kidney donation could give someone back ${ripple.dialysisHoursReclaimed.toLocaleString()} hours of their life. See what yours could mean.`,
                          url: window.location.href,
                        });
                      }
                    }}
                    className="flex items-center gap-2 text-sm text-red-200 hover:text-white"
                  >
                    <Share2 className="h-4 w-4" />
                    Share this
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
                <p className="text-xs text-gray-500">
                  Statistics based on USRDS 2024 Annual Report, OPTN data, and peer-reviewed literature.
                  Individual outcomes vary. This calculator is for awareness purposes only.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mx-auto max-w-2xl px-6 py-24 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Numbers become people</h2>
          <p className="text-gray-600 mb-8">
            Behind every statistic is a real person - a parent, a teacher, a neighbor -
            spending 13 hours a week in a dialysis chair. LivingLink connects you with that person's community.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/stories"
              className="flex items-center gap-2 rounded-xl border-2 border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              Read donor stories
            </Link>
            <SignUpButton mode="modal">
              <button className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                Start my journey
                <ArrowRight className="h-4 w-4" />
              </button>
            </SignUpButton>
          </div>
        </section>
      </div>

      <footer className="border-t border-gray-100 py-6">
        <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <Link href="/could-i-qualify" className="hover:text-blue-600">Could I qualify?</Link>
            <Link href="/waitlist-map" className="hover:text-blue-600">Waitlist Map</Link>
            <Link href="/stories" className="hover:text-blue-600">Donor Stories</Link>
          </div>
          <p className="text-xs text-gray-400">© 2026 LivingLink · Not a medical service</p>
        </div>
      </footer>
    </PublicPageShell>
  );
}
