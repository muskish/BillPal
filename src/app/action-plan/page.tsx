import React from "react";
import { getDashboardData } from "@/lib/db/queries";
import { ActionPlanWorkbench } from "@/components/ActionPlanWorkbench";
import { CalendarClock, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ActionPlanPage() {
  const { tasks } = await getDashboardData();

  const serializedTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    projectName: t.project.name,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate.toISOString(),
    priority: t.priority,
    status: t.status,
    isPaymentDependent: t.isPaymentDependent,
  }));

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
              <CalendarClock className="w-6 h-6 text-purple-400" />
              Intelligent Action Plan & Replanning Workbench
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
              Work Prioritization
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            When payment milestones are delayed, BillPal protects your runway by pausing uncompensated work and reprioritizing tasks tied to active cash inflows.
          </p>
        </div>
      </div>

      {/* Workbench Component */}
      <ActionPlanWorkbench initialTasks={serializedTasks} />
    </main>
  );
}

