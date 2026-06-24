"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";
import { CodeBlock } from "@/components/public/code-block";
import { publicService } from "@/services/public.service";
import { API_BASE_URL } from "@/constants";
import { PUBLIC_ROUTES } from "@/constants/public";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ApiExampleCardProps {
  title: string;
  method: "GET" | "POST";
  path: string;
  requiresAuth?: boolean;
  body?: unknown;
  description: string;
}

function useLiveExample({
  method,
  path,
  requiresAuth,
  body,
}: Pick<ApiExampleCardProps, "method" | "path" | "requiresAuth" | "body">) {
  const { data: session } = useSession();

  return useQuery({
    queryKey: ["live-example", path, method, session?.user?.accessToken],
    queryFn: () =>
      publicService.probeEndpoint(
        method,
        path,
        session?.user?.accessToken,
        body,
      ),
    enabled: !requiresAuth || !!session?.user?.accessToken,
    staleTime: 60_000,
  });
}

function ApiExampleCard({
  title,
  method,
  path,
  requiresAuth,
  body,
  description,
}: ApiExampleCardProps) {
  const { data: session } = useSession();
  const query = useLiveExample({ method, path, requiresAuth, body });

  const curl = [
    `curl -X ${method} ${API_BASE_URL}${path}`,
    requiresAuth ? '  -H "Authorization: Bearer YOUR_API_KEY"' : "",
    body ? `  -H "Content-Type: application/json" \\\n  -d '${JSON.stringify(body)}'` : "",
  ]
    .filter(Boolean)
    .join(" \\\n");

  const responseJson =
    query.isLoading
      ? "Loading live response from API…"
      : query.isError
        ? JSON.stringify({ error: "API unreachable" }, null, 2)
        : requiresAuth && !session
          ? JSON.stringify(
              {
                note: "Sign in and create an API key to see live response",
                endpoint: path,
              },
              null,
              2,
            )
          : JSON.stringify(query.data, null, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card rounded-xl p-6"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[11px] font-mono px-2 py-0.5 rounded ${
                method === "GET"
                  ? "bg-success/15 text-success"
                  : "bg-accent/15 text-accent"
              }`}
            >
              {method}
            </span>
            {requiresAuth && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3" /> Auth required
              </span>
            )}
          </div>
          <h3 className="font-heading font-semibold">{title}</h3>
          <p className="text-small text-muted-foreground mt-1">{description}</p>
        </div>
        {query.isFetching && (
          <Loader2 className="h-4 w-4 animate-spin text-accent shrink-0" />
        )}
      </div>
      <p className="font-mono text-[12px] text-muted-foreground mb-3">{path}</p>
      <Tabs defaultValue="response">
        <TabsList className="bg-secondary/50 mb-3">
          <TabsTrigger value="response">Response</TabsTrigger>
          <TabsTrigger value="request">Request</TabsTrigger>
        </TabsList>
        <TabsContent value="response">
          <CodeBlock code={responseJson} language="json" title="Live response" />
          {requiresAuth && !session && (
            <Link
              href={PUBLIC_ROUTES.getStarted}
              className="inline-block mt-3 text-small text-accent hover:underline"
            >
              Get started to run this endpoint live →
            </Link>
          )}
        </TabsContent>
        <TabsContent value="request">
          <CodeBlock code={curl} language="bash" title="curl" />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

export function ApiExamplesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 lg:px-8 py-24">
      <div className="text-center mb-12">
        <h2 className="font-heading text-3xl md:text-4xl font-semibold">
          Real API examples
        </h2>
        <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
          Live responses from the Kigali-Pack API — no mock data. Public
          endpoints fetch directly from the database.
        </p>
      </div>
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <ApiExampleCard
          title="Root provinces"
          method="GET"
          path="/v1/locations/root-provinces"
          description="List all active provinces from the Rwanda administrative hierarchy."
        />
        <ApiExampleCard
          title="NIDA identity lookup"
          method="GET"
          path="/v1/compliance/nida/mock/1200780064278123"
          requiresAuth
          description="Sandbox NIDA identity verification by national ID."
        />
        <ApiExampleCard
          title="Sandbox payment"
          method="POST"
          path="/v1/sandbox/payments/charge"
          requiresAuth
          body={{
            phoneNumber: "0781234567",
            amount: 5000,
            webhookUrl: "https://example.com/webhook",
            clientReference: "demo-001",
          }}
          description="Simulate MTN MoMo or Airtel Money payment charge."
        />
      </div>
    </section>
  );
}
