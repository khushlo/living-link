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
  Link2,
  Calendar,
  MessageCircle,
  TrendingUp,
  Map,
  BookOpen,
  Menu,
  X,
  UserCircle,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Fragment, useState } from "react";
import { NotificationBell } from "@/components/shared/notification-bell";

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface SidebarProps {
  navItems?: NavItem[];
  role: string;
  isMentor?: boolean;
  includeAdmin?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({
  navItems,
  role,
  includeAdmin = false,
  collapsed = false,
  onCollapsedChange,
}: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const resolvedNavItems = includeAdmin
    ? [...(navItems ?? donorNavItems), ...adminNavItems]
    : navItems ?? donorNavItems;

  const roleBadgeColor: Record<string, string> = {
    donor: "bg-teal-400/15 text-teal-200 ring-teal-400/20",
    patient: "bg-emerald-400/15 text-emerald-200 ring-emerald-400/20",
    coordinator: "bg-amber-400/15 text-amber-200 ring-amber-400/20",
    clinician: "bg-violet-400/15 text-violet-200 ring-violet-400/20",
    admin: "bg-slate-400/15 text-slate-200 ring-slate-400/20",
  };

  const sidebarContent = (compact = false) => (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-[4.5rem] items-center border-b border-white/10 px-5", compact && "justify-center px-3")}>
        <Link href="/" className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80" aria-label="LivingLink home">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-teal-400 text-slate-950 shadow-lg shadow-teal-950/30">
            <Heart className="h-[18px] w-[18px] fill-current" aria-hidden="true" />
          </span>
          {!compact && <span className="text-[15px] font-bold tracking-tight text-white">LivingLink</span>}
        </Link>
        {!compact && <span
          className={cn(
            "ml-auto rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ring-1 ring-inset",
            roleBadgeColor[role] ?? "bg-slate-400/15 text-slate-200 ring-slate-400/20"
          )}
        >
          {role}
        </span>}
      </div>

      <div className={cn("px-5 pb-2 pt-5", compact && "px-3 text-center")}>
        {compact ? <Sparkles className="mx-auto h-4 w-4 text-teal-300" aria-hidden="true" /> : <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Your journey</p>}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4" aria-label="Sidebar navigation">
        <ul className="space-y-1">
          {resolvedNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Fragment key={item.href}>
                {item.badge && resolvedNavItems[index - 1]?.badge !== item.badge && (
                  <li aria-hidden="true" className={cn("mb-2 mt-5 flex items-center gap-2 px-3", compact && "justify-center px-0")}>
                    {!compact && <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{item.badge}</span>}
                    <span className="h-px flex-1 bg-white/10" />
                  </li>
                )}
                <li>
                  <Link
                    href={item.href}
                    title={compact ? item.label : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      "focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-slate-950",
                      compact && "justify-center px-2",
                      isActive
                        ? "bg-teal-400 text-slate-950 shadow-md shadow-black/15"
                        : "text-slate-400 hover:bg-white/[0.07] hover:text-white"
                    )}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                    {!compact && <span className="truncate">{item.label}</span>}
                    {compact && <span className="sr-only">{item.label}</span>}
                  </Link>
                </li>
              </Fragment>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className={cn("flex items-center gap-3 rounded-xl bg-white/[0.05] p-2", compact && "justify-center bg-transparent")}>
          <UserButton afterSignOutUrl="/" />
          {!compact && <div className="min-w-0"><p className="text-xs font-medium text-slate-200">Your account</p><p className="text-[10px] text-slate-500">Profile & settings</p></div>}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <NotificationBell />
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden bg-slate-950 transition-[width] duration-300 lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-[17rem] lg:flex-col",
          collapsed && "lg:w-[5.5rem]"
        )}
        aria-label="Main sidebar"
      >
        {sidebarContent(collapsed)}
        <button
          type="button"
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="absolute -right-3 top-24 grid h-7 w-7 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition-colors hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="h-3.5 w-3.5" /> : <PanelLeftClose className="h-3.5 w-3.5" />}
        </button>
      </aside>

      {/* Mobile toggle */}
       <div className={cn("fixed top-4 z-[60] transition-[left] lg:hidden", mobileOpen ? "left-[14.75rem]" : "left-4")}>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
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
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside
            id="mobile-sidebar"
            className="fixed inset-y-0 left-0 z-50 flex w-[18rem] flex-col bg-slate-950 shadow-2xl lg:hidden"
            aria-label="Mobile navigation"
          >
            {sidebarContent(false)}
          </aside>
        </>
      )}
    </>
  );
}

// Pre-built nav item sets per role
export const donorNavItems: NavItem[] = [
  { href: "/donor/dashboard",      label: "Dashboard",          icon: LayoutDashboard },
  { href: "/donor/profile",        label: "Donor profile",       icon: UserCircle },
  { href: "/ready-check",          label: "ReadyCheck",          icon: CheckCircle },
  { href: "/donor-shield",         label: "DonorShield",         icon: Shield },
  { href: "/mentor-match",         label: "Mentor Match",        icon: Users },
  { href: "/life-after",           label: "LifeAfter",           icon: Heart },
  { href: "/privacy",              label: "Privacy & Data",      icon: Shield },
  { href: "/fhir-export",          label: "My FHIR export",       icon: Activity },
  { href: "/could-i-qualify",      label: "Eligibility Check",   icon: CheckCircle,  badge: "Public" },
  { href: "/ripple",               label: "Ripple Effect",       icon: TrendingUp,   badge: "Public" },
  { href: "/waitlist-map",         label: "Waitlist Map",        icon: Map,          badge: "Public" },
  { href: "/stories",              label: "Donor Stories",       icon: BookOpen,     badge: "Public" },
  { href: "/start-conversation",   label: "Conversation Guide",  icon: MessageCircle, badge: "Public" },
];

export const clinicianNavItems: NavItem[] = [
  { href: "/clinician/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clinician/center-flow", label: "CenterFlow", icon: Activity },
  { href: "/clinician/patient-links", label: "Link EHR patients", icon: Link2 },
];

export const coordinatorNavItems: NavItem[] = [
  { href: "/coordinator/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/coordinator/center-flow", label: "CenterFlow", icon: Activity },
  { href: "/coordinator/patient-links", label: "Link EHR patients", icon: Link2 },
];

export const patientNavItems: NavItem[] = [
  { href: "/patient/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/patient/appointments", label: "Appointments", icon: Calendar },
];

export const adminNavItems: NavItem[] = [
  { href: "/admin/dashboard", label: "Admin dashboard", icon: LayoutDashboard, badge: "Admin" },
  { href: "/admin/review", label: "Review queues", icon: BookOpen, badge: "Admin" },
  { href: "/admin/escalations", label: "Safety escalations", icon: Activity, badge: "Admin" },
  { href: "/admin/audit", label: "Audit log", icon: Shield, badge: "Admin" },
];
