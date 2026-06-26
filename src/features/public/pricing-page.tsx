"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { CtaBanner } from "@/components/public/cta-banner";
import { publicService } from "@/services/public.service";
import { formatCurrency, formatNumber } from "@/utils";
import type { BillingPlan } from "@/types";
import { PUBLIC_ROUTES } from "@/constants/public";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { Skeleton } from "@/components/ui/skeleton";

const COMPARISON_FEATURES = [
  { key: "requests", label: "Requests / hour", getValue: (p: BillingPlan) => p.rateLimitPerHour ? formatNumber(p.rateLimitPerHour) : "Unlimited" },
  { key: "analytics", label: "Analytics", getValue: (p: BillingPlan) => p.features.some(f => f.toLowerCase().includes("analytics")) ? "Included" : "—" },
  { key: "sandbox", label: "Sandbox", getValue: (p: BillingPlan) => p.features.some(f => f.toLowerCase().includes("sandbox")) ? "Included" : "—" },
  { key: "webhooks", label: "Webhooks", getValue: (p: BillingPlan) => p.features.some(f => f.toLowerCase().includes("webhook")) ? "Included" : "—" },
  { key: "support", label: "Support", getValue: (p: BillingPlan) => p.features.some(f => f.toLowerCase().includes("support")) ? "Priority" : "Community" },
];

export function PricingPage() {
  const { data: plans, isLoading, isError } = useQuery({
    queryKey: ["public-plans"],
    queryFn: () => publicService.getPlans(),
  });

  return (
    <>
      <PublicPageShell className="py-16">
        <PageHeader
          title="Pricing"
          description="Plans loaded live from the Kigali-Pack billing API. No mock data."
        />

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <p className="text-destructive text-center">
            Unable to load plans. Ensure the API is running.
          </p>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-3 mb-16">
              {(plans ?? []).map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`glass-card rounded-2xl p-8 flex flex-col ${
                    plan.code === "FREE" ? "ring-2 ring-accent relative" : ""
                  }`}
                >
                  {plan.code === "FREE" && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-accent text-[11px] font-medium text-accent-foreground">
                      Recommended
                    </span>
                  )}
                  <h3 className="font-heading text-2xl font-semibold">{plan.name}</h3>
                  <p className="text-small text-muted-foreground mt-2">
                    {plan.description}
                  </p>
                  <p className="font-numbers text-4xl font-bold mt-6">
                    {formatCurrency(Number(plan.priceMonthlyRwf))}
                    <span className="text-small font-normal text-muted-foreground">
                      /month
                    </span>
                  </p>
                  <ul className="mt-6 space-y-3 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-small">
                        <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={PUBLIC_ROUTES.getStarted}
                    className={`mt-8 inline-flex h-10 items-center justify-center rounded-lg text-sm font-medium ${
                      plan.code === "FREE"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "border border-border hover:bg-hover"
                    }`}
                  >
                    Get started
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Comparison table */}
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="font-heading text-xl font-semibold">
                  Plan comparison
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-small">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 font-medium text-muted-foreground">
                        Feature
                      </th>
                      {(plans ?? []).map((p) => (
                        <th key={p.id} className="p-4 font-heading font-semibold">
                          {p.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {COMPARISON_FEATURES.map((row) => (
                      <tr key={row.key} className="border-b border-border last:border-0">
                        <td className="p-4 text-muted-foreground">{row.label}</td>
                        {(plans ?? []).map((p) => (
                          <td key={p.id} className="p-4 font-mono">
                            {row.getValue(p)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </PublicPageShell>
      <CtaBanner />
    </>
  );
}
