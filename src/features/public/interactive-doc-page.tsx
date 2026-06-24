"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DocsSidebar } from "@/components/public/docs-sidebar";
import { TryItConsole } from "@/components/public/try-it-console";
import { CodeBlock } from "@/components/public/code-block";
import { SecurityPrivacyPanel } from "@/components/public/security-privacy-panel";
import { WebhookVerificationTabs } from "@/components/public/webhook-verification-tabs";
import { PUBLIC_ROUTES } from "@/constants/public";
import { API_PUBLIC_URL } from "@/constants";
import { getEndpointsByDocSlug } from "@/constants/api-endpoints";
import type { DocSection } from "@/content/docs";

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
        <div key={i} className="my-4 overflow-x-auto -mx-1 px-1">
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
  const primaryEndpoint = endpoints[0];

  return (
    <div className="space-y-4 lg:space-y-0 lg:flex lg:flex-row lg:gap-10">
      <DocsSidebar />

      <article className="flex-1 min-w-0 lg:max-w-2xl">
        <p className="text-accent text-small font-medium mb-2">
          {doc.category ?? "Documentation"}
        </p>
        <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight break-words">
          {doc.title}
        </h1>
        <p className="mt-3 text-muted-foreground text-sm sm:text-lg">{doc.description}</p>

        {SHOW_SECURITY_PANEL.has(doc.slug) && <SecurityPrivacyPanel />}

        {doc.slug === "introduction" && (
          <div className="glass-card rounded-xl p-4 sm:p-5 my-6 space-y-3 text-small">
            <h3 className="font-heading font-semibold">Installation &amp; setup</h3>
            <p className="text-muted-foreground">
              Treat{" "}
              <code className="font-mono text-accent break-all">{API_PUBLIC_URL}</code>{" "}
              as an external dependency. Insert your API key into any HTTP client.
            </p>
            <div className="overflow-x-auto">
              <CodeBlock
                language="bash"
                code={`# .env\nKIGALI_PACK_API_KEY=kp_test_your_key\nKIGALI_PACK_API_URL=${API_PUBLIC_URL}`}
              />
            </div>
            <p className="text-muted-foreground">
              From this Next.js app (localhost:3001), requests proxy through{" "}
              <code className="font-mono">/api/proxy</code> to avoid CORS. In your own
              app, call the API URL directly.
            </p>
          </div>
        )}

        <div className="mt-6">{renderMarkdown(doc.content)}</div>

        {doc.slug === "webhook-signature-verification" && <WebhookVerificationTabs />}

        {doc.codeExamples && doc.codeExamples.length > 0 && (
          <div className="mt-10 space-y-4">
            <h2 className="font-heading text-xl font-semibold">Code examples</h2>
            {doc.codeExamples.map((ex) => (
              <div key={ex.label} className="overflow-x-auto">
                <CodeBlock code={ex.code} language={ex.language} title={ex.label} />
              </div>
            ))}
          </div>
        )}

        {endpoints.length > 0 && (
          <div className="mt-10 space-y-4 lg:hidden">
            <h2 className="font-heading text-xl font-semibold">API Reference</h2>
            {endpoints.map((ep) => (
              <TryItConsole key={ep.id} endpoint={ep} />
            ))}
          </div>
        )}

        <div className="mt-12 glass-card rounded-xl p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
      </article>

      <aside className="hidden lg:block w-80 xl:w-96 shrink-0">
        <div className="sticky top-24 space-y-4 max-h-[calc(100vh-7rem)] overflow-y-auto">
          {primaryEndpoint ? (
            <TryItConsole endpoint={primaryEndpoint} />
          ) : (
            <div className="glass-card rounded-xl p-5 text-small text-muted-foreground">
              Select an endpoint from the Examples or Playground pages.
            </div>
          )}
          {endpoints.slice(1).map((ep) => (
            <TryItConsole key={ep.id} endpoint={ep} />
          ))}
        </div>
      </aside>
    </div>
  );
}
