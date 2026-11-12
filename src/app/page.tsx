import React from "react";
import { CheckCircle2, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-12">
      <div className="max-w-4xl mx-auto w-full space-y-8">
        <header className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-500/20">
              CP
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">CashPilot</h1>
              <p className="text-xs text-slate-400">Cash-Flow Autopilot for Solo Businesses</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800/60">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Phase 0 Bootstrap Ready
          </span>
        </header>

        <section className="space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Smart Cash-Flow Forecasting & PayPal Autopilot
          </h2>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed">
            Eliminate late-payment surprises. Connect project milestones to genuine PayPal Sandbox checkouts,
            forecast cash runways with real-time webhooks, and trigger intelligent schedule replanning.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="text-blue-400 flex items-center gap-2 font-semibold text-sm">
              <Zap className="w-4 h-4" /> PayPal Sandbox
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real server-side order creation, buyer approval links, and idempotent webhook capture handling.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="text-emerald-400 flex items-center gap-2 font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" /> Decimal-Safe Flow
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deterministic cash balance calculations with strict separation of actual funds and forecast models.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="text-purple-400 flex items-center gap-2 font-semibold text-sm">
              <CheckCircle2 className="w-4 h-4" /> AI Work Replanning
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated task dependency reprioritization when incoming milestone payments are delayed.
            </p>
          </div>
        </div>

        <section className="border border-slate-800 rounded-xl p-6 bg-slate-900/40 space-y-3">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Implementation Progress</h3>
          <ul className="text-xs text-slate-400 space-y-2 font-mono">
            <li className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" /> [Phase 0] Next.js 15, TypeScript, Tailwind CSS, Git initialized
            </li>
            <li className="flex items-center gap-2 text-slate-500">
              <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" /> [Phase 1] PostgreSQL (Neon) & Demo Seed
            </li>
            <li className="flex items-center gap-2 text-slate-500">
              <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" /> [Phase 2] AG Grid Interactive Ledger
            </li>
            <li className="flex items-center gap-2 text-slate-500">
              <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" /> [Phase 3] PayPal Sandbox Orders & Capture
            </li>
            <li className="flex items-center gap-2 text-slate-500">
              <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" /> [Phase 4] Signature Verification & Webhook Idempotency
            </li>
          </ul>
        </section>
      </div>

      <footer className="max-w-4xl mx-auto w-full border-t border-slate-800/80 pt-6 mt-12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <span>PayPal AI Hackathon 2026 Project</span>
        <span>Target: Best Use of PayPal + AI</span>
      </footer>
    </main>
  );
}

