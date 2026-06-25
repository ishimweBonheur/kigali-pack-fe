import api from "./api";
import type {
  ApiSuccessResponse,
  ApiMeta,
  BillingPlan,
  Subscription,
  Invoice,
  UsageCounter,
  PaginationMeta,
  PaginationParams,
} from "@/types";
import { normalizeListItems } from "@/utils/list";

interface SubscriptionEnvelope {
  active?: boolean;
  subscription?: Subscription | null;
}

interface SubscribeEnvelope {
  subscription?: Subscription;
}

interface UsageCounterApi {
  currentUsage?: number;
  planLimit?: number;
  usagePercent?: number;
  resettingAt?: string;
  used?: number;
  limit?: number;
  percentUsed?: number;
  periodStart?: string;
  periodEnd?: string;
}

interface InvoiceApi {
  id: string;
  amountRwf?: number;
  amount?: number;
  status: string;
  dueDate?: string;
  paidAt?: string | null;
  createdAt: string | Date;
  billingPeriod?: { start: string | Date; end: string | Date };
}

function isSubscription(value: unknown): value is Subscription {
  return (
    !!value &&
    typeof value === "object" &&
    "plan" in value &&
    "status" in value
  );
}

function unwrapSubscription(payload: unknown): Subscription | null {
  if (!payload) return null;
  if (isSubscription(payload)) return payload;

  const envelope = payload as SubscriptionEnvelope;
  if (envelope.subscription !== undefined) {
    return envelope.subscription ?? null;
  }

  return null;
}

function unwrapSubscribeResult(payload: unknown): Subscription {
  if (isSubscription(payload)) return payload;

  const envelope = payload as SubscribeEnvelope;
  if (envelope.subscription && isSubscription(envelope.subscription)) {
    return envelope.subscription;
  }

  throw new Error("Unexpected subscription response from server");
}

function mapUsageCounter(raw: UsageCounterApi): UsageCounter {
  if (raw.used !== undefined && raw.limit !== undefined) {
    return {
      used: raw.used,
      limit: raw.limit,
      percentUsed: raw.percentUsed ?? 0,
      periodStart: raw.periodStart ?? new Date().toISOString(),
      periodEnd: raw.periodEnd ?? new Date().toISOString(),
    };
  }

  const periodEnd = raw.resettingAt ?? new Date().toISOString();
  const endDate = new Date(periodEnd);
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 1);

  const used = raw.currentUsage ?? 0;
  const limit = raw.planLimit ?? 0;

  return {
    used,
    limit,
    percentUsed:
      raw.usagePercent ??
      (limit > 0 ? Math.round((used / limit) * 10000) / 100 : 0),
    periodStart: startDate.toISOString(),
    periodEnd: endDate.toISOString(),
  };
}

function mapInvoice(raw: InvoiceApi): Invoice {
  const createdAt =
    raw.createdAt instanceof Date
      ? raw.createdAt.toISOString()
      : String(raw.createdAt);

  const dueDate =
    raw.dueDate ??
    (raw.billingPeriod?.end instanceof Date
      ? raw.billingPeriod.end.toISOString().slice(0, 10)
      : raw.billingPeriod?.end
        ? String(raw.billingPeriod.end).slice(0, 10)
        : createdAt.slice(0, 10));

  return {
    id: raw.id,
    amountRwf: Number(raw.amountRwf ?? raw.amount ?? 0),
    status: raw.status,
    dueDate,
    paidAt: raw.paidAt ?? null,
    createdAt,
  };
}

function normalizePlans(data: unknown): BillingPlan[] {
  const items = normalizeListItems(data as BillingPlan[]);
  return items.map((plan) => ({
    ...plan,
    features: Array.isArray(plan.features) ? plan.features : [],
  }));
}

export const billingService = {
  async listPlans(): Promise<BillingPlan[]> {
    const { data } = await api.get<ApiSuccessResponse<BillingPlan[]>>(
      "/v1/billing/plans",
    );
    return normalizePlans(data.data);
  },

  async getCurrentSubscription(): Promise<Subscription | null> {
    const { data } = await api.get<
      ApiSuccessResponse<Subscription | SubscriptionEnvelope>
    >("/v1/billing/subscriptions/current");
    return unwrapSubscription(data.data);
  },

  async subscribe(planCode: string): Promise<Subscription> {
    const { data } = await api.post<
      ApiSuccessResponse<Subscription | SubscribeEnvelope>
    >("/v1/billing/subscriptions", { planCode });
    return unwrapSubscribeResult(data.data);
  },

  async cancel(): Promise<void> {
    await api.delete("/v1/billing/subscriptions/current");
  },

  async listInvoices(params?: PaginationParams) {
    const { data } = await api.get<
      ApiSuccessResponse<InvoiceApi[]> & {
        pagination?: PaginationMeta;
        meta?: ApiMeta;
      }
    >("/v1/billing/invoices", { params });

    return {
      items: normalizeListItems(data.data).map(mapInvoice),
      pagination: data.pagination ?? data.meta?.pagination,
    };
  },

  async getInvoice(id: string): Promise<Invoice> {
    const { data } = await api.get<ApiSuccessResponse<InvoiceApi>>(
      `/v1/billing/invoices/${id}`,
    );
    return mapInvoice(data.data);
  },

  async getUsageCounter(): Promise<UsageCounter> {
    const { data } = await api.get<ApiSuccessResponse<UsageCounterApi>>(
      "/v1/billing/usage-counter",
    );
    return mapUsageCounter(data.data);
  },
};
