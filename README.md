# BillPal

> **Cash-flow autopilot for solo service businesses.**  
> Built for the **PayPal AI Hackathon 2026** (Prize Focus: *Best Use of PayPal + AI* and *Best Demo Delivery*).

---

## 1. Product Overview

Freelancers and solo agencies frequently struggle with cash flow: will scheduled client payments arrive in time to cover upcoming rent and business expenses? When an invoice is delayed, what tasks should be prioritized?

**BillPal** connects project milestones to authentic PayPal Sandbox checkouts, listens for verified PayPal webhooks, dynamically updates decimal-safe cash balance forecasts, and leverages AI to propose rescheduled work timelines when payments slip.

---

## 2. Core Architecture

```text
Browser (Next.js UI + AG Grid Community)
       |
       | HTTPS
       v
Next.js Server Handlers / Services
       |
       +------ PayPal Sandbox REST API (OAuth token, Order creation, Capture)
       |              |
       |              +---- Sandbox Buyer checkout
       |              +---- PayPal Webhooks -> /api/webhooks/paypal (Verified signatures)
       |
       +------ PostgreSQL (Neon Database)
       |              +---- Clients, Projects, Milestones, Payments
       |              +---- Webhook Event Log (Idempotent processing)
       |              +---- Expenses, Tasks & Schedule Proposals
       |
       +------ Gemini AI Provider (Structured extraction & replanning)
```

---

## 3. Technology Stack

- **Framework:** Next.js (App Router), React, TypeScript
- **Styling:** Tailwind CSS
- **Interactive Data Grid:** AG Grid Community
- **Database & ORM:** PostgreSQL (Neon) with Prisma ORM
- **Payments:** PayPal Sandbox REST API (v2/checkout/orders, webhooks)
- **AI Engine:** Google Gemini API (structured schema validation with deterministic fallback)
- **Deployment:** Vercel

---

## 4. PayPal Sandbox Integration Details

BillPal implements a strict, genuine PayPal Sandbox integration:
1. **Server-Side Authentication:** Obtains OAuth 2.0 bearer tokens via client ID and secret.
2. **Order Creation:** Generates Sandbox checkout orders directly tied to project milestone IDs.
3. **Approval & Capture:** Directs buyers to genuine PayPal approval links; server captures funds upon completion.
4. **Webhook Verification:** Incoming notifications at `/api/webhooks/paypal` verify cryptographic signatures against PayPal's verification API.
5. **Idempotent Processing:** Unique event IDs are recorded in the database to safely ignore duplicate deliveries.
6. **Integrity Rule:** No simulated or faked payment states—actual balances update only upon genuine capture verification.

---

## 5. AG Grid Integration

AG Grid Community provides high-performance, interactive financial ledgers for:
- Accounts receivable tracking
- Milestone payment status with conditional color formatting
- Sorting, filtering, and instant reconciliation against cash-flow projection models

---

## 6. Local Development Setup

### Prerequisites
- Node.js (v20+ or v22+ LTS)
- pnpm (`npm install -g pnpm`)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/billpal.git
   cd billpal
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env.local
   ```
   Provide your values in `.env.local` (see table below).

4. **Run the local development server:**
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Environment Variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `PAYPAL_CLIENT_ID` | PayPal Developer Sandbox App Client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal Developer Sandbox App Secret |
| `PAYPAL_BASE_URL` | Sandbox Base URL (`https://api-m.sandbox.paypal.com`) |
| `PAYPAL_WEBHOOK_ID` | Registered PayPal Webhook ID |
| `GEMINI_API_KEY` | Google Gemini API Key |
| `NEXT_PUBLIC_APP_URL` | Base application URL (local or Vercel production URL) |

---

## 8. Live Demo & Video

- **Deployed URL:** *Pending Vercel configuration (Phase 0 exit)*
- **Demo Video:** *To be linked upon completion*

---

## 9. Known Limitations & Roadmap

- The MVP relies on a seeded starting cash balance and operating expenses (rent) for baseline simulation.
- Real bank feed aggregation is out of scope for the hackathon MVP.
- Currency is strictly USD in the sandbox environment.

---

## 10. License

Distributed under the [MIT License](LICENSE).
