"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  Heart,
  LayoutDashboard,
  Users,
  CheckCircle,
  Shield,
  Activity,
  Calendar,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface SidebarProps {
  navItems: NavItem[];
  role: string;
}

export function Sidebar({ navItems, role }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const roleBadgeColor: Record<string, string> = {
    donor: "bg-blue-100 text-blue-700",
    patient: "bg-green-100 text-green-700",
    coordinator: "bg-orange-100 text-orange-700",
    clinician: "bg-purple-100 text-purple-700",
  };

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <Heart className="h-5 w-5 fill-blue-600 text-blue-600" aria-hidden="true" />
        <span className="font-bold text-gray-900">LivingLink</span>
        <span
          className={cn(
            "ml-auto rounded-full px-2 py-0.5 text-xs font-medium capitalize",
            roleBadgeColor[role] ?? "bg-gray-100 text-gray-700"
          )}
        >
          {role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4" aria-label="Sidebar navigation">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setMobileOpen(false)}
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-blue-600 px-2 py-0.5 text-xs text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-xs text-gray-500">Account settings</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col border-r bg-white"
        aria-label="Main sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile toggle */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg border bg-white p-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
        >
          {mobileOpen ? (
            <X className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Menu className="h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            id="mobile-sidebar"
            className="fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-white lg:hidden"
            aria-label="Mobile navigation"
          >
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}

// Pre-built nav item sets per role
export const donorNavItems: NavItem[] = [
  { href: "/donor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/ready-check", label: "ReadyCheck", icon: CheckCircle },
  { href: "/donor-shield", label: "DonorShield", icon: Shield },
  { href: "/mentor-match", label: "Mentor Match", icon: Users },
  { href: "/life-after", label: "LifeAfter", icon: Heart },
];

export const clinicianNavItems: NavItem[] = [
  { href: "/clinician/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clinician/center-flow", label: "CenterFlow", icon: Activity },
];

export const coordinatorNavItems: NavItem[] = [
  { href: "/coordinator/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/coordinator/center-flow", label: "CenterFlow", icon: Activity },
];

export const patientNavItems: NavItem[] = [
  { href: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patient/appointments", label: "Appointments", icon: Calendar },
];
