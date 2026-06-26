"use client";

import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { Play, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodeBlock } from "@/components/public/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  generateCodeSnippet,
  CODE_LANGUAGES,
  type CodeLanguage,
} from "@/utils/code-snippets";
import { publicService } from "@/services/public.service";
import { API_KEY_STORAGE_KEY } from "@/constants";
import type { ApiEndpointDefinition } from "@/constants/api-endpoints";
import { copyToClipboard } from "@/utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TryItConsoleProps {
  endpoint: ApiEndpointDefinition;
  className?: string;
}

export function TryItConsole({ endpoint, className }: TryItConsoleProps) {
  const { data: session } = useSession();
  const [lang, setLang] = useState<CodeLanguage>("curl");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [requestPath, setRequestPath] = useState(endpoint.path);

  const [manualApiKey, setManualApiKey] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(API_KEY_STORAGE_KEY);
  });

  const sessionApiKey =
    session?.user?.accessToken?.startsWith("kp_")
      ? session.user.accessToken
      : null;

  const apiKey =
    manualApiKey ?? sessionApiKey ?? "kp_test_your_api_key_here";

  const [extraHeaders, setExtraHeaders] = useState('{\n  "Content-Type": "application/json"\n}');
  const [bodyText, setBodyText] = useState(
    endpoint.bodyExample ? JSON.stringify(endpoint.bodyExample, null, 2) : "{}",
  );

  const resolvedPath = requestPath;

  const parsedBody = useMemo(() => {
    if (endpoint.method === "GET" || endpoint.method === "DELETE") return undefined;
    try {
      return JSON.parse(bodyText) as Record<string, unknown>;
    } catch {
      return endpoint.bodyExample;
    }
  }, [bodyText, endpoint.bodyExample, endpoint.method]);

  const snippet = generateCodeSnippet(lang, {
    method: endpoint.method,
    path: resolvedPath,
    apiKey: endpoint.requiresAuth ? apiKey : undefined,
    body: parsedBody,
  });

  const runRequest = async () => {
    setLoading(true);
    setCopied(false);
    try {
      let customHeaders: Record<string, string> = {};
      try {
        customHeaders = JSON.parse(extraHeaders) as Record<string, string>;
      } catch {
        toast.error("Invalid JSON in headers editor");
        setLoading(false);
        return;
      }

      const token = endpoint.requiresAuth ? apiKey : undefined;
      const start = performance.now();
      const headers: Record<string, string> = { ...customHeaders };
      if (token) headers.Authorization = `Bearer ${token}`;

      const result = await publicService.probeEndpointWithHeaders(
        endpoint.method,
        resolvedPath.split("?")[0] + (resolvedPath.includes("?") ? "?" + resolvedPath.split("?").slice(1).join("?") : ""),
        headers,
        parsedBody,
      );
      setStatus(result.status);
      setDurationMs(result.durationMs ?? Math.round(performance.now() - start));
      setResponse(JSON.stringify(result.data, null, 2));
    } catch {
      setResponse(JSON.stringify({ error: "Request failed" }, null, 2));
      setStatus(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResponse = async () => {
    const ok = await copyToClipboard(response);
    if (ok) {
      setCopied(true);
      toast.success("Response copied");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={cn("glass-card rounded-xl overflow-hidden", className)}>
      <div className="px-4 py-3 border-b border-border bg-secondary/30">
        <h3 className="font-heading text-sm font-semibold">Try It</h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {endpoint.title} — live request against the API
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
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
          <code className="font-mono text-[12px] break-all">{resolvedPath}</code>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Request path</p>
          <Input
            value={requestPath}
            onChange={(e) => setRequestPath(e.target.value)}
            className="font-mono text-xs"
          />
        </div>

        {endpoint.requiresAuth && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Authorization</p>
            <Input
              value={apiKey}
              onChange={(e) => setManualApiKey(e.target.value)}
              className="font-mono text-xs"
              placeholder="Bearer kp_test_..."
            />
            <p className="text-[10px] text-muted-foreground">
              Auto-loaded from onboarding if available
            </p>
          </div>
        )}

        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Headers (JSON)</p>
          <Textarea
            value={extraHeaders}
            onChange={(e) => setExtraHeaders(e.target.value)}
            className="font-mono text-xs min-h-[72px]"
          />
        </div>

        {endpoint.method !== "GET" && endpoint.method !== "DELETE" && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Request body (JSON)</p>
            <Textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="font-mono text-xs min-h-[120px]"
            />
          </div>
        )}

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

        <Button onClick={() => void runRequest()} disabled={loading} className="w-full" size="sm">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Run request
        </Button>

        {response && (
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
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
              <Button variant="ghost" size="sm" onClick={() => void handleCopyResponse()}>
                {copied ? (
                  <Check className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <Copy className="h-3.5 w-3.5 mr-1" />
                )}
                Copy response
              </Button>
            </div>
            <CodeBlock code={response} language="json" title="Response" />
          </div>
        )}

        {endpoint.responsePreview && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Expected response preview</p>
            <CodeBlock code={endpoint.responsePreview} language="json" />
          </div>
        )}
      </div>
    </div>
  );
}
