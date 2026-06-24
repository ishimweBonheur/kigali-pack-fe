"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/public/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  generateCodeSnippet,
  CODE_LANGUAGES,
  type CodeLanguage,
} from "@/utils/code-snippets";
import { publicService } from "@/services/public.service";
import type { ApiEndpointDefinition } from "@/constants/api-endpoints";
import { cn } from "@/lib/utils";

interface TryItConsoleProps {
  endpoint: ApiEndpointDefinition;
  className?: string;
}

export function TryItConsole({ endpoint, className }: TryItConsoleProps) {
  const { data: session } = useSession();
  const [lang, setLang] = useState<CodeLanguage>("curl");
  const [response, setResponse] = useState<string>("");
  const [status, setStatus] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const apiKey =
    session?.user?.accessToken?.startsWith("kp_")
      ? session.user.accessToken
      : undefined;

  const snippet = generateCodeSnippet(lang, {
    method: endpoint.method,
    path: endpoint.path,
    apiKey: apiKey ?? "kp_test_your_api_key_here",
    body: endpoint.bodyExample,
  });

  const runRequest = async () => {
    setLoading(true);
    try {
      const token = session?.user?.accessToken;
      const result = await publicService.probeEndpoint(
        endpoint.method,
        endpoint.path.split("?")[0],
        endpoint.requiresAuth ? token : undefined,
        endpoint.bodyExample,
      );
      setStatus(result.status);
      setDurationMs(result.durationMs);
      setResponse(JSON.stringify(result.data, null, 2));
    } catch {
      setResponse(JSON.stringify({ error: "Request failed" }, null, 2));
      setStatus(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("glass-card rounded-xl overflow-hidden", className)}>
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <h3 className="font-heading text-sm font-semibold">Try It Now</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {endpoint.requiresAuth
            ? session
              ? "Using your session token"
              : "Sign in to auto-fill credentials"
            : "No auth required"}
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="space-y-2 text-small">
          <div className="flex gap-2">
            <span
              className={cn(
                "font-mono text-[11px] px-2 py-0.5 rounded",
                endpoint.method === "GET"
                  ? "bg-success/15 text-success"
                  : "bg-accent/15 text-accent",
              )}
            >
              {endpoint.method}
            </span>
            <code className="font-mono text-[12px] break-all">{endpoint.path}</code>
          </div>
          {endpoint.requiresAuth && (
            <p className="text-muted-foreground font-mono text-[11px]">
              Authorization: Bearer kp_test_xxx
            </p>
          )}
        </div>

        <Tabs value={lang} onValueChange={(v) => setLang(v as CodeLanguage)}>
          <TabsList className="flex flex-wrap h-auto gap-1 bg-secondary/50">
            {CODE_LANGUAGES.map((l) => (
              <TabsTrigger key={l.id} value={l.id} className="text-[11px] px-2 py-1">
                {l.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {CODE_LANGUAGES.map((l) => (
            <TabsContent key={l.id} value={l.id}>
              <CodeBlock code={snippet} language={l.id} />
            </TabsContent>
          ))}
        </Tabs>

        <Button onClick={runRequest} disabled={loading} className="w-full" size="sm">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Try It
        </Button>

        {response && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  "text-[11px] font-mono px-2 py-0.5 rounded",
                  status && status < 400
                    ? "bg-success/15 text-success"
                    : "bg-destructive/15 text-destructive",
                )}
              >
                {status}
              </span>
              {durationMs !== null && (
                <span className="text-[11px] text-muted-foreground font-mono">
                  {durationMs}ms
                </span>
              )}
            </div>
            <CodeBlock code={response} language="json" title="Response" />
          </div>
        )}
      </div>
    </div>
  );
}
