"use client";

import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Info
} from "lucide-react";

interface MilestoneData {
  id: string;
  name: string;
  clientCompany: string;
  amount: number; // cents
  dueDate: string;
  status: string;
}

interface ExpenseData {
  id: string;
  description: string;
  amount: number; // cents
  dueDate: string;
  category: string;
}

interface CashFlowSimulatorProps {
  openingBalance: number; // cents
  milestones: MilestoneData[];
  expenses: ExpenseData[];
}

export function CashFlowSimulator({ openingBalance, milestones, expenses }: CashFlowSimulatorProps) {
  // Scenario state: toggle 14-day delay on NovaTech
  const [isDelayedScenario, setIsDelayedScenario] = useState(false);

  const formatCents = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr));
  };

  // Build daily timeline projection over next 30 days
  const timeline = useMemo(() => {
    const today = new Date();
    const days: {
      date: Date;
      dateLabel: string;
      dayNumber: number;
      baselineBalance: number;
      scenarioBalance: number;
      inflowEvents: { title: string; amount: number; isDelayed?: boolean }[];
      outflowEvents: { title: string; amount: number }[];
    }[] = [];

    // Simulate 30 days starting from the 1st of current month
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    let baselineRunning = openingBalance;
    let scenarioRunning = openingBalance;

    for (let i = 1; i <= 30; i++) {
      const curDate = new Date(today.getFullYear(), today.getMonth(), i);
      const dateLabel = curDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      const inflows: { title: string; amount: number; isDelayed?: boolean }[] = [];
      const outflows: { title: string; amount: number }[] = [];

      // Check expenses on this day
      expenses.forEach((e) => {
        const d = new Date(e.dueDate);
        if (d.getDate() === i) {
          outflows.push({ title: e.description, amount: e.amount });
          baselineRunning -= e.amount;
          scenarioRunning -= e.amount;
        }
      });

      // Check milestones on this day
      milestones.forEach((m) => {
        const d = new Date(m.dueDate);
        const isNovaTech = m.clientCompany.includes("NovaTech");

        // Baseline inflow
        if (d.getDate() === i) {
          inflows.push({ title: `${m.clientCompany}: ${m.name}`, amount: m.amount });
          baselineRunning += m.amount;

          // In delayed scenario, NovaTech moves by 14 days!
          if (!isDelayedScenario || !isNovaTech) {
            scenarioRunning += m.amount;
          }
        }

        // If delayed scenario is active, NovaTech arrives at (original day + 14)
        if (isDelayedScenario && isNovaTech && i === Math.min(30, d.getDate() + 14)) {
          scenarioRunning += m.amount;
        }
      });

      days.push({
        date: curDate,
        dateLabel,
        dayNumber: i,
        baselineBalance: baselineRunning,
        scenarioBalance: scenarioRunning,
        inflowEvents: inflows,
        outflowEvents: outflows,
      });
    }

    return days;
  }, [openingBalance, milestones, expenses, isDelayedScenario]);

  // Key Dates & Critical Deficit Analysis
  const rentDay = timeline.find((d) => d.dayNumber === 25);
  const baselineRentBalance = rentDay?.baselineBalance ?? 0;
  const scenarioRentBalance = rentDay?.scenarioBalance ?? 0;
  const hasCashDeficit = isDelayedScenario && scenarioRentBalance < 0;

  return (
    <div className="space-y-6">
      {/* Interactive Scenario Control Card */}
      <div className={`p-6 rounded-2xl border transition-all ${
        isDelayedScenario 
          ? "bg-rose-950/20 border-rose-800/80 shadow-rose-950/30" 
          : "bg-slate-900/80 border-slate-800"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                isDelayedScenario ? "bg-rose-900 text-rose-300" : "bg-blue-950 text-blue-300"
              }`}>
                What-If Scenario Engine
              </span>
              <span className="text-xs text-slate-400">Section 5 & 10 Master Plan</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {isDelayedScenario 
                ? "Simulating: NovaTech Labs Pays 14 Days Late" 
                : "Baseline Cash Forecast (On-Time Payments)"}
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Toggle the scenario to recalculate Priya's runway without altering authentic database records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDelayedScenario(!isDelayedScenario)}
              className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
                isDelayedScenario
                  ? "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30"
                  : "bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isDelayedScenario ? "animate-spin" : ""}`} />
              <span>{isDelayedScenario ? "Reset to Baseline" : "Simulate NovaTech 14-Day Delay"}</span>
            </button>
          </div>
        </div>

        {/* Financial Gap Callout */}
        {isDelayedScenario && (
          <div className="mt-4 pt-4 border-t border-rose-800/60 flex items-start gap-3 text-xs text-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-rose-300 text-sm">
                Cash Gap Warning: Rent on the 25th is in Deficit!
              </div>
              <p className="text-rose-200/90 leading-relaxed">
                When NovaTech's $4,000 milestone shifts past the 25th, Priya's operating balance on rent day drops to{" "}
                <span className="font-mono font-bold text-white underline">{formatCents(scenarioRentBalance)}</span>. 
                BillPal's Action Plan recommends immediately delaying dependent tasks and adjusting the delivery schedule.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Opening Balance</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{formatCents(openingBalance)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Seeded baseline</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Balance on Rent Day (25th)</div>
          <div className={`text-2xl font-black font-mono mt-1 ${
            scenarioRentBalance < 0 ? "text-rose-400" : "text-emerald-400"
          }`}>
            {formatCents(isDelayedScenario ? scenarioRentBalance : baselineRentBalance)}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            After $2,200 studio rent outflow
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Projected Month-End</div>
          <div className="text-2xl font-black text-purple-300 font-mono mt-1">
            {formatCents(
              isDelayedScenario 
                ? timeline[timeline.length - 1].scenarioBalance 
                : timeline[timeline.length - 1].baselineBalance
            )}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Final 30-day runway position</div>
        </div>
      </div>

      {/* Visual Timeline Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            30-Day Cash Runway Projection & Outflow Schedule
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            {isDelayedScenario ? "Showing: Delayed Scenario" : "Showing: Baseline Projection"}
          </span>
        </div>

        <div className="space-y-2 overflow-x-auto">
          {timeline
            .filter((d) => d.inflowEvents.length > 0 || d.outflowEvents.length > 0 || d.dayNumber === 25 || d.dayNumber === 1 || d.dayNumber === 30)
            .map((day) => {
              const balance = isDelayedScenario ? day.scenarioBalance : day.baselineBalance;
              const isRentDay = day.dayNumber === 25;
              const isNegative = balance < 0;

              return (
                <div 
                  key={day.dayNumber}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                    isNegative 
                      ? "bg-rose-950/40 border-rose-800/80" 
                      : isRentDay 
                      ? "bg-amber-950/30 border-amber-800/60" 
                      : "bg-slate-950/60 border-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-16 font-mono font-bold text-slate-300">
                      {day.dateLabel}
                    </span>
                    <div className="space-y-0.5">
                      {day.outflowEvents.map((out, idx) => (
                        <div key={idx} className="text-rose-400 font-semibold flex items-center gap-1.5">
                          <span>&bull; {out.title}</span>
                          <span className="font-mono">(-{formatCents(out.amount)})</span>
                        </div>
                      ))}
                      {day.inflowEvents.map((inf, idx) => (
                        <div key={idx} className="text-emerald-400 font-semibold flex items-center gap-1.5">
                          <span>&bull; {inf.title}</span>
                          <span className="font-mono">(+{formatCents(inf.amount)})</span>
                        </div>
                      ))}
                      {day.inflowEvents.length === 0 && day.outflowEvents.length === 0 && (
                        <span className="text-slate-500 italic">Operating runway checkpoint</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 sm:text-right">
                    <div className="text-[11px] text-slate-400">Runway Balance:</div>
                    <span className={`text-sm font-bold font-mono px-2.5 py-1 rounded-md ${
                      isNegative 
                        ? "bg-rose-950 text-rose-300 border border-rose-800 font-black animate-pulse" 
                        : "bg-slate-900 text-slate-100 border border-slate-800"
                    }`}>
                      {formatCents(balance)}
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

