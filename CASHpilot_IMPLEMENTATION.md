# CashPilot --- Implementation Plan for Antigravity

**Project:** CashPilot --- Cash-flow autopilot for solo service
businesses\
**Hackathon:** PayPal AI Hackathon 2026\
**Owner:** Solo developer\
**Primary prize target:** Best Use of PayPal + AI\
**Secondary target:** Best Demo Delivery\
**Sponsor technology:** AG Grid\
**Hosting:** Vercel\
**Status:** Planning baseline --- implement in small, verified phases

> IMPORTANT TIME NOTE: The hackathon deadline is extremely close.
> Prioritize a reliable end-to-end demo over feature completeness.
> Confirm the exact deadline and submission requirements on the official
> Devpost page before spending time on optional features.

------------------------------------------------------------------------

## 1. Product goal

CashPilot helps freelancers understand whether expected client payments
will cover upcoming expenses and what work they should prioritize when a
payment is late.

The MVP must demonstrate this complete loop:

1.  A freelancer creates a client/project with milestones.
2.  CashPilot creates a genuine PayPal Sandbox payment request.
3.  A Sandbox buyer approves and pays.
4.  PayPal notifies CashPilot through a verified webhook.
5.  CashPilot updates the payment record exactly once.
6.  The backend recalculates actual and projected cash flow.
7.  The dashboard displays the changed financial state using AG Grid.
8.  CashPilot recommends a revised work plan when a payment is late.
9.  The freelancer reviews and approves any schedule changes.

The product must clearly distinguish actual Sandbox payment events,
seeded demo data, and forecasts. Never show a simulated payment as a
real PayPal payment.

## 2. Decisions already made

  -----------------------------------------------------------------------
  Decision                            Choice
  ----------------------------------- -----------------------------------
  Developer                           Solo

  Repository                          Create a fresh GitHub repository

  Prize focus                         Best Use of PayPal + AI; Best Demo
                                      Delivery

  Sponsor technology                  AG Grid

  Payments                            PayPal Sandbox

  Frontend                            Next.js + React + TypeScript

  Backend                             Next.js Route Handlers /
                                      server-side modules

  Styling                             Tailwind CSS

  Financial grid                      AG Grid Community initially

  Database                            PostgreSQL on Neon

  Hosting                             Vercel

  AI                                  Gemini API free tier if available
                                      for the account/region; keep
                                      provider replaceable

  Source control                      GitHub

  License                             MIT

  Demo data                           One freelancer, three clients,
                                      seeded starting balance and
                                      expenses

  Payment data                        Actual PayPal Sandbox
                                      orders/captures for the live
                                      payment path

  Chat copilot                        Excluded from MVP

  Negotiation emails                  Excluded from MVP

  ML late-payment risk scoring        Excluded from MVP

  Scenario                            One "What if Client B pays 14 days
                                      late?" action, only if core flow
                                      works

  Bryntum                             Excluded from MVP; do not install
                                      unless the complete core loop is
                                      finished
  -----------------------------------------------------------------------

### Clarification on deployment

The preferred submission is a **hosted demo URL** on Vercel, because
PayPal webhooks need a publicly reachable HTTPS endpoint. Also include
local setup instructions in the GitHub README as a backup. Hosting on
Vercel does not mean claiming a Vercel sponsor prize.

### Why Next.js

Use one TypeScript codebase for the UI and server routes. This reduces
integration overhead for a solo developer and aligns with PayPal's
TypeScript examples. Do not add a separate FastAPI service unless a
concrete blocker makes it necessary.

### Why AG Grid Community first

Start with AG Grid Community to avoid trial/license setup becoming a
blocker. Use it as a real interactive financial data grid. Check the
official hackathon AG Grid sponsor page and license requirements before
claiming any AG Grid sponsor prize. If the prize requires AG Studio or
another paid/trial feature, request its trial immediately and verify the
exact required integration. Do not assume ordinary AG Grid Community
qualifies for an AG Studio-specific prize.

------------------------------------------------------------------------

## 3. Architecture

