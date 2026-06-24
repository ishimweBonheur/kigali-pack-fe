"use client";

import { Activity, Zap, Clock, Webhook } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import { billingService } from "@/services/billing.service";
import { formatNumber } from "@/utils";

export function UtilityPanel() {
  const summaryQuery = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: () => analyticsService.getSummary({ limit: 7 }),
  });

  const usageQuery = useQuery({
    queryKey: ["usage-counter"],
    queryFn: () => billingService.getUsageCounter(),
  });

  const summary = summaryQuery.data?.summary;
  const usage = usageQuery.data;

  return (
    <aside className="hidden xl:flex w-72 flex-col border-l border-border bg-sidebar/50 p-4 gap-4 overflow-y-auto">
      <div>
        <h3 className="font-heading text-sm font-semibold mb-3">Live metrics</h3>
        <div className="space-y-3">
          <GlassCard className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-small mb-1">
              <Activity className="h-3.5 w-3.5" />
              Requests (30d)
            </div>
            {summaryQuery.isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <p className="font-numbers text-2xl font-semibold">
                {formatNumber(summary?.totalRequests ?? 0)}
              </p>
            )}
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-small mb-1">
              <Clock className="h-3.5 w-3.5" />
              Avg latency
            </div>
            {summaryQuery.isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <p className="font-numbers text-2xl font-semibold">
                {summary?.averageLatencyMs ?? 0}
                <span className="text-small text-muted-foreground ml-1">ms</span>
              </p>
            )}
          </GlassCard>

          <GlassCard className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground text-small mb-1">
              <Zap className="h-3.5 w-3.5" />
              API usage
            </div>
            {usageQuery.isLoading ? (
              <Skeleton className="h-7 w-24" />
            ) : (
              <p className="font-numbers text-2xl font-semibold">
                {formatNumber(usage?.used ?? 0)}
                <span className="text-small text-muted-foreground">
                  /{formatNumber(usage?.limit ?? 0)}
                </span>
              </p>
            )}
          </GlassCard>
        </div>
      </div>

      <div>
        <h3 className="font-heading text-sm font-semibold mb-3 flex items-center gap-2">
          <Webhook className="h-3.5 w-3.5" />
          Quick tips
        </h3>
        <GlassCard className="p-4 text-small text-muted-foreground space-y-2">
          <p>
            Use <kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono text-[11px]">⌘K</kbd>{" "}
            shortcuts: ⌘D overview, ⌘K keys, ⌘A analytics.
          </p>
          <p>Rotate API keys regularly for production workloads.</p>
        </GlassCard>
      </div>
    </aside>
  );
}
