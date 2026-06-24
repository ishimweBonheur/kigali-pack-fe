"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Receipt, Zap, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { billingService } from "@/services/billing.service";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { formatCurrency, formatDate, formatNumber, getErrorMessage } from "@/utils";
import { toast } from "sonner";

export function BillingPage() {
  const [invoicePage, setInvoicePage] = useState(1);
  const queryClient = useQueryClient();

  const plansQuery = useQuery({
    queryKey: ["billing-plans"],
    queryFn: () => billingService.listPlans(),
  });

  const subscriptionQuery = useQuery({
    queryKey: ["subscription"],
    queryFn: () => billingService.getCurrentSubscription(),
  });

  const usageQuery = useQuery({
    queryKey: ["usage-counter"],
    queryFn: () => billingService.getUsageCounter(),
  });

  const invoicesQuery = useQuery({
    queryKey: ["invoices", invoicePage],
    queryFn: () =>
      billingService.listInvoices({ page: invoicePage, limit: DEFAULT_PAGE_SIZE }),
  });

  const subscribeMutation = useMutation({
    mutationFn: billingService.subscribe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Plan upgraded successfully");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const cancelMutation = useMutation({
    mutationFn: billingService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      toast.success("Subscription cancelled");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const subscription = subscriptionQuery.data;
  const usage = usageQuery.data;
  const plans = plansQuery.data ?? [];
  const invoices = invoicesQuery.data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Manage your plan, invoices, and API usage"
      />

      <Tabs defaultValue="plan" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="plan">Current plan</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="upgrade">Upgrade</TabsTrigger>
        </TabsList>

        <TabsContent value="plan">
          <GlassCard className="p-6">
            {subscriptionQuery.isLoading ? (
              <TableSkeleton rows={2} />
            ) : subscription ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading text-2xl font-semibold">
                      {subscription.plan.name}
                    </h3>
                    <p className="text-muted-foreground mt-1">
                      {subscription.plan.description}
                    </p>
                  </div>
                  <StatusBadge status={subscription.status} />
                </div>
                <div className="grid gap-4 sm:grid-cols-3 text-small">
                  <div>
                    <p className="text-muted-foreground">Monthly price</p>
                    <p className="font-numbers text-lg font-semibold">
                      {formatCurrency(subscription.plan.priceMonthlyRwf)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Period start</p>
                    <p>{formatDate(subscription.currentPeriodStart)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Period end</p>
                    <p>{formatDate(subscription.currentPeriodEnd)}</p>
                  </div>
                </div>
                {subscription.status === "ACTIVE" && (
                  <Button
                    variant="outline"
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                  >
                    Cancel subscription
                  </Button>
                )}
              </div>
            ) : (
              <EmptyState
                icon={Receipt}
                title="No active subscription"
                description="Choose a plan to get started"
              />
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="invoices">
          <GlassCard className="p-0 overflow-hidden">
            {invoicesQuery.isLoading ? (
              <div className="p-6"><TableSkeleton /></div>
            ) : invoices.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No invoices"
                description="Invoices will appear here after billing cycles"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Due date</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} className="border-border">
                      <TableCell className="font-numbers font-medium">
                        {formatCurrency(inv.amountRwf)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={inv.status} />
                      </TableCell>
                      <TableCell>{formatDate(inv.dueDate)}</TableCell>
                      <TableCell className="text-muted-foreground text-small">
                        {formatDate(inv.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="px-6 pb-4">
              <PaginationControls
                pagination={invoicesQuery.data?.pagination}
                onPageChange={setInvoicePage}
              />
            </div>
          </GlassCard>
        </TabsContent>

        <TabsContent value="usage">
          <GlassCard className="p-6">
            {usageQuery.isLoading ? (
              <TableSkeleton rows={2} />
            ) : usage ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <Zap className="h-5 w-5 text-accent" />
                  <h3 className="font-heading text-lg font-semibold">
                    API usage this period
                  </h3>
                </div>
                <div className="flex items-end justify-between">
                  <p className="font-numbers text-4xl font-semibold">
                    {formatNumber(usage.used)}
                    <span className="text-lg text-muted-foreground ml-2">
                      / {formatNumber(usage.limit)}
                    </span>
                  </p>
                  <span className="text-small text-muted-foreground">
                    {usage.percentUsed}% used
                  </span>
                </div>
                <Progress value={usage.percentUsed} className="h-3" />
                <div className="grid gap-4 sm:grid-cols-2 text-small text-muted-foreground">
                  <p>Period start: {formatDate(usage.periodStart)}</p>
                  <p>Period end: {formatDate(usage.periodEnd)}</p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No usage data available</p>
            )}
          </GlassCard>
        </TabsContent>

        <TabsContent value="upgrade">
          <div className="grid gap-4 md:grid-cols-3">
            {plansQuery.isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <GlassCard key={i} className="p-6">
                  <TableSkeleton rows={3} />
                </GlassCard>
              ))
            ) : (
              plans.map((plan) => {
                const isCurrent = subscription?.plan?.code === plan.code;
                return (
                  <GlassCard
                    key={plan.id}
                    className={`p-6 ${isCurrent ? "ring-1 ring-accent" : ""}`}
                    hover
                  >
                    <h3 className="font-heading text-xl font-semibold">
                      {plan.name}
                    </h3>
                    <p className="mt-1 text-muted-foreground text-small">
                      {plan.description}
                    </p>
                    <p className="mt-4 font-numbers text-3xl font-semibold">
                      {formatCurrency(plan.priceMonthlyRwf)}
                      <span className="text-small text-muted-foreground">/mo</span>
                    </p>
                    <ul className="mt-4 space-y-2 text-small">
                      {plan.features.map((f) => (
                        <li key={f} className="text-muted-foreground">
                          • {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-6"
                      variant={isCurrent ? "outline" : "default"}
                      disabled={isCurrent || subscribeMutation.isPending}
                      onClick={() => subscribeMutation.mutate(plan.code)}
                    >
                      {isCurrent ? (
                        "Current plan"
                      ) : (
                        <>
                          Upgrade
                          <ArrowUpRight className="h-4 w-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </GlassCard>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
