import React from "react";
import { getDashboardData } from "@/lib/db/queries";
import Link from "next/link";
import { 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Briefcase, 
  CreditCard, 
  ArrowRight, 
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export const dynamic = "force-dynamic";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default async function OverviewPage() {
  const data = await getDashboardData();
  const { 
    currentActualBalance, 
    totalExpectedInflow, 
    totalExpenses, 
    projectedBalance,
    clients, 
    recentPayments 
  } = data;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="glass rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold glass-pill text-white border border-white/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Solo Financial Autopilot
            </span>
            <span className="text-xs text-white/60">Muskan Shaikh &bull; UX &amp; Product Consulting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow">
            Predictive Cash Runway &amp; Milestones
          </h1>
          <p className="text-xs sm:text-sm text-white/70 max-w-2xl leading-relaxed">
            BillPal links your client deliverables to authentic PayPal Sandbox checkouts, listens for verified webhooks, and protects your cash runway before rent day.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/payments"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-sky-700 font-semibold text-xs shadow-lg hover:bg-sky-50 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Open AG Grid Ledger</span>
          </Link>
          <Link
            href="/cash-flow"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl glass-pill text-white font-semibold text-xs border border-white/30 hover:bg-white/20 transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            <span>14-Day Scenario</span>
          </Link>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Actual Cash */}
        <div className="glass p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-white/70">
            <span>Actual Cash In Bank</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
              Verified
            </span>
          </div>
          <div className="text-3xl font-black text-white mt-2 tracking-tight drop-shadow">
            {formatCents(currentActualBalance)}
          </div>
          <p className="text-[11px] text-white/55 mt-1">
            Opening balance ({formatCents(data.cashAccount?.openingBalance ?? 0)}) + verified payments
          </p>
        </div>

        {/* Expected Inflows */}
        <div className="glass p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-sky-200">
            <span>Expected Receivables</span>
            <Clock className="w-4 h-4 text-sky-200" />
          </div>
          <div className="text-3xl font-black text-sky-100 mt-2 tracking-tight drop-shadow">
            {formatCents(totalExpectedInflow)}
          </div>
          <p className="text-[11px] text-white/55 mt-1">
            2 pending milestones awaiting PayPal Sandbox clearance
          </p>
        </div>

        {/* Outflows */}
        <div className="glass p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-rose-200">
            <span>Scheduled Outflows</span>
            <AlertTriangle className="w-4 h-4 text-rose-200" />
          </div>
          <div className="text-3xl font-black text-rose-200 mt-2 tracking-tight drop-shadow">
            {formatCents(totalExpenses)}
          </div>
          <p className="text-[11px] text-white/55 mt-1">
            Rent ($2,200 due on the 25th) &amp; SaaS software
          </p>
        </div>

        {/* Projected */}
        <div className="glass p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-purple-200">
            <span>Projected Month-End</span>
            <TrendingUp className="w-4 h-4 text-purple-200" />
          </div>
          <div className="text-3xl font-black text-purple-100 mt-2 tracking-tight drop-shadow">
            {formatCents(projectedBalance)}
          </div>
          <p className="text-[11px] text-white/55 mt-1">
            Baseline forecast assuming on-time client payments
          </p>
        </div>
      </section>

      {/* At-Risk Warning */}
      <div className="glass p-4 rounded-xl border border-amber-300/30 flex items-start gap-3 bg-amber-400/10">
        <AlertTriangle className="w-5 h-5 text-amber-200 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-amber-100">
            Cash Runway Timing Vulnerability Detected
          </div>
          <p className="text-amber-100/80 leading-relaxed">
            NovaTech Labs ($4,000) is scheduled on the <strong>20th</strong>, right before your <strong>$2,200 rent is due on the 25th</strong>. If NovaTech pays 14 days late, your cash balance dips into the red. BillPal can simulate this scenario and propose an automated task replanning schedule.
          </p>
          <div className="pt-1">
            <Link 
              href="/cash-flow" 
              className="inline-flex items-center gap-1 font-semibold text-amber-200 hover:text-white hover:underline"
            >
              Simulate 14-day late payment scenario <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Active Projects & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2 drop-shadow">
              <Briefcase className="w-4 h-4 text-white/80" /> Active Client Engagements
            </h2>
            <Link href="/projects" className="text-xs font-semibold text-white/70 hover:text-white hover:underline flex items-center gap-1">
              View all deliverables <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {clients.map((client) => {
              const project = client.projects[0];
              const pendingCount = project?.milestones.filter(m => m.status === "payment_pending").length ?? 0;
              return (
                <div key={client.id} className="glass p-4 rounded-xl flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                      {client.company ?? client.name}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5 leading-snug">
                      {project?.name}
                    </h3>
                    <div className="mt-2 text-xs font-mono font-semibold text-white/90">
                      {project ? formatCents(project.totalAmount) : "$0"}
                    </div>
                  </div>

                  <div className="border-t border-white/15 pt-2 flex items-center justify-between text-[11px]">
                    <span className="text-white/55">{project?.milestones.length} milestones</span>
                    {pendingCount > 0 ? (
                      <span className="text-amber-200 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {pendingCount} Pending
                      </span>
                    ) : (
                      <span className="text-emerald-200 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2 drop-shadow">
              <CreditCard className="w-4 h-4 text-white/80" /> Verified Payment Activity
            </h2>
            <Link href="/payments" className="text-xs font-semibold text-white/70 hover:text-white hover:underline flex items-center gap-1">
              Ledger <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="glass p-4 rounded-xl space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-white/55">No payment events recorded yet.</p>
            ) : (
              recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between pb-3 border-b border-white/10 last:border-none last:pb-0">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-white">
                      {p.client.company ?? p.client.name}
                    </div>
                    <div className="text-[10px] text-white/55">
                      {p.milestone.name}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-200">
                      {p.paypalCaptureId}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-200 font-mono">
                      +{formatCents(p.amount)}
                    </span>
                    <div className="text-[10px] text-white/50">
                      {p.paidAt ? formatDate(p.paidAt) : "Completed"}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
