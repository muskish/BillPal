"use client";

import React, { useState } from "react";
import { 
  CalendarClock, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  RefreshCw,
  Clock,
  Layers
} from "lucide-react";

interface TaskItem {
  id: string;
  title: string;
  projectName: string;
  startDate: string;
  endDate: string;
  priority: string;
  status: string;
  isPaymentDependent: boolean;
}

export function ActionPlanWorkbench({ initialTasks }: { initialTasks: TaskItem[] }) {
  const [proposalStatus, setProposalStatus] = useState<"pending" | "approved" | "rejected">("pending");

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-6">
      {/* AI / Rule-Based Proposal Card */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-800/60 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-900/80 text-purple-300 border border-purple-700/60 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              Replanning Proposal #CP-2026-01
            </span>
            <span className="text-xs text-slate-400">Trigger: NovaTech Milestone 1 Pending</span>
          </div>

          <div className="flex items-center gap-2">
            {proposalStatus === "pending" ? (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Awaiting Freelancer Review
              </span>
            ) : proposalStatus === "approved" ? (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Schedule Revisions Approved
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                Proposal Rejected
              </span>
            )}
          </div>
        </div>

        {/* Financial Rationale */}
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-white">
            Suggested Schedule Revision & Deliverable Hold
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            <strong>Financial Rationale:</strong> NovaTech Labs ($4,000 Milestone 1) is awaiting Sandbox checkout. Continuing Phase 2 Brand Guidelines consumes uncompensated design hours while your $2,200 studio rent is due on the 25th.
          </p>
        </div>

        {/* Proposed Adjustments Table */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Proposed Action Items
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="font-semibold text-amber-300 flex items-center gap-2">
                  <span>HOLD: NovaTech Phase 2 Implementation (Brand Guidelines)</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-900/60 text-amber-200">
                    Payment Dependent
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Delay kick-off until Milestone 1 payment is captured in PayPal Sandbox.
                </div>
              </div>
              <div className="text-[11px] font-mono text-amber-300 shrink-0">
                Shift: Nov 22 &rarr; Dec 6 (+14 days)
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <div className="font-semibold text-emerald-300 flex items-center gap-2">
                  <span>PRIORITIZE: Acme Corp Mobile App Prototype</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-900/60 text-emerald-200">
                    Active Clearance
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Acme Milestone 1 ($3,500) is ready for immediate payment; focus hours on completing Acme sign-off.
                </div>
              </div>
              <div className="text-[11px] font-mono text-emerald-300 shrink-0">
                Keep on Schedule
              </div>
            </div>
          </div>
        </div>

        {/* Approval Actions */}
        {proposalStatus === "pending" ? (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setProposalStatus("approved")}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve & Apply Schedule Changes</span>
            </button>
            <button
              onClick={() => setProposalStatus("rejected")}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-all cursor-pointer"
            >
              <span>Keep Original Schedule</span>
            </button>
          </div>
        ) : (
          <div className="pt-2 flex items-center gap-2 text-xs">
            <button
              onClick={() => setProposalStatus("pending")}
              className="text-purple-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Proposal State</span>
            </button>
          </div>
        )}
      </div>

      {/* Full Task Registry */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Active Consulting Deliverables & Tasks
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Deliverables tagged with &quot;Payment Dependent&quot; pause automatically when linked PayPal milestone payments are unverified.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {initialTasks.map((task) => {
            const isDelayedByApproval = proposalStatus === "approved" && task.isPaymentDependent;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isDelayedByApproval
                    ? "bg-amber-950/20 border-amber-800/60"
                    : "bg-slate-950/70 border-slate-800/70"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-white">{task.title}</span>
                    {task.isPaymentDependent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800/60">
                        Payment Dependent
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Project: <span className="text-slate-300">{task.projectName}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 uppercase font-sans">Window</div>
                    <div className={isDelayedByApproval ? "text-amber-400 font-bold" : "text-slate-300"}>
                      {isDelayedByApproval ? "Delayed +14 days (Pending Capture)" : `${formatDate(task.startDate)} - ${formatDate(task.endDate)}`}
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-medium uppercase tracking-wider ${
                    task.status === "completed"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                      : task.status === "in_progress"
                      ? "bg-blue-950 text-blue-400 border border-blue-800/60"
                      : isDelayedByApproval
                      ? "bg-amber-950 text-amber-400 border border-amber-800/60"
                      : "bg-slate-800 text-slate-400"
                  }`}>
                    {isDelayedByApproval ? "Paused" : task.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

