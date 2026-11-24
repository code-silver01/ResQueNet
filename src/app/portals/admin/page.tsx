"use client";

import React, { useState, useEffect } from "react";

interface RequestItem {
  id: string;
  incident_id: string;
  status: string;
  portal_ref: string | null;
  resource_name: string | null;
  resource_type: string | null;
  created_at: string;
  incident_type?: string;
  people_count?: number;
  priority_score?: number;
  location_text?: string;
}

export default function AdminPortalPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (err) {
      console.error("Failed to load admin requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 12000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await fetch(`/api/admin/requests/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchRequests();
    } catch (err) {
      console.error("Status update error:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-block bg-purple-100 text-purple-800 font-bold text-xs px-2.5 py-0.5 rounded uppercase tracking-wider mb-1">
            SIMULATED COORDINATOR DASHBOARD
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Portal Dispatcher Administration View</h1>
          <p className="text-sm text-slate-600">
            Simulate a municipal dispatch coordinator acknowledging, verifying, or resolving incoming browser-agent requests.
          </p>
        </div>
        <button
          onClick={fetchRequests}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-lg text-sm border border-slate-300 transition"
        >
          🔄 Refresh Feed
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading incoming portal queues...</div>
        ) : requests.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <div className="text-3xl mb-2">📥</div>
            <p className="font-semibold">No requests submitted yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Run the agent in RESQNET or submit a request on the rescue form to see items appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600">
                <tr>
                  <th className="px-4 py-3">Request ID</th>
                  <th className="px-4 py-3">Portal Ref</th>
                  <th className="px-4 py-3">Event / Party</th>
                  <th className="px-4 py-3">Target Resource</th>
                  <th className="px-4 py-3">Current Status</th>
                  <th className="px-4 py-3 text-right">Dispatcher Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{r.id}</td>
                    <td className="px-4 py-3">
                      {r.portal_ref ? (
                        <span className="font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-xs font-bold">
                          {r.portal_ref}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="capitalize font-bold text-slate-800">{r.incident_type || "General Flood"}</div>
                      <div className="text-xs text-slate-500">{r.people_count || 1} people • Score: {r.priority_score || 0}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs font-semibold text-slate-800">{r.resource_name || "Rapid Flood Response Unit"}</div>
                      <div className="text-[11px] text-slate-400 capitalize">{r.resource_type || "rescue"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          r.status === "Resolved"
                            ? "bg-emerald-100 text-emerald-800"
                            : r.status === "Acknowledged"
                            ? "bg-blue-100 text-blue-800"
                            : r.status === "Submitted"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          disabled={updatingId === r.id || r.status === "Acknowledged" || r.status === "Resolved"}
                          onClick={() => updateStatus(r.id, "Acknowledged")}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 disabled:opacity-40 px-2.5 py-1 rounded text-xs font-bold transition"
                        >
                          Acknowledge
                        </button>
                        <button
                          disabled={updatingId === r.id || r.status === "Resolved"}
                          onClick={() => updateStatus(r.id, "Resolved")}
                          className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 disabled:opacity-40 px-2.5 py-1 rounded text-xs font-bold transition"
                        >
                          Resolve
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
