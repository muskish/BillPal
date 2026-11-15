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
  Layers,
  Loader2,
  Sliders
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [proposalStatus, setProposalStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [delayDays, setDelayDays] = useState<number>(14);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [proposalId, setProposalId] = useState<string>("PROP-CP-2026-01");
  const [proposalSource, setProposalSource] = useState<"gemini_ai" | "rule_based_fallback">("gemini_ai");
  const [rationale, setRationale] = useState<string>(
    "NovaTech Labs ($4,000 Milestone 1) is awaiting Sandbox payment. Continuing Phase 2 Brand Guidelines consumes uncompensated design hours while your $2,200 studio rent is due on the 25th."
  );

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr));
  };

  const handleRegenerateProposal = async (newDelay: number) => {
    setIsGenerating(true);
    setDelayDays(newDelay);

    try {
      const res = await fetch("/api/ai/replan-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delayDays: newDelay }),
      });

      const data = await res.json();
      if (res.ok && data.proposal) {
        setProposalId(data.proposal.proposalId);
        setProposalSource(data.proposal.source);
        setRationale(data.proposal.financialRationale);
        setProposalStatus("pending");
      }
    } catch (err) {
      console.error("Error regenerating proposal:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApprove = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/ai/approve-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, action: "approve" }),
      });

      if (res.ok) {
        setProposalStatus("approved");
        router.refresh();
      }
    } catch (err) {
      console.error("Error approving proposal:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReject = async () => {
    setIsSaving(true);
    try {
      await fetch("/api/ai/approve-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposalId, action: "reject" }),
      });
      setProposalStatus("rejected");
    } catch (err) {
      console.error("Error rejecting proposal:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* AI / Rule-Based Proposal Card */}
      <div className="bg-gradient-to-r from-purple-950/40 via-slate-900 to-indigo-950/40 border border-purple-800/60 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-900/80 text-purple-300 border border-purple-700/60 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-400" />
              {proposalSource === "gemini_ai" ? "Gemini 2.5 Flash Proposal" : "Rule-Based Engine Proposal"} #{proposalId}
            </span>
            <span className="text-xs text-slate-400">Trigger: NovaTech (+{delayDays}d Delay)</span>
          </div>

          <div className="flex items-center gap-2">
            {proposalStatus === "pending" ? (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Awaiting Freelancer Approval
              </span>
            ) : proposalStatus === "approved" ? (
              <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Schedule Revisions Approved & Saved
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
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">
              Suggested Schedule Revision & Deliverable Hold
            </h2>
            <button
              onClick={() => handleRegenerateProposal(delayDays)}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium text-purple-300 hover:text-white bg-purple-950/80 border border-purple-800/60 hover:bg-purple-900 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isGenerating ? "animate-spin" : ""}`} />
              <span>{isGenerating ? "Consulting AI..." : "Regenerate with Gemini"}</span>
            </button>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
            <strong>Financial Rationale:</strong> {rationale}
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
                Shift: +{delayDays} days past Milestone 1 capture
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
                  Acme Milestone 1 ($3,500) has been paid via PayPal; continue high-priority sign-off.
                </div>
              </div>
              <div className="text-[11px] font-mono text-emerald-300 shrink-0">
                Keep on Schedule
              </div>
            </div>
          </div>
        </div>

        {/* Approval Actions (Mandatory Section 7: User approval required) */}
        {proposalStatus === "pending" ? (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleApprove}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving to Database...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Apply Schedule Changes</span>
                </>
              )}
            </button>
            <button
              onClick={handleReject}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs border border-slate-700 transition-all cursor-pointer"
            >
              <span>Keep Original Schedule</span>
            </button>
          </div>
        ) : (
          <div className="pt-2 flex items-center gap-3 text-xs">
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Changes recorded in Neon PostgreSQL schedule proposals.
            </span>
            <button
              onClick={() => setProposalStatus("pending")}
              className="text-purple-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset State</span>
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
                      {isDelayedByApproval ? `Delayed +${delayDays} days (Awaiting Capture)` : `${formatDate(task.startDate)} - ${formatDate(task.endDate)}`}
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
