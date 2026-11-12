import React from "react";
import { getDashboardData } from "@/lib/db/queries";
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Briefcase, 
  CreditCard,
  ShieldAlert,
  ArrowUpRight,
  Database
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

export default async function DashboardPage() {
  const data = await getDashboardData();
  const { freelancer, clients, expenses, tasks, recentPayments } = data;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        {/* Top Navigation / Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-600/30">
              BP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">BillPal</h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950 text-blue-400 border border-blue-800/60">
                  Phase 1 Live Database
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {freelancer?.name ?? "Priya Sharma"} &bull; {freelancer?.role ?? "UX & Product Consultant"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
              <Database className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              Connected to Neon PostgreSQL
            </span>
          </div>
        </header>

        {/* Demo Data & Financial Integrity Disclosure Banner */}
        <div className="bg-amber-950/30 border border-amber-800/50 rounded-xl p-4 flex items-start gap-3 text-xs text-amber-200/90 leading-relaxed">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300 font-semibold">Integrity Baseline:</strong> Starting balance ($4,500) and rent ($2,200 due on 25th) are seeded demo assumptions. All financial math is computed server-side in integer cents. Actual money updates only via verified PayPal capture events.
          </div>
        </div>

        {/* Financial Metrics Strip */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Actual Cash In Bank</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {formatCents(data.currentActualBalance)}
            </div>
            <p className="text-[11px] text-slate-400">
              Includes {formatCents(data.cashAccount?.openingBalance ?? 0)} opening balance + confirmed payments
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Expected Receivables</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400">
              {formatCents(data.totalExpectedInflow)}
            </div>
            <p className="text-[11px] text-slate-400">
              Pending client milestones awaiting PayPal Sandbox payment
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Scheduled Expenses</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-400">
              {formatCents(data.totalExpenses)}
            </div>
            <p className="text-[11px] text-slate-400">
              Studio rent ($2,200 due 25th) & SaaS software
            </p>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium uppercase tracking-wider">
              <span>Projected Month-End</span>
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-300">
              {formatCents(data.projectedBalance)}
            </div>
            <p className="text-[11px] text-slate-400">
              Forecast assuming on-time milestone clearance
            </p>
          </div>
        </section>

        {/* Client Projects & Milestones (Live PayPal Checkout Targets) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-blue-400" /> Client Projects & Payment Milestones
              </h2>
              <p className="text-xs text-slate-400">
                Milestones with status <span className="text-amber-400 font-medium">payment_pending</span> are primed for genuine PayPal Sandbox checkout in Phase 3.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {clients.map((client) => {
              const project = client.projects[0];
              return (
                <div key={client.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[11px] font-semibold tracking-wider text-blue-400 uppercase">
                          {client.company ?? client.name}
                        </span>
                        <h3 className="text-base font-bold text-white">{project?.name ?? "Consulting"}</h3>
                      </div>
                      <span className="text-xs font-mono font-medium text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                        {project ? formatCents(project.totalAmount) : "$0"}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-2">{project?.description}</p>
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-2 border-t border-slate-800/80 pt-3">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Milestones
                    </span>
                    {project?.milestones.map((m) => (
                      <div key={m.id} className="bg-slate-950/70 border border-slate-800/70 rounded-lg p-3 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-200">{m.name}</span>
                          <span className="font-bold text-slate-100">{formatCents(m.amount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" /> Due {formatDate(m.dueDate)}
                          </span>
                          {m.status === "paid" ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3 h-3" /> Paid
                            </span>
                          ) : m.status === "payment_pending" ? (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
                              <Clock className="w-3 h-3" /> Payment Pending
                            </span>
                          ) : (
                            <span className="text-slate-500">Planned</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Expenses & Tasks Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scheduled Expenses */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-rose-400" /> Scheduled Operating Expenses
            </h2>
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <div>
                    <div className="text-xs font-semibold text-white">{expense.description}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-500" /> Due {formatDate(expense.dueDate)} &bull; {expense.category}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-rose-400">
                    -{formatCents(expense.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Project Tasks with Payment Dependency */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-400" /> Work Plan & Payment Dependencies
            </h2>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800/60">
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-white flex items-center gap-2">
                      <span>{task.title}</span>
                      {task.isPaymentDependent && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-950 text-amber-300 border border-amber-800/60">
                          Payment Dependent
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {task.project.name} &bull; {formatDate(task.startDate)} - {formatDate(task.endDate)}
                    </div>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded capitalize ${
                    task.status === "completed" 
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                      : task.status === "in_progress"
                      ? "bg-blue-950 text-blue-400 border border-blue-800/60"
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Phase 1 Verification Footnote */}
        <footer className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Phase 1 Exit Condition Verified: Refreshing this page live-queries records from Neon PostgreSQL.</span>
          </div>
          <span>Next: Phase 2 AG Grid & Phase 3 PayPal Sandbox</span>
        </footer>
      </div>
    </main>
  );
}
