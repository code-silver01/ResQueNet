import { getDb } from "@/lib/db/index";
import { seedDatabase } from "@/lib/db/seed";

export const dynamic = "force-dynamic";

export default function HospitalsPortalPage() {
  seedDatabase();
  const db = getDb();
  const hospitals = db.prepare("SELECT * FROM resources WHERE type = 'hospital'").all() as Array<{
    id: string;
    name: string;
    capabilities: string;
    accessibility: string;
    capacity_text: string;
    confirmed: number;
    phone: string;
    address: string;
    last_checked: string;
  }>;

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded">
            SIMULATED PORTAL
          </span>
          <span className="text-xs text-slate-500">Live Browser Agent Target</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Emergency Hospital & Triage Directory</h1>
        <p className="text-sm text-slate-600 mt-1">
          Trauma centers and acute care emergency departments ready to receive evacuated patients.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {hospitals.map((h) => {
          const caps: string[] = JSON.parse(h.capabilities || "[]");
          const access: string[] = JSON.parse(h.accessibility || "[]");
          return (
            <div
              key={h.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
              data-testid={`hosp-${h.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{h.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{h.address}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                      h.confirmed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {h.confirmed ? "✓ 24/7 Verified" : "Daytime Only"}
                  </span>
                </div>
              </div>

              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Status & Beds:</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{h.capacity_text}</p>
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Medical Capabilities:</p>
                <div className="flex flex-wrap gap-1.5">
                  {caps.map((c) => (
                    <span key={c} className="bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-0.5 rounded font-medium">
                      {c.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-2.5">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Accessibility / Triage:</p>
                <div className="flex flex-wrap gap-1.5">
                  {access.map((a) => (
                    <span key={a} className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2 py-0.5 rounded">
                      {a.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Emergency Desk: <strong>{h.phone}</strong></span>
                <span className="text-slate-400">Checked: {new Date(h.last_checked).toLocaleTimeString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
