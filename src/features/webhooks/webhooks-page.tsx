"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Webhook, Plus, Trash2, RefreshCw, Play } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { webhooksService } from "@/services/webhooks.service";
import {
  createWebhookSchema,
  type CreateWebhookInput,
} from "@/schemas/webhooks";
import { WEBHOOK_EVENTS, DEFAULT_PAGE_SIZE } from "@/constants";
import { formatDateTime, getErrorMessage } from "@/utils";
import { toast } from "sonner";

export function WebhooksPage() {
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deliveryPage, setDeliveryPage] = useState(1);
  const queryClient = useQueryClient();

  const webhooksQuery = useQuery({
    queryKey: ["webhooks", page],
    queryFn: () => webhooksService.list({ page, limit: DEFAULT_PAGE_SIZE }),
  });

  const deliveriesQuery = useQuery({
    queryKey: ["webhook-deliveries", selectedId, deliveryPage],
    queryFn: () =>
      webhooksService.listDeliveries(selectedId!, {
        page: deliveryPage,
        limit: DEFAULT_PAGE_SIZE,
      }),
    enabled: !!selectedId,
  });

  const form = useForm<CreateWebhookInput>({
    resolver: zodResolver(createWebhookSchema),
    defaultValues: {
      url: "",
      events: ["payment.success"],
      description: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: webhooksService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      setDialogOpen(false);
      form.reset();
      toast.success("Webhook registered");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: webhooksService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhooks"] });
      setSelectedId(null);
      toast.success("Webhook deleted");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const testMutation = useMutation({
    mutationFn: webhooksService.test,
    onSuccess: () => toast.success("Test delivery queued"),
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const retryMutation = useMutation({
    mutationFn: webhooksService.retryDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["webhook-deliveries"] });
      toast.success("Retry queued");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const items = webhooksQuery.data?.items ?? [];

  const toggleEvent = (event: string) => {
    const current = form.getValues("events");
    if (current.includes(event)) {
      form.setValue(
        "events",
        current.filter((e) => e !== event),
      );
    } else {
      form.setValue("events", [...current, event]);
    }
  };

  return (
    <div>
      <PageHeader
        title="Webhooks"
        description="Register endpoints and monitor delivery logs"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Register webhook
            </DialogTrigger>
            <DialogContent className="glass-card border-border">
              <DialogHeader>
                <DialogTitle>Register webhook</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) =>
                    createMutation.mutate(data),
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endpoint URL</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://example.com/webhooks"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormItem>
                    <FormLabel>Events</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {WEBHOOK_EVENTS.map((event) => (
                        <Badge
                          key={event}
                          variant={
                            form.watch("events").includes(event)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer"
                          onClick={() => toggleEvent(event)}
                        >
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </FormItem>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Optional description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="w-full"
                  >
                    Register
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        }
      />

      <GlassCard className="p-0 overflow-hidden mb-6">
        {webhooksQuery.isLoading ? (
          <div className="p-6"><TableSkeleton /></div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Webhook}
            title="No webhooks"
            description="Register an endpoint to receive event notifications"
            actionLabel="Register webhook"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((hook) => (
                <TableRow
                  key={hook.id}
                  className="border-border cursor-pointer hover:bg-hover/50"
                  onClick={() => setSelectedId(hook.id)}
                >
                  <TableCell className="max-w-[200px] truncate font-mono text-small">
                    {hook.url}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {hook.events.slice(0, 2).map((e) => (
                        <Badge key={e} variant="outline" className="text-[10px]">
                          {e}
                        </Badge>
                      ))}
                      {hook.events.length > 2 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{hook.events.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge
                      status={hook.isActive ? "ACTIVE" : "CANCELLED"}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          testMutation.mutate(hook.id);
                        }}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteMutation.mutate(hook.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <div className="px-6 pb-4">
          <PaginationControls
            pagination={webhooksQuery.data?.pagination}
            onPageChange={setPage}
          />
        </div>
      </GlassCard>

      {selectedId && (
        <GlassCard>
          <h3 className="font-heading text-lg font-semibold mb-4">
            Delivery logs
          </h3>
          {deliveriesQuery.isLoading ? (
            <TableSkeleton rows={3} />
          ) : (deliveriesQuery.data?.items ?? []).length === 0 ? (
            <p className="text-small text-muted-foreground">No deliveries yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead>Event</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveriesQuery.data?.items.map((d) => (
                  <TableRow key={d.id} className="border-border">
                    <TableCell className="font-mono text-small">
                      {d.eventType}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={d.status} />
                    </TableCell>
                    <TableCell className="font-numbers">
                      {d.responseStatus ?? "—"}
                    </TableCell>
                    <TableCell>{d.attemptCount}</TableCell>
                    <TableCell className="text-small text-muted-foreground">
                      {formatDateTime(d.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => retryMutation.mutate(d.id)}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          <PaginationControls
            pagination={deliveriesQuery.data?.pagination}
            onPageChange={setDeliveryPage}
          />
        </GlassCard>
      )}
    </div>
  );
}
