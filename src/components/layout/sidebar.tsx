"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Key,
  BarChart3,
  CreditCard,
  Webhook,
  Receipt,
  Building2,
  User,
  Settings,
  Moon,
  Sun,
  ChevronLeft,
  Package,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, DASHBOARD_ROUTES } from "@/constants";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "next-auth/react";

const iconMap = {
  LayoutDashboard,
  Key,
  Terminal,
  BarChart3,
  CreditCard,
  Webhook,
  Receipt,
  Building2,
  User,
  Settings,
} as const;

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-border bg-sidebar h-full transition-all duration-300",
        collapsed ? "w-[72px]" : "w-64",
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15">
          <Package className="h-5 w-5 text-accent" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="font-heading text-sm font-semibold truncate">
              Kigali-Pack
            </p>
            <p className="text-[11px] text-muted-foreground">Cloud Engine</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          className={cn("ml-auto shrink-0", collapsed && "mx-auto")}
          onClick={onToggle}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              collapsed && "rotate-180",
            )}
          />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive =
            pathname === item.href ||
            (item.href !== DASHBOARD_ROUTES.overview &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-small font-medium transition-colors",
                isActive
                  ? "bg-accent/15 text-accent"
                  : "text-muted-foreground hover:bg-hover hover:text-foreground",
                collapsed && "justify-center px-2",
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 space-y-2">
        <Link
          href={DASHBOARD_ROUTES.profile}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-hover transition-colors",
            collapsed && "justify-center",
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-secondary text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-small font-medium truncate">{email}</p>
              <p className="text-[11px] text-muted-foreground">Developer</p>
            </div>
          )}
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full", collapsed ? "justify-center px-2" : "justify-start")}
          onClick={toggleTheme}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          {!collapsed && <span className="ml-2">Toggle theme</span>}
        </Button>
      </div>
    </aside>
  );
}
