"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Package,
  Menu,
  X,
  Moon,
  Sun,
  Search,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PUBLIC_NAV, PUBLIC_ROUTES } from "@/constants/public";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "next-auth/react";

export function PublicNavbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border glass-panel">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 lg:px-8">
        <Link href={PUBLIC_ROUTES.home} className="flex items-center gap-2.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15">
            <Package className="h-5 w-5 text-accent" />
          </div>
          <span className="font-heading font-semibold hidden sm:inline">
            Kigali-Pack
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-8">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 rounded-lg text-small font-medium transition-colors",
                pathname === item.href || pathname.startsWith(`${item.href}/`)
                  ? "text-accent bg-accent/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-hover",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon-sm" className="hidden lg:flex">
            <Search className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={toggleTheme}>
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex h-8 items-center gap-1 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href={PUBLIC_ROUTES.login}
                className="hidden sm:inline-flex h-8 items-center px-3 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href={PUBLIC_ROUTES.getStarted}
                className="inline-flex h-8 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Start Building
              </Link>
            </>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-hover">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="flex flex-col gap-1 mt-8">
                {PUBLIC_NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm hover:bg-hover"
                  >
                    {item.label}
                  </Link>
                ))}
                <hr className="my-3 border-border" />
                <Link
                  href={session ? "/dashboard" : PUBLIC_ROUTES.login}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm hover:bg-hover"
                >
                  {session ? "Dashboard" : "Sign in"}
                </Link>
                {!session && (
                  <Link
                    href={PUBLIC_ROUTES.getStarted}
                    onClick={() => setMobileOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-accent hover:bg-hover"
                  >
                    Get Started
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
