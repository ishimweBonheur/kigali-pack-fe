"use client";

import { motion } from "framer-motion";
import {
  Activity,
  CreditCard,
  Clock,
  Webhook,
  Zap,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { MetricCardSkeleton, PageSkeleton } from "@/components/shared/loading-skeleton";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { analyticsService } from "@/services/analytics.service";
import { billingService } from "@/services/billing.service";
import { paymentsService } from "@/services/payments.service";
import { webhooksService } from "@/services/webhooks.service";
import { formatNumber } from "@/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: typeof Activity;
  delay?: number;
}) {
  return (
    <motion.div
      initial={fadeIn.initial}
      animate={fadeIn.animate}
      transition={{ delay, duration: 0.4 }}
    >
      <GlassCard hover className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-small text-muted-foreground">{label}</p>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <Icon className="h-4 w-4 text-accent" />
          </div>
        </div>
        <p className="mt-3 font-numbers text-3xl font-semibold tracking-tight">
          {value}
        </p>
        {sub && (
          <p className="mt-1 text-small text-muted-foreground">{sub}</p>
        )}
      </GlassCard>
    </motion.div>
  );
}

export function DashboardOverview() {
  const summaryQuery = useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => analyticsService.getSummary({ limit: 30 }),
  });

  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: () => billingService.getCurrentSubscription(),
  });

  const usageCounterQuery = useQuery({
    queryKey: ["usage-counter"],
    queryFn: () => billingService.getUsageCounter(),
  });

  const paymentsQuery = useQuery({
    queryKey: ["sandbox-history-preview"],
    queryFn: () => paymentsService.listHistory({ limit: 5 }),
  });

  const webhooksQuery = useQuery({
    queryKey: ["webhooks-preview"],
    queryFn: () => webhooksService.list({ limit: 1 }),
  });

  const usageQuery = useQuery({
    queryKey: ["analytics-usage-chart"],
    queryFn: () => analyticsService.getUsage({ limit: 14 }),
  });

  const errorsQuery = useQuery({
    queryKey: ["analytics-errors-chart"],
    queryFn: () => analyticsService.getErrors({ limit: 14 }),
  });

  const latencyQuery = useQuery({
    queryKey: ["analytics-latency-chart"],
    queryFn: () => analyticsService.getLatency({ limit: 14 }),
  });

  if (summaryQuery.isLoading) {
    return <PageSkeleton />;
  }

  const summary = summaryQuery.data?.summary;
  const plan = subscriptionQuery.data?.plan;
  const usageCounter = usageCounterQuery.data;
  const sandboxCount = paymentsQuery.data?.items?.length ?? 0;
  const webhookDeliveries = webhooksQuery.data?.items?.length ?? 0;

  const usageItems = usageQuery.data?.items ?? [];
  const usageLabels = usageItems
    .slice()
    .reverse()
    .map((u) => u.usageDate?.slice(5) ?? "");
  const usageData = usageItems
    .slice()
    .reverse()
    .map((u) => u.requests);

  const errorData = errorsQuery.data as {
    daily?: Array<{ date: string; count: number }>;
  } | undefined;
  const errorLabels =
    errorData?.daily?.map((d) => d.date?.slice(5) ?? "") ?? usageLabels;
  const errorCounts = errorData?.daily?.map((d) => d.count) ?? [];

  const latencyData = latencyQuery.data as {
    daily?: Array<{ date: string; averageLatencyMs: number }>;
  } | undefined;
  const latencyLabels =
    latencyData?.daily?.map((d) => d.date?.slice(5) ?? "") ?? usageLabels;
  const latencyValues =
    latencyData?.daily?.map((d) => d.averageLatencyMs) ?? [];

  const topEndpoints = summaryQuery.data?.topEndpoints ?? [];

  return (
    <div>
      <PageHeader
        title="Overview"
        description="Monitor your API performance, usage, and sandbox activity"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 mb-8">
        <MetricCard
          label="Total requests"
          value={formatNumber(summary?.totalRequests ?? 0)}
          sub="Last 30 days"
          icon={Activity}
          delay={0}
        />
        <MetricCard
          label="Current plan"
          value={plan?.name ?? "Free"}
          sub={plan?.code ?? "FREE"}
          icon={TrendingUp}
          delay={0.05}
        />
        <MetricCard
          label="Avg latency"
          value={`${summary?.averageLatencyMs ?? 0} ms`}
          sub="Across all endpoints"
          icon={Clock}
          delay={0.1}
        />
        <MetricCard
          label="Webhook endpoints"
          value={formatNumber(webhookDeliveries)}
          sub="Registered"
          icon={Webhook}
          delay={0.15}
        />
        <MetricCard
          label="Sandbox payments"
          value={formatNumber(sandboxCount)}
          sub="Recent transactions"
          icon={CreditCard}
          delay={0.2}
        />
        <MetricCard
          label="API usage"
          value={`${usageCounter?.percentUsed ?? 0}%`}
          sub={`${formatNumber(usageCounter?.used ?? 0)} / ${formatNumber(usageCounter?.limit ?? 0)}`}
          icon={Zap}
          delay={0.25}
        />
      </div>

      {usageCounter && (
        <GlassCard className="mb-8 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-small font-medium">Monthly API usage</p>
            <span className="font-numbers text-small text-muted-foreground">
              {formatNumber(usageCounter.used)} / {formatNumber(usageCounter.limit)}
            </span>
          </div>
          <Progress value={usageCounter.percentUsed} className="h-2" />
        </GlassCard>
      )}

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="latency">Latency</TabsTrigger>
        </TabsList>

        <TabsContent value="requests">
          <GlassCard>
            <h3 className="font-heading text-lg font-semibold mb-4">
              Request volume
            </h3>
            {usageQuery.isLoading ? (
              <MetricCardSkeleton />
            ) : (
              <AreaChart
                labels={usageLabels}
                datasets={[
                  { label: "Requests", data: usageData, color: "#0ea5e9" },
                ]}
              />
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="errors">
          <GlassCard>
            <h3 className="font-heading text-lg font-semibold mb-4">
              Error rate
            </h3>
            <BarChart
              labels={errorLabels}
              data={errorCounts}
              label="Errors"
              color="#ef4444"
            />
          </GlassCard>
        </TabsContent>

        <TabsContent value="latency">
          <GlassCard>
            <h3 className="font-heading text-lg font-semibold mb-4">
              Average latency (ms)
            </h3>
            <AreaChart
              labels={latencyLabels}
              datasets={[
                {
                  label: "Latency",
                  data: latencyValues,
                  color: "#22c55e",
                },
              ]}
            />
          </GlassCard>
        </TabsContent>
      </Tabs>

      {topEndpoints.length > 0 && (
        <GlassCard className="mt-8 p-5">
          <h3 className="font-heading text-lg font-semibold mb-4">
            Top endpoints
          </h3>
          <div className="space-y-3">
            {topEndpoints.map((ep) => (
              <div
                key={ep.endpoint}
                className="flex items-center justify-between text-small"
              >
                <span className="font-mono text-muted-foreground truncate max-w-[70%]">
                  {ep.endpoint}
                </span>
                <span className="font-numbers font-medium">
                  {formatNumber(ep.requests)}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
