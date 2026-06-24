"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DASHBOARD_ROUTES } from "@/constants";

export function KeyboardShortcuts() {
  const router = useRouter();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey)) return;

      const shortcuts: Record<string, string> = {
        d: DASHBOARD_ROUTES.overview,
        k: DASHBOARD_ROUTES.apiKeys,
        a: DASHBOARD_ROUTES.analytics,
        p: DASHBOARD_ROUTES.payments,
        w: DASHBOARD_ROUTES.webhooks,
        b: DASHBOARD_ROUTES.billing,
        o: DASHBOARD_ROUTES.organizations,
        s: DASHBOARD_ROUTES.settings,
      };

      const target = shortcuts[e.key];
      if (target) {
        e.preventDefault();
        router.push(target);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [router]);

  return null;
}
