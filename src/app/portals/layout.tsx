import React from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";

export default function PortalsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F1F5F9] transition-colors duration-200">
      {/* Top Permanent 112 Banner */}
      <div className="bg-red-600 text-white font-bold py-2 px-4 text-center text-xs sm:text-sm shadow-xs sticky top-0 z-50">
        🚨 In an emergency call 112 / local disaster helpline first. RESQNET does not dispatch rescue.
      </div>

      {/* Simulated Portal Environment Banner */}
      <div className="bg-slate-900 dark:bg-slate-950 text-slate-200 py-1.5 px-4 text-center text-xs font-semibold tracking-wide flex items-center justify-center gap-2 border-b border-slate-800">
        <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full text-[10px] font-mono uppercase">SIMULATED PORTALS</span>
        <span>Mock Government & Agency Portals for Supervised Browser-Agent Execution</span>
      </div>

      {/* Mini Portal Navigation */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121827] shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏛️</span>
            <div>
              <span className="font-bold text-slate-800 dark:text-white text-base">DISASTER PORTAL NETWORK</span>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold ml-2">[SIMULATED]</span>
            </div>
          </div>
          <nav className="flex items-center gap-4 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link href="/portals/rescue" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Rescue Teams</Link>
            <Link href="/portals/rescue/request" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Rescue Request</Link>
            <Link href="/portals/shelters" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Shelters</Link>
            <Link href="/portals/shelters/register" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Shelter Registration</Link>
            <Link href="/portals/hospitals" className="hover:text-blue-600 dark:hover:text-blue-400 transition">Hospitals</Link>
            <Link href="/portals/admin" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">Admin Portal</Link>
            <Link href="/" className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 ml-2">← Back to App</Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
