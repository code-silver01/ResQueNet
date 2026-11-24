"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import SafetyBanner from "@/components/SafetyBanner";
import Navbar from "@/components/Navbar";
import StatusBadge from "@/components/StatusBadge";
import SourceBadge from "@/components/SourceBadge";

const PIPELINE_STAGES = ["Reported", "Matched", "Submitted", "Acknowledged", "Resolved"];

export default function DashboardPage() {
  const [data, setData] = useState<{
    incidents: any[];
    requests: any[];
    steps: any[];
    resources: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [expandedIncident, setExpandedIncident] = useState<string | null>(null);
  const [selectedTimeline, setSelectedTimeline] = useState<string | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard/data");
      const json = await res.json();
      setData(json);
      if (!expandedIncident && json.incidents?.length > 0) {
        setExpandedIncident(json.incidents[0].id);
      }
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const getRequestsForIncident = (incId: string) => {
    return data?.requests.filter((r) => r.incident_id === incId) || [];
  };

  const getStepsForRequest = (reqId: string) => {
    return data?.steps.filter((s) => s.request_id === reqId) || [];
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#121316] text-[#202124] dark:text-[#E8EAED] pb-16 transition-colors duration-200">
      <SafetyBanner />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#4285F4]/10 dark:bg-[#4285F4]/20 text-[#1A73E8] dark:text-[#8AB4F8] font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#4285F4]/30">
                MODULE 4 • INCIDENT & AUDIT PIPELINE
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Live Auto-Refresh (10s)</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Incident Command Dashboard</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              className="bg-white dark:bg-[#1E1F23] hover:bg-slate-100 dark:hover:bg-[#282A2E] text-slate-700 dark:text-slate-200 font-bold px-3.5 py-2 rounded-xl text-xs border border-slate-300 dark:border-slate-700 shadow-2xs transition"
            >
              🔄 Refresh Feed
            </button>
            <Link
              href="/report"
              className="bg-[#EA4335] hover:bg-[#D93025] text-white font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition"
            >
              + Report New Incident
            </Link>
          </div>
        </div>

        {/* Status Pipeline Ribbon */}
        <div className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm mb-8">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            Active Disaster Lifecycle Pipeline
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PIPELINE_STAGES.map((stage, idx) => {
              const count = data?.incidents.filter((inc) => inc.status === stage).length || 0;
              return (
                <div
                  key={stage}
                  className="bg-slate-50 dark:bg-[#282A2E] border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>{idx + 1}. {stage}</span>
                  </div>
                  <div className="text-2xl font-extrabold text-[#4285F4]">{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        {loading && !data ? (
          <div className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center text-slate-400">
            <div className="w-8 h-8 border-3 border-slate-300 dark:border-slate-700 border-t-[#EA4335] rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold">Loading incidents and requests from SQLite...</p>
          </div>
        ) : !data || data.incidents.length === 0 ? (
          <div className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center text-slate-500">
            <div className="text-4xl mb-3">📭</div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Incidents Recorded Yet</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
              Run the One-Click Flood Demo from the home screen or submit a custom incident report to populate this dashboard.
            </p>
            <Link
              href="/report"
              className="mt-4 inline-block bg-[#EA4335] text-white font-bold text-xs py-2.5 px-5 rounded-xl shadow-xs hover:bg-[#D93025] transition"
            >
              Report Incident Now →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data.incidents.map((inc) => {
              const isExpanded = expandedIncident === inc.id;
              const reqs = getRequestsForIncident(inc.id);
              const needs: string[] = JSON.parse(inc.needs || "[]");

              return (
                <div
                  key={inc.id}
                  className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden transition"
                >
                  {/* Card Header Bar */}
                  <div
                    onClick={() => setExpandedIncident(isExpanded ? null : inc.id)}
                    className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#282A2E]/50 flex flex-wrap items-center justify-between gap-4 select-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {inc.incident_type === "flood"
                          ? "🌊"
                          : inc.incident_type === "fire"
                          ? "🔥"
                          : inc.incident_type === "earthquake"
                          ? "🏚️"
                          : "🆘"}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                            {inc.location_text || "Near Flooded Road"}
                          </span>
                          <span className="font-mono text-xs text-slate-400 font-semibold">{inc.id}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {inc.people_count} Individuals • Priority Score: <strong>{inc.priority_score}/15</strong> •{" "}
                          {new Date(inc.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <StatusBadge status={inc.status} />
                      <SourceBadge type="SIMULATED" confirmed={true} />
                      <span className="text-slate-400 font-mono text-sm px-1">
                        {isExpanded ? "▲" : "▼"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  {isExpanded && (
                    <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#282A2E]/30 space-y-5">
                      {/* Grid info */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        <div className="bg-white dark:bg-[#1E1F23] p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 uppercase font-bold text-[10px] block">Coordinates</span>
                          <span className="font-mono text-slate-800 dark:text-slate-200 font-semibold">
                            {inc.lat?.toFixed(4)}, {inc.lng?.toFixed(4)}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-[#1E1F23] p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 uppercase font-bold text-[10px] block">Needs Identified</span>
                          <span className="text-slate-800 dark:text-slate-200 font-semibold capitalize">
                            {needs.join(", ") || "water_rescue"}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-[#1E1F23] p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 uppercase font-bold text-[10px] block">Mobility Assistance</span>
                          <span className="text-slate-800 dark:text-slate-200 font-semibold">
                            {inc.mobility_assistance_count > 0
                              ? `${inc.mobility_assistance_count} Non-Ambulatory (Wheelchair Required)`
                              : "Standard Evacuation"}
                          </span>
                        </div>
                        <div className="bg-white dark:bg-[#1E1F23] p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-400 uppercase font-bold text-[10px] block">Medical Handover</span>
                          <span className="text-slate-800 dark:text-slate-200 font-semibold">
                            {inc.medical_consent ? "✓ Attached & Consented" : "No Medical Attachment"}
                          </span>
                        </div>
                      </div>

                      {/* Associated Requests */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                            Browser-Agent Portal Requests ({reqs.length})
                          </h4>
                          <div className="flex gap-2">
                            <Link
                              href={`/agent/${inc.id}`}
                              className="text-xs font-bold text-[#EA4335] dark:text-[#F28B82] hover:underline"
                            >
                              Open Live Agent View →
                            </Link>
                            {inc.medical_consent ? (
                              <Link
                                href={`/medical/${inc.id}`}
                                className="text-xs font-bold text-[#4285F4] dark:text-[#8AB4F8] hover:underline"
                              >
                                View Medical Handover →
                              </Link>
                            ) : null}
                          </div>
                        </div>

                        {reqs.length === 0 ? (
                          <div className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-500 dark:text-slate-400 text-center">
                            No automated requests submitted yet.{" "}
                            <Link href={`/agent/${inc.id}`} className="text-[#4285F4] font-bold underline">
                              Launch browser agent for this incident →
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {reqs.map((req) => {
                              const reqSteps = getStepsForRequest(req.id);
                              const isTimelineOpen = selectedTimeline === req.id;

                              return (
                                <div
                                  key={req.id}
                                  className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xs"
                                >
                                  <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono font-bold text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                                        {req.id}
                                      </span>
                                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                        {req.resource_name || "Emergency Resource"}
                                      </span>
                                      {req.portal_ref && (
                                        <span className="font-mono text-xs bg-[#34A853]/10 dark:bg-[#34A853]/20 text-[#137333] dark:text-[#81C995] font-bold px-2 py-0.5 rounded-full border border-[#34A853]/30">
                                          Voucher: {req.portal_ref}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <StatusBadge status={req.status} />
                                      <button
                                        onClick={() => setSelectedTimeline(isTimelineOpen ? null : req.id)}
                                        className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1 rounded-xl transition"
                                      >
                                        {isTimelineOpen ? "Hide Audit Timeline" : `Audit Trail (${reqSteps.length} Steps)`}
                                      </button>
                                    </div>
                                  </div>

                                  {req.confirmation_text && (
                                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-[#282A2E] p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-mono">
                                      {req.confirmation_text}
                                    </p>
                                  )}

                                  {/* Timeline Drawer */}
                                  {isTimelineOpen && (
                                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
                                      <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Agent Execution Steps & Verified Screenshots
                                      </h5>
                                      {reqSteps.length === 0 ? (
                                        <p className="text-xs text-slate-400">No steps recorded in audit log.</p>
                                      ) : (
                                        reqSteps.map((st: any, sIdx: number) => (
                                          <div
                                            key={sIdx}
                                            className="bg-slate-50 dark:bg-[#282A2E] p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-3 text-xs"
                                          >
                                            <div className="space-y-1">
                                              <div className="flex items-center gap-2">
                                                <span className="font-mono text-[10px] font-bold bg-slate-800 dark:bg-slate-900 text-white px-2 py-0.5 rounded-md">
                                                  {st.tool}
                                                </span>
                                                <SourceBadge type={st.badge} />
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                  {new Date(st.ts).toLocaleTimeString()}
                                                </span>
                                              </div>
                                              <p className="text-slate-700 dark:text-slate-300 font-medium">{st.summary}</p>
                                              {st.url && (
                                                <p className="text-[10px] font-mono text-slate-400 truncate max-w-md">
                                                  {st.url}
                                                </p>
                                              )}
                                            </div>

                                            {st.screenshot_path && (
                                              <button
                                                type="button"
                                                onClick={() => setLightboxImg(st.screenshot_path)}
                                                className="shrink-0 w-16 h-12 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 hover:border-[#EA4335] transition"
                                              >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                  src={st.screenshot_path}
                                                  alt={st.tool}
                                                  className="w-full h-full object-cover"
                                                />
                                              </button>
                                            )}
                                          </div>
                                        ))
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setLightboxImg(null)}
        >
          <div className="max-w-5xl w-full bg-white dark:bg-[#1E1F23] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-[#282A2E]">
              <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">Audit Screenshot Full View</span>
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
