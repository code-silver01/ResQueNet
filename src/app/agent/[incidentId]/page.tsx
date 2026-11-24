"use client";

import React, { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import SafetyBanner from "@/components/SafetyBanner";
import Navbar from "@/components/Navbar";
import SourceBadge from "@/components/SourceBadge";
import StatusBadge from "@/components/StatusBadge";
import { ScoredResource } from "@/lib/scorer";
import { AgentStepData } from "@/lib/agent/tools";

type PageParams = { incidentId: string };

export default function AgentRunPage({ params }: { params: Promise<PageParams> }) {
  const { incidentId } = use(params);

  // Agent State
  const [steps, setSteps] = useState<AgentStepData[]>([]);
  const [status, setStatus] = useState<
    "initializing" | "running" | "awaiting_approval" | "submitting" | "submitted" | "failed" | "cancelled"
  >("initializing");
  const [currentTool, setCurrentTool] = useState<string>("");
  const [comparisonTable, setComparisonTable] = useState<ScoredResource[]>([]);
  const [approvalData, setApprovalData] = useState<{
    requestId: string;
    screenshot: string;
    targetResource?: any;
  } | null>(null);

  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    portalRef?: string;
    text: string;
  } | null>(null);

  // Lightbox
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const stepsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setStatus("running");
    const eventSource = new EventSource(`/api/agent/run?incidentId=${incidentId}`);

    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);

        if (payload.type === "tool_start") {
          setCurrentTool(payload.tool);
        } else if (payload.type === "step") {
          setSteps((prev) => [...prev, payload.data]);
          stepsEndRef.current?.scrollIntoView({ behavior: "smooth" });
        } else if (payload.type === "comparison_table") {
          setComparisonTable(payload.data);
        } else if (payload.type === "awaiting_approval") {
          setStatus("awaiting_approval");
          setApprovalData({
            requestId: payload.requestId,
            screenshot: payload.filledFormScreenshot,
            targetResource: payload.targetResource,
          });
          eventSource.close();
        } else if (payload.type === "done") {
          eventSource.close();
        } else if (payload.type === "error") {
          setStatus("failed");
          eventSource.close();
        }
      } catch (err) {
        console.error("SSE parse error:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("SSE connection closed or ended:", err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [incidentId]);

  const handleApprove = async () => {
    if (!approvalData) return;
    setStatus("submitting");

    try {
      const res = await fetch("/api/agent/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: approvalData.requestId }),
      });
      const data = await res.json();

      if (data.success && data.result && data.result.success) {
        setStatus("submitted");
        setSubmissionResult({
          success: true,
          portalRef: data.result.portalRef,
          text: data.result.confirmationText,
        });
        if (data.steps) {
          setSteps((prev) => [...prev, ...data.steps.map((s: any) => s.data || s)]);
        }
      } else {
        setStatus("failed");
        setSubmissionResult({
          success: false,
          text: data.result?.confirmationText || data.error || "Portal submission rejected.",
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatus("failed");
      setSubmissionResult({
        success: false,
        text: `Network or browser crash during submission: ${msg}`,
      });
    }
  };

  const handleCancel = () => {
    setStatus("cancelled");
  };

  const toolLabels: Record<string, string> = {
    search_official_sources: "🔍 search_official_sources",
    open_resource_directory: "📂 open_resource_directory",
    extract_resource_details: "📋 extract_resource_details",
    compare_resources: "⚖️ compare_resources",
    prepare_rescue_request: "📝 prepare_rescue_request",
    fill_rescue_form: "✍️ fill_rescue_form",
    submit_form: "📤 submit_form",
    confirm_submission: "✅ confirm_submission",
    track_request: "📡 track_request",
    find_relief_schemes: "📜 find_relief_schemes",
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#121316] text-[#202124] dark:text-[#E8EAED] pb-16 transition-colors duration-200">
      <SafetyBanner />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#4285F4]/10 dark:bg-[#4285F4]/20 text-[#1A73E8] dark:text-[#8AB4F8] font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#4285F4]/30">
                MODULE 2 & 3 • RESCUEMATCH BROWSER AGENT
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Incident ID: {incidentId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Live Supervised Browser-Agent Execution
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {status === "running" && (
              <span className="flex items-center gap-2 text-xs font-bold text-[#1A73E8] dark:text-[#8AB4F8] bg-[#4285F4]/10 dark:bg-[#4285F4]/20 border border-[#4285F4]/30 px-3 py-1.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#4285F4] animate-ping" />
                <span>Executing: {toolLabels[currentTool] || currentTool || "Initializing Browser..."}</span>
              </span>
            )}
            <StatusBadge
              status={
                status === "awaiting_approval"
                  ? "Awaiting approval"
                  : status === "submitting"
                  ? "Agent running"
                  : status === "submitted"
                  ? "Submitted"
                  : status === "failed"
                  ? "Submission failed"
                  : status === "cancelled"
                  ? "Cancelled"
                  : "Agent running"
              }
            />
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Real-Time Browser Agent Activity Feed (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#282A2E] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span>📡</span> Live Agent Activity & Audit Log
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tool invocations, portal URLs, and visual screenshots logged in real-time.
                </p>
              </div>
              <span className="text-xs font-mono font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-2.5 py-0.5 rounded-full">
                {steps.length} Steps
              </span>
            </div>

            <div className="p-4 space-y-4 max-h-[640px] overflow-y-auto">
              {steps.length === 0 ? (
                <div className="py-16 text-center text-slate-400 dark:text-slate-500">
                  <div className="w-8 h-8 border-3 border-slate-300 dark:border-slate-700 border-t-[#EA4335] rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm font-medium">Launching Chromium instance in worker sandbox...</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Visiting official disaster advisories and portals.</p>
                </div>
              ) : (
                steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#282A2E]/50 hover:bg-slate-50 dark:hover:bg-[#282A2E] transition"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold bg-slate-800 dark:bg-slate-900 text-white px-2 py-0.5 rounded-md">
                          {toolLabels[step.tool] || step.tool}
                        </span>
                        <SourceBadge type={step.badge} />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 shrink-0">
                        {new Date(step.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{step.summary}</p>
                    <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 truncate mt-1">Target URL: {step.url}</p>

                    {step.screenshot_path && (
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => setLightboxImg(step.screenshot_path)}
                          className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-2xs block text-left bg-black"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={step.screenshot_path}
                            alt={step.tool}
                            className="w-full max-h-36 object-cover opacity-90 group-hover:opacity-100 transition"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                            🔍 Enlarge Capture
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
              <div ref={stepsEndRef} />
            </div>
          </div>

          {/* Right Column: Comparison Table & Human Approval Gate (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* HUMAN SUPERVISOR APPROVAL GATE */}
            {status === "awaiting_approval" && approvalData && (
              <div className="bg-[#FBBC04]/10 dark:bg-[#FBBC04]/15 border-2 border-[#FBBC04] rounded-3xl p-6 shadow-md">
                <div className="flex items-center gap-2 text-[#B06000] dark:text-[#FDD663] font-extrabold text-sm uppercase tracking-wider mb-2">
                  <span className="text-lg animate-bounce">✋</span>
                  <span>Human Supervisor Approval Required</span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-3">
                  The autonomous browser agent has opened the official portal form, filled all contact, triage, and capability fields, and taken the verification screenshot below.{" "}
                  <strong>The agent is hard-blocked and will NEVER submit without your explicit click.</strong>
                </p>

                <div className="bg-white dark:bg-[#1E1F23] border border-[#FBBC04]/40 rounded-2xl p-3 mb-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Filled Form Capture:</span>
                    <span className="font-mono text-[#B06000] dark:text-[#FDD663] font-semibold">{approvalData.requestId}</span>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={approvalData.screenshot}
                    alt="Filled form preview"
                    onClick={() => setLightboxImg(approvalData.screenshot)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:opacity-95 transition"
                  />
                  <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-1.5">
                    Click image to inspect in full resolution.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleApprove}
                    className="flex-1 bg-[#34A853] hover:bg-[#2D9247] text-white font-extrabold py-3.5 px-4 rounded-xl shadow-xs transition text-sm flex items-center justify-center gap-1.5"
                  >
                    <span>✓</span>
                    <span>Approve Submission</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-3.5 px-4 rounded-xl transition text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Submitting Spinner */}
            {status === "submitting" && (
              <div className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center shadow-sm">
                <div className="w-8 h-8 border-3 border-[#FBBC04] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Committing Portal Submission</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Playwright browser is clicking the submit button on the portal and awaiting the confirmation voucher ID...
                </p>
              </div>
            )}

            {/* Submission Result Notice */}
            {submissionResult && (
              <div
                className={`rounded-3xl p-6 border-2 shadow-sm ${
                  submissionResult.success
                    ? "bg-[#34A853]/10 dark:bg-[#34A853]/15 border-[#34A853] text-[#137333] dark:text-[#81C995]"
                    : "bg-[#EA4335]/10 dark:bg-[#EA4335]/15 border-[#EA4335] text-[#C5221F] dark:text-[#F28B82]"
                }`}
              >
                <div className="flex items-center gap-2 text-base font-bold mb-2">
                  <span>{submissionResult.success ? "✅" : "❌"}</span>
                  <span>{submissionResult.success ? "Portal Submission Confirmed" : "Submission Failed"}</span>
                </div>

                {submissionResult.portalRef && (
                  <p className="font-mono text-sm font-bold bg-white dark:bg-[#1E1F23] px-3 py-1.5 rounded-xl border border-[#34A853]/30 inline-block mb-2">
                    Official Reference: {submissionResult.portalRef}
                  </p>
                )}

                <p className="text-xs leading-relaxed mb-4 text-slate-700 dark:text-slate-300">{submissionResult.text}</p>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <Link
                    href="/dashboard"
                    className="bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition"
                  >
                    View in Live Dashboard →
                  </Link>
                  <Link
                    href={`/medical/${incidentId}`}
                    className="bg-white dark:bg-[#1E1F23] text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-[#282A2E] transition"
                  >
                    Medical Handover Preview →
                  </Link>
                </div>
              </div>
            )}

            {status === "cancelled" && (
              <div className="bg-slate-100 dark:bg-[#282A2E] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 text-center text-xs text-slate-600 dark:text-slate-400">
                Supervisor cancelled submission. No transaction was committed to the portal.
              </div>
            )}

            {/* Deterministic Resource Scoring Table */}
            {comparisonTable.length > 0 && (
              <div className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#282A2E]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        ⚖️ Deterministic Resource Scoring Table
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Formula: Capability (40) + Distance (30) + Accessibility (15) + Verif (10) + Freshness (5)
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#4285F4] bg-[#4285F4]/10 dark:bg-[#4285F4]/20 border border-[#4285F4]/30 px-2 py-0.5 rounded-full">
                      RULE-BASED
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#282A2E] border-b border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-400">
                      <tr>
                        <th className="px-3 py-2.5">Resource</th>
                        <th className="px-2 py-2.5">Dist</th>
                        <th className="px-2 py-2.5">Breakdown</th>
                        <th className="px-2 py-2.5 text-right">Score</th>
                        <th className="px-2 py-2.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {comparisonTable.map((item, idx) => {
                        const isFiltered = !item.hardFilterPassed;
                        const isTop = idx === 0 && item.hardFilterPassed;
                        return (
                          <tr
                            key={item.resource.id}
                            className={`${
                              isFiltered
                                ? "bg-rose-50/70 dark:bg-rose-950/20 text-slate-400 dark:text-slate-500 opacity-60"
                                : isTop
                                ? "bg-emerald-50/70 dark:bg-emerald-950/20 font-semibold"
                                : "hover:bg-slate-50 dark:hover:bg-[#282A2E]/50"
                            }`}
                          >
                            <td className="px-3 py-2.5">
                              <div className={`font-bold ${isFiltered ? "line-through text-slate-500" : "text-slate-900 dark:text-slate-100"}`}>
                                {item.resource.name}
                              </div>
                              <div className="text-[10px] text-slate-400 capitalize flex items-center gap-1.5 mt-0.5">
                                <span>{item.resource.type}</span>
                                <span>•</span>
                                <span className={item.resource.confirmed ? "text-[#34A853]" : "text-[#FBBC04]"}>
                                  {item.resource.confirmed ? "✓ Confirmed" : "? Unverified"}
                                </span>
                              </div>
                              {isFiltered && (
                                <div className="text-[10px] text-[#EA4335] dark:text-[#F28B82] font-bold mt-1">
                                  ⚠️ {item.hardFilterReason}
                                </div>
                              )}
                            </td>
                            <td className="px-2 py-2.5 whitespace-nowrap text-slate-600 dark:text-slate-400">
                              {item.distanceKm} km
                            </td>
                            <td className="px-2 py-2.5 whitespace-nowrap font-mono text-[10px] text-slate-500 dark:text-slate-400">
                              {item.breakdown.capabilityFit}+{item.breakdown.distance}+{item.breakdown.accessibilityFit}
                            </td>
                            <td className="px-2 py-2.5 text-right font-mono font-bold whitespace-nowrap">
                              <span className={item.totalScore >= 60 ? "text-[#34A853] text-sm" : "text-slate-700 dark:text-slate-300"}>
                                {item.totalScore}
                              </span>
                              <span className="text-[10px] text-slate-400">/100</span>
                            </td>
                            <td className="px-2 py-2.5 text-center whitespace-nowrap">
                              {isFiltered ? (
                                <span className="text-[10px] font-bold bg-[#EA4335]/10 text-[#EA4335] dark:bg-[#EA4335]/20 dark:text-[#F28B82] px-2 py-0.5 rounded-full">
                                  Filtered
                                </span>
                              ) : isTop ? (
                                <span className="text-[10px] font-bold bg-[#34A853]/10 text-[#137333] dark:bg-[#34A853]/20 dark:text-[#81C995] px-2 py-0.5 rounded-full">
                                  Top Pick
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                                  Eligible
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-[#282A2E] border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  Notice: Wheelchair filter strictly eliminates shelters lacking ramps when mobility-assistance count &gt; 0.
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setLightboxImg(null)}
        >
          <div className="max-w-5xl w-full bg-white dark:bg-[#1E1F23] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#282A2E]">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">Playwright Visual Verification Capture</span>
              <button
                onClick={() => setLightboxImg(null)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-white font-bold px-2 py-1 text-sm"
              >
                ✕ Close
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={lightboxImg} alt="Screenshot Full View" className="w-full max-h-[80vh] object-contain bg-slate-900" />
          </div>
        </div>
      )}
    </div>
  );
}
