"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  UserPlus,
  Mail,
  Key,
  Terminal,
  LayoutDashboard,
  Check,
  Circle,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { CtaBanner } from "@/components/public/cta-banner";
import { PUBLIC_ROUTES } from "@/constants/public";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    id: "account",
    icon: UserPlus,
    title: "Create account",
    description: "Register your organization and owner email.",
    href: PUBLIC_ROUTES.getStarted,
    action: "Create account",
  },
  {
    id: "verify",
    icon: Mail,
    title: "Verify email",
    description: "Confirm your email address using the verification token.",
    href: "/docs/authentication",
    action: "Learn more",
  },
  {
    id: "api-key",
    icon: Key,
    title: "Generate API key",
    description: "Create a TEST or SANDBOX key from the dashboard.",
    href: "/dashboard/api-keys",
    action: "Open API Keys",
    requiresAuth: true,
  },
  {
    id: "test",
    icon: Terminal,
    title: "Test an endpoint",
    description: "Call GET /v1/locations/root-provinces or run a sandbox payment.",
    href: PUBLIC_ROUTES.examples,
    action: "View examples",
  },
  {
    id: "dashboard",
    icon: LayoutDashboard,
    title: "Open dashboard",
    description: "Monitor analytics, webhooks, billing, and usage.",
    href: "/dashboard",
    action: "Go to dashboard",
    requiresAuth: true,
  },
];

export function GetStartedPage() {
  const { data: session } = useSession();

  const completedSteps = new Set<string>();
  if (session) {
    completedSteps.add("account");
    completedSteps.add("verify");
  }

  return (
    <>
      <div className="mx-auto max-w-3xl px-4 lg:px-8 py-16">
        <PageHeader
          title="Get started"
          description="Follow these steps to integrate Kigali-Pack into your application."
        />

        <div className="space-y-4 mt-8">
          {STEPS.map((step, i) => {
            const done = completedSteps.has(step.id);
            const locked = step.requiresAuth && !session;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  "glass-card rounded-xl p-6 flex gap-4",
                  done && "border-success/20",
                )}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    done ? "bg-success/15" : "bg-accent/10",
                  )}
                >
                  {done ? (
                    <Check className="h-5 w-5 text-success" />
                  ) : (
                    <step.icon className="h-5 w-5 text-accent" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Step {i + 1}
                    </span>
                    {locked && (
                      <Circle className="h-2 w-2 fill-muted-foreground text-muted-foreground" />
                    )}
                  </div>
                  <h3 className="font-heading font-semibold mt-0.5">
                    {step.title}
                  </h3>
                  <p className="text-small text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  <Link
                    href={
                      locked
                        ? `${PUBLIC_ROUTES.login}?callbackUrl=${encodeURIComponent(PUBLIC_ROUTES.getStarted)}`
                        : step.href
                    }
                    className="inline-flex items-center gap-1 mt-3 text-small text-accent hover:underline"
                  >
                    {locked ? "Sign in to continue" : step.action}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-10 glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-small font-medium">Onboarding progress</span>
            <span className="font-mono text-small text-muted-foreground">
              {completedSteps.size}/{STEPS.length}
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{
                width: `${(completedSteps.size / STEPS.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>
      <CtaBanner title="Need help?" description="Browse the documentation or explore live API examples." />
    </>
  );
}
