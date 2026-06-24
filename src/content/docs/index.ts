export interface DocSection {
  slug: string;
  title: string;
  description: string;
  category?: string;
  content: string;
  codeExamples?: Array<{
    label: string;
    language: string;
    code: string;
  }>;
}

export const DOC_SECTIONS: DocSection[] = [
  {
    slug: "introduction",
    title: "Introduction",
    description: "Overview of the Kigali-Pack Cloud Engine platform.",
    content: `Kigali-Pack Cloud Engine is a developer infrastructure platform built for Rwanda. It provides administrative location data, compliance sandboxes, mock payment simulation, analytics, webhooks, and billing — all through a unified REST API.

## What you can build

- Address validation and location hierarchy lookups
- Identity verification flows with NIDA sandbox
- RRA tax and payroll calculations
- MTN MoMo / Airtel Money payment simulation
- Production-grade webhook delivery and analytics

## Base URL

\`\`\`
${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}
\`\`\`

All responses follow a consistent envelope:

\`\`\`json
{
  "success": true,
  "message": "Request completed successfully",
  "data": { }
}
\`\`\``,
  },
  {
    slug: "quick-start",
    title: "Quick Start",
    description: "Get up and running in minutes.",
    content: `## 1. Get started

Create an organization and owner account at **/get-started** (interactive wizard) or via \`POST /v1/auth/register\`.

## 2. Generate an API Key

Navigate to **Dashboard → API Keys** and create a \`TEST\` or \`SANDBOX\` key. The raw token is shown once — store it securely.

## 3. Call an endpoint

Use your key as a Bearer token. Public endpoints like \`GET /v1/locations/root-provinces\` require no authentication.`,
    codeExamples: [
      {
        label: "curl",
        language: "bash",
        code: `curl ${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/v1/locations/root-provinces`,
      },
      {
        label: "JavaScript",
        language: "javascript",
        code: `const res = await fetch("${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/v1/locations/root-provinces");
const { data } = await res.json();
console.log(data);`,
      },
      {
        label: "TypeScript",
        language: "typescript",
        code: `import axios from "axios";

const { data } = await axios.get("${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/v1/locations/root-provinces");
console.log(data.data);`,
      },
    ],
  },
  {
    slug: "authentication",
    title: "Authentication",
    description: "JWT, API keys, and Bearer tokens.",
    content: `Kigali-Pack supports two authentication methods:

## JWT (Dashboard)

Login via \`POST /v1/auth/login\` to receive \`accessToken\` and \`refreshToken\`. Use the access token for billing, profile, and organization endpoints.

## API Key (Developer API)

Create keys at \`POST /v1/developer/api-keys\`. Prefixes include \`kp_test_\`, \`kp_live_\`, and \`kp_sandbox_\`.

Pass either token as:

\`\`\`
Authorization: Bearer <token>
\`\`\`

## Scopes

| Method | Use case |
|--------|----------|
| JWT | Dashboard, billing, org management |
| API Key | Locations, sandbox, analytics, webhooks |`,
    codeExamples: [
      {
        label: "Login",
        language: "bash",
        code: `curl -X POST ${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"owner@acme.rw","password":"SecurePass123!"}'`,
      },
    ],
  },
  {
    slug: "locations",
    title: "Locations",
    description: "Rwanda administrative hierarchy API.",
    content: `## Root provinces (public)

\`GET /v1/locations/root-provinces\` — no authentication required. Returns all active provinces from the NISR hierarchy.

## Children

\`GET /v1/locations/:parentId/children\` — list districts, sectors, cells, or villages under a parent unit. Requires API key or JWT.

## Normalize address

\`POST /v1/locations/normalize\` — match a raw address string against the hierarchy.`,
    codeExamples: [
      {
        label: "Provinces",
        language: "bash",
        code: `curl ${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/v1/locations/root-provinces`,
      },
    ],
  },
  {
    slug: "compliance",
    title: "Compliance",
    description: "NIDA sandbox and RRA tax engine.",
    content: `## NIDA Mock Lookup

\`GET /v1/compliance/nida/mock/:nationalId\` — sandbox identity lookup. Requires API key.

## RRA Tax

\`POST /v1/compliance/rra/taxes\` — PAYE and VAT breakdown.

\`POST /v1/compliance/rra/rssb\` — pension and maternity contributions.

\`POST /v1/compliance/rra/payroll-summary\` — full payroll summary.`,
    codeExamples: [
      {
        label: "NIDA lookup",
        language: "bash",
        code: `curl ${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/v1/compliance/nida/mock/1200780064278123 \\
  -H "Authorization: Bearer kp_test_your_key"`,
      },
    ],
  },
  {
    slug: "sandbox-payments",
    title: "Sandbox Payments",
    description: "Mock telecom payment simulation.",
    content: `## Initiate charge

\`POST /v1/sandbox/payments/charge\` — simulate MTN MoMo or Airtel Money payment.

## Test accounts

\`GET /v1/sandbox/payments/test-accounts\` — list magic amounts and test phone numbers.

## History

\`GET /v1/sandbox/payments/history\` — paginated transaction history.`,
    codeExamples: [
      {
        label: "Charge",
        language: "bash",
        code: `curl -X POST ${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/v1/sandbox/payments/charge \\
  -H "Authorization: Bearer kp_test_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phoneNumber": "0781234567",
    "amount": 5000,
    "webhookUrl": "https://example.com/webhook",
    "clientReference": "order-001"
  }'`,
      },
    ],
  },
  {
    slug: "webhooks",
    title: "Webhooks",
    description: "Register and monitor webhook deliveries.",
    content: `Register endpoints at \`POST /v1/developer/webhooks\`. Supported events include \`payment.success\`, \`payment.failed\`, and subscription events.

## V2 Signature Format

Every outbound dispatch includes:

\`\`\`
X-Kigalipack-Signature: t={unix_timestamp},v1={hmac_sha256_hex}
\`\`\`

The HMAC is computed over \`\${timestamp}.\${rawJsonBody}\` using your webhook secret. Timestamps outside a 5-minute window are rejected to prevent replay attacks.

Retry failed deliveries via \`POST /v1/developer/webhooks/deliveries/:id/retry\`.`,
  },
  {
    slug: "security-privacy",
    title: "Security & Privacy",
    category: "V2 Architecture",
    description: "Transient vs persistent data handling and developer responsibilities.",
    content: `## Where is data stored?

Kigali-Pack V2 separates **transient processing** from **persistent storage**:

| Processing mode | Examples | What we keep |
|-----------------|----------|--------------|
| **Transient** | RRA tax, RSSB payroll, phone utilities | Metadata audit logs only (method, route, status, timing, masked snapshots) |
| **Persistent** | Sandbox payments, organizations, webhook deliveries | Full records in PostgreSQL |

Transient pipelines process inputs strictly in volatile system RAM. Names, salaries, phone numbers, and national IDs are **never** written to the database.

## Metadata audit logging

\`developer_api_logs\` stores only:

- \`developerId\` (UUID)
- \`httpMethod\`, \`routePath\`, \`httpStatusCode\`, \`executionTimeMs\`
- Masked payload snapshots with PII redacted

## Do I need a Kigali-Pack DB?

**No.** You do not download our source code or copy our tables. Your clean application interacts entirely with our hosted URL using standard network calls (\`fetch\` / \`axios\`). We operate the PostgreSQL engine; you consume the API.

\`\`\`
${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}
\`\`\`

## Automated platform protection

Production deployments include scheduled \`pg_dump\` backups and emergency restore scripts. Contact your platform administrator for backup retention policies.`,
  },
  {
    slug: "webhook-signature-verification",
    title: "Webhook Verification",
    category: "V2 Architecture",
    description: "Verify inbound webhooks with HMAC-SHA256 across multiple frameworks.",
    content: `## Overview

When Kigali-Pack dispatches a webhook, your server receives:

1. The raw JSON body (exact bytes used for signing)
2. Header \`X-Kigalipack-Signature: t={timestamp},v1={hmac_hash}\`

## Verification steps

1. Read the **raw request body** before JSON parsing (use \`express.raw()\` or \`rawBody: true\` in NestJS)
2. Parse the signature header to extract \`t\` (timestamp) and \`v1\` (HMAC hex)
3. Reject if \`|now - t| > 300\` seconds (replay protection)
4. Compute \`HMAC-SHA256(secret, \`\${t}.\${rawBody}\`)\`
5. Compare using a timing-safe equality check

## Header example

\`\`\`
X-Kigalipack-Signature: t=1719230400,v1=a3f8c2d1e9b7...
X-Kigali-Pack-Event: payment.success
\`\`\`

Select a framework tab below for copy-paste verification code.`,
  },
  {
    slug: "analytics",
    title: "Analytics",
    description: "Usage metering and traffic logs.",
    content: `Access aggregated metrics at \`GET /v1/developer/analytics/summary\`.

Additional endpoints: \`/usage\`, \`/errors\`, \`/latency\`, \`/endpoints\`, and paginated \`/logs\`.`,
  },
  {
    slug: "billing",
    title: "Billing",
    description: "Plans, subscriptions, and invoices.",
    content: `## Public plans

\`GET /v1/billing/plans\` — list available plans (no auth).

## Subscribe

\`POST /v1/billing/subscriptions\` — requires JWT.`,
  },
  {
    slug: "organizations",
    title: "Organizations",
    description: "Teams, members, and RBAC.",
    content: `Manage organization members via \`GET /v1/organizations/:id/members\` and \`POST /v1/organizations/:id/members\`. Roles include \`ORG_OWNER\`, \`ADMIN\`, and \`DEVELOPER\`.`,
  },
  {
    slug: "errors",
    title: "Errors",
    description: "Error codes and handling.",
    content: `Errors return:

\`\`\`json
{
  "success": false,
  "message": "Human-readable message",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": []
  }
}
\`\`\`

Common status codes: \`400\` validation, \`401\` unauthorized, \`403\` forbidden, \`404\` not found, \`429\` rate limited.`,
  },
  {
    slug: "rate-limits",
    title: "Rate Limits",
    description: "Throttling and tier limits.",
    content: `Rate limits vary by plan. Response headers include:

- \`X-RateLimit-Limit\`
- \`X-RateLimit-Remaining\`
- \`X-RateLimit-Reset\`
- \`Retry-After\` (when exceeded)`,
  },
  {
    slug: "utilities",
    title: "Utilities",
    description: "Phone validation and sandbox test data generators.",
    content: `## Phone Intelligence

\`GET /v1/utilities/phone/validate?phone=0781234567\` — validate Rwandan mobile format.

\`GET /v1/utilities/phone/carrier\` — detect MTN or Airtel.

\`GET /v1/utilities/phone/format\` — normalize to E.164.

## Test Data

\`GET /v1/utilities/citizens/random\` — generate sandbox citizen profile.

\`GET /v1/utilities/addresses/random\` — generate sandbox address.`,
    codeExamples: [
      {
        label: "Validate phone",
        language: "bash",
        code: `curl "${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"}/v1/utilities/phone/validate?phone=0781234567" \\
  -H "Authorization: Bearer kp_test_your_key"`,
      },
    ],
  },
  {
    slug: "changelog",
    title: "Changelog",
    description: "API version history.",
    content: `## v1.0.0

- Initial release: locations, sandbox payments, compliance, analytics, webhooks, billing
- JWT auth with refresh tokens
- API key management with rotate/revoke
- Deprecated endpoint headers with sunset dates`,
  },
];

export const DOC_NAV = DOC_SECTIONS.map(({ slug, title }) => ({
  slug,
  title,
}));

export function getDocBySlug(slug: string): DocSection | undefined {
  return DOC_SECTIONS.find((d) => d.slug === slug);
}
