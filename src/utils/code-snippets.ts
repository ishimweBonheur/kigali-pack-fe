import { API_PUBLIC_URL } from "@/constants";

export type CodeLanguage =
  | "curl"
  | "javascript"
  | "typescript"
  | "nodejs"
  | "react"
  | "nextjs";

export interface SnippetOptions {
  method: string;
  path: string;
  apiKey?: string;
  body?: Record<string, unknown>;
  baseUrl?: string;
}

const PLACEHOLDER_KEY = "kp_test_your_api_key_here";

export function generateCodeSnippet(
  lang: CodeLanguage,
  opts: SnippetOptions,
): string {
  const base = opts.baseUrl ?? API_PUBLIC_URL;
  const url = `${base}${opts.path}`;
  const key = opts.apiKey ?? PLACEHOLDER_KEY;
  const hasBody = opts.body && Object.keys(opts.body).length > 0;
  const bodyJson = hasBody ? JSON.stringify(opts.body, null, 2) : "";

  switch (lang) {
    case "curl": {
      const lines = [`curl -X ${opts.method} "${url}"`, `  -H "Authorization: Bearer ${key}"`];
      if (hasBody) {
        lines.push(`  -H "Content-Type: application/json"`, `  -d '${JSON.stringify(opts.body)}'`);
      }
      return lines.join(" \\\n");
    }
    case "javascript":
      return `const response = await fetch("${url}", {
  method: "${opts.method}",
  headers: {
    Authorization: "Bearer ${key}",
    "Content-Type": "application/json",
  },${hasBody ? `\n  body: JSON.stringify(${bodyJson}),` : ""}
});

const data = await response.json();
console.log(data);`;

    case "typescript":
      return `interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const response = await fetch("${url}", {
  method: "${opts.method}",
  headers: {
    Authorization: "Bearer ${key}",
    "Content-Type": "application/json",
  },${hasBody ? `\n  body: JSON.stringify(${bodyJson}),` : ""}
});

const result: ApiResponse<unknown> = await response.json();
console.log(result.data);`;

    case "nodejs":
      return `import axios from "axios";

const { data } = await axios.${opts.method.toLowerCase()}("${url}"${hasBody ? `, ${bodyJson}` : ""}, {
  headers: { Authorization: "Bearer ${key}" },
});

console.log(data);`;

    case "react":
      return `"use client";

import { useEffect, useState } from "react";

export function ApiExample() {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    fetch("${url}", {
      method: "${opts.method}",
      headers: { Authorization: "Bearer ${key}" },${hasBody ? `\n      body: JSON.stringify(${bodyJson}),` : ""}
    })
      .then((r) => r.json())
      .then(setData);
  }, []);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}`;

    case "nextjs":
      return `// app/api/example/route.ts — server-side proxy pattern
import { NextResponse } from "next/server";

export async function ${opts.method === "GET" ? "GET" : "POST"}() {
  const res = await fetch("${url}", {
    method: "${opts.method}",
    headers: {
      Authorization: \`Bearer \${process.env.KIGALI_PACK_API_KEY}\`,
    },${hasBody ? `\n    body: JSON.stringify(${bodyJson}),` : ""}
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data);
}`;

    default:
      return "";
  }
}

export const CODE_LANGUAGES: { id: CodeLanguage; label: string }[] = [
  { id: "curl", label: "curl" },
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "nodejs", label: "Node.js (axios)" },
  { id: "react", label: "React" },
  { id: "nextjs", label: "Next.js App Router" },
];
