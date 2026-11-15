"use client";

import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowRight, 
  RefreshCw,
  Info,
  Sliders,
  DollarSign
} from "lucide-react";
import Link from "next/link";

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
  // Scenario state: delay days (0 = baseline, 7, 14, 21)
  const [delayDays, setDelayDays] = useState<number>(0);

  const isDelayedScenario = delayDays > 0;

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

          // In delayed scenario, NovaTech shifts by delayDays!
          if (!isDelayedScenario || !isNovaTech) {
            scenarioRunning += m.amount;
          }
        }

        // If delayed scenario is active, NovaTech arrives at (original day + delayDays)
        if (isDelayedScenario && isNovaTech && i === Math.min(30, d.getDate() + delayDays)) {
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
  }, [openingBalance, milestones, expenses, delayDays, isDelayedScenario]);

  // Key Dates & Critical Deficit Analysis
  const rentDay = timeline.find((d) => d.dayNumber === 25);
  const baselineRentBalance = rentDay?.baselineBalance ?? 0;
  const scenarioRentBalance = rentDay?.scenarioBalance ?? 0;
  const hasCashDeficit = isDelayedScenario && scenarioRentBalance < 0;

  // Chart Coordinates Calculation (SVG)
  const chartHeight = 160;
  const chartWidth = 700;
  const maxBalance = Math.max(...timeline.map((d) => Math.max(d.baselineBalance, d.scenarioBalance)), 1200000);
  const minBalance = Math.min(...timeline.map((d) => Math.min(d.baselineBalance, d.scenarioBalance)), -200000);
  const range = maxBalance - minBalance || 1;

  const getY = (val: number) => {
    return chartHeight - ((val - minBalance) / range) * chartHeight;
  };

  const getX = (index: number) => {
    return (index / (timeline.length - 1)) * chartWidth;
  };

  const baselinePoints = timeline.map((d, idx) => `${getX(idx)},${getY(d.baselineBalance)}`).join(" ");
  const scenarioPoints = timeline.map((d, idx) => `${getX(idx)},${getY(d.scenarioBalance)}`).join(" ");
  const zeroLineY = getY(0);

  return (
    <div className="space-y-6">
      {/* Interactive Scenario Control Card */}
      <div className={`p-6 rounded-2xl border transition-all ${
        hasCashDeficit 
          ? "bg-rose-950/20 border-rose-800/80 shadow-rose-950/30" 
          : "bg-slate-900/80 border-slate-800"
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                hasCashDeficit ? "bg-rose-900 text-rose-300" : "bg-blue-950 text-blue-300"
              }`}>
                What-If Scenario Engine
              </span>
              <span className="text-xs text-slate-400">Section 5 & 10 Master Plan Baseline</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {isDelayedScenario 
                ? `Simulating: NovaTech Labs Pays ${delayDays} Days Late` 
                : "Baseline Cash Forecast (On-Time Payments)"}
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Dynamically shifts NovaTech Labs ($4,000 Milestone 1) past rent day (the 25th) without altering authentic database records.
            </p>
          </div>

          {/* Interactive Delay Selector */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 p-1.5 rounded-xl shrink-0">
            <button
              onClick={() => setDelayDays(0)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                delayDays === 0 ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Baseline (0d)
            </button>
            <button
              onClick={() => setDelayDays(7)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                delayDays === 7 ? "bg-amber-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              +7 Days
            </button>
            <button
              onClick={() => setDelayDays(14)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                delayDays === 14 ? "bg-rose-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              +14 Days (Hackathon Demo)
            </button>
          </div>
        </div>

        {/* Financial Deficit Callout */}
        {hasCashDeficit && (
          <div className="mt-4 pt-4 border-t border-rose-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold text-rose-300 text-sm">
                  Runway Gap Warning: Studio Rent Deficit on the 25th!
                </span>
                <p className="text-rose-200/90 leading-relaxed text-[11px]">
                  When NovaTech shifts by {delayDays} days, your account balance on the 25th plunges to{" "}
                  <span className="font-mono font-bold text-white underline">{formatCents(scenarioRentBalance)}</span>.
                </p>
              </div>
            </div>

            <Link
              href="/action-plan"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md shrink-0 transition-colors"
            >
              <span>Review AI Work Replanning</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>

      {/* SVG Trajectory Chart */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-4">
            <span className="font-bold text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              30-Day Liquidity Trajectory Curve
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-3 h-0.5 bg-blue-500 inline-block"></span> Baseline
              </span>
              {isDelayedScenario && (
                <span className="flex items-center gap-1.5 text-rose-400">
                  <span className="w-3 h-0.5 bg-rose-500 inline-block border-dashed"></span> Delayed Scenario
                </span>
              )}
            </div>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Day 1 to 30</span>
        </div>

        <div className="w-full overflow-hidden pt-2">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-40 overflow-visible">
            {/* Zero line */}
            <line
              x1="0"
              y1={zeroLineY}
              x2={chartWidth}
              y2={zeroLineY}
              stroke="#475569"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
            <text x="5" y={zeroLineY - 4} fill="#94a3b8" fontSize="10" fontFamily="monospace">
              $0 Break-even
            </text>

            {/* Rent Day line (Day 25) */}
            <line
              x1={getX(24)}
              y1="0"
              x2={getX(24)}
              y2={chartHeight}
              stroke="#fb7185"
              strokeDasharray="2 2"
              strokeWidth="1"
            />
            <text x={getX(24) - 20} y="15" fill="#fb7185" fontSize="9" fontFamily="monospace">
              Day 25 (Rent)
            </text>

            {/* Baseline Polyline */}
            <polyline
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              points={baselinePoints}
            />

            {/* Scenario Polyline */}
            {isDelayedScenario && (
              <polyline
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.5"
                strokeDasharray="5 3"
                points={scenarioPoints}
              />
            )}
          </svg>
        </div>
      </div>

      {/* Comparison Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Opening Balance</div>
          <div className="text-2xl font-black text-white font-mono mt-1">{formatCents(openingBalance)}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Seeded baseline cash</div>
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
          <div className="text-[11px] text-slate-500 mt-0.5">Final 30-day position</div>
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
            {isDelayedScenario ? `Showing: +${delayDays}d Delayed Scenario` : "Showing: Baseline Projection"}
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
