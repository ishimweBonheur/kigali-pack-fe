"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  CreditCard,
  Shield,
  Calculator,
  BarChart3,
  Webhook,
  ArrowRight,
} from "lucide-react";
import { ApiTerminal } from "@/components/public/api-terminal";
import { ApiExamplesSection } from "@/features/public/api-examples-section";
import { CtaBanner } from "@/components/public/cta-banner";
import { PublicPageShell } from "@/components/public/public-page-shell";
import { PUBLIC_ROUTES } from "@/constants/public";
import { publicService } from "@/services/public.service";
import { formatCurrency } from "@/utils";
import type { BillingPlan } from "@/types";

const FEATURES = [
  {
    icon: MapPin,
    title: "Rwanda Administrative Locations",
    description:
      "Full NISR hierarchy — provinces, districts, sectors, cells, and villages with address normalization.",
  },
  {
    icon: CreditCard,
    title: "Mock Payments Sandbox",
    description:
      "Simulate MTN MoMo and Airtel Money with test accounts, magic amounts, and webhook callbacks.",
  },
  {
    icon: Shield,
    title: "NIDA Identity Sandbox",
    description:
      "Mock national ID lookups for KYC flows without touching production NIDA systems.",
  },
  {
    icon: Calculator,
    title: "RRA Tax Engine",
    description:
      "PAYE, VAT, RSSB pension, and full payroll summary calculations aligned with RRA brackets.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Usage metering, error rates, latency trends, and paginated traffic logs for debugging.",
  },
  {
    icon: Webhook,
    title: "Developer Webhooks",
    description:
      "Register endpoints, monitor delivery attempts, retry failures, and send test events.",
  },
];

const STEPS = [
  { step: "01", title: "Get Started", desc: "Create your organization and developer account." },
  { step: "02", title: "Get API Key", desc: "Generate a TEST or SANDBOX key from the dashboard." },
  { step: "03", title: "Integrate", desc: "Call locations, payments, or compliance endpoints." },
  { step: "04", title: "Ship", desc: "Monitor usage, scale plans, and go live." },
];

const FAQ = [
  {
    q: "Is there a free tier?",
    a: "Yes. The Free plan includes sandbox payments, location API access, and 100 requests per hour.",
  },
  {
    q: "Do I need authentication for locations?",
    a: "Root provinces are public. Deeper hierarchy lookups and normalization require an API key.",
  },
  {
    q: "Are payments real money?",
    a: "No. The sandbox simulates MTN MoMo and Airtel Money without moving real funds.",
  },
  {
    q: "Can I use JWT instead of API keys?",
    a: "Both work. JWT is ideal for dashboard and billing. API keys are for server-to-server integration.",
  },
];

