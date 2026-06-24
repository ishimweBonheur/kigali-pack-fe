export const WEBHOOK_VERIFICATION_SNIPPETS = {
  node: {
    label: "Node.js",
    language: "javascript",
    code: `import crypto from "crypto";
import express from "express";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

function verifySignature(rawBody, headerValue) {
  const parts = Object.fromEntries(
    headerValue.split(",").map((p) => p.trim().split("="))
  );
  const timestamp = Number(parts.t);
  const signature = parts.v1;

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) {
    throw new Error("Timestamp outside tolerance — possible replay");
  }

  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(\`\${timestamp}.\${rawBody}\`)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    throw new Error("Invalid signature");
  }
}

const app = express();
app.post(
  "/webhooks/kigalipack",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const header = req.headers["x-kigalipack-signature"];
    verifySignature(req.body.toString("utf8"), header);
    const event = JSON.parse(req.body.toString("utf8"));
    res.status(200).json({ received: true });
  }
);`,
  },
  express: {
    label: "Express",
    language: "typescript",
    code: `import express, { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET!;

export function kigaliPackWebhookMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers["x-kigalipack-signature"];
  if (typeof header !== "string") {
    return res.status(401).json({ error: "Missing signature header" });
  }

  const rawBody = Buffer.isBuffer(req.body)
    ? req.body.toString("utf8")
    : JSON.stringify(req.body);

  const parts = Object.fromEntries(
    header.split(",").map((p) => p.trim().split("="))
  );
  const timestamp = Number(parts.t);
  const signature = parts.v1;

  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(\`\${timestamp}.\${rawBody}\`)
    .digest("hex");

  if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  req.body = JSON.parse(rawBody);
  next();
}`,
  },
  nestjs: {
    label: "NestJS",
    language: "typescript",
    code: `import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { verifyWebhookSignature } from "./webhook-signing.util";

@Injectable()
export class KigaliPackWebhookGuard implements CanActivate {
  constructor(private readonly secret: string) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header = req.headers["x-kigalipack-signature"];
    const rawBody = Buffer.isBuffer(req.body)
      ? req.body.toString("utf8")
      : JSON.stringify(req.body);

    return verifyWebhookSignature(this.secret, rawBody, header).valid;
  }
}

// Enable rawBody in main.ts: NestFactory.create(AppModule, { rawBody: true })`,
  },
  python: {
    label: "Python",
    language: "python",
    code: `import hmac
import hashlib
import time
from flask import Flask, request, abort

WEBHOOK_SECRET = os.environ["WEBHOOK_SECRET"]
app = Flask(__name__)

@app.post("/webhooks/kigalipack")
def handle_webhook():
    header = request.headers.get("X-Kigalipack-Signature", "")
    parts = dict(p.split("=", 1) for p in header.split(","))
    timestamp = int(parts["t"])
    signature = parts["v1"]

    if abs(time.time() - timestamp) > 300:
        abort(401, "Replay protection: timestamp expired")

    raw_body = request.get_data(as_text=True)
    signed = f"{timestamp}.{raw_body}"
    expected = hmac.new(
        WEBHOOK_SECRET.encode(), signed.encode(), hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected, signature):
        abort(401, "Invalid signature")

    return {"received": True}, 200`,
  },
  go: {
    label: "Go",
    language: "go",
    code: `package main

import (
  "crypto/hmac"
  "crypto/sha256"
  "encoding/hex"
  "io"
  "net/http"
  "os"
  "strings"
  "time"
)

func verifyWebhook(rawBody []byte, header string) bool {
  secret := os.Getenv("WEBHOOK_SECRET")
  parts := map[string]string{}
  for _, p := range strings.Split(header, ",") {
    kv := strings.SplitN(strings.TrimSpace(p), "=", 2)
    if len(kv) == 2 {
      parts[kv[0]] = kv[1]
    }
  }

  ts, _ := strconv.ParseInt(parts["t"], 10, 64)
  if abs(time.Now().Unix()-ts) > 300 {
    return false
  }

  mac := hmac.New(sha256.New, []byte(secret))
  mac.Write([]byte(fmt.Sprintf("%d.%s", ts, rawBody)))
  expected := hex.EncodeToString(mac.Sum(nil))
  return hmac.Equal([]byte(expected), []byte(parts["v1"]))
}`,
  },
} as const;

export type WebhookSnippetId = keyof typeof WEBHOOK_VERIFICATION_SNIPPETS;
