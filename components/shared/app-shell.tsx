"use client";

import { useEffect, useState } from "react";
import { Sidebar, type NavItem } from "@/components/shared/sidebar";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  role: string;
  navItems?: NavItem[];
  includeAdmin?: boolean;
  mainClassName?: string;
}

export function AppShell({
  children,
  role,
  navItems,
  includeAdmin = false,
  mainClassName,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("livinglink-sidebar-collapsed") === "true");
  }, []);

  function updateCollapsed(value: boolean) {
    setCollapsed(value);
    window.localStorage.setItem("livinglink-sidebar-collapsed", String(value));
  }

  return (
    <div className="min-h-screen bg-slate-50 bg-[radial-gradient(circle_at_85%_0%,rgba(20,184,166,0.06),transparent_28rem)]">
      <Sidebar
        navItems={navItems}
        role={role}
        includeAdmin={includeAdmin}
        collapsed={collapsed}
        onCollapsedChange={updateCollapsed}
      />
      <div
        className={cn(
          "min-h-screen transition-[padding] duration-300 lg:pl-[17rem]",
          collapsed && "lg:pl-[5.5rem]"
        )}
      >
        <main
          id="main-content"
          className={cn("portal-content px-4 pb-10 pt-20 sm:px-6 lg:px-8 lg:pt-8", mainClassName)}
          tabIndex={-1}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
