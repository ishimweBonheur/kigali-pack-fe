"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  ChevronRight,
  Send,
  Clock,
  Package,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { CodeBlock } from "@/components/public/code-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  API_ENDPOINTS,
  getEndpointsByCategory,
  type ApiEndpointDefinition,
} from "@/constants/api-endpoints";
import { publicService } from "@/services/public.service";
import { cn } from "@/lib/utils";

interface RequestLogEntry {
  id: string;
  endpoint: ApiEndpointDefinition;
  status: number;
  durationMs: number;
  timestamp: Date;
}

function maskKey(key: string): string {
  if (key.length <= 12) return key;
  return `${key.slice(0, 8)}••••••••${key.slice(-4)}`;
}

export function PlaygroundPage() {
  const { data: session } = useSession();
  const grouped = getEndpointsByCategory();
  const [selected, setSelected] = useState<ApiEndpointDefinition>(API_ENDPOINTS[0]);
  const [path, setPath] = useState(API_ENDPOINTS[0].path);
  const [body, setBody] = useState(
    API_ENDPOINTS[0].bodyExample
      ? JSON.stringify(API_ENDPOINTS[0].bodyExample, null, 2)
      : "",
  );
  const [authHeader, setAuthHeader] = useState("");
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState<number | null>(null);
  const [durationMs, setDurationMs] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<RequestLogEntry[]>([]);
  const [expandedCat, setExpandedCat] = useState<string | null>("Locations");

  const selectEndpoint = (ep: ApiEndpointDefinition) => {
    setSelected(ep);
    setPath(ep.path);
    setBody(ep.bodyExample ? JSON.stringify(ep.bodyExample, null, 2) : "");
    if (ep.requiresAuth && session?.user?.accessToken) {
      setAuthHeader(session.user.accessToken);
    }
  };

  const sendRequest = useCallback(async () => {
    setLoading(true);
    try {
      let parsedBody: unknown = undefined;
      if (body.trim() && selected.method !== "GET") {
        parsedBody = JSON.parse(body) as unknown;
      }
      const token = authHeader || session?.user?.accessToken;
      const pathOnly = path.split("?")[0];
      const result = await publicService.probeEndpoint(
        selected.method,
        pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`,
        selected.requiresAuth ? token : undefined,
        parsedBody,
      );
      setStatus(result.status);
      setDurationMs(result.durationMs);
      setResponse(JSON.stringify(result.data, null, 2));
      setHistory((prev) => [
        {
          id: crypto.randomUUID(),
          endpoint: selected,
          status: result.status,
          durationMs: result.durationMs,
          timestamp: new Date(),
        },
        ...prev.slice(0, 19),
      ]);
    } catch {
      setResponse(JSON.stringify({ error: "Invalid JSON body or network error" }, null, 2));
      setStatus(0);
    } finally {
      setLoading(false);
    }
  }, [body, path, selected, authHeader, session]);

  return (
    <div className="min-h-0 flex flex-col">
      <div className="px-4 lg:px-0 pb-4 shrink-0">
        <PageHeader
          title="API Playground"
          description="Explore and test Kigali-Pack endpoints. Transient utility routes (RRA, phone) process data in RAM only — see Security & Privacy docs."
        />
      </div>

      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-4 min-h-0 px-4 lg:px-0 pb-6 lg:pb-4">
        {/* Left — endpoint tree */}
        <div className="lg:col-span-3 glass-card rounded-xl overflow-hidden flex flex-col min-h-[200px] max-h-[40vh] lg:max-h-none lg:min-h-0 order-1">
          <div className="px-4 py-3 border-b border-border text-small font-semibold shrink-0">
            Endpoints
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {Object.entries(grouped).map(([cat, eps]) =>
              eps.length === 0 ? null : (
                <div key={cat}>
                  <button
                    type="button"
                    onClick={() => setExpandedCat(expandedCat === cat ? null : cat)}
                    className="flex w-full items-center gap-1 px-2 py-1.5 text-small font-medium hover:bg-hover rounded-lg"
                  >
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        expandedCat === cat && "rotate-90",
                      )}
                    />
                    {cat}
                  </button>
                  {expandedCat === cat &&
                    eps.map((ep) => (
                      <button
                        key={ep.id}
                        type="button"
                        onClick={() => selectEndpoint(ep)}
                        className={cn(
                          "w-full text-left px-3 py-2 ml-3 rounded-lg text-[12px] font-mono truncate",
                          selected.id === ep.id
                            ? "bg-accent/15 text-accent"
                            : "text-muted-foreground hover:bg-hover",
                        )}
                      >
                        <span
                          className={cn(
                            "mr-1.5 text-[10px]",
                            ep.method === "GET" ? "text-success" : "text-accent",
                          )}
                        >
                          {ep.method}
                        </span>
                        {ep.path.replace("/v1/", "")}
                      </button>
                    ))}
                </div>
              ),
            )}
          </div>

          {/* SDK teaser */}
          <div className="m-2 p-3 rounded-lg border border-dashed border-border bg-secondary/20 shrink-0">
            <div className="flex items-center gap-2 text-small text-muted-foreground">
              <Package className="h-4 w-4" />
              <span className="font-medium">Official SDK</span>
              <Badge variant="outline" className="text-[10px] ml-auto">
                Coming Soon
              </Badge>
            </div>
          </div>
        </div>

        {/* Center — request builder */}
        <div className="lg:col-span-5 glass-card rounded-xl flex flex-col min-h-[320px] lg:min-h-0 overflow-hidden order-2">
          <div className="px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-[11px]",
                  selected.method === "GET" ? "text-success" : "text-accent",
                )}
              >
                {selected.method}
              </Badge>
              <span className="font-heading text-sm font-semibold truncate">
                {selected.title}
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <label className="text-[11px] text-muted-foreground uppercase tracking-wide">
                URL Path
              </label>
              <Input
                value={path}
                onChange={(e) => setPath(e.target.value)}
                className="mt-1 font-mono text-small"
              />
            </div>
            {selected.requiresAuth && (
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  Authorization Bearer
                </label>
                <Input
                  value={authHeader}
                  onChange={(e) => setAuthHeader(e.target.value)}
                  placeholder="kp_test_… or JWT access token"
                  className="mt-1 font-mono text-small"
                />
                {session?.user?.accessToken && (
                  <button
                    type="button"
                    onClick={() => setAuthHeader(session.user.accessToken)}
                    className="text-[11px] text-accent mt-1 hover:underline"
                  >
                    Use session token ({maskKey(session.user.accessToken)})
                  </button>
                )}
              </div>
            )}
            {selected.method !== "GET" && (
              <div>
                <label className="text-[11px] text-muted-foreground uppercase tracking-wide">
                  JSON Body
                </label>
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="mt-1 font-mono text-[12px] min-h-[160px]"
                />
              </div>
            )}
            <Button onClick={sendRequest} disabled={loading} className="w-full">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Request
            </Button>
          </div>
        </div>

        {/* Right — response viewer */}
        <div className="lg:col-span-4 glass-card rounded-xl flex flex-col min-h-[280px] lg:min-h-0 overflow-hidden order-3">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
            <span className="text-small font-semibold">Response</span>
            <div className="flex items-center gap-2">
              {status !== null && (
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono text-[11px]",
                    status < 400 ? "text-success" : "text-destructive",
                  )}
                >
                  {status} {status < 400 ? "OK" : "Error"}
                </Badge>
              )}
              {durationMs !== null && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                  <Clock className="h-3 w-3" />
                  {durationMs}ms
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {response ? (
              <CodeBlock code={response} language="json" />
            ) : (
              <p className="text-small text-muted-foreground text-center py-12">
                Send a request to see the response
              </p>
            )}
          </div>
          {history.length > 0 && (
            <div className="border-t border-border p-3 shrink-0 max-h-32 overflow-y-auto">
              <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wide">
                History
              </p>
              {history.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => selectEndpoint(h.endpoint)}
                  className="flex w-full items-center justify-between py-1 text-[11px] font-mono hover:text-accent"
                >
                  <span className="truncate">{h.endpoint.method} {h.endpoint.path}</span>
                  <span className={h.status < 400 ? "text-success" : "text-destructive"}>
                    {h.status} · {h.durationMs}ms
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
