import Link from "next/link";
import { Heart } from "lucide-react";

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <Link href="/" className="inline-flex items-center gap-2.5 font-bold tracking-tight text-slate-950">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-600 text-white"><Heart className="h-4 w-4 fill-current" aria-hidden="true" /></span>
            LivingLink
          </Link>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-500">Clear information and practical support for every step of the living kidney donation journey.</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-slate-600" aria-label="Footer navigation">
          <Link href="/could-i-qualify" className="hover:text-teal-700">Eligibility</Link>
          <Link href="/ripple" className="hover:text-teal-700">Ripple effect</Link>
          <Link href="/waitlist-map" className="hover:text-teal-700">Waitlist</Link>
          <Link href="/stories" className="hover:text-teal-700">Stories</Link>
          <Link href="/start-conversation" className="hover:text-teal-700">Practice</Link>
        </nav>
      </div>
      <div className="border-t border-slate-100 px-5 py-4 text-center text-xs text-slate-400">LivingLink is not a medical service. Always consult your transplant team. © 2026 LivingLink.</div>
    </footer>
  );
}
