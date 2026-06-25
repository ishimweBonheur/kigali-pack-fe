"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Bell, LogOut, PanelRightClose, PanelRightOpen, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_ROUTES, SIDEBAR_NAV_ITEMS } from "@/constants";
import { authService } from "@/services/auth.service";
import { setAuthTokens } from "@/services/api";
import { useDashboardLayout } from "@/providers/dashboard-layout-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { utilityOpen, toggleUtility } = useDashboardLayout();
  const email = session?.user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase() || "SJ";

  const isActive = (href: string) =>
    pathname === href ||
    (href !== DASHBOARD_ROUTES.overview && pathname.startsWith(href));

  const handleLogout = async () => {
    const refreshToken = session?.user?.refreshToken;
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // proceed with sign out even if API call fails
      }
    }
    setAuthTokens(null);
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="shrink-0 px-3 pt-3 sm:px-4 lg:px-6">
      <div className="mx-auto flex h-12 sm:h-14 max-w-7xl items-center gap-2 sm:gap-3 rounded-xl border border-border bg-card px-3 sm:px-5">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(
            "shrink-0 hidden md:inline-flex",
            utilityOpen && "bg-accent/10 text-accent",
          )}
          onClick={toggleUtility}
          aria-label={utilityOpen ? "Hide metrics panel" : "Show metrics panel"}
          aria-pressed={utilityOpen}
        >
          {utilityOpen ? (
            <PanelRightClose className="h-4 w-4" />
          ) : (
            <PanelRightOpen className="h-4 w-4" />
          )}
        </Button>

        <div className="relative hidden lg:block w-44 xl:w-52 shrink-0">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search…"
            className="h-8 pl-8 bg-secondary/30 border-border text-sm"
          />
        </div>

        <nav
          className="hidden md:flex min-w-0 flex-1 items-center justify-center gap-0.5 lg:gap-1 overflow-x-auto"
          aria-label="Dashboard"
        >
          {SIDEBAR_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs lg:text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-accent/15 text-accent"
                  : "text-muted-foreground hover:bg-hover hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1 md:hidden" />

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="md:hidden"
            onClick={toggleUtility}
            aria-label={utilityOpen ? "Hide metrics panel" : "Show metrics panel"}
            aria-pressed={utilityOpen}
          >
            {utilityOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>

          <Button variant="ghost" size="icon-sm" className="hidden sm:inline-flex">
            <Bell className="h-4 w-4" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex h-8 items-center gap-2 rounded-lg px-1.5 hover:bg-hover"
            >
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-[var(--sidebar-logo-bg)] text-[11px] text-white">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden xl:inline text-small truncate max-w-[160px]">
                {email}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => router.push(DASHBOARD_ROUTES.profile)}>
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(DASHBOARD_ROUTES.settings)}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
