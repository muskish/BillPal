# BillPal 🚀

> **Cash-flow autopilot for solo service businesses.**  
> Built for the **PayPal AI Hackathon 2026**  
> **Primary Prize Target:** *Best Use of PayPal + AI*  
> **Secondary Target:** *Best Demo Delivery*  
> **Sponsor Technology:** AG Grid Community  
> **Live Demo URL:** [https://bill-pal.vercel.app](https://bill-pal.vercel.app)  
> **GitHub Repository:** [https://github.com/muskish/BillPal](https://github.com/muskish/BillPal)  

---

## 1. Product Overview & Problem Statement

Freelancers and solo agencies frequently face cash runway crises: will expected client payments clear in time to cover upcoming rent and operating expenses? When a milestone payment is delayed, what uncompensated work should be halted immediately?

**BillPal** connects client project milestones directly to genuine PayPal Sandbox checkouts, verifies server-to-server PayPal webhooks with cryptographic signatures, dynamically projects decimal-safe cash runways without accounting errors, and leverages **Google Gemini 2.5 Flash** to extract client briefs and propose safe work replanning schedules.

---

## 2. Core Architecture

```text
Browser (Next.js 15 App Router + AG Grid Community)
       │
       │ HTTPS
       ▼
Next.js Server Route Handlers & Provider Services
       │
       ├──► PayPal Sandbox REST API (OAuth 2.0, Order Creation, Server Capture)
       │       │
       │       ├──► Sandbox Buyer Approval Checkout
       │       └──► PayPal Webhooks ──► POST /api/webhooks/paypal (Cryptographically Verified)
       │
       ├──► Google Gemini 2.5 Flash Provider Module (Structured Schema Extraction & Work Replanning)
       │
       └──► Neon PostgreSQL Cloud Database (via Prisma ORM)
               ├── clients, projects & deliverables
               ├── milestones & authentic PayPal payment capture records
               ├── webhook_events log (idempotent duplicate prevention)
               ├── expenses & operating cash accounts
               └── tasks & human-approved schedule proposals
```

---

## 3. PayPal Sandbox Integration Details (Highest Priority)

BillPal implements a strict, genuine PayPal Sandbox integration:
1. **Server-Side Authentication:** Securely fetches OAuth 2.0 bearer tokens using client credentials (`https://api-m.sandbox.paypal.com/v1/oauth2/token`).
2. **Order Creation:** Generates Sandbox checkout orders (`POST /v2/checkout/orders`) tied to milestone IDs with server-validated integer cents.
3. **Buyer Approval & Capture:** Buyers approve checkout via genuine PayPal Sandbox checkout pages; the server executes `POST /v2/checkout/orders/{id}/capture` upon redirect.
4. **Cryptographic Webhook Verification:** Incoming events at `/api/webhooks/paypal` verify transmission headers against PayPal's verification endpoint (`/v1/notifications/verify-webhook-signature`).
5. **Idempotency & Duplicate Safety:** Every event ID is logged in `webhook_events`. Duplicate deliveries are recognized and safely ignored without double-crediting balances.
6. **Financial Integrity Rule:** Never fakes payment success; actual balances update only upon verified capture responses or verified webhooks.

---

## 4. AG Grid Community Integration (Sponsor Technology)

The **Accounts Receivable & PayPal Ledger** (`/payments`) uses **AG Grid Community**:
- Interactive client-side filtering and real-time quick search across clients and deliverables.
- Column sorting by milestone amount, due date, client name, and payment status.
- Custom styled badge cell renderers for `Paid (Captured)`, `Payment Pending`, and `Planned`.
- Direct one-click action to launch genuine PayPal Sandbox checkout.

---

## 5. Google Gemini 2.5 Flash AI Engine

1. **Brief-to-Milestone Extraction (`/projects`):**
   - Ingests raw client briefs and emails.
   - Converts unstructured text into validated JSON: project deliverables, milestone amounts, and suggested due dates.
   - Saves generated milestones directly into Neon PostgreSQL.
2. **Intelligent Work Replanning (`/action-plan`):**
   - Automatically detects cash runway shortfalls when client payments are delayed before rent day.
   - Proposes which tasks to delay (+14 days) and which tasks to keep on schedule.
   - **Human-in-the-Loop:** Requires explicit freelancer review and approval before database updates are applied.
   - Includes guaranteed deterministic rule-based fallback if no AI key is provided.

---

## 6. Demo Persona & 2-Minute Judging Walkthrough

- **Freelancer:** Muskan Shaikh (Solo UX & Product Consultant)
- **Starting Cash:** $4,500.00 in primary operating account
- **Operating Rent:** $2,200.00 due on the 25th
- **Clients:**
  - **Acme Corp:** Mobile App Design System ($7,000 total) &mdash; Milestone 1 ($3,500)
  - **NovaTech Labs:** Cloud UX Audit ($8,000 total) &mdash; Milestone 1 ($4,000) due on the 20th
  - **Zenith Studio:** Design Advisory Retainer ($1,800) &mdash; Verified Captured

### Recommended 2-Minute Demo Sequence:
1. **Overview (`/`):** Inspect Muskan's cash position ($6,300), expected receivables ($7,500), and the timing vulnerability alert regarding rent on the 25th.
2. **Projects (`/projects`):** Click **"Extract Brief with Gemini AI"** &rarr; load sample brief &rarr; extract structured deliverables and milestones.
3. **Payments (`/payments`):** Inspect the AG Grid Community ledger. Click **"PayPal Checkout"** on Acme Corp ($3,500) to test genuine sandbox approval and view the live capture ID!
4. **Webhook Audit Log (`/payments`):** Scroll to the bottom to verify incoming webhook events with cryptographic verification status and idempotency audit badges.
5. **Cash Flow (`/cash-flow`):** Toggle **"+14 Days Delayed Scenario"** &rarr; watch the 30-day runway curve dip into deficit on rent day (Day 25).
6. **Action Plan (`/action-plan`):** Review the AI replanning proposal to pause payment-dependent tasks, click **"Approve & Apply Schedule Changes"**, and view the updated schedule.

---

## 7. Local Development Setup

### Prerequisites
- Node.js (v20+ or v22+ LTS)
- pnpm (`npm install -g pnpm`)
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/muskish/BillPal.git
cd BillPal

# 2. Install dependencies
pnpm install

# 3. Configure environment variables
cp .env.example .env.local
# Populate DATABASE_URL, PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, and GEMINI_API_KEY in .env.local

# 4. Generate Prisma client & push schema
pnpm prisma db push

# 5. Seed Muskan's demo dataset
pnpm prisma db seed

# 6. Run local development server
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 8. Environment Variables Reference

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL pooled connection string |
| `DIRECT_URL` | Neon PostgreSQL direct connection string (migrations) |
| `PAYPAL_CLIENT_ID` | PayPal Developer Sandbox App Client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal Developer Sandbox App Secret |
| `PAYPAL_BASE_URL` | `https://api-m.sandbox.paypal.com` |
| `PAYPAL_WEBHOOK_ID` | Registered PayPal Webhook ID |
| `GEMINI_API_KEY` | Google Gemini 2.5 Flash API Key |
| `NEXT_PUBLIC_APP_URL` | Base application URL (`https://bill-pal.vercel.app` or `http://localhost:3000`) |

---

## 9. License

Distributed under the [MIT License](LICENSE).
