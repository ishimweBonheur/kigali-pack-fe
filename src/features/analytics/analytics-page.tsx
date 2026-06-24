"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { AreaChart } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { analyticsService } from "@/services/analytics.service";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { formatDateTime, formatNumber } from "@/utils";

export function AnalyticsPage() {
  const [logPage, setLogPage] = useState(1);

  const summaryQuery = useQuery({
    queryKey: ["analytics-summary-full"],
    queryFn: () => analyticsService.getSummary({ limit: 30 }),
  });

  const usageQuery = useQuery({
    queryKey: ["analytics-usage-full"],
    queryFn: () => analyticsService.getUsage({ limit: 30 }),
  });

  const errorsQuery = useQuery({
    queryKey: ["analytics-errors-full"],
    queryFn: () => analyticsService.getErrors({ limit: 30 }),
  });

  const latencyQuery = useQuery({
    queryKey: ["analytics-latency-full"],
    queryFn: () => analyticsService.getLatency({ limit: 30 }),
  });

  const logsQuery = useQuery({
    queryKey: ["analytics-logs", logPage],
    queryFn: () =>
      analyticsService.getLogs({ page: logPage, limit: DEFAULT_PAGE_SIZE }),
  });

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
  const latencyData = latencyQuery.data as {
    daily?: Array<{ date: string; averageLatencyMs: number }>;
  } | undefined;

  const logs = logsQuery.data?.items ?? [];
  const summary = summaryQuery.data?.summary;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Deep dive into API usage, errors, and traffic logs"
      />

      <div className="grid gap-4 sm:grid-cols-4 mb-8">
        <GlassCard className="p-4">
          <p className="text-small text-muted-foreground">Total requests</p>
          <p className="font-numbers text-2xl font-semibold mt-1">
            {formatNumber(summary?.totalRequests ?? 0)}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-small text-muted-foreground">Total errors</p>
          <p className="font-numbers text-2xl font-semibold mt-1">
            {formatNumber(summary?.totalErrors ?? 0)}
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-small text-muted-foreground">Error rate</p>
          <p className="font-numbers text-2xl font-semibold mt-1">
            {((summary?.errorRate ?? 0) * 100).toFixed(1)}%
          </p>
        </GlassCard>
        <GlassCard className="p-4">
          <p className="text-small text-muted-foreground">Avg latency</p>
          <p className="font-numbers text-2xl font-semibold mt-1">
            {summary?.averageLatencyMs ?? 0} ms
          </p>
        </GlassCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        <GlassCard>
          <h3 className="font-heading font-semibold mb-4">Request volume</h3>
          {usageQuery.isLoading ? (
            <TableSkeleton rows={4} />
          ) : (
            <AreaChart
              labels={usageLabels}
              datasets={[
                { label: "Requests", data: usageData, color: "#0ea5e9" },
              ]}
              height={220}
            />
          )}
        </GlassCard>
        <GlassCard>
          <h3 className="font-heading font-semibold mb-4">Errors by day</h3>
          <BarChart
            labels={
              errorData?.daily?.map((d) => d.date?.slice(5) ?? "") ?? []
            }
            data={errorData?.daily?.map((d) => d.count) ?? []}
            color="#ef4444"
            height={220}
          />
        </GlassCard>
        <GlassCard className="lg:col-span-2">
          <h3 className="font-heading font-semibold mb-4">Latency trend</h3>
          <AreaChart
            labels={
              latencyData?.daily?.map((d) => d.date?.slice(5) ?? "") ?? []
            }
            datasets={[
              {
                label: "Latency (ms)",
                data:
                  latencyData?.daily?.map((d) => d.averageLatencyMs) ?? [],
                color: "#22c55e",
              },
            ]}
            height={220}
          />
        </GlassCard>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-heading font-semibold">Traffic logs</h3>
        </div>
        {logsQuery.isLoading ? (
          <div className="p-6"><TableSkeleton /></div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No logs yet"
            description="API traffic logs will appear as you make requests"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Endpoint</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Latency</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="border-border">
                  <TableCell className="font-mono text-small max-w-[200px] truncate">
                    {log.endpoint}
                  </TableCell>
                  <TableCell>{log.method}</TableCell>
                  <TableCell className="font-numbers">
                    {log.statusCode}
                  </TableCell>
                  <TableCell className="font-numbers">
                    {log.latencyMs} ms
                  </TableCell>
                  <TableCell className="text-small text-muted-foreground">
                    {formatDateTime(log.timestamp ?? log.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="px-6 pb-4">
          <PaginationControls
            pagination={logsQuery.data?.pagination}
            onPageChange={setLogPage}
          />
        </div>
      </GlassCard>
    </div>
  );
}
