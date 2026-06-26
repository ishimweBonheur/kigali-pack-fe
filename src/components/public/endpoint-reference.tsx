import { CodeBlock } from "@/components/public/code-block";
import { API_PUBLIC_URL } from "@/constants";
import type { ApiEndpointDefinition } from "@/constants/api-endpoints";
import { generateCodeSnippet } from "@/utils/code-snippets";

interface EndpointReferenceProps {
  endpoint: ApiEndpointDefinition;
}

export function EndpointReference({ endpoint }: EndpointReferenceProps) {
  const fullUrl = `${API_PUBLIC_URL}${endpoint.path.split("?")[0]}`;

  return (
    <div className="glass-card rounded-xl p-4 sm:p-6 space-y-4 w-full">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-accent/15 text-accent">
          {endpoint.method}
        </span>
        <code className="font-mono text-sm break-all">{endpoint.path}</code>
      </div>

      <div>
        <h3 className="font-heading text-lg font-semibold">{endpoint.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{endpoint.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
        <div>
          <p className="font-medium mb-1">Purpose</p>
          <p className="text-muted-foreground">{endpoint.description}</p>
        </div>
        <div>
          <p className="font-medium mb-1">Authentication</p>
          <p className="text-muted-foreground font-mono text-xs">
            {endpoint.authentication ??
              (endpoint.requiresAuth
                ? "Authorization: Bearer kp_live_xxxxx"
                : "None")}
          </p>
        </div>
        <div>
          <p className="font-medium mb-1">Base URL</p>
          <p className="text-muted-foreground font-mono text-xs break-all">{fullUrl}</p>
        </div>
      </div>

      {endpoint.params && endpoint.params.length > 0 && (
        <div>
          <p className="font-medium text-sm mb-2">Parameters</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-border rounded-lg">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">In</th>
                  <th className="p-2 text-left">Required</th>
                  <th className="p-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.params.map((p) => (
                  <tr key={p.name} className="border-b border-border last:border-0">
                    <td className="p-2 font-mono">{p.name}</td>
                    <td className="p-2">{p.in}</td>
                    <td className="p-2">{p.required ? "Yes" : "No"}</td>
                    <td className="p-2 text-muted-foreground">{p.description ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {endpoint.bodySchema && (
        <div>
          <p className="font-medium text-sm mb-2">Request body</p>
          <CodeBlock code={endpoint.bodySchema} language="json" />
        </div>
      )}

      {endpoint.responsePreview && (
        <div>
          <p className="font-medium text-sm mb-2">Response</p>
          <CodeBlock code={endpoint.responsePreview} language="json" />
        </div>
      )}

      {endpoint.errors && endpoint.errors.length > 0 && (
        <div>
          <p className="font-medium text-sm mb-2">Errors</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-border rounded-lg">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Code</th>
                  <th className="p-2 text-left">Description</th>
                </tr>
              </thead>
              <tbody>
                {endpoint.errors.map((e) => (
                  <tr key={e.code} className="border-b border-border last:border-0">
                    <td className="p-2 font-mono">{e.status}</td>
                    <td className="p-2 font-mono">{e.code}</td>
                    <td className="p-2 text-muted-foreground">{e.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div>
        <p className="font-medium text-sm mb-2">Examples</p>
        <div className="grid gap-3 lg:grid-cols-2">
          <CodeBlock
            title="curl"
            language="bash"
            code={generateCodeSnippet("curl", {
              method: endpoint.method,
              path: endpoint.path,
              apiKey: endpoint.requiresAuth ? "kp_live_xxxxx" : undefined,
              body: endpoint.bodyExample,
            })}
          />
          <CodeBlock
            title="fetch"
            language="javascript"
            code={generateCodeSnippet("javascript", {
              method: endpoint.method,
              path: endpoint.path,
              apiKey: endpoint.requiresAuth ? "kp_live_xxxxx" : undefined,
              body: endpoint.bodyExample,
            })}
          />
          <CodeBlock
            title="axios"
            language="typescript"
            code={generateCodeSnippet("axios", {
              method: endpoint.method,
              path: endpoint.path,
              apiKey: endpoint.requiresAuth ? "kp_live_xxxxx" : undefined,
              body: endpoint.bodyExample,
            })}
          />
          <CodeBlock
            title="Express"
            language="typescript"
            code={generateCodeSnippet("express", {
              method: endpoint.method,
              path: endpoint.path,
              apiKey: endpoint.requiresAuth ? "kp_live_xxxxx" : undefined,
              body: endpoint.bodyExample,
            })}
          />
        </div>
      </div>
    </div>
  );
}
