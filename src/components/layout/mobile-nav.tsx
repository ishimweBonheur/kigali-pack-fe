"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Key,
  BarChart3,
  CreditCard,
  Webhook,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_ROUTES } from "@/constants";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/layout/sidebar";
import { useState } from "react";

const mobileItems = [
  { label: "Overview", href: DASHBOARD_ROUTES.overview, icon: LayoutDashboard },
  { label: "Keys", href: DASHBOARD_ROUTES.apiKeys, icon: Key },
  { label: "Analytics", href: DASHBOARD_ROUTES.analytics, icon: BarChart3 },
  { label: "Payments", href: DASHBOARD_ROUTES.payments, icon: CreditCard },
  { label: "Webhooks", href: DASHBOARD_ROUTES.webhooks, icon: Webhook },
];

export function MobileNav() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border glass-panel">
        <div className="flex items-center justify-around py-2">
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
                  isActive ? "text-accent" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger
              className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] text-muted-foreground"
            >
              <Menu className="h-5 w-5" />
              <span>More</span>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      <div className="lg:hidden fixed top-4 left-4 z-30">
        <Sheet>
          <SheetTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg glass-card border border-border">
            <Menu className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar collapsed={false} onToggle={() => undefined} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