``` text
Browser (Next.js UI)
       |
       | HTTPS
       v
Next.js server routes / server-side services
       |
       +------ Gemini API (project extraction / explanation / replanning proposal)
       |
       +------ PayPal Sandbox REST API
       |              |
       |              +---- Buyer approves and pays
       |              |
       |              +---- PayPal webhook ----> /api/webhooks/paypal
       |
       +------ PostgreSQL (Neon)
                      |
                      +---- clients
                      +---- projects
                      +---- milestones
                      +---- payment orders/captures
                      +---- webhook event log
                      +---- expenses and starting balance
                      +---- tasks and schedule revisions

UI:
- Overview / cash-flow dashboard
- Clients and projects
- Milestones and payment requests
- AG Grid financial transaction / invoice table
- Cash-flow forecast and 14-day scenario
- AI-generated replanning proposal
```

### Recommended stack

-   Next.js App Router, React, TypeScript.
-   Tailwind CSS for styling.
-   AG Grid Community for the financial grid.
-   PostgreSQL hosted on Neon.
-   Prisma ORM (or Drizzle if the developer prefers it; choose one and
    do not mix).
-   PayPal REST API using server-side `fetch` or the official supported
    SDK where suitable.
-   Gemini API behind a server-side provider module.
-   Vercel deployment.
-   GitHub repository with MIT license.

Use current stable compatible package versions. Do not copy outdated
setup commands blindly.

------------------------------------------------------------------------

## 4. Data model

Use PostgreSQL. Store monetary values as integer minor units (for
example, cents) or PostgreSQL `numeric`, never JavaScript floating-point
arithmetic for financial totals. Store currency explicitly (MVP
currency: USD, unless the PayPal Sandbox app and chosen API flow support
another currency consistently).

Suggested tables:

### `clients`

-   `id`
-   `name`
-   `email`
-   `created_at`

### `projects`

-   `id`
-   `client_id`
-   `name`
-   `description`
-   `total_amount`
-   `currency`
-   `status`
-   `start_date`
-   `end_date`
-   `created_at`

### `milestones`

-   `id`
-   `project_id`
-   `name`
-   `amount`
-   `due_date`
-   `status` (`planned`, `payment_pending`, `paid`, `late`)
-   `paypal_order_id` (nullable)
-   `paypal_capture_id` (nullable)

### `payments`

-   `id`
-   `client_id`
-   `project_id`
-   `milestone_id`
-   `paypal_order_id`
-   `paypal_capture_id`
-   `amount`
-   `currency`
-   `status`
-   `approval_url`
-   `created_at`
-   `paid_at`

### `webhook_events`

-   `id`
-   `paypal_event_id` (unique)
-   `event_type`
-   `resource_id`
-   `processing_status`
-   `received_at`
-   `processed_at`
-   `error_message`

### `expenses`

-   `id`
-   `description`
-   `amount`
-   `due_date`
-   `category`
-   `is_seeded`

### `cash_accounts`

-   `id`
-   `label`
-   `opening_balance`
-   `currency`

### `tasks`

-   `id`
-   `project_id`
-   `milestone_id` (nullable)
-   `title`
-   `start_date`
-   `end_date`
-   `priority`
-   `status`
-   `is_payment_dependent`

### `schedule_proposals`

-   `id`
-   `reason`
-   `proposal_json`
-   `status` (`pending`, `approved`, `rejected`)
-   `created_at`
-   `approved_at`

Adjust this schema if a simpler safe design is needed, but preserve
unique webhook event IDs and payment references.

------------------------------------------------------------------------

## 5. Financial correctness and business rules

These rules are mandatory:

1.  All financial arithmetic runs on the server using decimal-safe
    arithmetic or integer minor units.
2.  The LLM must never calculate or invent balances.
3.  Actual received money comes only from a verified PayPal
    capture/payment event or a server-side verified capture response.
4.  A payment approval page being opened is not proof of payment.
5.  Forecasts are separate from actual balances.
6.  Seeded opening balance and seeded expenses must be labelled as demo
    assumptions.
7.  A webhook may be delivered more than once. Process each PayPal event
    idempotently using a unique event ID and database transaction.
