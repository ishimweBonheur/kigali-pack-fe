# Kigali-Pack Cloud Console

<p align="center">
  <img src="./public/logo.svg" width="140" alt="Kigali-Pack"/>
</p>

<h1 align="center">Kigali-Pack Cloud Console</h1>

<p align="center">
Developer Platform for building Rwanda-ready applications faster.
</p>

<p align="center">
Locations • Compliance • Sandbox Payments • Analytics • Webhooks
</p>

---

## Overview

Kigali-Pack Cloud Console is a production-grade Developer Experience (DX) platform built to help software engineers integrate Rwanda-focused infrastructure without rebuilding core services.

The platform provides:

* Administrative Locations API
* Compliance Sandbox (NIDA + RRA)
* Payment Simulation
* Analytics
* API Key Management
* Billing
* Organizations
* Webhooks
* Developer Workspace

---

## Stack

Frontend

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS
* shadcn/ui
* React Query
* Axios
* Chart.js
* Framer Motion

Backend

* NestJS
* PostgreSQL
* TypeORM
* JWT
* Swagger

---

## Project Structure

```txt
src
├── app
│   ├── (public)
│   ├── (auth)
│   ├── (dashboard)
│   ├── docs
│   └── pricing
│
├── components
├── features
├── services
├── providers
├── schemas
├── types
└── lib
```

---

## Features

### Public Portal

* Landing Page
* Pricing
* Documentation
* Get Started
* Examples

### Authentication

* Register
* Login
* Refresh Token
* Password Recovery

### Dashboard

* Analytics
* API Keys
* Billing
* Payments
* Organizations
* Profile
* Webhooks

### Developer Experience

* API Playground
* Interactive Docs
* Code Samples
* Copy-to-Clipboard
* Syntax Highlighting

---

## Environment

Create:

`.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:3000

AUTH_SECRET=change_me

AUTH_URL=http://localhost:3001
```

---

## Installation

Install dependencies:

```bash
npm install
```

Run development:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Start:

```bash
npm start
```

---

## Using Kigali-Pack APIs

Developers do NOT need source code.

Generate API key:

Dashboard

→ API Keys

→ Create Key

Example:

```bash
curl \
-H "Authorization: Bearer kp_live_xxxxx" \
https://api.kigalipack.rw/v1/locations/root-provinces
```

Response:

```json
{
  "success": true,
  "data": [
    {
      "name": "Kigali City"
    }
  ]
}
```

---

## API Examples

Locations

```http
GET /v1/locations/root-provinces
```

Compliance

```http
GET /v1/compliance/nida/mock/{nationalId}
```

Payments

```http
POST /v1/sandbox/payments/charge
```

Analytics

```http
GET /v1/developer/analytics/summary
```

---

## Deployment

Frontend:

```bash
vercel
```

Backend:

```bash
docker compose up
```

Domains:

```txt
dashboard.kigalipack.rw
api.kigalipack.rw
docs.kigalipack.rw
```

---

## Security

Implemented:

* JWT
* API Keys
* Rate Limiting
* Audit Logs
* Role Guards
* Request IDs
* Webhook Verification

---

## Roadmap

Phase 1

Completed

* Backend APIs
* Stabilization
* Security

Phase 2

In Progress

* Public Website
* Docs
* Dashboard

Phase 3

Planned

* SDK
* CLI
* npm package
* AI Playground

---

## Contributing

Fork

Create branch

Commit

Open Pull Request

---

## License

MIT

---

Built for developers building Rwanda.
