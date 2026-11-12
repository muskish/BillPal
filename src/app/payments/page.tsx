import React from "react";
import { getDashboardData } from "@/lib/db/queries";
import { PaymentsGrid, MilestoneRow } from "@/components/ag-grid/PaymentsGrid";
import { CreditCard, ShieldCheck, Zap, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  const { clients } = await getDashboardData();

  // Transform relational milestones into flat rows for AG Grid
  const rows: MilestoneRow[] = clients.flatMap((client) =>
    client.projects.flatMap((project) =>
      project.milestones.map((m) => ({
        id: m.id,
        clientName: client.name,
        clientCompany: client.company ?? client.name,
        projectName: project.name,
        milestoneName: m.name,
        amount: m.amount,
        dueDate: m.dueDate.toISOString(),
        status: m.status,
        paypalOrderId: m.paypalOrderId,
        paypalCaptureId: m.paypalCaptureId,
      }))
    )
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <CreditCard className="w-6 h-6 text-emerald-400" />
              Accounts Receivable & PayPal Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-800">
              AG Grid Community
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time milestone payment tracking. Filter, sort, and reconcile invoices directly against verified PayPal Sandbox events.
          </p>
        </div>
      </div>

      {/* Sponsor & Sandbox Integrity Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-300">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-white">Interactive Sponsor Technology: AG Grid Community</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Provides client-side sorting, column filtering, and quick search. The ledger reflects live data persisted in PostgreSQL.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-md bg-blue-950/80 text-blue-400 border border-blue-800/60 font-mono text-[11px]">
            PayPal Sandbox Mode
          </span>
        </div>
      </div>

      {/* AG Grid Component */}
      <PaymentsGrid initialRows={rows} />
    </main>
  );
}

