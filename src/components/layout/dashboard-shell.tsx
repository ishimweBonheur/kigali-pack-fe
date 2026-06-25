"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardNav } from "@/components/layout/dashboard-nav";
import { UtilityPanel } from "@/components/layout/utility-panel";
import { MobileNav } from "@/components/layout/mobile-nav";
import { ErrorBoundary } from "@/components/shared/error-boundary";
import { PageSkeleton } from "@/components/shared/loading-skeleton";
import { DashboardLayoutProvider } from "@/providers/dashboard-layout-context";
import { useAuthReady } from "@/providers/auth-ready-context";
import { AUTH_ROUTES } from "@/constants";

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { authReady, status } = useAuthReady();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`${AUTH_ROUTES.login}?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [status, router]);

  if (!authReady) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6">
        <PageSkeleton />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 gap-3 overflow-hidden px-3 pb-3 pt-1 sm:px-4 sm:pb-4 lg:px-6 lg:pb-6">
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden rounded-xl p-3 sm:p-4 lg:p-6 pb-[calc(4.5rem+env(safe-area-inset-bottom))] lg:pb-6">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <UtilityPanel />
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutProvider>
      <div className="flex h-[100dvh] overflow-hidden bg-background">
        <Sidebar />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <DashboardNav />
          <DashboardContent>{children}</DashboardContent>
        </div>
        <MobileNav />
      </div>
    </DashboardLayoutProvider>
  );
}
