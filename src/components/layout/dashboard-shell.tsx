"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/top-nav";
import { UtilityPanel } from "@/components/layout/utility-panel";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ErrorBoundary } from "@/components/shared/error-boundary";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="flex flex-1 flex-col min-w-0">
        <TopNav />
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-20 lg:pb-6 min-w-0">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
          <UtilityPanel />
        </div>
      </div>
      <MobileNav />
    </div>
  );
}
