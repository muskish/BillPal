import React from "react";
import { getDashboardData } from "@/lib/db/queries";
import Link from "next/link";
import { ProjectBriefExtractor } from "@/components/ProjectBriefExtractor";
import { 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  User, 
  Building2, 
  Sparkles,
  ArrowRight,
  ExternalLink
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

export default async function ProjectsPage() {
  const { clients } = await getDashboardData();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-blue-400" />
            Client Engagements & Milestones
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Active consulting projects for Priya Sharma. Each milestone ties directly into genuine PayPal Sandbox payment orders.
          </p>
        </div>

        {/* AI Brief Extractor Component (Phase 6) */}
        <div className="flex items-center gap-2">
          <ProjectBriefExtractor />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="space-y-6">
        {clients.map((client) => {
          const project = client.projects[0];
          if (!project) return null;

          const totalPaid = project.milestones
            .filter((m) => m.status === "paid")
            .reduce((sum, m) => sum + m.amount, 0);

          const totalPending = project.milestones
            .filter((m) => m.status === "payment_pending")
            .reduce((sum, m) => sum + m.amount, 0);

          return (
            <div 
              key={client.id}
              className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm hover:border-slate-700 transition-colors"
            >
              {/* Project Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {client.company ?? client.name}
                    </span>
                    <span className="text-slate-500">&bull;</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      {client.name} ({client.email})
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white">{project.name}</h2>
                  <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">{project.description}</p>
                </div>

                {/* Financial Summary for Project */}
                <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 rounded-xl p-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Contract</div>
                    <div className="text-base font-extrabold text-white font-mono">{formatCents(project.totalAmount)}</div>
                  </div>
                  <div className="w-px h-8 bg-slate-800" />
                  <div className="text-right">
                    <div className="text-[10px] text-emerald-400 uppercase font-semibold">Collected</div>
                    <div className="text-base font-extrabold text-emerald-400 font-mono">{formatCents(totalPaid)}</div>
                  </div>
                  {totalPending > 0 && (
                    <>
                      <div className="w-px h-8 bg-slate-800" />
                      <div className="text-right">
                        <div className="text-[10px] text-amber-400 uppercase font-semibold">Pending</div>
                        <div className="text-base font-extrabold text-amber-400 font-mono">{formatCents(totalPending)}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Milestones Timeline */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Payment Milestones ({project.milestones.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project.milestones.map((milestone) => (
                    <div 
                      key={milestone.id}
                      className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-slate-200 block">
                            {milestone.name}
                          </span>
                          <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-slate-500" /> Due {formatDate(milestone.dueDate)}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-white font-mono">
                          {formatCents(milestone.amount)}
                        </span>
                      </div>

                      <div className="border-t border-slate-800/60 pt-2 flex items-center justify-between text-xs">
                        {milestone.status === "paid" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid & Captured
                          </span>
                        ) : milestone.status === "payment_pending" ? (
                          <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            Awaiting Sandbox Payment
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">
                            Planned Milestone
                          </span>
                        )}

                        <Link
                          href="/payments"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 hover:underline"
                        >
                          <span>View in Ledger</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}

