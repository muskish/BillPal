"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  CreditCard, 
  TrendingUp, 
  CalendarClock,
  Database,
  ShieldCheck
} from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: Briefcase },
  { href: "/payments", label: "Payments (AG Grid)", icon: CreditCard },
  { href: "/cash-flow", label: "Cash Flow", icon: TrendingUp },
  { href: "/action-plan", label: "Action Plan", icon: CalendarClock },
];

export function Navbar({ freelancerName }: { freelancerName?: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-black text-lg text-white shadow-md shadow-blue-600/30 group-hover:scale-105 transition-transform">
                BP
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white group-hover:text-blue-400 transition-colors">
                  BillPal
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-950/80 text-blue-400 border border-blue-800/60">
                  PayPal + AI
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {NAV_LINKS.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Neon PostgreSQL</span>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-semibold text-slate-300">
                MS
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-slate-200 leading-tight">
                  {freelancerName ?? "Muskan Shaikh"}
                </div>
                <div className="text-[10px] text-slate-400 leading-none">Solo UX Consultant</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center space-x-1 py-2 overflow-x-auto border-t border-slate-800/60 scrollbar-none">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? "bg-slate-800 text-white border border-slate-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}

