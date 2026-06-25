"use client";

import { Activity, Zap, Clock, Webhook, X } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analytics.service";
import { billingService } from "@/services/billing.service";
import { formatNumber } from "@/utils";
import { useDashboardLayout } from "@/providers/dashboard-layout-context";
import { cn } from "@/lib/utils";

function UtilityPanelContent({
  onClose,
  showClose,
}: {
  onClose?: () => void;
  showClose?: boolean;
}) {
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
    <>
      <div className="flex items-center justify-between shrink-0">
        <h3 className="font-heading text-sm font-semibold">Live metrics</h3>
        {showClose && onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close metrics panel"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

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

      <div>
        <h3 className="font-heading text-sm font-semibold mb-3 flex items-center gap-2">
          <Webhook className="h-3.5 w-3.5" />
          Quick tips
        </h3>
        <GlassCard className="p-4 text-small text-muted-foreground space-y-2">
          <p>
            Use{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-secondary font-mono text-[11px]">
              ⌘K
            </kbd>{" "}
            shortcuts: ⌘D overview, ⌘K keys, ⌘A analytics.
          </p>
          <p>Rotate API keys regularly for production workloads.</p>
        </GlassCard>
      </div>
    </>
  );
}

export function UtilityPanel() {
  const { utilityOpen, setUtilityOpen } = useDashboardLayout();

  if (!utilityOpen) return null;

  const close = () => setUtilityOpen(false);

  return (
    <>
      <button
        type="button"
        className="md:hidden fixed inset-0 z-40 bg-black/20"
        onClick={close}
        aria-label="Close metrics panel"
      />

      <aside
        className={cn(
          "hidden md:flex h-full min-h-0 w-60 xl:w-64 shrink-0 flex-col rounded-xl border border-border bg-card p-4 gap-4 overflow-y-auto",
        )}
      >
        <UtilityPanelContent />
      </aside>

      <aside className="md:hidden fixed top-[calc(4.5rem+0.75rem)] right-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-50 flex w-[min(100%,18rem)] flex-col rounded-xl border border-border bg-card p-4 gap-4 overflow-y-auto safe-area-pb">
        <UtilityPanelContent showClose onClose={close} />
      </aside>
    </>
  );
}
