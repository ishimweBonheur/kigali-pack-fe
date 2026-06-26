"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { MapPin, CreditCard, Shield, BarChart3, ExternalLink, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { CodeBlock } from "@/components/public/code-block";
import { CtaBanner } from "@/components/public/cta-banner";
import { publicService } from "@/services/public.service";
import { API_BASE_URL } from "@/constants";
import { PUBLIC_ROUTES } from "@/constants/public";
import { PublicPageShell } from "@/components/public/public-page-shell";

const EXAMPLES = [
  {
    id: "locations",
    icon: MapPin,
    title: "Locations API",
    method: "GET" as const,
    path: "/v1/locations/root-provinces",
    docsHref: "/docs/locations",
    public: true,
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Payments API",
    method: "POST" as const,
    path: "/v1/sandbox/payments/charge",
    docsHref: "/docs/sandbox-payments",
    public: false,
    body: {
      phoneNumber: "0781234567",
      amount: 5000,
      webhookUrl: "https://example.com/webhook",
      clientReference: "example-001",
    },
  },
  {
    id: "compliance",
    icon: Shield,
    title: "Compliance API",
    method: "GET" as const,
    path: "/v1/compliance/nida/mock/1200780064278123",
    docsHref: "/docs/compliance",
    public: false,
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analytics API",
    method: "GET" as const,
    path: "/v1/developer/analytics/summary",
    docsHref: "/docs/analytics",
    public: false,
  },
];

function ExampleCard({
  example,
}: {
  example: (typeof EXAMPLES)[number];
}) {
  const { data: session } = useSession();

  const query = useQuery({
    queryKey: ["example", example.id, session?.user?.accessToken],
    queryFn: () =>
      publicService.probeEndpoint(
        example.method,
        example.path,
        session?.user?.accessToken,
        example.body,
      ),
    enabled: example.public || !!session?.user?.accessToken,
  });

  const requestCode = [
    `curl -X ${example.method} ${API_BASE_URL}${example.path}`,
    !example.public ? '  -H "Authorization: Bearer YOUR_API_KEY"' : "",
    example.body
      ? `  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(example.body)}'`
      : "",
  ]
    .filter(Boolean)
    .join(" \\\n");

  const responseCode = query.isLoading
    ? "Fetching live response…"
    : !example.public && !session
      ? JSON.stringify({ message: "Sign in to fetch live response" }, null, 2)
      : JSON.stringify(query.data ?? {}, null, 2);

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <example.icon className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-heading font-semibold">{example.title}</h3>
            <p className="font-mono text-[12px] text-muted-foreground">
              {example.method} {example.path}
            </p>
          </div>
        </div>
        {query.isFetching && (
          <Loader2 className="h-4 w-4 animate-spin text-accent" />
        )}
      </div>

      <div className="space-y-3">
        <CodeBlock code={requestCode} title="Request" language="bash" />
        <CodeBlock code={responseCode} title="Live response" language="json" />
      </div>

      <div className="flex gap-3 mt-4">
        <Link
          href={example.docsHref}
          className="inline-flex items-center gap-1 text-small text-accent hover:underline"
        >
          Open docs
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        {!example.public && !session && (
          <Link
            href={PUBLIC_ROUTES.getStarted}
            className="text-small text-muted-foreground hover:text-foreground"
          >
            Get started to run live →
          </Link>
        )}
      </div>
    </div>
  );
}

export function ExamplesPage() {
  return (
    <>
      <PublicPageShell className="py-16">
        <PageHeader
          title="API Examples"
          description="Interactive examples with live responses from the Kigali-Pack API."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2">
          {EXAMPLES.map((ex) => (
            <ExampleCard key={ex.id} example={ex} />
          ))}
        </div>
      </PublicPageShell>
      <CtaBanner />
    </>
  );
}
