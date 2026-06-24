"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2 } from "lucide-react";
import { publicService } from "@/services/public.service";
import { API_BASE_URL } from "@/constants";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PUBLIC_ROUTES } from "@/constants/public";

interface TerminalDemo {
  id: string;
  method: "GET" | "POST";
  path: string;
  label: string;
  requiresAuth?: boolean;
  body?: unknown;
}

const DEMOS: TerminalDemo[] = [
  {
    id: "provinces",
    method: "GET",
    path: "/v1/locations/root-provinces",
    label: "List root provinces",
  },
  {
    id: "plans",
    method: "GET",
    path: "/v1/billing/plans",
    label: "List billing plans",
  },
  {
    id: "nida",
    method: "GET",
    path: "/v1/compliance/nida/mock/1200780064278123",
    label: "NIDA mock lookup",
    requiresAuth: true,
  },
  {
    id: "charge",
    method: "POST",
    path: "/v1/sandbox/payments/charge",
    label: "Sandbox payment charge",
    requiresAuth: true,
    body: {
      phoneNumber: "0781234567",
      amount: 5000,
      webhookUrl: "https://example.com/webhook",
      clientReference: "demo-ref-001",
    },
  },
];

export function ApiTerminal() {
  const { data: session } = useSession();
  const [active, setActive] = useState(0);
  const [response, setResponse] = useState<string>("");
  const [status, setStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const demo = DEMOS[active];
  const requestLine = `${demo.method} ${demo.path}`;

  const runDemo = useCallback(async () => {
    setLoading(true);
    try {
      const token = session?.user?.accessToken;
      if (demo.requiresAuth && !token) {
        setStatus(401);
        setResponse(
          JSON.stringify(
            {
              success: false,
              message: "Authentication required. Register and create an API key to run this endpoint.",
            },
            null,
            2,
          ),
        );
        return;
      }
      const result = await publicService.probeEndpoint(
        demo.method,
        demo.path,
        token,
        demo.body,
      );
      setStatus(result.status);
      setResponse(JSON.stringify(result.data, null, 2));
    } catch {
      setStatus(500);
      setResponse(JSON.stringify({ error: "Failed to reach API" }, null, 2));
    } finally {
      setLoading(false);
    }
  }, [demo, session]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void runDemo();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [runDemo]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % DEMOS.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-border shadow-2xl">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/40">
        <span className="h-3 w-3 rounded-full bg-destructive/80" />
        <span className="h-3 w-3 rounded-full bg-amber-400/80" />
        <span className="h-3 w-3 rounded-full bg-success/80" />
        <span className="ml-2 text-[11px] font-mono text-muted-foreground truncate">
          api-terminal — {API_BASE_URL.replace("http://", "")}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-background/50 overflow-x-auto">
        {DEMOS.map((d, i) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setActive(i)}
            className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] sm:text-[11px] font-mono transition-colors ${
              i === active
                ? "bg-accent/20 text-accent"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="p-3 sm:p-4 space-y-3 font-mono text-[12px] sm:text-[13px] overflow-x-auto">
        <div className="break-all">
          <span className="text-accent">$</span>{" "}
          <span className="text-muted-foreground">curl -X {demo.method} </span>
          <span className="text-foreground">{API_BASE_URL}{demo.path}</span>
          {demo.requiresAuth && (
            <span className="text-muted-foreground">
              {" "}
              -H &quot;Authorization: Bearer …&quot;
            </span>
          )}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={demo.id + status}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center gap-2 mb-2">
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
              ) : (
                <span
                  className={`text-[11px] px-1.5 py-0.5 rounded ${
                    status && status < 400
                      ? "bg-success/15 text-success"
                      : "bg-destructive/15 text-destructive"
                  }`}
                >
                  {status ?? "—"}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">
                {requestLine}
              </span>
            </div>
            <pre className="text-[12px] leading-relaxed text-muted-foreground max-h-64 overflow-auto whitespace-pre-wrap">
              {loading ? "Loading…" : response}
            </pre>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center gap-2 pt-2">
          <Button size="sm" variant="outline" onClick={runDemo} disabled={loading}>
            <Play className="h-3.5 w-3.5 mr-1.5" />
            Run
          </Button>
          {demo.requiresAuth && !session && (
            <Link
              href={PUBLIC_ROUTES.getStarted}
              className="text-[12px] text-accent hover:underline"
            >
              Get started to run authenticated endpoints →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
