"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function ShelterRegisterInner() {
  const searchParams = useSearchParams();
  const prefillId = searchParams.get("reg_id") || "";
  const prefillShelter = searchParams.get("shelter") || "City Relief Shelter A";

  const [form, setForm] = useState({
    reg_id: prefillId || "",
    person_count: "4",
    names_list: "Primary Contact, Elderly Patient, Family Member 1, Family Member 2",
    shelter_name: prefillShelter,
    special_requirements: ["wheelchair", "elderly"],
    contact_name: "Demo On-Scene Coordinator",
    contact_phone: "9876543210",
    arrival_time: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
  });

  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<{ ref: string; message: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (prefillId) {
      setForm((prev) => ({ ...prev, reg_id: prefillId }));
    }
  }, [prefillId]);

  const handleReqToggle = (req: string) => {
    setForm((prev) => ({
      ...prev,
      special_requirements: prev.special_requirements.includes(req)
        ? prev.special_requirements.filter((r) => r !== req)
        : [...prev.special_requirements, req],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/portals/shelters/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success && data.ref) {
        setConfirmation({
          ref: data.ref,
          message: `Official Shelter Voucher Reference: ${data.ref} — Allocated at ${form.shelter_name}.`,
        });
      } else {
        setErrorMsg(data.error || "Shelter intake rejected.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(`Network failure: ${msg}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="inline-block bg-purple-100 text-purple-800 font-bold text-xs px-2.5 py-0.5 rounded uppercase tracking-wider mb-1">
          SIMULATED PORTAL • BROWSER-AGENT TARGET
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Shelter Evacuee Intake Registration Form</h1>
        <p className="text-sm text-slate-600">Register arriving flood evacuees to secure emergency cots and medical beds.</p>
      </div>

      {confirmation ? (
        <div
          id="confirmation-message"
          className="bg-blue-50 border-2 border-blue-500 rounded-2xl p-6 text-center shadow-md my-4"
        >
          <div className="text-4xl mb-2">🏢</div>
          <h2 className="text-xl font-bold text-blue-900">Shelter Admission Reserved</h2>
          <p className="text-blue-800 font-mono font-semibold text-lg mt-2">
            Registration Reference: <span className="bg-blue-200 px-2 py-0.5 rounded">{confirmation.ref}</span>
          </p>
          <p className="text-sm text-blue-700 mt-2">{confirmation.message}</p>
          <p className="text-xs text-slate-500 mt-4">
            Notice: Simulated demo record logged to SQLite DB. In a real disaster, contact 112 or local relief camps.
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
            <label htmlFor="reg_id" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Registration Tracking ID
            </label>
            <input
              id="reg_id"
              name="reg_id"
              type="text"
              value={form.reg_id}
              onChange={(e) => setForm({ ...form, reg_id: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-slate-50 font-mono font-semibold"
              placeholder="e.g. SH-7819"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="person_count" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Number of Individuals
              </label>
              <input
                id="person_count"
                name="person_count"
                type="number"
                min="1"
                value={form.person_count}
                onChange={(e) => setForm({ ...form, person_count: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="shelter_name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Allocated Shelter
              </label>
              <select
                id="shelter_name"
                name="shelter_name"
                value={form.shelter_name}
                onChange={(e) => setForm({ ...form, shelter_name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="City Relief Shelter A">City Relief Shelter A (Wheelchair ✓)</option>
                <option value="Riverside Relief Point">Riverside Relief Point (Wheelchair ✓)</option>
                <option value="School Emergency Camp">School Emergency Camp (Stairs Only)</option>
                <option value="Elevated Ground Camp">Elevated Ground Camp (No Ramp)</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="names_list" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Names of Evacuees (for public missing registry lookup)
            </label>
            <textarea
              id="names_list"
              name="names_list"
              rows={2}
              value={form.names_list}
              onChange={(e) => setForm({ ...form, names_list: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Comma separated names..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Special Needs & Accommodations
            </label>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  value="wheelchair"
                  checked={form.special_requirements.includes("wheelchair")}
                  onChange={() => handleReqToggle("wheelchair")}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Wheelchair Accessibility Needed</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  value="elderly"
                  checked={form.special_requirements.includes("elderly")}
                  onChange={() => handleReqToggle("elderly")}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Elderly Assistance</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  value="medical_care"
                  checked={form.special_requirements.includes("medical_care")}
                  onChange={() => handleReqToggle("medical_care")}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>On-Site Nurse Triage Needed</span>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  value="infant"
                  checked={form.special_requirements.includes("infant")}
                  onChange={() => handleReqToggle("infant")}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Infant / Formula Supplies</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="contact_name" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Contact Name
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

          <div className="pt-2">
            <button
              id="submit-shelter-btn"
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl shadow hover:bg-blue-700 disabled:opacity-50 transition text-base"
            >
              {submitting ? "Registering with Shelter..." : "Submit Evacuee Shelter Registration"}
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

export default function ShelterRegisterPortalPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Loading shelter registration portal...</div>}>
      <ShelterRegisterInner />
    </Suspense>
  );
}
