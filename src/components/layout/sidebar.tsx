"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { DASHBOARD_ROUTES, SIDEBAR_NAV_ITEMS } from "@/constants";
import { authService } from "@/services/auth.service";
import { setAuthTokens } from "@/services/api";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarNavContentProps {
  className?: string;
  onNavigate?: () => void;
}

function SidebarIconButton({
  label,
  href,
  icon,
  isActive,
  onNavigate,
}: {
  label: string;
  href?: string;
  icon: string;
  isActive?: boolean;
  onNavigate?: () => void;
}) {
  const className = cn("sidebar-nav-btn", isActive && "sidebar-nav-btn-active");

  const inner = (
    <i className={cn("ti", icon, "text-[20px] leading-none")} aria-hidden />
  );

  if (href) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={href}
              onClick={onNavigate}
              className={className}
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
            />
          }
        >
          {inner}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button type="button" className={className} aria-label={label} />
        }
      >
        {inner}
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function SidebarNavContent({
  className,
  onNavigate,
}: SidebarNavContentProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const email = session?.user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase() || "SJ";

  const handleLogout = async () => {
    onNavigate?.();
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

  const isActive = (href: string) =>
    pathname === href ||
    (href !== DASHBOARD_ROUTES.overview && pathname.startsWith(href));

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      {/* Card 1 — Logo */}
      <div className="sidebar-card py-3">
        <Link
          href={DASHBOARD_ROUTES.overview}
          onClick={onNavigate}
          className="sidebar-logo"
          aria-label="Kigali-Pack home"
        >
          <i className="ti ti-package text-[20px] leading-none" aria-hidden />
        </Link>
      </div>

      {/* Card 2 — Navigation */}
      <div className="sidebar-card flex-1 min-h-0 py-2 gap-0.5">
        {SIDEBAR_NAV_ITEMS.map((item) => (
          <SidebarIconButton
            key={item.href}
            label={item.label}
            href={item.href}
            icon={item.icon}
            isActive={isActive(item.href)}
            onNavigate={onNavigate}
          />
        ))}
      </div>

      {/* Card 3 — Account */}
      <div className="sidebar-card py-2 gap-0.5">
        <SidebarIconButton
          label="Settings"
          href={DASHBOARD_ROUTES.settings}
          icon="ti-settings"
          isActive={isActive(DASHBOARD_ROUTES.settings)}
          onNavigate={onNavigate}
        />
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                className="sidebar-nav-btn"
                aria-label="Sign out"
                onClick={handleLogout}
              />
            }
          >
            <i className="ti ti-logout text-[20px] leading-none" aria-hidden />
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Sign out
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href={DASHBOARD_ROUTES.profile}
                onClick={onNavigate}
                className="sidebar-avatar mt-0.5"
                aria-label="Profile"
              />
            }
          >
            <span className="text-[11px] font-semibold leading-none">
              {initials}
            </span>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Profile
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden lg:flex h-full w-16 shrink-0 flex-col items-center py-3">
      <SidebarNavContent className="h-full w-full" />
    </aside>
  );
}
