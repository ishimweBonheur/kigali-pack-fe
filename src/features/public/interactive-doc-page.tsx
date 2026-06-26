"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DocsSidebar } from "@/components/public/docs-sidebar";
import { TryItConsole } from "@/components/public/try-it-console";
import { EndpointReference } from "@/components/public/endpoint-reference";
import { CodeBlock } from "@/components/public/code-block";
import { SecurityPrivacyPanel } from "@/components/public/security-privacy-panel";
import { WebhookVerificationTabs } from "@/components/public/webhook-verification-tabs";
import { PUBLIC_ROUTES } from "@/constants/public";
import { API_PUBLIC_URL } from "@/constants";
import { getEndpointsByDocSlug } from "@/constants/api-endpoints";
import type { DocSection } from "@/content/docs";
import { PublicPageShell } from "@/components/public/public-page-shell";

interface InteractiveDocPageProps {
  doc: DocSection;
}

function renderMarkdown(content: string) {
  return content.split("\n\n").map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="font-heading text-lg sm:text-xl font-semibold mt-8 mb-3">
          {block.replace("## ", "")}
        </h2>
      );
    }
    if (block.startsWith("```")) {
      const lines = block.split("\n");
      const lang = lines[0].replace("```", "") || "text";
      const code = lines.slice(1, -1).join("\n");
      return (
        <div key={i} className="my-4 overflow-x-auto">
          <CodeBlock code={code} language={lang} />
        </div>
      );
    }
    if (block.startsWith("|")) {
      const rows = block.split("\n").filter((r) => !r.includes("---"));
      return (
        <div key={i} className="my-4 overflow-x-auto">
          <table className="w-full min-w-[480px] text-small border border-border rounded-lg">
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="border-b border-border last:border-0">
                  {row.split("|").filter(Boolean).map((cell, ci) => (
                    <td key={ci} className="p-2 sm:p-3">{cell.trim()}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (block.startsWith("- ")) {
      return (
        <ul key={i} className="list-disc pl-5 space-y-1 my-4 text-muted-foreground text-sm">
          {block.split("\n").map((item, ii) => (
            <li key={ii}>{item.replace(/^- /, "")}</li>
          ))}
        </ul>
      );
    }
    return (
      <p key={i} className="my-4 text-muted-foreground leading-relaxed text-sm sm:text-base">
        {block}
      </p>
    );
  });
}

const SHOW_SECURITY_PANEL = new Set([
  "introduction",
  "security-privacy",
  "compliance",
  "utilities",
  "webhooks",
]);

export function InteractiveDocPage({ doc }: InteractiveDocPageProps) {
  const endpoints = getEndpointsByDocSlug(doc.slug);

  return (
    <PublicPageShell className="py-6 sm:py-8 lg:py-12">
      <div className="flex flex-col lg:flex-row lg:gap-8 xl:gap-12 w-full">
        <DocsSidebar />

        <div className="flex-1 min-w-0 w-full">
          <p className="text-accent text-small font-medium mb-2">
            {doc.category ?? "Documentation"}
          </p>
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight break-words">
            {doc.title}
          </h1>
          <p className="mt-3 text-muted-foreground text-sm sm:text-lg">
            {doc.description}
          </p>

          {SHOW_SECURITY_PANEL.has(doc.slug) && <SecurityPrivacyPanel />}

          {doc.slug === "environment-setup" && (
            <div className="glass-card rounded-xl p-4 sm:p-6 my-6 space-y-4">
              <h3 className="font-heading font-semibold">`.env.local` (Next.js)</h3>
              <CodeBlock
                language="bash"
                code={`NEXT_PUBLIC_API_URL=${API_PUBLIC_URL}
API_KEY=kp_live_xxxxx`}
              />
              <h3 className="font-heading font-semibold">Node.js (fetch)</h3>
              <CodeBlock
                language="javascript"
                code={`const response = await fetch(
  "${API_PUBLIC_URL}/v1/locations/root-provinces",
  {
    headers: {
      Authorization: \`Bearer \${process.env.API_KEY}\`,
    },
  },
);

const { data } = await response.json();`}
              />
              <h3 className="font-heading font-semibold">Axios client</h3>
              <CodeBlock
                language="typescript"
                code={`import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    Authorization: \`Bearer \${process.env.API_KEY}\`,
  },
});

const { data } = await api.get("/v1/locations/root-provinces");`}
              />
            </div>
          )}

          {doc.slug === "introduction" && (
            <div className="glass-card rounded-xl p-4 sm:p-5 my-6 space-y-3 text-small w-full">
              <h3 className="font-heading font-semibold">Installation &amp; setup</h3>
              <p className="text-muted-foreground">
                Treat{" "}
                <code className="font-mono text-accent break-all">{API_PUBLIC_URL}</code>{" "}
                as an external dependency. Insert your API key into any HTTP client.
              </p>
              <CodeBlock
                language="bash"
                code={`# .env.local\nNEXT_PUBLIC_API_URL=${API_PUBLIC_URL}\nAPI_KEY=kp_test_your_key`}
              />
              <p className="text-muted-foreground">
                From this Next.js app (localhost:3001), requests proxy through{" "}
                <code className="font-mono">/api/proxy</code> to avoid CORS. In your own
                app, call the API URL directly.
              </p>
            </div>
          )}

          <div className="mt-6 max-w-none">{renderMarkdown(doc.content)}</div>

          {doc.slug === "webhook-signature-verification" && <WebhookVerificationTabs />}

          {doc.codeExamples && doc.codeExamples.length > 0 && (
            <div className="mt-10 space-y-4 w-full">
              <h2 className="font-heading text-xl font-semibold">Code examples</h2>
              {doc.codeExamples.map((ex) => (
                <div key={ex.label} className="overflow-x-auto w-full">
                  <CodeBlock code={ex.code} language={ex.language} title={ex.label} />
                </div>
              ))}
            </div>
          )}

          {endpoints.length > 0 && (
            <div className="mt-12 space-y-8 w-full">
              <h2 className="font-heading text-2xl font-semibold">API Reference</h2>
              {endpoints.map((ep) => (
                <div key={ep.id} className="space-y-4">
                  <EndpointReference endpoint={ep} />
                  <TryItConsole endpoint={ep} />
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 glass-card rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
            <div className="min-w-0">
              <p className="font-medium">Ready to integrate?</p>
              <p className="text-small text-muted-foreground mt-1">
                Create an account and generate your first API key.
              </p>
            </div>
            <Link
              href={PUBLIC_ROUTES.getStarted}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shrink-0"
            >
              Get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </PublicPageShell>
  );
}
