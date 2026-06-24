"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Key, Plus, RotateCcw, Ban } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { EmptyState } from "@/components/shared/empty-state";
import { SearchInput } from "@/components/shared/search-input";
import { PaginationControls } from "@/components/shared/pagination";
import { CopyButton } from "@/components/shared/copy-button";
import { StatusBadge } from "@/components/shared/status-badge";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { apiKeysService } from "@/services/api-keys.service";
import {
  createApiKeySchema,
  type CreateApiKeyInput,
} from "@/schemas/api-keys";
import { DEFAULT_PAGE_SIZE } from "@/constants";
import { formatDateTime, getErrorMessage } from "@/utils";
import { toast } from "sonner";
import { billingService } from "@/services/billing.service";
import { formatNumber } from "@/utils";
import { AlertTriangle } from "lucide-react";

function maskKeyPrefix(prefix: string): string {
  return `${prefix.slice(0, 7)}••••••••${prefix.slice(-4)}`;
}

export function ApiKeysPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newToken, setNewToken] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const keysQuery = useQuery({
    queryKey: ["api-keys", page, search],
    queryFn: () =>
      apiKeysService.list({ page, limit: DEFAULT_PAGE_SIZE }),
  });

  const usageQuery = useQuery({
    queryKey: ["usage-counter"],
    queryFn: () => billingService.getUsageCounter(),
  });

  const form = useForm<CreateApiKeyInput>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: { environment: "TEST", name: "" },
  });

  const createMutation = useMutation({
    mutationFn: apiKeysService.create,
    onSuccess: (data) => {
      setNewToken(data.rawToken);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key created");
      form.reset();
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const revokeMutation = useMutation({
    mutationFn: apiKeysService.revoke,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key revoked");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const rotateMutation = useMutation({
    mutationFn: apiKeysService.rotate,
    onSuccess: (data) => {
      setNewToken(data.rawToken);
      setDialogOpen(true);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key rotated — save the new key now");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });

  const items = keysQuery.data?.items ?? [];
  const filtered = search
    ? items.filter(
        (k) =>
          k.name?.toLowerCase().includes(search.toLowerCase()) ||
          k.keyPrefix.toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  return (
    <div>
      <PageHeader
        title="API Keys"
        description="Create, rotate, and manage your developer API keys"
        actions={
          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setNewToken(null);
            }}
          >
            <DialogTrigger
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Create key
            </DialogTrigger>
            <DialogContent className="glass-card border-border">
              <DialogHeader>
                <DialogTitle>Create API key</DialogTitle>
              </DialogHeader>
              {newToken ? (
                <Alert className="border-destructive/30 bg-destructive/5">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <AlertTitle>Store securely — shown once only</AlertTitle>
                  <AlertDescription className="mt-2">
                    <p className="text-small text-muted-foreground mb-3">
                      This key will never be displayed again. Copy it now.
                    </p>
                    <code className="block p-3 rounded-lg bg-secondary font-mono text-small break-all">
                      {newToken}
                    </code>
                    <div className="mt-2 flex gap-2">
                      <CopyButton value={newToken} label="API key copied" />
                      <Button
                        size="sm"
                        onClick={() => {
                          setNewToken(null);
                          setDialogOpen(false);
                        }}
                      >
                        Done
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit((data) =>
                      createMutation.mutate(data),
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Production app" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="environment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Environment</FormLabel>
                          <Select
                            onValueChange={(v) => v && field.onChange(v)}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="TEST">TEST</SelectItem>
                              <SelectItem value="SANDBOX">SANDBOX</SelectItem>
                              <SelectItem value="LIVE">LIVE</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="w-full"
                    >
                      Create key
                    </Button>
                  </form>
                </Form>
              )}
            </DialogContent>
          </Dialog>
        }
      />

      {usageQuery.data && (
        <GlassCard className="mb-6 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-small text-muted-foreground">Monthly API usage</p>
            <p className="font-numbers text-lg font-semibold">
              {formatNumber(usageQuery.data.used)} / {formatNumber(usageQuery.data.limit)}
            </p>
          </div>
          <p className="text-small text-muted-foreground font-mono">
            {usageQuery.data.percentUsed}% used this period
          </p>
        </GlassCard>
      )}

      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search keys…"
          className="max-w-sm"
        />
      </div>

      <GlassCard className="p-0 overflow-hidden">
        {keysQuery.isLoading ? (
          <div className="p-6">
            <TableSkeleton />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Key}
            title="No API keys"
            description="Create your first API key to start integrating"
            actionLabel="Create key"
            onAction={() => setDialogOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead>Name</TableHead>
                <TableHead>Token</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Created</TableHead>
                <TableHead className="hidden md:table-cell">Last used</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((key) => (
                <TableRow key={key.id} className="border-border">
                  <TableCell className="font-medium min-w-[100px]">
                    {key.name ?? "Unnamed"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <code className="font-mono text-[12px] whitespace-nowrap">
                        {maskKeyPrefix(key.keyPrefix)}
                      </code>
                      <CopyButton value={key.keyPrefix} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={key.environment} />
                  </TableCell>
                  <TableCell>{key.tier}</TableCell>
                  <TableCell>
                    <StatusBadge
                      status={key.isActive ? "ACTIVE" : "REVOKED"}
                    />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground text-small whitespace-nowrap">
                    {formatDateTime(key.createdAt)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground text-small whitespace-nowrap">
                    {key.lastUsedAt
                      ? formatDateTime(key.lastUsedAt)
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    {key.isActive && (
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => rotateMutation.mutate(key.id)}
                          disabled={rotateMutation.isPending}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => revokeMutation.mutate(key.id)}
                          disabled={revokeMutation.isPending}
                        >
                          <Ban className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
        <div className="px-6 pb-4">
          <PaginationControls
            pagination={keysQuery.data?.pagination}
            onPageChange={setPage}
          />
        </div>
      </GlassCard>
    </div>
  );
}
