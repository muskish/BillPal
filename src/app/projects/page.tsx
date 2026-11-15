import React from "react";
import { getDashboardData } from "@/lib/db/queries";
import Link from "next/link";
import { ProjectBriefExtractor } from "@/components/ProjectBriefExtractor";
import { 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  User, 
  Building2, 
  ArrowRight,
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
      <div className="glass rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5 drop-shadow">
            <Briefcase className="w-6 h-6 text-white/80" />
            Client Engagements &amp; Milestones
          </h1>
          <p className="text-xs sm:text-sm text-white/65 mt-1">
            Active consulting projects for Muskan Shaikh. Each milestone ties directly into genuine PayPal Sandbox payment orders.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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
              className="glass rounded-2xl p-6 space-y-6 shadow-sm hover:border-white/50 transition-colors"
            >
              {/* Project Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/80 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {client.company ?? client.name}
                    </span>
                    <span className="text-white/30">&bull;</span>
                    <span className="text-xs text-white/55 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-white/40" />
                      {client.name} ({client.email})
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white drop-shadow">{project.name}</h2>
                  <p className="text-xs text-white/60 max-w-3xl leading-relaxed">{project.description}</p>
                </div>

                {/* Financial Summary */}
                <div className="flex items-center gap-3 glass-dark border border-white/20 rounded-xl p-3 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-white/50 uppercase font-semibold">Total Contract</div>
                    <div className="text-base font-extrabold text-white font-mono">{formatCents(project.totalAmount)}</div>
                  </div>
                  <div className="w-px h-8 bg-white/20" />
                  <div className="text-right">
                    <div className="text-[10px] text-emerald-200 uppercase font-semibold">Collected</div>
                    <div className="text-base font-extrabold text-emerald-200 font-mono">{formatCents(totalPaid)}</div>
                  </div>
                  {totalPending > 0 && (
                    <>
                      <div className="w-px h-8 bg-white/20" />
                      <div className="text-right">
                        <div className="text-[10px] text-amber-200 uppercase font-semibold">Pending</div>
                        <div className="text-base font-extrabold text-amber-200 font-mono">{formatCents(totalPending)}</div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                  Payment Milestones ({project.milestones.length})
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project.milestones.map((milestone) => (
                    <div 
                      key={milestone.id}
                      className="glass-dark p-4 rounded-xl flex flex-col justify-between space-y-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-xs font-semibold text-white block">
                            {milestone.name}
                          </span>
                          <span className="text-[11px] text-white/50 flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-white/40" /> Due {formatDate(milestone.dueDate)}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-white font-mono">
                          {formatCents(milestone.amount)}
                        </span>
                      </div>

                      <div className="border-t border-white/10 pt-2 flex items-center justify-between text-xs">
                        {milestone.status === "paid" ? (
                          <span className="inline-flex items-center gap-1 text-emerald-200 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Paid &amp; Captured
                          </span>
                        ) : milestone.status === "payment_pending" ? (
                          <span className="inline-flex items-center gap-1.5 text-amber-200 font-semibold text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
                            Awaiting Sandbox Payment
                          </span>
                        ) : (
                          <span className="text-white/40 text-[11px]">Planned Milestone</span>
                        )}

                        <Link
                          href="/payments"
                          className="inline-flex items-center gap-1 text-[11px] text-white/70 hover:text-white hover:underline"
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
