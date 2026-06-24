"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Play, Webhook } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { paymentsService } from "@/services/payments.service";
import {
  mockPaymentSchema,
  simulateWebhookSchema,
  type MockPaymentInput,
  type SimulateWebhookInput,
} from "@/schemas/payments";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { formatCurrency, formatDateTime, getErrorMessage } from "@/utils";
import { toast } from "sonner";

export function PaymentsPage() {
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const historyQuery = useQuery({
    queryKey: ["payments-history", page],
    queryFn: () =>
      paymentsService.listHistory({ page, limit: DEFAULT_PAGE_SIZE }),
  });

  const detailQuery = useQuery({
    queryKey: ["payment-detail", selectedId],
    queryFn: () => paymentsService.getTransaction(selectedId!),
    enabled: !!selectedId,
  });

  const testAccountsQuery = useQuery({
    queryKey: ["test-accounts"],
    queryFn: () => paymentsService.getTestAccounts(),
  });

  const chargeForm = useForm<MockPaymentInput>({
    resolver: zodResolver(mockPaymentSchema),
    defaultValues: {
      phoneNumber: "0781234567",
      amount: 5000,
      webhookUrl: "https://example.com/webhook",
      clientReference: "ref-demo",
    },
  });

  const webhookForm = useForm<SimulateWebhookInput>({
    resolver: zodResolver(simulateWebhookSchema),
    defaultValues: { eventType: "payment.success", amount: 5000 },
  });

  const chargeMutation = useMutation({
    mutationFn: paymentsService.charge,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payments-history"] });
      setSelectedId(data.transactionId);
      toast.success("Payment simulation started");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const simulateMutation = useMutation({
    mutationFn: paymentsService.simulateWebhook,
    onSuccess: () => toast.success("Webhook simulation queued"),
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const items = historyQuery.data?.items ?? [];

  return (
    <div>
      <PageHeader
        title="Payments"
        description="Sandbox payment simulator and transaction history"
      />

      <Tabs defaultValue="simulator" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="simulator">Simulator</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="webhook-test">Webhook test</TabsTrigger>
        </TabsList>

        <TabsContent value="simulator" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard>
              <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="h-4 w-4 text-accent" />
                Run simulation
              </h3>
              <Form {...chargeForm}>
                <form
                  onSubmit={chargeForm.handleSubmit((data) =>
                    chargeMutation.mutate(data),
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={chargeForm.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone number</FormLabel>
                        <FormControl>
                          <Input placeholder="0781234567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={chargeForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount (RWF)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={chargeForm.control}
                    name="webhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Webhook URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={chargeForm.control}
                    name="clientReference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client reference</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={chargeMutation.isPending}
                    className="w-full"
                  >
                    {chargeMutation.isPending ? "Processing…" : "Simulate charge"}
                  </Button>
                </form>
              </Form>
            </GlassCard>

            <GlassCard>
              <h3 className="font-heading text-lg font-semibold mb-4">
                Test accounts & rules
              </h3>
              {testAccountsQuery.data && (
                <div className="space-y-4 text-small">
                  <div>
                    <p className="text-muted-foreground mb-2">Accounts</p>
                    {testAccountsQuery.data.accounts.map((a) => (
                      <div
                        key={a.phone}
                        className="flex justify-between py-1.5 border-b border-border last:border-0"
                      >
                        <code className="font-mono">{a.phone}</code>
                        <span>{a.carrier}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">Amount triggers</p>
                    {Object.entries(testAccountsQuery.data.rules).map(
                      ([key, val]) => (
                        <div key={key} className="py-1">
                          <span className="text-accent">{key}</span>: {val}
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </GlassCard>
          </div>
        </TabsContent>

        <TabsContent value="transactions">
          <GlassCard className="p-0 overflow-hidden">
            {historyQuery.isLoading ? (
              <div className="p-6"><TableSkeleton /></div>
            ) : items.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="No transactions"
                description="Run a sandbox payment to see history here"
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead>Reference</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="border-border cursor-pointer hover:bg-hover/50"
                      onClick={() => setSelectedId(tx.id)}
                    >
                      <TableCell className="font-mono text-small">
                        {tx.clientReference}
                      </TableCell>
                      <TableCell>{tx.phoneNumber}</TableCell>
                      <TableCell className="font-numbers">
                        {formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell>{tx.gateway}</TableCell>
                      <TableCell>
                        <StatusBadge status={tx.status} />
                      </TableCell>
                      <TableCell className="text-small text-muted-foreground">
                        {formatDateTime(tx.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            <div className="px-6 pb-4">
              <PaginationControls
                pagination={historyQuery.data?.pagination}
                onPageChange={setPage}
              />
            </div>
          </GlassCard>

          {selectedId && detailQuery.data && (
            <GlassCard className="mt-6">
              <h3 className="font-heading text-lg font-semibold mb-4">
                Status timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-accent" />
                  <div>
                    <p className="text-small font-medium">Created</p>
                    <p className="text-small text-muted-foreground">
                      {formatDateTime(detailQuery.data.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      detailQuery.data.status === "SUCCESS"
                        ? "bg-success"
                        : detailQuery.data.status === "PENDING"
                          ? "bg-amber-400"
                          : "bg-destructive"
                    }`}
                  />
                  <div>
                    <p className="text-small font-medium">
                      Status: {detailQuery.data.status}
                    </p>
                    {detailQuery.data.failureReason && (
                      <p className="text-small text-destructive">
                        {detailQuery.data.failureReason}
                      </p>
                    )}
                  </div>
                </div>
                {detailQuery.data.completedAt && (
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <div>
                      <p className="text-small font-medium">Completed</p>
                      <p className="text-small text-muted-foreground">
                        {formatDateTime(detailQuery.data.completedAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>
          )}
        </TabsContent>

        <TabsContent value="webhook-test">
          <GlassCard>
            <h3 className="font-heading text-lg font-semibold mb-4 flex items-center gap-2">
              <Webhook className="h-4 w-4 text-accent" />
              Simulate webhook delivery
            </h3>
            <Form {...webhookForm}>
              <form
                onSubmit={webhookForm.handleSubmit((data) =>
                  simulateMutation.mutate(data),
                )}
                className="space-y-4 max-w-md"
              >
                <FormField
                  control={webhookForm.control}
                  name="eventType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event type</FormLabel>
                      <FormControl>
                        <Input placeholder="payment.success" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={webhookForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (RWF)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={simulateMutation.isPending}
                >
                  Send test webhook
                </Button>
              </form>
            </Form>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
