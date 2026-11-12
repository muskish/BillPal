"use client";

import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { 
  ColDef, 
  ModuleRegistry, 
  AllCommunityModule,
  ICellRendererParams 
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { 
  Search, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Building2,
  DollarSign
} from "lucide-react";
import Link from "next/link";

// Register AG Grid Community Modules
ModuleRegistry.registerModules([AllCommunityModule]);

export interface MilestoneRow {
  id: string;
  clientName: string;
  clientCompany: string;
  projectName: string;
  milestoneName: string;
  amount: number; // integer cents
  dueDate: string;
  status: string; // paid, payment_pending, planned
  paypalOrderId: string | null;
  paypalCaptureId: string | null;
}

export function PaymentsGrid({ initialRows }: { initialRows: MilestoneRow[] }) {
  const [quickFilterText, setQuickFilterText] = useState("");

  // Financial aggregates calculated server-side/client from actual rows
  const stats = useMemo(() => {
    let totalInvoiced = 0;
    let paidAmount = 0;
    let pendingAmount = 0;
    let plannedAmount = 0;

    initialRows.forEach((r) => {
      totalInvoiced += r.amount;
      if (r.status === "paid") paidAmount += r.amount;
      else if (r.status === "payment_pending") pendingAmount += r.amount;
      else if (r.status === "planned") plannedAmount += r.amount;
    });

    return { totalInvoiced, paidAmount, pendingAmount, plannedAmount };
  }, [initialRows]);

  const formatCents = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const columnDefs = useMemo<ColDef<MilestoneRow>[]>(() => {
    return [
      {
        headerName: "Client & Company",
        field: "clientCompany",
        minWidth: 180,
        flex: 1.2,
        cellRenderer: (params: ICellRendererParams<MilestoneRow>) => {
          if (!params.data) return null;
          return (
            <div className="flex flex-col justify-center h-full py-1">
              <span className="font-semibold text-slate-100 text-xs leading-snug">
                {params.data.clientCompany}
              </span>
              <span className="text-[11px] text-slate-400 leading-none">
                {params.data.clientName}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Project",
        field: "projectName",
        minWidth: 160,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<MilestoneRow>) => {
          return (
            <span className="text-slate-200 text-xs font-medium">
              {params.value}
            </span>
          );
        },
      },
      {
        headerName: "Milestone Deliverable",
        field: "milestoneName",
        minWidth: 220,
        flex: 1.5,
        cellRenderer: (params: ICellRendererParams<MilestoneRow>) => {
          return (
            <span className="text-slate-300 text-xs">
              {params.value}
            </span>
          );
        },
      },
      {
        headerName: "Amount (USD)",
        field: "amount",
        minWidth: 130,
        flex: 0.8,
        cellRenderer: (params: ICellRendererParams<MilestoneRow>) => {
          return (
            <span className="font-mono font-bold text-slate-100 text-xs">
              {formatCents(params.value ?? 0)}
            </span>
          );
        },
        comparator: (valueA: number, valueB: number) => valueA - valueB,
      },
      {
        headerName: "Due Date",
        field: "dueDate",
        minWidth: 120,
        flex: 0.8,
        cellRenderer: (params: ICellRendererParams<MilestoneRow>) => {
          if (!params.value) return null;
          const formatted = new Date(params.value).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          return (
            <span className="text-slate-400 text-xs font-mono">
              {formatted}
            </span>
          );
        },
      },
      {
        headerName: "Payment Status",
        field: "status",
        minWidth: 150,
        flex: 1,
        cellRenderer: (params: ICellRendererParams<MilestoneRow>) => {
          const status = params.value;
          if (status === "paid") {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Paid (Captured)
              </span>
            );
          }
          if (status === "payment_pending") {
            return (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950 text-amber-300 border border-amber-800/60">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Payment Pending
              </span>
            );
          }
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
              <Clock className="w-3 h-3 text-slate-500" />
              Planned
            </span>
          );
        },
      },
      {
        headerName: "PayPal Reference / Action",
        field: "id",
        minWidth: 200,
        flex: 1.2,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<MilestoneRow>) => {
          if (!params.data) return null;
          const { status, paypalCaptureId, id } = params.data;

          if (status === "paid") {
            return (
              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                <span>{paypalCaptureId ?? "CAP-VERIFIED"}</span>
              </div>
            );
          }

          if (status === "payment_pending") {
            return (
              <button 
                onClick={() => alert(`Phase 3 PayPal Sandbox checkout will initialize for milestone: ${params.data?.milestoneName}. Setting up in Phase 3!`)}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-[11px] font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors cursor-pointer"
              >
                <span>PayPal Checkout</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            );
          }

          return (
            <span className="text-[11px] text-slate-500 italic">
              Future milestone
            </span>
          );
        },
      },
    ];
  }, []);

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      sortable: true,
      filter: true,
      resizable: true,
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Total Contract Value</div>
          <div className="text-xl font-bold text-slate-100">{formatCents(stats.totalInvoiced)}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-emerald-400 font-medium uppercase tracking-wider">Confirmed Received</div>
          <div className="text-xl font-bold text-emerald-400">{formatCents(stats.paidAmount)}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-amber-400 font-medium uppercase tracking-wider">Pending Receivables</div>
          <div className="text-xl font-bold text-amber-400">{formatCents(stats.pendingAmount)}</div>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 font-medium uppercase tracking-wider">Future Planned</div>
          <div className="text-xl font-bold text-slate-400">{formatCents(stats.plannedAmount)}</div>
        </div>
      </div>

      {/* Grid Controls / Quick Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={quickFilterText}
            onChange={(e) => setQuickFilterText(e.target.value)}
            placeholder="Search clients, projects, status..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          <span>Powered by <strong>AG Grid Community</strong></span>
        </div>
      </div>

      {/* AG Grid Table Container */}
      <div 
        className="ag-theme-quartz-dark rounded-xl overflow-hidden border border-slate-800 shadow-xl"
        style={{ height: 420, width: "100%" }}
      >
        <AgGridReact<MilestoneRow>
          rowData={initialRows}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilterText}
          pagination={true}
          paginationPageSize={10}
          domLayout="normal"
        />
      </div>
    </div>
  );
}

