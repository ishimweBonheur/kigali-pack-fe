import Link from "next/link";
import { Package } from "lucide-react";
import { FOOTER_LINKS, PUBLIC_ROUTES } from "@/constants/public";
import { PublicPageShell } from "@/components/public/public-page-shell";

export function PublicFooter() {
  return (
    <footer className="w-full border-t border-border bg-card/50">
      <PublicPageShell className="py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <div className="lg:col-span-1 xl:col-span-2">
            <Link href={PUBLIC_ROUTES.home} className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15">
                <Package className="h-5 w-5 text-accent" />
              </div>
              <span className="font-heading font-semibold">Kigali-Pack</span>
            </Link>
            <p className="mt-4 text-small text-muted-foreground max-w-md">
              Developer infrastructure for Rwanda — locations, compliance,
              payments, and analytics in one platform.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([group, links]) => (
            <div key={group}>
              <h4 className="font-heading text-sm font-semibold capitalize mb-4">
                {group}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-small text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-small text-muted-foreground w-full">
          <p>© {new Date().getFullYear()} Kigali-Pack Cloud Engine</p>
          <p>Built for developers in Rwanda</p>
        </div>
      </PublicPageShell>
    </footer>
  );
}
