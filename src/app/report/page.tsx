"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import SafetyBanner from "@/components/SafetyBanner";
import Navbar from "@/components/Navbar";
import { findCoordinates } from "@/lib/locations";
import { computePriority } from "@/lib/priority";

const SAMPLE_FLOOD_REPORT =
  "I'm stranded near a flooded road with three other people. One person is elderly and cannot walk. We need a boat or rescue team. One person needs medical help.";

export default function ReportPage() {
  const router = useRouter();

  // Intake State
  const [reportText, setReportText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [extracted, setExtracted] = useState(false);

  // Editable Form State
  const [formData, setFormData] = useState({
    incident_type: "flood",
    people_count: 4,
    location_text: "Near Flooded Road Sector 5",
    needs: ["water_rescue", "medical", "mobility_assistance", "shelter"],
    mobility_assistance_count: 1,
    injuries_text: "Elderly person non-ambulatory; requires medical assistance and boat/stretcher.",
    hazards: "Active water rising, roadway cut off.",
    medical_consent: true,
  });

  // Coordinates
  const [coords, setCoords] = useState<{ lat: number; lng: number; source: string }>({
    lat: 28.6200,
    lng: 77.2100,
    source: "Default Landmark",
  });
  const [locPermissionState, setLocPermissionState] = useState<string | null>(null);

  // Submitting
  const [confirming, setConfirming] = useState(false);

  // Live priority score computation
  const priority = useMemo(() => {
    return computePriority({
      incident_type: formData.incident_type,
      people_count: formData.people_count,
      needs: formData.needs,
      mobility_assistance_count: formData.mobility_assistance_count,
      injuries_text: formData.injuries_text,
      hazards: formData.hazards,
      raw_text: reportText || SAMPLE_FLOOD_REPORT,
    });
  }, [formData, reportText]);

  const handleUseSample = () => {
    setReportText(SAMPLE_FLOOD_REPORT);
  };

  const handleExtract = async () => {
    if (!reportText.trim()) {
      setExtractError("Please provide an incident report description first.");
      return;
    }

    setExtracting(true);
    setExtractError(null);

    try {
      const res = await fetch("/api/intake/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reportText }),
      });
      const data = await res.json();
      if (data.success && data.incident) {
        const inc = data.incident;
        setFormData({
          incident_type: inc.incident_type || "flood",
          people_count: Number(inc.people_count) || 4,
          location_text: inc.location_text || "Near Flooded Road Sector 5",
          needs: inc.needs && inc.needs.length > 0 ? inc.needs : ["water_rescue"],
          mobility_assistance_count: Number(inc.mobility_assistance_count) || 0,
          injuries_text: inc.injuries_text || "",
          hazards: inc.hazards || "",
          medical_consent: true,
        });

        // Resolve location
        const found = findCoordinates(inc.location_text);
        if (found) {
          setCoords({ lat: found.lat, lng: found.lng, source: found.label });
        }
        setExtracted(true);
      } else {
        setExtractError(data.error || "Failed to parse incident fields.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setExtractError(`Extraction error: ${msg}`);
    } finally {
      setExtracting(false);
    }
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setLocPermissionState("Browser does not support geolocation.");
      return;
    }
    setLocPermissionState("Requesting device location...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Math.round(pos.coords.latitude * 10000) / 10000,
          lng: Math.round(pos.coords.longitude * 10000) / 10000,
          source: "Device GPS (User Granted)",
        });
        setLocPermissionState("✓ Location acquired from browser GPS.");
      },
      (err) => {
        setLocPermissionState(`GPS unavailable (${err.message}). Using mapped landmark fallback.`);
      },
      { timeout: 7000 }
    );
  };

  const handleNeedToggle = (need: string) => {
    setFormData((prev) => ({
      ...prev,
      needs: prev.needs.includes(need)
        ? prev.needs.filter((n) => n !== need)
        : [...prev.needs, need],
    }));
  };

  const handleConfirmAndRun = async () => {
    setConfirming(true);
    try {
      const payload = {
        ...formData,
        lat: coords.lat,
        lng: coords.lng,
        raw_text: reportText || SAMPLE_FLOOD_REPORT,
      };

      const res = await fetch("/api/intake/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.id) {
        router.push(`/agent/${data.id}`);
      } else {
        alert(data.error || "Failed to confirm incident.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(`Submission error: ${msg}`);
    } finally {
      setConfirming(false);
    }
  };

  const needOptions = [
    { id: "water_rescue", label: "Water / Boat Rescue" },
    { id: "medical", label: "Medical Care / Ambulance" },
    { id: "mobility_assistance", label: "Mobility Assistance" },
    { id: "shelter", label: "Emergency Shelter" },
    { id: "food_water", label: "Food & Potable Water" },
    { id: "transport", label: "Evacuation Transport" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#121316] text-[#202124] dark:text-[#E8EAED] pb-16 transition-colors duration-200">
      <SafetyBanner />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="inline-block bg-[#4285F4]/10 dark:bg-[#4285F4]/20 text-[#1A73E8] dark:text-[#8AB4F8] font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 border border-[#4285F4]/30">
            MODULE 1 • INCIDENT INTAKE & TRIAGE
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Report Disaster Incident</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Describe the situation in plain language. Gemini structures the incident, computes rule-based priority, and prepares the browser agent.
          </p>
        </div>

        {/* Report Input Box */}
        <div className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-8">
          <label htmlFor="report_text" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
            Disaster Situation Narrative
          </label>
          <textarea
            id="report_text"
            rows={4}
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Describe what is happening, where you are, how many people are with you, and any injuries or immediate dangers..."
            className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#282A2E] text-slate-900 dark:text-slate-100 rounded-2xl p-3.5 text-sm focus:ring-2 focus:ring-[#4285F4] focus:border-[#4285F4] outline-none transition"
          />

          {extractError && (
            <div className="mt-3 bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800 text-xs p-3 rounded-xl font-medium">
              {extractError}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleUseSample}
              className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 transition"
            >
              📋 Use Sample Flood Report
            </button>

            <button
              type="button"
              onClick={handleExtract}
              disabled={extracting}
              className="bg-[#4285F4] hover:bg-[#3367D6] text-white font-bold py-2.5 px-6 rounded-xl shadow-xs transition text-sm flex items-center gap-2 disabled:opacity-50"
            >
              {extracting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Extracting with Gemini...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Extract & Analyse Incident →</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editable Form & Review Section */}
        {extracted && (
          <div className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Review & Correct Extracted Fields</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Human verification step: edit any fields before the browser agent executes searches.
                </p>
              </div>
              <span className="bg-[#34A853]/10 dark:bg-[#34A853]/20 text-[#137333] dark:text-[#81C995] border border-[#34A853]/30 text-xs font-bold px-3 py-1 rounded-full">
                ✓ Gemini Parsed
              </span>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Incident Type
                </label>
                <select
                  value={formData.incident_type}
                  onChange={(e) => setFormData({ ...formData, incident_type: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm bg-white dark:bg-[#282A2E] text-slate-900 dark:text-slate-100"
                >
                  <option value="flood">Flood / Flash Flood</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="fire">Fire / Hazmat</option>
                  <option value="medical">Medical Emergency</option>
                  <option value="storm">Cyclone / Storm</option>
                  <option value="general">General Disaster</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Total Individuals Stranded
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.people_count}
                  onChange={(e) => setFormData({ ...formData, people_count: parseInt(e.target.value, 10) || 1 })}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm bg-white dark:bg-[#282A2E] text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Location Description & Landmark
                </label>
                <input
                  type="text"
                  value={formData.location_text}
                  onChange={(e) => {
                    const text = e.target.value;
                    setFormData({ ...formData, location_text: text });
                    const match = findCoordinates(text);
                    if (match) {
                      setCoords({ lat: match.lat, lng: match.lng, source: match.label });
                    }
                  }}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm bg-white dark:bg-[#282A2E] text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Geolocation Section */}
              <div className="sm:col-span-2 bg-slate-50 dark:bg-[#282A2E] border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
                      Coordinates for Haversine Matcher
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Lat: <strong>{coords.lat}</strong>, Lng: <strong>{coords.lng}</strong> ({coords.source})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGeolocation}
                    className="bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 shadow-2xs"
                  >
                    📍 Use Current Browser Geolocation
                  </button>
                </div>
                {locPermissionState && (
                  <p className="text-xs text-[#4285F4] dark:text-[#8AB4F8] font-medium">{locPermissionState}</p>
                )}
              </div>

              {/* Special Needs Checkboxes */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                  Needs & Capabilities Required
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {needOptions.map((opt) => (
                    <label
                      key={opt.id}
                      className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#282A2E] text-slate-800 dark:text-slate-200 cursor-pointer text-xs font-medium"
                    >
                      <input
                        type="checkbox"
                        checked={formData.needs.includes(opt.id)}
                        onChange={() => handleNeedToggle(opt.id)}
                        className="rounded text-[#4285F4] focus:ring-[#4285F4]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Mobility Assistance Count (Cannot Walk)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.mobility_assistance_count}
                  onChange={(e) =>
                    setFormData({ ...formData, mobility_assistance_count: parseInt(e.target.value, 10) || 0 })
                  }
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm bg-white dark:bg-[#282A2E] text-slate-900 dark:text-slate-100"
                />
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Enforces strict wheelchair accessibility filter on shelters.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Hazards & Site Risks
                </label>
                <input
                  type="text"
                  value={formData.hazards}
                  onChange={(e) => setFormData({ ...formData, hazards: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm bg-white dark:bg-[#282A2E] text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Injuries & Medical Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.injuries_text}
                  onChange={(e) => setFormData({ ...formData, injuries_text: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm bg-white dark:bg-[#282A2E] text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Medical Consent Toggle */}
              <div className="sm:col-span-2 p-4 bg-[#EA4335]/10 dark:bg-[#EA4335]/20 border border-[#EA4335]/30 rounded-2xl">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.medical_consent}
                    onChange={(e) => setFormData({ ...formData, medical_consent: e.target.checked })}
                    className="mt-0.5 rounded text-[#EA4335] focus:ring-[#EA4335]"
                  />
                  <div>
                    <span className="text-xs font-bold text-[#EA4335] dark:text-[#F28B82] block">
                      Include Simulated Medical Handover in Request (Secondary 2: Medical Relay)
                    </span>
                    <span className="text-[11px] text-slate-600 dark:text-slate-300 block mt-0.5">
                      Attaches allergies, chronic conditions, and emergency contact details for hospital/ambulance triage.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Rule-Based Priority Score Breakdown */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Deterministic Priority Score: <span className="text-[#EA4335] dark:text-[#F28B82] font-extrabold">{priority.score} / 15</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Rule-based triage formula — LLM never determines urgency.
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    priority.score >= 8
                      ? "bg-[#EA4335]/10 text-[#EA4335] dark:bg-[#EA4335]/20 dark:text-[#F28B82] border border-[#EA4335]/30"
                      : priority.score >= 5
                      ? "bg-[#FBBC04]/10 text-[#B06000] dark:bg-[#FBBC04]/20 dark:text-[#FDD663] border border-[#FBBC04]/40"
                      : "bg-[#34A853]/10 text-[#137333] dark:bg-[#34A853]/20 dark:text-[#81C995] border border-[#34A853]/30"
                  }`}
                >
                  {priority.score >= 8 ? "🔴 Critical Priority" : priority.score >= 5 ? "🟠 High Priority" : "🟢 Standard"}
                </span>
              </div>

              {/* Progress Bar with GDG Gradient */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden mb-4">
                <div
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    priority.score >= 8 ? "bg-[#EA4335]" : priority.score >= 5 ? "bg-[#FBBC04]" : "bg-[#34A853]"
                  }`}
                  style={{ width: `${Math.min(100, (priority.score / 15) * 100)}%` }}
                />
              </div>

              {/* Breakdown List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {priority.breakdown.map((item, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-[#282A2E] border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.factor}</span>
                      <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{item.reason}</p>
                    </div>
                    <span className="font-mono font-bold text-[#EA4335] dark:text-[#F28B82]">+{item.points}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={handleConfirmAndRun}
                disabled={confirming}
                className="w-full bg-[#EA4335] hover:bg-[#D93025] text-white font-extrabold py-4 px-6 rounded-2xl shadow-md transition text-base flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {confirming ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Recording Incident & Initializing Agent...</span>
                  </>
                ) : (
                  <>
                    <span>✅</span>
                    <span>Confirm Incident & Launch Browser Agent →</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
