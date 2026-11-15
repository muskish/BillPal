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
    <header className="sticky top-0 z-50 glass border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center font-black text-lg text-sky-600 shadow-lg shadow-sky-400/20 group-hover:scale-105 transition-transform">
                BP
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white drop-shadow group-hover:text-sky-100 transition-colors">
                  BillPal
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded glass-pill text-white/90 border border-white/30">
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
                        ? "bg-white/30 text-white shadow-sm border border-white/40 backdrop-blur-sm"
                        : "text-white/70 hover:text-white hover:bg-white/15"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-white/60"}`} />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md glass-pill text-white/90 border border-white/30">
              <Database className="w-3 h-3 text-emerald-200" />
              <span>Neon PostgreSQL</span>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-white/20">
              <div className="w-7 h-7 rounded-full bg-white/90 border border-white/50 flex items-center justify-center text-xs font-semibold text-sky-600">
                MS
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold text-white leading-tight drop-shadow">
                  {freelancerName ?? "Muskan Shaikh"}
                </div>
                <div className="text-[10px] text-white/60 leading-none">Solo UX Consultant</div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center space-x-1 py-2 overflow-x-auto border-t border-white/15 scrollbar-none">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? "bg-white/30 text-white border border-white/40"
                    : "text-white/70 hover:text-white"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-white/60"}`} />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
