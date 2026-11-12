import React from "react";
import { getDashboardData } from "@/lib/db/queries";
import Link from "next/link";
import { 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Briefcase, 
  CreditCard, 
  CalendarClock, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap
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
    expenses, 
    tasks, 
    recentPayments 
  } = data;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/30 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/50">
              Solo Financial Autopilot
            </span>
            <span className="text-xs text-slate-400">Priya Sharma &bull; UX & Product Consulting</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Predictive Cash Runway & Milestones
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            BillPal links your client deliverables to authentic PayPal Sandbox checkouts, listens for verified webhooks, and protects your cash runway before rent day.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/payments"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all"
          >
            <CreditCard className="w-4 h-4" />
            <span>Open AG Grid Ledger</span>
          </Link>
          <Link
            href="/cash-flow"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
          >
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span>14-Day Scenario</span>
          </Link>
        </div>
      </div>

      {/* Financial Health Summary Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Actual Money */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span>Actual Cash In Bank</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/50">
              Verified
            </span>
          </div>
          <div className="text-3xl font-black text-white mt-2 tracking-tight">
            {formatCents(currentActualBalance)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Opening balance ({formatCents(data.cashAccount?.openingBalance ?? 0)}) + verified payments
          </p>
        </div>

        {/* Expected Inflows */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-sm group">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-blue-400">
            <span>Expected Receivables</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-blue-400 mt-2 tracking-tight">
            {formatCents(totalExpectedInflow)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            2 pending milestones awaiting PayPal Sandbox clearance
          </p>
        </div>

        {/* Scheduled Expenses */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-sm group">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-rose-400">
            <span>Scheduled Outflows</span>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-black text-rose-400 mt-2 tracking-tight">
            {formatCents(totalExpenses)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Rent ($2,200 due on the 25th) & SaaS software
          </p>
        </div>

        {/* Forecasted Month-End */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/90 shadow-sm group">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-purple-400">
            <span>Projected Month-End</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-300 mt-2 tracking-tight">
            {formatCents(projectedBalance)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Baseline forecast assuming on-time client payments
          </p>
        </div>
      </section>

      {/* At-Risk Cash Flow Warning Banner */}
      <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-800/60 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <div className="font-bold text-amber-300">
            Cash Runway Timing Vulnerability Detected
          </div>
          <p className="text-amber-200/80 leading-relaxed">
            NovaTech Labs ($4,000) is scheduled on the <strong>20th</strong>, right before your <strong>$2,200 rent is due on the 25th</strong>. If NovaTech pays 14 days late, your cash balance dips into the red. BillPal can simulate this scenario and propose an automated task replanning schedule.
          </p>
          <div className="pt-1">
            <Link 
              href="/cash-flow" 
              className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 hover:underline"
            >
              Simulate 14-day late payment scenario <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Grid: Active Projects & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Projects Quick Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-400" /> Active Client Engagements
            </h2>
            <Link href="/projects" className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
              View all deliverables <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {clients.map((client) => {
              const project = client.projects[0];
              const pendingCount = project?.milestones.filter(m => m.status === "payment_pending").length ?? 0;
              return (
                <div key={client.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      {client.company ?? client.name}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-0.5 leading-snug">
                      {project?.name}
                    </h3>
                    <div className="mt-2 text-xs font-mono font-semibold text-slate-300">
                      {project ? formatCents(project.totalAmount) : "$0"}
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{project?.milestones.length} milestones</span>
                    {pendingCount > 0 ? (
                      <span className="text-amber-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {pendingCount} Pending
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Paid
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Payment Ledger Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-400" /> Verified Payment Activity
            </h2>
            <Link href="/payments" className="text-xs font-semibold text-blue-400 hover:underline flex items-center gap-1">
              Ledger <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-xs text-slate-400">No payment events recorded yet.</p>
            ) : (
              recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between pb-3 border-b border-slate-800/60 last:border-none last:pb-0">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-white">
                      {p.client.company ?? p.client.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {p.milestone.name}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400">
                      {p.paypalCaptureId}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      +{formatCents(p.amount)}
                    </span>
                    <div className="text-[10px] text-slate-400">
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
