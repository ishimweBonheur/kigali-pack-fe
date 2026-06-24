"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  CreditCard,
  Shield,
  Radio,
  Users,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { PaginationControls } from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminService } from "@/services/admin.service";
import { isAdminRole } from "@/types/admin";
import type { AdminSubscription } from "@/types/admin";
import {
  formatCurrency,
  formatDateTime,
  formatNumber,
  getErrorMessage,
} from "@/utils";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { toast } from "sonner";

export function AdminDashboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  const [devPage, setDevPage] = useState(1);
  const [telemetryPage, setTelemetryPage] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const [selectedSub, setSelectedSub] = useState<AdminSubscription | null>(
    null,
  );
  const [planCode, setPlanCode] = useState("");
  const [rateLimit, setRateLimit] = useState("");

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || !isAdminRole(session?.user?.role)) {
      router.replace("/login?callbackUrl=/admin-dashboard");
    }
  }, [status, session, router]);

  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => adminService.getOverview(),
    enabled: isAdminRole(session?.user?.role),
    refetchInterval: 30_000,
  });

  const subscriptionsQuery = useQuery({
    queryKey: ["admin-subscriptions", subPage],
    queryFn: () =>
      adminService.listSubscriptions({ page: subPage, limit: DEFAULT_PAGE_SIZE }),
    enabled: isAdminRole(session?.user?.role),
  });

  const developersQuery = useQuery({
    queryKey: ["admin-developers", devPage],
    queryFn: () =>
      adminService.listDevelopers({ page: devPage, limit: DEFAULT_PAGE_SIZE }),
    enabled: isAdminRole(session?.user?.role),
  });

  const telemetryQuery = useQuery({
    queryKey: ["admin-telemetry", telemetryPage],
    queryFn: () =>
      adminService.getTelemetryStream({
        page: telemetryPage,
        limit: DEFAULT_PAGE_SIZE,
      }),
    enabled: isAdminRole(session?.user?.role),
    refetchInterval: 10_000,
  });

  const webhookFailuresQuery = useQuery({
    queryKey: ["admin-webhook-failures"],
    queryFn: () => adminService.listWebhookFailures({ limit: 10 }),
    enabled: isAdminRole(session?.user?.role),
  });

  const tierOverrideMutation = useMutation({
    mutationFn: ({
      id,
      planCode,
      rateLimitPerHour,
    }: {
      id: string;
      planCode?: string;
      rateLimitPerHour?: number;
    }) =>
      adminService.overrideSubscriptionTier(id, {
        planCode: planCode || undefined,
        rateLimitPerHour,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      setSelectedSub(null);
      toast.success("Subscription updated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const restrictMutation = useMutation({
    mutationFn: (memberId: string) => adminService.restrictDeveloper(memberId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["admin-developers"] });
      toast.success(result.message);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  if (status === "loading" || !isAdminRole(session?.user?.role)) {
    return (
      <div className="min-h-screen bg-[#020617] p-6">
        <TableSkeleton rows={6} />
      </div>
    );
  }

  const overview = overviewQuery.data;

  return (
    <div className="min-h-screen bg-[#020617] text-foreground">
      <div className="border-b border-white/10 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-[#0EA5E9]" />
            <div>
              <p className="font-heading font-semibold text-lg">
                Master Admin Control Center
              </p>
              <p className="text-small text-muted-foreground">
                Kigali-Pack Cloud Engine — platform operations
              </p>
            </div>
          </div>
          <StatusBadge status={session.user.role} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader
          title="System Control Layer"
          description="Manage subscriptions, developers, billing overrides, and live telemetry"
        />

        <Tabs defaultValue="overview" className="mt-6">
          <TabsList className="bg-white/5 border border-white/10 mb-6 flex-wrap h-auto">
            <TabsTrigger value="overview" className="gap-2">
              <Activity className="h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="h-4 w-4" /> Subscriptions
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="h-4 w-4" /> Members
            </TabsTrigger>
            <TabsTrigger value="telemetry" className="gap-2">
              <Radio className="h-4 w-4" /> Live Telemetry
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {[
                {
                  label: "Registered businesses",
                  value: formatNumber(overview?.totalOrganizations ?? 0),
                },
                {
                  label: "Live API keys",
                  value: formatNumber(overview?.totalActiveApiKeys ?? 0),
                },
                {
                  label: "MRR (RWF)",
                  value: formatCurrency(overview?.totalMrrRwf ?? 0),
                },
                {
                  label: "Global latency",
                  value: `${overview?.globalAverageLatencyMs ?? 0} ms`,
                },
                {
                  label: "Error rate",
                  value: `${((overview?.globalErrorRate ?? 0) * 100).toFixed(2)}%`,
                },
              ].map((metric) => (
                <GlassCard key={metric.label} className="p-4 border-[#0EA5E9]/20">
                  <p className="text-small text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="font-numbers text-2xl font-semibold mt-1 text-[#0EA5E9]">
                    {metric.value}
                  </p>
                </GlassCard>
              ))}
            </div>

            {(webhookFailuresQuery.data?.items.length ?? 0) > 0 && (
              <GlassCard className="mt-6 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-400" />
                  <h3 className="font-heading font-semibold">
                    Recent webhook failures
                  </h3>
                </div>
                <div className="space-y-2 text-small">
                  {webhookFailuresQuery.data?.items.slice(0, 5).map((f) => (
                    <div
                      key={f.id}
                      className="flex justify-between gap-4 border-b border-white/5 pb-2"
                    >
                      <span className="truncate font-mono">{f.webhookUrl}</span>
                      <span className="text-red-400 shrink-0">
                        {f.errorMessage ?? f.status}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </TabsContent>

          <TabsContent value="billing">
            <GlassCard className="p-0 overflow-hidden">
              {subscriptionsQuery.isLoading ? (
                <div className="p-6">
                  <TableSkeleton />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead>Organization</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Monthly</TableHead>
                      <TableHead>API limit/hr</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(subscriptionsQuery.data?.items ?? []).map((sub) => (
                      <TableRow key={sub.id} className="border-white/10">
                        <TableCell className="font-mono text-small">
                          {sub.developerName}
                        </TableCell>
                        <TableCell>{sub.plan.name}</TableCell>
                        <TableCell>
                          <StatusBadge status={sub.status} />
                        </TableCell>
                        <TableCell className="font-numbers">
                          {formatCurrency(sub.plan.priceMonthlyRwf)}
                        </TableCell>
                        <TableCell className="font-numbers">
                          {formatNumber(sub.plan.rateLimitPerHour ?? 0)}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#0EA5E9]/40 text-[#0EA5E9]"
                            onClick={() => {
                              setSelectedSub(sub);
                              setPlanCode(sub.plan.code);
                              setRateLimit(
                                String(sub.plan.rateLimitPerHour ?? ""),
                              );
                            }}
                          >
                            Modify plan/limits
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="px-6 pb-4">
                <PaginationControls
                  pagination={subscriptionsQuery.data?.pagination}
                  onPageChange={setSubPage}
                />
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="members">
            <GlassCard className="p-0 overflow-hidden">
              {developersQuery.isLoading ? (
                <div className="p-6">
                  <TableSkeleton />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead>Email</TableHead>
                      <TableHead>Organization</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>API keys</TableHead>
                      <TableHead>Total requests</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(developersQuery.data?.items ?? []).map((dev) => (
                      <TableRow key={dev.id} className="border-white/10">
                        <TableCell>{dev.email}</TableCell>
                        <TableCell>{dev.organization.name}</TableCell>
                        <TableCell>{dev.role}</TableCell>
                        <TableCell className="font-numbers">
                          {dev.activeApiKeys}/{dev.apiKeyCount}
                        </TableCell>
                        <TableCell className="font-numbers">
                          {formatNumber(dev.totalRequests)}
                        </TableCell>
                        <TableCell className="text-small text-muted-foreground">
                          {formatDateTime(dev.createdAt)}
                        </TableCell>
                        <TableCell>
                          {dev.role !== "MASTER_ADMIN" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={restrictMutation.isPending}
                              onClick={() => {
                                if (
                                  window.confirm(
                                    `Suspend ${dev.email} and revoke all API keys?`,
                                  )
                                ) {
                                  restrictMutation.mutate(dev.id);
                                }
                              }}
                            >
                              Suspend / Revoke keys
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="px-6 pb-4">
                <PaginationControls
                  pagination={developersQuery.data?.pagination}
                  onPageChange={setDevPage}
                />
              </div>
            </GlassCard>
          </TabsContent>

          <TabsContent value="telemetry">
            <GlassCard className="p-0 overflow-hidden">
              {telemetryQuery.isLoading ? (
                <div className="p-6">
                  <TableSkeleton />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10">
                      <TableHead>Route</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Latency</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Developer</TableHead>
                      <TableHead>Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(telemetryQuery.data?.items ?? []).map((log) => (
                      <TableRow key={log.id} className="border-white/10">
                        <TableCell className="font-mono text-small max-w-[220px] truncate">
                          {log.routePath}
                        </TableCell>
                        <TableCell>{log.httpMethod}</TableCell>
                        <TableCell className="font-numbers">
                          {log.httpStatusCode}
                        </TableCell>
                        <TableCell className="font-numbers">
                          {log.executionTimeMs} ms
                        </TableCell>
                        <TableCell>{log.processingMode}</TableCell>
                        <TableCell className="font-mono text-small truncate max-w-[120px]">
                          {log.developerId.slice(0, 8)}…
                        </TableCell>
                        <TableCell className="text-small text-muted-foreground">
                          {formatDateTime(log.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              <div className="px-6 pb-4">
                <PaginationControls
                  pagination={telemetryQuery.data?.pagination}
                  onPageChange={setTelemetryPage}
                />
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
        <DialogContent className="bg-[#0f172a] border-white/10">
          <DialogHeader>
            <DialogTitle>Modify plan &amp; API limits</DialogTitle>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-4 py-2">
              <p className="text-small text-muted-foreground">
                Organization:{" "}
                <span className="font-mono">{selectedSub.developerName}</span>
              </p>
              <div className="space-y-2">
                <Label htmlFor="planCode">Plan tier</Label>
                <Input
                  id="planCode"
                  value={planCode}
                  onChange={(e) => setPlanCode(e.target.value.toUpperCase())}
                  placeholder="FREE | PRO | ENTERPRISE"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rateLimit">Hourly API limit</Label>
                <Input
                  id="rateLimit"
                  type="number"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(e.target.value)}
                  placeholder="e.g. 50000"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSelectedSub(null)}>
              Cancel
            </Button>
            <Button
              className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90"
              disabled={tierOverrideMutation.isPending}
              onClick={() => {
                if (!selectedSub) return;
                tierOverrideMutation.mutate({
                  id: selectedSub.id,
                  planCode: planCode || undefined,
                  rateLimitPerHour: rateLimit
                    ? parseInt(rateLimit, 10)
                    : undefined,
                });
              }}
            >
              Apply override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
