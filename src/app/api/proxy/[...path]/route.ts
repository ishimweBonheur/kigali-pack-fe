import { NextRequest, NextResponse } from "next/server";

const DEFAULT_BACKEND = "http://127.0.0.1:3000";
const PROXY_TIMEOUT_MS = 15_000;

const FORWARD_HEADERS = [
  "authorization",
  "content-type",
  "accept",
  "x-request-id",
  "x-correlation-id",
];

function normalizeBackendBaseUrl(): string {
  const raw =
    process.env.BACKEND_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    DEFAULT_BACKEND;

  return raw.trim().replace(/\/+$/, "");
}

function buildBackendCandidates(baseUrl: string): string[] {
  const candidates = [baseUrl];

  if (baseUrl.includes("localhost")) {
    candidates.push(baseUrl.replace("localhost", "127.0.0.1"));
  }
  if (baseUrl.includes("127.0.0.1")) {
    candidates.push(baseUrl.replace("127.0.0.1", "localhost"));
  }

  return [...new Set(candidates)];
}

async function fetchBackend(
  url: string,
  init: RequestInit,
): Promise<Response> {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
    cache: "no-store",
  });
}

async function handleProxy(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const targetPath = path.join("/");
  const search = req.nextUrl.search;
  const baseCandidates = buildBackendCandidates(normalizeBackendBaseUrl());

  const headers = new Headers();
  FORWARD_HEADERS.forEach((name) => {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  });

  const init: RequestInit = {
    method: req.method,
    headers,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  let lastError: unknown = null;

  for (const baseUrl of baseCandidates) {
    const url = `${baseUrl}/${targetPath}${search}`;

    try {
      const backendRes = await fetchBackend(url, init);
      const body = await backendRes.text();

      const responseHeaders = new Headers();
      const contentType = backendRes.headers.get("Content-Type");
      if (contentType) {
        responseHeaders.set("Content-Type", contentType);
      }
      responseHeaders.set("Access-Control-Allow-Origin", "*");
      responseHeaders.set("X-Proxy-Backend", baseUrl);

      return new NextResponse(body, {
        status: backendRes.status,
        headers: responseHeaders,
      });
    } catch (error) {
      lastError = error;
    }
  }

  const errorMessage =
    lastError instanceof Error ? lastError.message : "Unknown connection error";

  const isDev = process.env.NODE_ENV !== "production";

  return NextResponse.json(
    {
      success: false,
      message: "Backend unreachable. Start the NestJS API on port 3000.",
      error: {
        code: "BACKEND_UNREACHABLE",
        details: isDev
          ? {
              attempted: baseCandidates.map((b) => `${b}/${targetPath}`),
              hint: "Run: cd backend && npm run start:dev",
              cause: errorMessage,
            }
          : undefined,
      },
    },
    {
      status: 502,
      headers: { "Content-Type": "application/json" },
    },
  );
}

export const GET = handleProxy;
export const POST = handleProxy;
export const PUT = handleProxy;
export const PATCH = handleProxy;
export const DELETE = handleProxy;
