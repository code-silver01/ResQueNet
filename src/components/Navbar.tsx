"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/report", label: "🚨 Report Incident" },
    { href: "/dashboard", label: "📊 Incident Dashboard" },
    { href: "/find", label: "🔍 Find a Person" },
    { href: "/portals/rescue", label: "🌐 Demo Portals" },
    { href: "/portals/admin", label: "🛡️ Admin Dispatch" },
  ];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0D121F]/95 backdrop-blur-md sticky top-[41px] z-40 shadow-2xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
            RQ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">
                RESQNET
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 uppercase">
                SUPERVISED AGENT
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Browser-Agent Disaster Rescue Coordination
            </span>
          </div>
        </Link>

        {/* Links + Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <nav className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold">
            {links.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-xl transition-all duration-150 text-xs sm:text-sm ${
                    isActive
                      ? "bg-slate-900 dark:bg-blue-600 text-white shadow-2xs font-bold"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="pl-1 border-l border-slate-200 dark:border-slate-800">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
