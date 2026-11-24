"use client";

import React, { useState } from "react";
import SafetyBanner from "@/components/SafetyBanner";
import Navbar from "@/components/Navbar";

interface Candidate {
  id: string;
  display_name: string;
  age_range: string;
  facility_name: string;
  last_seen_area: string;
  source_type: string;
  match_score: number;
  disclaimer: string;
}

export default function FindPersonPage() {
  const [form, setForm] = useState({
    name: "Raju",
    approxAge: "35",
    lastSeenLocation: "Sector 5",
    description: "Wearing blue raincoat, medium build.",
  });

  const [searching, setSearching] = useState(false);
  const [searchStep, setSearchStep] = useState<string>("");
  const [candidates, setCandidates] = useState<Candidate[] | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    setSearching(true);
    setCandidates(null);
    setReportId(null);

    setSearchStep("1/3 Querying Shelter Public Intake Registries (/portals/registry/shelters)...");
    await new Promise((r) => setTimeout(r, 600));

    setSearchStep("2/3 Querying Hospital Reception Locators (/portals/registry/hospitals)...");
    await new Promise((r) => setTimeout(r, 600));

    setSearchStep("3/3 Computing Levenshtein token similarity & age buffer match...");
    await new Promise((r) => setTimeout(r, 500));

    try {
      const res = await fetch("/api/missing/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setCandidates(data.candidates);
        setReportId(data.reportId);
      }
    } catch (err) {
      console.error("Missing search error:", err);
    } finally {
      setSearching(false);
      setSearchStep("");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#121316] text-[#202124] dark:text-[#E8EAED] pb-16 transition-colors duration-200">
      <SafetyBanner />
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="inline-block bg-[#34A853]/10 dark:bg-[#34A853]/20 text-[#137333] dark:text-[#81C995] font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider mb-1 border border-[#34A853]/30">
            SECONDARY 1 • MISSINGLINK LOCATOR
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Find a Missing Person</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Searches public municipal shelter check-ins and hospital reception logs. Only non-sensitive locator fields are exposed.
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Full Name / Known Alias *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#282A2E] text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-sm"
                  placeholder="e.g. Raju Kumar"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Approximate Age (Optional)
                </label>
                <input
                  type="number"
                  value={form.approxAge}
                  onChange={(e) => setForm({ ...form, approxAge: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#282A2E] text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-sm"
                  placeholder="e.g. 35"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Last Seen Location / Landmark
                </label>
                <input
                  type="text"
                  value={form.lastSeenLocation}
                  onChange={(e) => setForm({ ...form, lastSeenLocation: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#282A2E] text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-sm"
                  placeholder="e.g. Sector 5 near Flooded Road"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                  Physical Description / Clothing
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#282A2E] text-slate-900 dark:text-slate-100 rounded-xl p-2.5 text-sm"
                  placeholder="Clothing, distinguishing features..."
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={searching}
                className="w-full bg-[#34A853] hover:bg-[#2D9247] text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-xs transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {searching ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Searching Registries...</span>
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    <span>Search Public Registries →</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {searching && (
            <div className="mt-4 p-3 bg-slate-50 dark:bg-[#282A2E] border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34A853] animate-ping" />
              <span>{searchStep}</span>
            </div>
          )}
        </div>

        {/* Results Section */}
        {candidates && (
          <div className="space-y-4">
            {/* Critical Disclaimer Ribbon */}
            <div className="bg-[#FBBC04]/10 dark:bg-[#FBBC04]/15 border-2 border-[#FBBC04] rounded-3xl p-4 text-[#B06000] dark:text-[#FDD663] font-bold text-xs flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <span className="uppercase tracking-wider block font-extrabold">
                  SAFETY & VERIFICATION PROTOCOL:
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  All results are <strong>POSSIBLE MATCHES ONLY</strong>. This system does NOT confirm identity or guarantee that a missing person has been located. Authorized shelter or medical personnel must physically verify identity.
                </span>
              </div>
            </div>

            {reportId && (
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>
                  Tracked Missing Report Reference: <strong className="font-mono text-slate-800 dark:text-slate-200">{reportId}</strong>
                </span>
                <span>Found {candidates.length} potential matches</span>
              </div>
            )}

            {candidates.length === 0 ? (
              <div className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500">
                <div className="text-3xl mb-2">🔍</div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">No Candidates Found</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Try searching with alternative spellings or broadening the last-seen vicinity.
                </p>
              </div>
            ) : (
              candidates.map((cand) => (
                <div
                  key={cand.id}
                  className="bg-white dark:bg-[#1E1F23] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white">{cand.display_name}</h3>
                        <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          SIMULATED RECORD
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Age range: <strong>{cand.age_range} years</strong> • Last seen near: <strong>{cand.last_seen_area}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="inline-block bg-[#34A853]/10 dark:bg-[#34A853]/20 text-[#137333] dark:text-[#81C995] border border-[#34A853]/30 font-mono text-xs font-bold px-3 py-1 rounded-full">
                        {cand.match_score}% Match Confidence
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
                    <div>
                      <span>Logged at: </span>
                      <strong className="text-slate-800 dark:text-slate-200">{cand.facility_name}</strong>
                      <span className="text-slate-400"> ({cand.source_type})</span>
                    </div>

                    <span className="text-[11px] font-bold text-[#B06000] dark:text-[#FDD663] bg-[#FBBC04]/10 dark:bg-[#FBBC04]/20 px-2.5 py-0.5 rounded-full border border-[#FBBC04]/30">
                      POSSIBLE MATCH: must be verified by authorised staff
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
