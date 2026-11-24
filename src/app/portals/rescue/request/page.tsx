"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function RescueFormInner() {
  const searchParams = useSearchParams();
  const prefillId = searchParams.get("rq_id") || "";

  const [form, setForm] = useState({
    request_id: prefillId || "",
    incident_type: "flood",
    people_count: "4",
    location: "Near Flooded Road Sector",
    needs: ["water_rescue", "medical_urgent", "mobility_assistance"],
    contact_name: "Demo On-Scene Coordinator",
    contact_phone: "9876543210",
    priority_level: "critical",
    medical_notes: "Elderly non-ambulatory party member present.",
  });

  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ ref: string; message: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (prefillId) {
      setForm((prev) => ({ ...prev, request_id: prefillId }));
    }
  }, [prefillId]);

  const handleNeedToggle = (need: string) => {
    setForm((prev) => ({
      ...prev,
      needs: prev.needs.includes(need)
        ? prev.needs.filter((n) => n !== need)
        : [...prev.needs, need],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/portals/rescue/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success && data.ref) {
        setConfirmation({
          ref: data.ref,
          message: `Official Reference: ${data.ref} — Rescue Intake Recorded. Status: Pending Coordinator Verification.`,
        });
      } else {
        setErrorMsg(data.error || "Submission failed. Portal rejected payload.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Network failure contacting portal endpoint: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="inline-block bg-purple-100 text-purple-800 font-bold text-xs px-2.5 py-0.5 rounded uppercase tracking-wider mb-1">
          SIMULATED PORTAL • BROWSER-AGENT FORM TARGET
        </div>
        <h1 className="text-2xl font-bold text-slate-900">National Emergency Rescue Request Dispatch Portal</h1>
        <p className="text-sm text-slate-600">Standardized field intake form for emergency boat and vehicle dispatch.</p>
      </div>

      {confirmation ? (
        <div
          id="confirmation-message"
          className="bg-emerald-50 border-2 border-emerald-500 rounded-2xl p-6 text-center shadow-md my-4"
        >
          <div className="text-4xl mb-2">✅</div>
          <h2 className="text-xl font-bold text-emerald-900">Rescue Request Acknowledged by Portal</h2>
          <p className="text-emerald-800 font-mono font-semibold text-lg mt-2">
            Reference ID: <span className="bg-emerald-200 px-2 py-0.5 rounded">{confirmation.ref}</span>
          </p>
          <p className="text-sm text-emerald-700 mt-2">{confirmation.message}</p>
          <p className="text-xs text-slate-500 mt-4">
            Notice: Simulated demo record logged to SQLite DB. In a real emergency, call 112 immediately.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4"
        >
          {errorMsg && (
            <div id="error-message" className="bg-red-50 border border-red-300 text-red-800 p-3 rounded-lg text-sm font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label htmlFor="request_id" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Internal Request Reference ID
            </label>
            <input
              id="request_id"
              name="request_id"
              type="text"
              value={form.request_id}
              onChange={(e) => setForm({ ...form, request_id: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 font-mono text-slate-800 font-semibold"
              placeholder="e.g. RQ-4102"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="incident_type" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Disaster Event Type
              </label>
              <select
                id="incident_type"
                name="incident_type"
                value={form.incident_type}
                onChange={(e) => setForm({ ...form, incident_type: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="flood">Flood / Rising Water</option>
                <option value="earthquake">Earthquake / Structural Collapse</option>
                <option value="fire">Urban / Wildfire</option>
                <option value="medical">Medical Mass Casualty</option>
                <option value="storm">Severe Storm / Cyclone</option>
                <option value="general">General Disaster</option>
              </select>
            </div>

            <div>
              <label htmlFor="people_count" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Total People Stranded
              </label>
              <input
                id="people_count"
                name="people_count"
                type="number"
                min="1"
                value={form.people_count}
                onChange={(e) => setForm({ ...form, people_count: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Detailed Scene Location & Landmarks
            </label>
            <textarea
              id="location"
              name="location"
              rows={2}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Stranded near Flooded Road Sector 5, behind main junction"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Critical Capabilities & Resources Needed
            </label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  value="water_rescue"
                  checked={form.needs.includes("water_rescue")}
                  onChange={() => handleNeedToggle("water_rescue")}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Water / Boat Rescue</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  value="medical_urgent"
                  checked={form.needs.includes("medical_urgent")}
                  onChange={() => handleNeedToggle("medical_urgent")}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Urgent Medical / Stretcher</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  value="mobility_assistance"
                  checked={form.needs.includes("mobility_assistance")}
                  onChange={() => handleNeedToggle("mobility_assistance")}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Elderly / Mobility Assistance</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  value="shelter_needed"
                  checked={form.needs.includes("shelter_needed")}
                  onChange={() => handleNeedToggle("shelter_needed")}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>Shelter Transfer Required</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact_name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Field Contact Name
              </label>
              <input
                id="contact_name"
                name="contact_name"
                type="text"
                value={form.contact_name}
                onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="contact_phone" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                id="contact_phone"
                name="contact_phone"
                type="tel"
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="priority_level" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Intake Priority Tier
            </label>
            <select
              id="priority_level"
              name="priority_level"
              value={form.priority_level}
              onChange={(e) => setForm({ ...form, priority_level: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm font-semibold"
            >
              <option value="critical">🔴 Critical (Life-Threatening / Water Surging)</option>
              <option value="high">🟠 High (Vulnerable Persons / Trapped)</option>
              <option value="medium">🟡 Medium (Stable / Awaiting Evacuation)</option>
              <option value="low">🟢 Low (Relief Supplies Only)</option>
            </select>
          </div>

          <div>
            <label htmlFor="medical_notes" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Field Medical & Triage Notes <span className="text-slate-400 font-normal">(Included only with consent)</span>
            </label>
            <textarea
              id="medical_notes"
              name="medical_notes"
              rows={2}
              value={form.medical_notes}
              onChange={(e) => setForm({ ...form, medical_notes: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Medical context, non-ambulatory patient note, or allergies..."
            />
          </div>

          <div className="pt-2">
            <button
              id="submit-request-btn"
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 text-white font-bold py-3.5 px-4 rounded-xl shadow hover:bg-red-700 disabled:opacity-50 transition text-base"
            >
              {submitting ? "Submitting to Rescue Portal..." : "Submit Official Rescue Request"}
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
              Note: The automated browser agent pauses for human verification before clicking this submit button.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}

export default function RescueRequestPortalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading rescue form portal...</div>}>
      <RescueFormInner />
    </Suspense>
  );
}
