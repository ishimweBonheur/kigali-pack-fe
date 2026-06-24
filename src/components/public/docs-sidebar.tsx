"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DOC_NAV, DOC_SECTIONS } from "@/content/docs";

export function DocsSidebar() {
  const pathname = usePathname();

  const v2Sections = DOC_SECTIONS.filter((d) => d.category === "V2 Architecture");
  const standardSections = DOC_SECTIONS.filter((d) => d.category !== "V2 Architecture");

  const renderNavItem = (slug: string, title: string) => {
    const href = `/docs/${slug}`;
    const isActive = pathname === href;
    return (
      <Link
        key={slug}
        href={href}
        className={cn(
          "block px-3 py-2 rounded-lg text-small transition-colors whitespace-nowrap lg:whitespace-normal",
          isActive
            ? "bg-accent/15 text-accent font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-hover",
        )}
      >
        {title}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile: horizontal scroll nav */}
      <nav className="lg:hidden -mx-4 px-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 pb-2 min-w-max">
          {DOC_NAV.map((item) => {
            const href = `/docs/${item.slug}`;
            const isActive = pathname === href;
            return (
              <Link
                key={item.slug}
                href={href}
                className={cn(
                  "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                  isActive
                    ? "border-accent/40 bg-accent/15 text-accent"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop: sticky sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <nav className="sticky top-24 space-y-1 max-h-[calc(100vh-7rem)] overflow-y-auto">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 px-3">
            Documentation
          </p>
          {standardSections.map((item) => renderNavItem(item.slug, item.title))}

          {v2Sections.length > 0 && (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-accent/80 mb-2 mt-6 px-3">
                V2 Architecture
              </p>
              {v2Sections.map((item) => renderNavItem(item.slug, item.title))}
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
