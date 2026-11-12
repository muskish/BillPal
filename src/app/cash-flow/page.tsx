import React from "react";
import { getDashboardData } from "@/lib/db/queries";
import { CashFlowSimulator } from "@/components/CashFlowSimulator";
import { TrendingUp, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CashFlowPage() {
  const data = await getDashboardData();
  const { cashAccount, clients, expenses } = data;

  // Flatten milestones
  const milestones = clients.flatMap((client) =>
    client.projects.flatMap((project) =>
      project.milestones.map((m) => ({
        id: m.id,
        name: m.name,
        clientCompany: client.company ?? client.name,
        amount: m.amount,
        dueDate: m.dueDate.toISOString(),
        status: m.status,
      }))
    )
  );

  const serializedExpenses = expenses.map((e) => ({
    id: e.id,
    description: e.description,
    amount: e.amount,
    dueDate: e.dueDate.toISOString(),
    category: e.category,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-purple-400" />
              Cash-Flow Forecast & 14-Day Scenario Model
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-950 text-purple-300 border border-purple-800">
              Deterministic Math
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Evaluate expected payments against fixed rent ($2,200 due on the 25th). Simulate late payments to anticipate liquidity crunches.
          </p>
        </div>

        <Link
          href="/action-plan"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs shadow-md shadow-purple-600/30 transition-all shrink-0"
        >
          <span>View Recommended Work Plan</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Simulator Component */}
      <CashFlowSimulator
        openingBalance={cashAccount?.openingBalance ?? 450000}
        milestones={milestones}
        expenses={serializedExpenses}
      />
    </main>
  );
}