8.  Verify webhook signatures with PayPal's verification API before
    trusting the event.
9.  Never expose PayPal client secret, database URL, or AI key in
    browser code.
10. Never accept amount, currency, or payment status from the browser as
    authoritative. Validate against server-side project/milestone data
    and PayPal API responses.
11. Store webhook payloads carefully; avoid unnecessary personal data.
12. Do not claim the freelancer's real bank balance is connected. The
    MVP uses a seeded starting balance and seeded expenses.

### Cash-flow calculation

For each date in the forecast horizon:

`projected_balance = opening_balance + confirmed_inflows_by_date - scheduled_expenses_by_date`

Show confirmed/received money separately from expected/unpaid invoices.
A forecast may include expected payments, but label them as expected and
make assumptions visible.

For the 14-day late scenario, move the selected expected payment date by
14 days and recalculate the forecast. Do not mutate the real invoice or
payment status when running a what-if scenario.

------------------------------------------------------------------------

## 6. PayPal implementation approach

Prefer a genuine PayPal Sandbox Orders flow for the MVP if it is the
fastest reliable path:

1.  Server obtains OAuth access token using Sandbox client ID and
    secret.
2.  Server creates an order using a server-calculated amount and
    currency.
3.  UI sends the user to the returned PayPal approval URL (or uses the
    PayPal JS SDK if time permits).
4.  Buyer signs in with a Sandbox personal account and approves.
5.  Server captures the order after approval.
6.  Server records the capture response.
7.  PayPal webhook is configured to notify the deployed HTTPS endpoint.
8.  Webhook signature is verified using PayPal's verification endpoint.
9.  Event ID is inserted into `webhook_events`; duplicate event IDs are
    ignored safely.
10. A valid completed capture updates payment/milestone status and
    triggers cash-flow recalculation.

Use the correct PayPal Sandbox API base URL and official API
documentation. Do not invent endpoint paths or webhook event names.
Confirm the exact event types needed for the chosen Orders API flow.

If the full webhook setup cannot be completed in time, the capture
response may update the payment state as a verified server-side
fallback, but the final demo must clearly state whether webhook
processing is live. Do not fake a webhook.

Keep credentials in environment variables: - `PAYPAL_CLIENT_ID` -
`PAYPAL_CLIENT_SECRET` - `PAYPAL_BASE_URL` (Sandbox) -
`PAYPAL_WEBHOOK_ID` - Any other values required by the chosen SDK/API.

------------------------------------------------------------------------

## 7. AI implementation

AI is for structured extraction and recommendations, not accounting.

### MVP AI functions

1.  **Project extraction:** Convert a short client brief into structured
    JSON:
    -   project name
    -   deliverables
    -   milestones
    -   suggested due dates
    -   suggested payment split
    -   missing information/questions
2.  **Replanning proposal:** Given actual backend-provided payment
    statuses, project tasks, due dates and constraints, propose:
    -   tasks to keep
    -   tasks to delay
    -   revised dates
    -   dependencies affected
    -   concise explanation

Validate all AI output against a schema. Reject invalid dates, negative
amounts, unknown task IDs and impossible schedules. The user must
approve proposals before changes are saved.

### Provider and fallback

Check whether Gemini API free-tier access is available to this account
and region, and review current rate limits. Keep the AI integration
behind a provider module so another provider can be substituted. If no
key is available, the app must still work with deterministic
templates/rules and clearly label those recommendations as rule-based
rather than AI-generated.

Do not put API keys in client components or commit `.env` files.

------------------------------------------------------------------------

## 8. UI pages

Build a clean, modern, credible SaaS interface. Avoid excessive
gradients, decorative animations and fake metrics.

### Page 1: Overview

-   Current demo cash balance.
-   Expected incoming payments.
-   Upcoming expenses.
-   Projected end-of-month balance.
-   At-risk cash-flow warning.
-   Recent payment activity.
-   Clear labels for actual vs expected vs forecast.

### Page 2: Projects

-   Three seeded clients/projects.
-   Project details and deliverables.
-   Milestone payment amounts and dates.
-   Create project from brief using AI extraction.

