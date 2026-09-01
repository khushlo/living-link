"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  CheckCircle,
  TrendingUp,
  Map,
  BookOpen,
  MessageCircle,
  Menu,
  X,
  ChevronDown,
  FileText,
  Network,
  Handshake,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const PUBLIC_LINKS = [
  { href: "/could-i-qualify", label: "Eligibility check", description: "A private 60-second screener", icon: CheckCircle, group: "Get started" },
  { href: "/start-conversation", label: "Conversation practice", description: "Prepare for a meaningful talk", icon: MessageCircle, group: "Get started" },
  { href: "/ripple", label: "Ripple effect", description: "See the impact of one donation", icon: TrendingUp, group: "Explore & learn" },
  { href: "/waitlist-map", label: "Waitlist explorer", description: "Understand need across the U.S.", icon: Map, group: "Explore & learn" },
  { href: "/stories", label: "Donor stories", description: "Learn from people who donated", icon: BookOpen, group: "Explore & learn" },
];

export function PublicNav({ currentPath }: { currentPath?: string }) {
  const pathname = usePathname();
  const active = currentPath ?? pathname;
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [ehrOpen, setEhrOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);
  const ehrRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setExploreOpen(false);
        setEhrOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) setExploreOpen(false);
      if (ehrRef.current && !ehrRef.current.contains(event.target as Node)) setEhrOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setExploreOpen(false);
    setEhrOpen(false);
  }, [pathname]);

  const isExploreActive = PUBLIC_LINKS.some(({ href }) => active === href || active.startsWith(`${href}/`));
  const isEhrActive = active === "/ehr/register" || active === "/ehr/documentation";

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-slate-50/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between px-5 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-900/20"><Heart className="h-[18px] w-[18px] fill-current" aria-hidden="true" /></span>
            <span className="font-bold tracking-tight text-slate-950">LivingLink</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Public navigation">
            <Link href="/" className={cn("rounded-lg px-3 py-2 text-sm font-medium transition-colors", active === "/" ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:bg-white hover:text-slate-950")}>Home</Link>
            <div className="relative" ref={exploreRef}>
              <button
                type="button"
                onClick={() => setExploreOpen((open) => !open)}
                aria-expanded={exploreOpen}
                aria-controls="explore-menu"
                className={cn("flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors", isExploreActive ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-white hover:text-slate-950")}
              >
                Explore <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", exploreOpen && "rotate-180")} aria-hidden="true" />
              </button>
              {exploreOpen && (
                <div id="explore-menu" className="absolute left-1/2 top-full mt-3 w-[34rem] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/10">
                  <div className="grid grid-cols-2 gap-2">
                    {["Get started", "Explore & learn"].map((group) => (
                      <div key={group}>
                        <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{group}</p>
                        {PUBLIC_LINKS.filter((item) => item.group === group).map(({ href, label, description, icon: Icon }) => (
                          <Link key={href} href={href} className={cn("group flex gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50", (active === href || active.startsWith(`${href}/`)) && "bg-teal-50")}>
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-teal-100 group-hover:text-teal-800"><Icon className="h-[18px] w-[18px]" aria-hidden="true" /></span>
                            <span><span className="block text-sm font-semibold text-slate-900">{label}</span><span className="mt-0.5 block text-xs leading-4 text-slate-500">{description}</span></span>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/stories" className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-950">Stories</Link>
            <Link href="/contact-us" aria-current={active === "/contact-us" ? "page" : undefined} className={cn("rounded-lg px-3 py-2 text-sm font-medium transition-colors", active === "/contact-us" ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-white hover:text-slate-950")}>Contact us</Link>
            <div className="relative" ref={ehrRef}>
              <button type="button" onClick={() => setEhrOpen((open) => !open)} aria-expanded={ehrOpen} aria-controls="ehr-menu" className={cn("flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors", isEhrActive ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-white hover:text-slate-950")}>For EHRs <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", ehrOpen && "rotate-180")} aria-hidden="true" /></button>
              {ehrOpen && <div id="ehr-menu" className="absolute right-0 top-full mt-3 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-900/10">
                <Link href="/ehr/register" aria-current={active === "/ehr/register" ? "page" : undefined} className={cn("flex gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50", active === "/ehr/register" && "bg-teal-50")}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700"><Network className="h-[18px] w-[18px]" aria-hidden="true" /></span><span><span className="block text-sm font-semibold text-slate-900">Registration</span><span className="mt-0.5 block text-xs leading-4 text-slate-500">Submit an EHR tenant for review</span></span></Link>
                <Link href="/ehr/documentation" aria-current={active === "/ehr/documentation" ? "page" : undefined} className={cn("flex gap-3 rounded-xl p-3 transition-colors hover:bg-slate-50", active === "/ehr/documentation" && "bg-teal-50")}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-teal-50 text-teal-700"><FileText className="h-[18px] w-[18px]" aria-hidden="true" /></span><span><span className="block text-sm font-semibold text-slate-900">Documentation</span><span className="mt-0.5 block text-xs leading-4 text-slate-500">SMART, FHIR, and CDS integration guide</span></span></Link>
              </div>}
            </div>
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-teal-700 lg:block">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="hidden rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 lg:block">
                  Get started free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="hidden rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-800 lg:block"
              >
                Dashboard
              </Link>
            </SignedIn>

            {/* Mobile menu toggle — always visible on small screens */}
            <button
               ref={menuButtonRef}
               className="ml-1 rounded-xl border border-slate-200 bg-white p-2 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
               aria-label={mobileOpen ? "Close menu" : "Open menu"}
               aria-expanded={mobileOpen}
               aria-controls="public-mobile-menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div id="public-mobile-menu" className="space-y-1 border-t border-slate-200 bg-white px-4 py-3 lg:hidden" aria-label="Mobile public tools menu">
            <p className="px-3 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Explore LivingLink</p>
            {PUBLIC_LINKS.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                   aria-current={active === href || active.startsWith(`${href}/`) ? "page" : undefined}
                   className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                   active === href || active.startsWith(`${href}/`)
                    ? "bg-teal-50 text-teal-800"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span><span className="block">{label}</span><span className="block text-xs font-normal text-slate-400">{description}</span></span>
              </Link>
            ))}
            <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">For EHRs</p>
            <Link href="/ehr/register" onClick={() => setMobileOpen(false)} aria-current={active === "/ehr/register" ? "page" : undefined} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active === "/ehr/register" ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50")}><Network className="h-4 w-4 shrink-0" aria-hidden="true" /><span><span className="block">Registration</span><span className="block text-xs font-normal text-slate-400">Submit a health-system connection</span></span></Link>
            <Link href="/ehr/documentation" onClick={() => setMobileOpen(false)} aria-current={active === "/ehr/documentation" ? "page" : undefined} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active === "/ehr/documentation" ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50")}><FileText className="h-4 w-4 shrink-0" aria-hidden="true" /><span><span className="block">Documentation</span><span className="block text-xs font-normal text-slate-400">SMART, FHIR, and CDS guide</span></span></Link>
            <Link href="/contact-us" onClick={() => setMobileOpen(false)} aria-current={active === "/contact-us" ? "page" : undefined} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors", active === "/contact-us" ? "bg-teal-50 text-teal-800" : "text-slate-600 hover:bg-slate-50")}><Handshake className="h-4 w-4 shrink-0" aria-hidden="true" /><span><span className="block">Contact us</span><span className="block text-xs font-normal text-slate-400">Talk with our team about a partnership</span></span></Link>

            {/* Auth buttons inside mobile menu */}
            <div className="pt-2 mt-2 border-t border-gray-100 flex flex-col gap-2">
              <SignedOut>
                <SignInButton mode="modal">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors text-left"
                  >
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-teal-800"
                  >
                    Get started free
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="w-full rounded-xl bg-slate-950 px-4 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-teal-800"
                >
                  Go to dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
