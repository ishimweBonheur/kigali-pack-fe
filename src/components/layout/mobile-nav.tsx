"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_ROUTES, SIDEBAR_NAV_ITEMS } from "@/constants";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNavContent } from "@/components/layout/sidebar";
import { useState } from "react";

const mobileQuickItems = SIDEBAR_NAV_ITEMS.slice(0, 4);

export function MobileNav() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href ||
    (href !== DASHBOARD_ROUTES.overview && pathname.startsWith(href));

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background safe-area-pb">
      <div className="flex items-stretch justify-around px-1 py-1.5">
        {mobileQuickItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-medium",
              isActive(item.href) ? "text-accent" : "text-muted-foreground",
            )}
          >
            <i className={cn("ti", item.icon, "text-[20px] leading-none")} aria-hidden />
            <span className="truncate max-w-full">{item.label.split(" ")[0]}</span>
          </Link>
        ))}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger
            className="flex min-w-0 flex-1 flex-col items-center gap-0.5 px-1 py-1 text-[10px] font-medium text-muted-foreground"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
            <span>More</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-[88px] p-3 border-r border-border">
            <SidebarNavContent
              className="h-full"
              onNavigate={() => setSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
