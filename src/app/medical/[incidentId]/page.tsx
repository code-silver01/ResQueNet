"use client";

import React, { useState, useEffect, use } from "react";
import SafetyBanner from "@/components/SafetyBanner";
import Navbar from "@/components/Navbar";

type PageParams = { incidentId: string };

export default function MedicalRelayPage({ params }: { params: Promise<PageParams> }) {
  const { incidentId } = use(params);

  const [incident, setIncident] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [consent, setConsent] = useState(true);
  const [handoverHtml, setHandoverHtml] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [handoverId, setHandoverId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [incRes, profRes] = await Promise.all([
          fetch(`/api/incidents/${incidentId}`),
          fetch("/api/medical/profile"),
        ]);
        const incData = await incRes.json();
        const profData = await profRes.json();
        setIncident(incData.incident);
        setProfile(profData.profile);
      } catch (err) {
        console.error("Error loading medical relay context:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [incidentId]);

  const handleGenerateHandover = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/medical/handover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId,
          profileId: profile?.id || "mp1",
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHandoverHtml(data.html);
        setHandoverId(data.handoverId);
      }
    } catch (err) {
      console.error("Handover generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    if (!handoverHtml) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(handoverHtml);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const isUrgent =
    incident &&
    (incident.priority_score >= 8 ||
      (incident.needs && (incident.needs.includes("medical") || incident.needs.includes("water_rescue"))));

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#121316] text-[#202124] dark:text-[#E8EAED] pb-16 transition-colors duration-200">
      <SafetyBanner />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="inline-block bg-[#EA4335]/10 dark:bg-[#EA4335]/20 text-[#EA4335] dark:text-[#F28B82] font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 border border-[#EA4335]/30">
            SECONDARY 2 • MEDICAL RELAY
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Emergency Medical Handover Preview</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Standardized triage summary for emergency medical technicians and hospital reception staff.
          </p>
        </div>

        {/* URGENT MEDICAL / LIFE RISK PROMPT */}
        {isUrgent && (
          <div className="bg-[#EA4335] text-white rounded-3xl p-6 shadow-md mb-8 flex items-start gap-4 animate-pulse">
            <span className="text-3xl shrink-0">🚨</span>
            <div>
              <h2 className="text-lg font-extrabold uppercase tracking-wide">
                URGENT: CRITICAL MEDICAL RISK DETECTED
              </h2>
              <p className="text-sm mt-1 leading-relaxed opacity-95">
                If the patient is unconscious, drowning, in respiratory failure, or experiencing acute trauma,{" "}
                <strong>CALL 112 IMMEDIATELY</strong> from a telephone. Do not wait for browser agent completion or web requests.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white dark:bg-[#1E1F23] p-12 text-center text-slate-400 rounded-3xl border border-slate-200 dark:border-slate-800">
            Loading medical context...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Consent Toggle */}
            <div className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 rounded text-[#EA4335] focus:ring-[#EA4335]"
                />
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    Include Medical Handover Document with Dispatch Requests
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block mt-0.5">
                    When enabled, paramedics receive the allergy and chronic disease handover. If disabled, all medical profile data is strictly withheld.
                  </span>
                </div>
              </label>
            </div>

            {/* Profile Overview */}
            {profile && consent && (
              <div className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Seeded Medical Profile Record</h3>
                  <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    SIMULATED DATA
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Patient Name</span>
                    <span className="text-slate-800 dark:text-slate-100 font-bold text-sm">{profile.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">DOB / Blood Type</span>
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{profile.dob} • Blood Type: {profile.blood_type}</span>
                  </div>
                  <div className="sm:col-span-2 bg-[#EA4335]/10 dark:bg-[#EA4335]/20 p-3.5 rounded-2xl border border-[#EA4335]/30">
                    <span className="text-[#EA4335] dark:text-[#F28B82] font-bold block uppercase text-[10px]">⚠️ Critical Known Allergies</span>
                    <span className="text-[#EA4335] dark:text-[#F28B82] font-extrabold text-sm">{profile.allergies || "None reported"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Chronic Conditions</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{profile.conditions || "None reported"}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 font-bold block uppercase text-[10px]">Current Medications</span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">{profile.medications || "None reported"}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
                  <button
                    onClick={handleGenerateHandover}
                    disabled={generating}
                    className="bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition"
                  >
                    {generating ? "Generating HTML Document..." : "Generate Printable Handover Document"}
                  </button>

                  {handoverHtml && (
                    <button
                      onClick={handlePrint}
                      className="bg-[#EA4335] hover:bg-[#D93025] text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-xs transition flex items-center gap-1.5"
                    >
                      <span>🖨️</span>
                      <span>Print Official Handover (1-Page)</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Rendered Handover Preview */}
            {handoverHtml && consent && (
              <div className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Handover Document Preview {handoverId && `(${handoverId})`}
                  </span>
                  <button onClick={handlePrint} className="text-[#EA4335] dark:text-[#F28B82] font-bold hover:underline">
                    🖨️ Print Document
                  </button>
                </div>
                <iframe
                  srcDoc={handoverHtml}
                  title="Medical Handover Preview"
                  className="w-full h-96 border border-slate-200 dark:border-slate-700 rounded-2xl bg-white"
                />
              </div>
            )}

            {!consent && (
              <div className="p-8 bg-slate-100 dark:bg-[#282A2E] rounded-3xl border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500 dark:text-slate-400">
                Medical consent is turned off. No medical details or allergies will be included in the rescue request.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
