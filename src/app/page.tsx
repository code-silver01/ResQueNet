"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SafetyBanner from "@/components/SafetyBanner";
import Navbar from "@/components/Navbar";

export default function HomePage() {
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const handleStartCoordination = async () => {
    setDemoLoading(true);
    setDemoError(null);
    try {
      const res = await fetch("/api/demo/flood", { method: "POST" });
      const data = await res.json();
      if (data.success && data.incidentId) {
        router.push(`/agent/${data.incidentId}`);
      } else {
        setDemoError(data.error || "Failed to initialize rescue workflow.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setDemoError(`Network error launching coordination: ${msg}`);
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-[#0F172A] dark:text-[#F1F5F9] transition-colors duration-200">
      <SafetyBanner />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-12 sm:py-16 space-y-20">
        {/* =========================================================
            SECTION 1: HERO
        ========================================================= */}
        <section className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-wider mb-6 border border-blue-200 dark:border-blue-800">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span>Autonomous Browser Agent • Supervised Field Dispatch</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            RESQNET
          </h1>

          <p className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 mt-4 tracking-tight">
            Disaster Rescue Coordination at the Speed of Software.
          </p>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 mt-4 font-normal leading-relaxed max-w-3xl mx-auto">
            An autonomous browser agent that visibly traverses disaster portals, extracts live relief rosters, evaluates resources with open mathematical rules, and prepares validated dispatch forms —{" "}
            <span className="font-bold text-rose-600 dark:text-rose-400 underline decoration-2">
              with a human supervisor approving every submission.
            </span>
          </p>

          {/* Primary Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleStartCoordination}
              disabled={demoLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 px-8 rounded-2xl shadow-md hover:shadow-lg transition text-base flex items-center gap-2.5 disabled:opacity-50 active:scale-[0.99]"
            >
              {demoLoading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Initializing Autonomous Agent...</span>
                </>
              ) : (
                <>
                  <span>🚀</span>
                  <span>Launch Live Coordination</span>
                  <span>→</span>
                </>
              )}
            </button>

            <Link
              href="/report"
              className="bg-white dark:bg-[#121827] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold py-4 px-6 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xs transition text-base"
            >
              File Incident Report
            </Link>

            <Link
              href="/dashboard"
              className="bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold py-4 px-6 rounded-2xl transition text-base"
            >
              Incident Dashboard
            </Link>
          </div>

          {demoError && (
            <div className="mt-4 bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800 text-xs p-3 rounded-xl font-medium max-w-md mx-auto">
              {demoError}
            </div>
          )}

          {/* Key Platform Metric Badges */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white dark:bg-[#121827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-2xl font-black text-blue-600 dark:text-blue-400 block">100%</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">Deterministic Scoring</span>
              <span className="text-[11px] text-slate-400 block">LLM never ranks resources</span>
            </div>
            <div className="bg-white dark:bg-[#121827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-2xl font-black text-slate-900 dark:text-white block">0</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">Autonomous Submissions</span>
              <span className="text-[11px] text-slate-400 block">Strict human approval gate</span>
            </div>
            <div className="bg-white dark:bg-[#121827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 block">7</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">Automated Tools</span>
              <span className="text-[11px] text-slate-400 block">Browser agent visits real portals</span>
            </div>
            <div className="bg-white dark:bg-[#121827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 block">$0</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">Free Local Stack</span>
              <span className="text-[11px] text-slate-400 block">Zero AWS • Local SQLite</span>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 2: PIPELINE WORKFLOW (HOW IT WORKS)
        ========================================================= */}
        <section className="bg-white dark:bg-[#121827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
              THE 4-STAGE PIPELINE
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              How Supervised Coordination Works
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Combining autonomous browser efficiency with human moral accountability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-50 dark:bg-[#1A2234] p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-black text-base mb-4 shadow-xs">
                  1
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Intelligent Intake</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  Messy user disaster reports are converted into typed JSON schemas via Gemini 1.5 Flash. Field counts, mobility limitations, and hazards are parsed instantly.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                JSON Schema Extraction
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 dark:bg-[#1A2234] p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-black text-base mb-4 shadow-xs">
                  2
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Browser Traversal</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  The Playwright agent visibly opens real advisory websites and live directory portals under <code className="text-[11px]">/portals/*</code>, scraping rosters, capacities, and active alerts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Playwright Chromium
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 dark:bg-[#1A2234] p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-black text-base mb-4 shadow-xs">
                  3
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Mathematical Triage</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  A transparent 100-point formula scores resources by capability, Haversine distance, and physical accessibility. Non-accessible shelters are automatically disqualified.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Haversine + Wheelchair Filter
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 dark:bg-[#1A2234] p-6 rounded-2xl border border-slate-200 dark:border-slate-700/80 relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center font-black text-base mb-4 shadow-xs">
                  4
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Human Approval Gate</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                  The agent fills out the target dispatch form, captures a screenshot, and completely halts. Only when a human clicks &quot;Approve&quot; does it commit the transaction.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Zero Unauthorized Submits
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 3: CORE PLATFORM FEATURES
        ========================================================= */}
        <section className="space-y-8">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              FULL CAPABILITY MATRIX
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Built for High-Stakes Operations
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Every feature designed to eliminate latency while maintaining total auditability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#121827] border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center text-2xl mb-4">
                🌐
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Beyond the Browser Traversal</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Rather than being locked in a conversational chat window, the agent navigates external web pages, fills real HTML form inputs, selects dropdowns, and checks conditional checkboxes.
              </p>
            </div>

            <div className="bg-white dark:bg-[#121827] border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center text-2xl mb-4">
                ⚖️
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Transparent Mathematical Scoring</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Resource scoring is 100% deterministic and open for review. Users see exact breakdowns: Capability Match (40 pts) + Geospatial Distance (30 pts) + Freshness & Verification (20 pts).
              </p>
            </div>

            <div className="bg-white dark:bg-[#121827] border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center text-2xl mb-4">
                ♿
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Inherent Accessibility Protection</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                If an evacuee has non-ambulatory needs or requires mobility support, shelters lacking wheelchair ramps are strictly eliminated from recommendations, preventing dangerous mismatches.
              </p>
            </div>

            <div className="bg-white dark:bg-[#121827] border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center text-2xl mb-4">
                🔍
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">MissingLink Person Locator</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Fuzzy Levenshtein & token similarity searches across municipal shelter and hospital reception logs to reconnect separated families without exposing private clinical health records.
              </p>
            </div>

            <div className="bg-white dark:bg-[#121827] border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center text-2xl mb-4">
                📋
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Emergency Medical Relay</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Generates 1-page standardized printable triage summaries with critical allergy alerts, chronic conditions, and emergency contacts for frontline paramedics and hospital trauma bays.
              </p>
            </div>

            <div className="bg-white dark:bg-[#121827] border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center text-2xl mb-4">
                📊
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Full Lifecycle Audit Trail</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                Every single agent step logs its target URL, execution timestamp, tool name, and visual screenshot to SQLite. Coordinators can audit every second of agent activity on the dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 4: PORTAL ECOSYSTEM SHOWCASE
        ========================================================= */}
        <section className="bg-white dark:bg-[#121827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                CONNECTED AGENT TARGETS
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Live Disaster Portal Network
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                The agent navigates these mock public sector and agency web portals in real-time.
              </p>
            </div>
            <Link
              href="/portals/admin"
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold px-4 py-2 rounded-xl transition"
            >
              Open Dispatcher Admin View →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <Link
              href="/portals/rescue"
              className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 transition block"
            >
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>🚤 Rescue Operations</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">SIMULATED</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Roster of boat rescue strike teams, swift water units, and ambulances.
              </p>
            </Link>

            <Link
              href="/portals/shelters"
              className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 transition block"
            >
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>🏢 Shelter Directory</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">SIMULATED</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Capacity counts, wheelchair ramp accessibility flags, and rations.
              </p>
            </Link>

            <Link
              href="/portals/hospitals"
              className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 transition block"
            >
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>🏥 Trauma Hospitals</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">SIMULATED</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Emergency trauma center beds, 24/7 ICU status, and triage bays.
              </p>
            </Link>

            <Link
              href="/portals/registry/shelters"
              className="p-4 rounded-2xl bg-slate-50 dark:bg-[#1A2234] border border-slate-200 dark:border-slate-700/80 hover:border-slate-400 dark:hover:border-slate-600 transition block"
            >
              <div className="font-bold text-slate-900 dark:text-white flex items-center justify-between">
                <span>📋 Public Registries</span>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono">SIMULATED</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Non-clinical shelter and hospital reception logs for MissingLink searches.
              </p>
            </Link>
          </div>
        </section>

        {/* =========================================================
            SECTION 5: ABOUT US / MISSION & PHILOSOPHY
        ========================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
              OUR MISSION & PHILOSOPHY
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Why We Built Supervised Browser Automation
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              In natural disasters like floods, earthquakes, and storms, emergency telephone hotlines quickly become overwhelmed. Stranded citizens and local volunteers are forced to cross-check dozens of disjointed web portals, spreadsheets, and municipal notices to find shelter and rescue assets.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Standard AI chatbots fail in this scenario: they hallucinate dispatch statuses, cannot navigate live interactive forms, and carry no legal or ethical accountability.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>RESQNET solves this through Supervised Browser Automation:</strong> The agent does the heavy lifting of opening websites, reading criteria, calculating distances, and filling forms in seconds — but halts before submission, putting final authority into the hands of a human operator.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600">✓</span> Zero Hallucinated Dispatch
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600">✓</span> Full Visual Audit Trail
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600">✓</span> 100% Free & Open Source
              </span>
            </div>
          </div>

          <div className="md:col-span-5 bg-slate-100 dark:bg-[#121827] border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-3">
              Core Operational Safeguards
            </h3>
            <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span><strong>Truth in Status:</strong> The platform will never assert &quot;rescue is on the way&quot;. Only verified reference IDs from real portals are logged.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-600 font-bold">2.</span>
                <span><strong>Emergency Escalation:</strong> Acute medical risks immediately trigger high-priority prompts advising direct calls to emergency 112.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-600 font-bold">3.</span>
                <span><strong>Privacy Containment:</strong> Medical handover data is strictly gated behind per-incident user consent.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">4.</span>
                <span><strong>Attribution Badges:</strong> Every data point is tagged as OFFICIAL, USER-REPORTED, or SIMULATED.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* =========================================================
            SECTION 6: FREQUENTLY ASKED QUESTIONS (FAQ)
        ========================================================= */}
        <section className="bg-white dark:bg-[#121827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
              QUESTIONS & ANSWERS
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 dark:text-slate-300">
            <div className="bg-slate-50 dark:bg-[#1A2234] p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                Does RESQNET dispatch real emergency vehicles?
              </h3>
              <p className="leading-relaxed">
                No. RESQNET is an experimental rescue coordination decision support tool. It integrates with real and simulated web portals. In a genuine life-threatening emergency, always dial 112 or your regional disaster helpline immediately.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-[#1A2234] p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                Why does the agent pause before submitting forms?
              </h3>
              <p className="leading-relaxed">
                This is our core safety rule. Submitting requests to emergency portals commits actual logistical resources. The agent fills out all fields, takes a full visual screenshot, and requires an authorized human supervisor to inspect the payload and approve submission.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-[#1A2234] p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                How does the deterministic scoring formula work?
              </h3>
              <p className="leading-relaxed">
                We combine: Capability Fit (40 pts) + Haversine distance (30 pts) + Accessibility (15 pts) + Verification level (10 pts) + Data freshness (5 pts). The LLM never ranks options; scoring is mathematically computed and completely transparent.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-[#1A2234] p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                Can RESQNET operate completely locally without external cloud APIs?
              </h3>
              <p className="leading-relaxed">
                Yes! The entire stack runs locally using SQLite and Playwright Chromium. It contains built-in heuristic parsers and offline fallback caches, guaranteeing operation even during severe network degradation.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            SECTION 7: FOOTER
        ========================================================= */}
        <footer className="border-t border-slate-200 dark:border-slate-800 pt-8 pb-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              <div className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center font-black text-[10px]">
                RQ
              </div>
              <span>RESQNET • Supervised Rescue Coordination</span>
            </div>
            <div className="flex gap-4">
              <Link href="/report" className="hover:underline">Report Incident</Link>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Link href="/find" className="hover:underline">Find Person</Link>
              <Link href="/portals/rescue" className="hover:underline">Mock Portals</Link>
              <Link href="/portals/admin" className="hover:underline">Dispatcher Admin</Link>
            </div>
          </div>
          <p className="text-[11px] text-center text-slate-400 dark:text-slate-500">
            Demonstration System • All demo portals, teams, and data marked SIMULATED • Does not replace official 112 emergency services.
          </p>
        </footer>
      </main>
    </div>
  );
}