### Page 3: Payments

-   Milestone payment requests.
-   PayPal Sandbox approval link.
-   Status: pending, approved, captured/paid, failed or overdue as
    applicable.
-   AG Grid table with sorting/filtering.

### Page 4: Cash Flow

-   Cash inflow/outflow forecast.
-   Upcoming expense list.
-   14-day delay scenario button.
-   Compare baseline forecast with delayed-payment scenario.

### Page 5: Action Plan

-   AI/rule-based suggested task changes.
-   Explanation of why a task is affected.
-   Approve/reject proposal.
-   Show updated dates after approval.

------------------------------------------------------------------------

## 9. Implementation phases

Work in this exact order. Each phase must be tested before moving on.
Keep the app runnable after every phase.

### Phase 0 --- Verify requirements and bootstrap

-   Check official hackathon deadline, submission requirements and AG
    Grid sponsor rules.
-   Create a fresh GitHub repository.
-   Add MIT license, `.gitignore`, README and `.env.example`.
-   Create Next.js TypeScript app.
-   Add Tailwind.
-   Deploy a blank but working app to Vercel.
-   Confirm deployment URL works.

**Exit condition:** Fresh GitHub repo and a working public Vercel
deployment.

### Phase 1 --- Database and seeded demo

-   Create Neon PostgreSQL database.
-   Configure ORM and migrations.
-   Create tables.
-   Seed one freelancer, three clients, projects, milestones, opening
    balance, expenses and tasks.
-   Build dashboard using database data, not hardcoded frontend arrays.

**Exit condition:** Refreshing the page still shows the seeded records
from PostgreSQL.

### Phase 2 --- Dashboard and AG Grid

-   Build Overview, Projects, Payments, Cash Flow and Action Plan pages.
-   Integrate AG Grid Community for payments/receivables.
-   Add filters, sorting and status indicators.
-   Add forecast chart and clear actual/expected/forecast distinctions.
-   Use responsive layout.

**Exit condition:** A judge can understand the product and inspect
meaningful data without needing a payment first.

### Phase 3 --- PayPal Sandbox payment flow

-   Create PayPal Developer app and Sandbox business/personal accounts.
-   Add server-side OAuth token retrieval.
-   Create order from a selected milestone.
-   Show the PayPal approval URL.
-   Approve using Sandbox buyer account.
-   Capture order server-side.
-   Persist order and capture IDs and statuses.
-   Display payment result.

**Exit condition:** A real Sandbox buyer can complete a payment and the
app records the verified capture.

### Phase 4 --- Webhooks and idempotency

-   Configure a public webhook endpoint on Vercel.
-   Register the webhook in PayPal Developer Dashboard.
-   Verify signatures with PayPal.
-   Process the relevant completed-capture event.
-   Store event IDs uniquely.
-   Handle duplicate deliveries safely.
-   Update payment/milestone state and refresh the dashboard.

**Exit condition:** A genuine PayPal webhook is verified, recorded and
reflected in the app. Demonstrate duplicate-event safety if feasible.

### Phase 5 --- Cash-flow forecast and scenario

-   Implement deterministic cash-flow calculation.
-   Show actual balance and forecast separately.
-   Add 14-day delayed-payment scenario.
-   Compare baseline and delayed forecast.
-   Explain which expense/date creates a projected cash gap.

**Exit condition:** Changing a payment's expected date changes the
forecast correctly without changing actual payment records.

### Phase 6 --- AI extraction and replanning

-   Add Gemini provider module if a usable free tier/key is available.
-   Extract a project brief into validated structured JSON.
-   Generate a task-replanning proposal from backend data.
-   Validate proposal against real task IDs, dependencies and dates.
-   Require user approval before saving schedule changes.
-   Provide deterministic fallback if AI is unavailable.

**Exit condition:** A user can paste a brief, receive a structured
proposal, and approve a safe replanning recommendation.

### Phase 7 --- Polish, deploy and submit

