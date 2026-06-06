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
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton, SignUpButton } from "@clerk/nextjs";
import { useState } from "react";
import { cn } from "@/lib/utils";

const PUBLIC_LINKS = [
  { href: "/could-i-qualify", label: "Could I qualify?",  icon: CheckCircle  },
  { href: "/ripple",          label: "Ripple effect",     icon: TrendingUp   },
  { href: "/waitlist-map",    label: "Waitlist map",      icon: Map          },
  { href: "/stories",         label: "Donor stories",     icon: BookOpen     },
  { href: "/start-conversation", label: "Practice conversation", icon: MessageCircle },
];

export function PublicNav({ currentPath }: { currentPath?: string }) {
  const pathname = usePathname();
  const active = currentPath ?? pathname;
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Heart className="h-5 w-5 fill-blue-600 text-blue-600" aria-hidden="true" />
            <span className="font-bold text-gray-900">LivingLink</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Public tools navigation">
            {PUBLIC_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active === href
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <SignedOut>
              <SignInButton mode="modal">
                <button className="hidden sm:block text-sm font-medium text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-md transition-colors">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                  Get started free
                </button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link
                href="/dashboard"
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Dashboard
              </Link>
            </SignedIn>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden rounded-lg border p-1.5 ml-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {PUBLIC_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active === href
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {label}
              </Link>
            ))}
          </div>
        )}
      </header>
    </>
  );
}
