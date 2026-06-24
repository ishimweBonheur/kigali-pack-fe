import Link from "next/link";
import { Shield, Database, Cloud, Lock } from "lucide-react";
import { API_PUBLIC_URL } from "@/constants";

export function SecurityPrivacyPanel() {
  return (
    <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 sm:p-6 space-y-5 my-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15">
          <Shield className="h-5 w-5 text-accent" />
        </div>
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Security &amp; Privacy (V2)
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Kigali-Pack V2 enforces strict separation between transient processing
            and persistent storage.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-background/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Cloud className="h-4 w-4 text-accent shrink-0" />
            Where is data stored?
          </div>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-4">
            <li>
              <strong className="text-foreground">Transient pipelines</strong> — RRA
              tax, RSSB payroll, and phone utilities process inputs in volatile RAM
              and discard raw PII immediately after responding.
            </li>
            <li>
              <strong className="text-foreground">Metadata audit logs</strong> — only
              developer ID, HTTP method, route, status, timing, and masked payload
              snapshots are retained.
            </li>
            <li>
              <strong className="text-foreground">Persistent state</strong> — sandbox
              payment transactions, organization records, and webhook delivery logs
              are written to PostgreSQL.
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-background/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Database className="h-4 w-4 text-accent shrink-0" />
            Do I need a Kigali-Pack DB?
          </div>
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">No.</strong> You do not download our
            source code or replicate our tables. Your application calls our hosted API
            at{" "}
            <code className="font-mono text-xs text-accent break-all">
              {API_PUBLIC_URL}
            </code>{" "}
            using standard network requests (
            <code className="font-mono text-xs">fetch</code>,{" "}
            <code className="font-mono text-xs">axios</code>, etc.). We manage
            infrastructure, compliance, and data retention on your behalf.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-background/40 p-3 text-sm text-muted-foreground">
        <Lock className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <p>
          Outbound webhooks are signed with HMAC-SHA256 using{" "}
          <code className="font-mono text-xs">X-Kigalipack-Signature: t=&#123;timestamp&#125;,v1=&#123;hash&#125;</code>.
          See the{" "}
          <Link href="/docs/webhook-signature-verification" className="text-accent hover:underline">
            Webhook Signature Verification Guide
          </Link>{" "}
          for copy-paste middleware in Node, Express, NestJS, Python, and Go.
        </p>
      </div>
    </div>
  );
}