-   Test all critical paths.
-   Fix errors and loading states.
-   Confirm secrets are not exposed.
-   Confirm Vercel environment variables and production database.
-   Test PayPal against the deployed webhook URL.
-   Add README setup and demo instructions.
-   Record a 2--3 minute demo.
-   Submit before the official deadline.

**Exit condition:** Public demo URL, working GitHub repository, demo
video and completed Devpost submission.

------------------------------------------------------------------------

## 10. Demo scenario

Use a single freelancer called Priya with three clients.

Seed: - A starting cash balance. - A rent/operating expense due on the
25th. - Three projects with different milestone dates. - One pending
payment from Client B that is expected before rent. - One or more other
confirmed/expected inflows.

Demo sequence:

1.  Show Priya's overview and forecast.
2.  Open Client A's project and create a milestone payment request.
3.  Open the PayPal Sandbox approval page.
4.  Pay using the Sandbox buyer account.
5.  Return to CashPilot and show the captured payment.
6.  Show the verified webhook event and updated payment status.
7.  Show the updated cash forecast.
8.  Select "What if Client B pays 14 days late?"
9.  Show the projected cash gap.
10. Ask CashPilot to propose a revised work plan.
11. Review and approve the suggested changes.
12. Show the updated tasks and explain the financial reason.

Never stage a fake successful PayPal transaction. Seeded data is
acceptable for the starting scenario, but clearly label it as demo data.

------------------------------------------------------------------------

## 11. Security and reliability checklist

-   [ ] `.env` is ignored by Git.
-   [ ] `.env.example` contains names only, no secrets.
-   [ ] PayPal secret is server-side only.
-   [ ] AI API key is server-side only.
-   [ ] Webhook signature verification is implemented.
-   [ ] Webhook processing is idempotent.
-   [ ] Amount and currency are validated server-side.
-   [ ] Payment status is not trusted from browser input.
-   [ ] Financial calculations use decimal-safe arithmetic.
-   [ ] AI output is schema-validated.
-   [ ] Schedule changes require user approval.
-   [ ] Errors are visible and actionable.
-   [ ] No fake payment success state is presented as real.

------------------------------------------------------------------------

## 12. GitHub and submission

Repository name: `cashpilot`

License: MIT.

README must include: - Product pitch. - Problem and target users. -
Features. - Architecture diagram. - Technology stack. - PayPal Sandbox
integration explanation. - AG Grid integration explanation. - Setup
instructions. - Environment variables (names only). - Demo URL. - Demo
video link. - Known limitations and future scope.

Do not claim features that are not implemented. Clearly disclose that
the app uses Sandbox transactions and seeded starting balance/expenses.

------------------------------------------------------------------------

# 13. Instructions for Antigravity

You are the implementation agent. Follow these operating rules:

1.  Read this entire plan before making changes.
2.  Start by inspecting the current workspace and checking whether it is
    empty.
3.  Do not overwrite existing user files without checking.
4.  Work one phase at a time in the order above.
5.  Before each phase, state the goal, files to create/change,
    dependencies and acceptance tests.
6.  Implement the phase, run the relevant checks and fix errors.
7.  Do not claim a feature works unless you have actually tested it.
8.  Keep the application runnable after every phase.
9.  Do not add unnecessary packages or architecture.
10. Do not add Bryntum, AG Studio, a separate FastAPI server, bank
    integrations, authentication or unrelated features unless explicitly
    approved.
11. Do not use mock payment success for the real PayPal flow.
12. Use environment variables for secrets.
13. Commit logical milestones to Git where possible.
14. If blocked, explain the exact blocker, provide the simplest
    alternatives and wait for a decision if the choice changes
    architecture or security.
15. Never silently skip a failed test.

## Start instruction

Begin with **Phase 0 only**.

First inspect the workspace and report: - What files already exist. -
Whether the directory is empty. - What tools/runtime versions are
installed. - What accounts, credentials or external setup are needed. -
Any conflicts between this plan and current hackathon requirements.

Then propose the exact Phase 0 actions. Do not begin Phase 1 until Phase
0 is complete and verified.

**The priority is a deployed, genuine PayPal Sandbox
payment-to-cash-flow workflow, not maximum feature count.**
