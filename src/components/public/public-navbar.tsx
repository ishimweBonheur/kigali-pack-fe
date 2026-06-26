"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Package,
  Menu,
  X,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PUBLIC_NAV, PUBLIC_ROUTES } from "@/constants/public";
import { PUBLIC_PAGE_PADDING } from "@/components/public/public-page-shell";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useSession } from "next-auth/react";

export function PublicNavbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div
        className={cn(
          PUBLIC_PAGE_PADDING,
          "flex h-14 sm:h-16 w-full items-center justify-between gap-3",
        )}
      >
        <Link
          href={PUBLIC_ROUTES.home}
          className="flex min-w-0 shrink-0 items-center gap-2.5"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/15">
            <Package className="h-5 w-5 text-accent" />
          </div>
          <span className="hidden font-heading text-lg font-semibold sm:inline truncate">
            Kigali-Pack
          </span>
        </Link>

        <nav className="hidden md:flex min-w-0 flex-1 items-center justify-center gap-6 lg:gap-8 px-4">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "whitespace-nowrap text-sm lg:text-[15px] font-medium transition-colors",
                isActive(item.href)
                  ? "text-accent"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">App</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link
                href={PUBLIC_ROUTES.login}
                className="hidden sm:inline-flex text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign in
              </Link>
              <Link
                href={PUBLIC_ROUTES.getStarted}
                className="inline-flex items-center rounded-lg bg-primary px-3 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                <span className="hidden sm:inline">Start Building</span>
                <span className="sm:hidden">Start</span>
              </Link>
            </>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-hover transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm">
              <div className="flex h-full flex-col">
                <div className="mb-8 mt-2 flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15">
                    <Package className="h-5 w-5 text-accent" />
                  </div>
                  <span className="font-heading text-lg font-semibold">
                    Kigali-Pack
                  </span>
                </div>

                <nav className="flex flex-1 flex-col gap-1">
                  {PUBLIC_NAV.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-accent/10 text-accent"
                          : "text-muted-foreground hover:bg-hover hover:text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}

                  <hr className="my-4 border-border" />

                  <Link
                    href={session ? "/dashboard" : PUBLIC_ROUTES.login}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-lg px-3 py-2.5 text-sm font-semibold hover:bg-hover transition-colors"
                  >
                    {session ? "Dashboard" : "Sign in"}
                  </Link>

                  {!session && (
                    <Link
                      href={PUBLIC_ROUTES.getStarted}
                      onClick={() => setMobileOpen(false)}
                      className="mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