export function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-accent/5 blur-3xl" />
        </div>
        <PublicPageShell className="py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-accent text-small font-medium mb-4">
                Kigali-Pack Cloud Engine
              </p>
              <h1 className="font-heading text-4xl md:text-5xl lg:text-[52px] font-bold tracking-tight leading-[1.1]">
                Build Rwanda-ready applications faster.
              </h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                Locations, Compliance, Payments Sandbox, Analytics, and Developer
                Infrastructure in one platform.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                  href={PUBLIC_ROUTES.getStarted}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Start Building
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={PUBLIC_ROUTES.docs}
                  className="inline-flex h-11 items-center justify-center rounded-lg border border-border px-6 text-sm font-medium hover:bg-hover"
                >
                  Read Documentation
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <ApiTerminal />
            </motion.div>
          </div>
        </PublicPageShell>
      </section>

      {/* Features */}
      <section className="border-y border-border bg-card/30 py-24">
        <PublicPageShell>
          <div className="text-center mb-14">
            <h2 className="font-heading text-3xl md:text-4xl font-semibold">
              Everything developers need
            </h2>
            <p className="mt-3 text-muted-foreground">
              One API for Rwanda-specific infrastructure
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card rounded-xl p-6 hover:bg-hover/30 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 mb-4">
                  <f.icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-heading font-semibold">{f.title}</h3>
                <p className="mt-2 text-small text-muted-foreground">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </PublicPageShell>
      </section>

      <ApiExamplesSection />

      {/* How it works */}
      <section className="py-24">
        <PublicPageShell>
          <h2 className="font-heading text-3xl font-semibold text-center mb-14">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <div key={s.step} className="relative text-center">
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-[60%] w-[80%] h-px bg-border" />
                )}
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 font-mono text-sm font-semibold text-accent mb-4">
                  {s.step}
                </div>
                <h3 className="font-heading font-semibold">{s.title}</h3>
                <p className="mt-2 text-small text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </PublicPageShell>
      </section>

      {/* Developer workflow */}
      <section className="border-y border-border bg-card/30 py-24">
        <PublicPageShell className="text-center">
          <h2 className="font-heading text-3xl font-semibold mb-4">
            Developer workflow
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-10">
            From registration to production — a streamlined path with docs,
            sandbox, and dashboard tooling.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Get Started", "API Key", "Sandbox Test", "Webhooks", "Analytics", "Go Live"].map(
              (step) => (
                <span
                  key={step}
                  className="px-4 py-2 rounded-full border border-border text-small bg-secondary/30"
                >
                  {step}
                </span>
              ),
            )}
          </div>
          <Link
            href={PUBLIC_ROUTES.getStarted}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 mt-10"
          >
            View onboarding guide
          </Link>
        </PublicPageShell>
      </section>

      {/* Pricing preview */}
      <PricingPreview />

      {/* FAQ */}
      <section className="py-24">
        <PublicPageShell>
          <h2 className="font-heading text-3xl font-semibold text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <FaqAccordion items={FAQ.slice(0, 2)} />
            <FaqAccordion items={FAQ.slice(2)} />
          </div>
        </PublicPageShell>
      </section>

      <CtaBanner />
    </>
  );
}

function FaqAccordion({ items }: { items: typeof FAQ }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <details
          key={item.q}
          className="glass-card rounded-xl group"
        >
          <summary className="px-5 py-4 cursor-pointer font-medium list-none flex items-center justify-between">
            {item.q}
            <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg">
              +
            </span>
          </summary>
          <p className="px-5 pb-4 text-small text-muted-foreground">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

function PricingPreview() {
  return (
    <section className="py-24">
      <PublicPageShell className="text-center">
        <h2 className="font-heading text-3xl font-semibold mb-4">
          Simple, transparent pricing
        </h2>
        <p className="text-muted-foreground mb-10">
          Plans loaded live from the API. Start free, scale when you&apos;re ready.
        </p>
        <PricingPreviewCards />
        <Link
          href={PUBLIC_ROUTES.pricing}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-5 text-sm font-medium hover:bg-hover mt-10"
        >
          View all plans
        </Link>
      </PublicPageShell>
    </section>
  );
}

function PricingPreviewCards() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ["public-plans-preview"],
    queryFn: () => publicService.getPlans(),
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass-card rounded-xl h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {(plans ?? []).slice(0, 3).map((plan: BillingPlan) => (
        <div
          key={plan.id}
          className={`glass-card rounded-xl p-6 text-left ${
            plan.code === "FREE" ? "ring-1 ring-accent" : ""
          }`}
        >
          {plan.code === "FREE" && (
            <span className="text-[11px] font-medium text-accent uppercase tracking-wide">
              Popular
            </span>
          )}
          <h3 className="font-heading text-xl font-semibold mt-1">{plan.name}</h3>
          <p className="text-small text-muted-foreground mt-1">{plan.description}</p>
          <p className="font-numbers text-3xl font-bold mt-4">
            {formatCurrency(Number(plan.priceMonthlyRwf))}
            <span className="text-small font-normal text-muted-foreground">/mo</span>
          </p>
        </div>
      ))}
    </div>
  );
}
