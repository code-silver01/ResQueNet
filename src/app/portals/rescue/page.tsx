import Link from "next/link";
import { getDb } from "@/lib/db/index";
import { seedDatabase } from "@/lib/db/seed";

export const dynamic = "force-dynamic";

export default function RescuePortalPage() {
  seedDatabase();
  const db = getDb();
  const teams = db.prepare("SELECT * FROM resources WHERE type = 'rescue'").all() as Array<{
    id: string;
    name: string;
    capabilities: string;
    accessibility: string;
    capacity_text: string;
    source_type: string;
    confirmed: number;
    last_checked: string;
    phone: string;
    address: string;
  }>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded">
              SIMULATED PORTAL
            </span>
            <span className="text-xs text-slate-500">Live Browser Agent Target</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">Official Rescue Operations Directory</h1>
          <p className="text-sm text-slate-600 mt-1">Verified rescue strike teams and specialized water evacuation units.</p>
        </div>
        <Link
          href="/portals/rescue/request"
          className="bg-red-600 text-white font-bold px-5 py-3 rounded-xl shadow hover:bg-red-700 transition"
        >
          Submit Rescue Request Form →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {teams.map((team) => {
          const caps: string[] = JSON.parse(team.capabilities || "[]");
          const access: string[] = JSON.parse(team.accessibility || "[]");
          return (
            <div
              key={team.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition"
              data-testid={`team-${team.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{team.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{team.address}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                      team.confirmed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {team.confirmed ? "✓ Confirmed Active" : "Unverified Status"}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Capabilities:</p>
                <div className="flex flex-wrap gap-1.5">
                  {caps.map((c) => (
                    <span key={c} className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2 py-0.5 rounded font-medium">
                      {c.replace("_", " ")}
                    </span>
                  ))}
                </div>
              </div>

              {access.length > 0 && (
                <div className="mt-2.5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Equipment / Accessibility:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {access.map((a) => (
                      <span key={a} className="bg-purple-50 text-purple-700 border border-purple-200 text-xs px-2 py-0.5 rounded">
                        {a.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>📞 Hotline: <strong>{team.phone}</strong></span>
                <span className="text-slate-400">Checked: {new Date(team.last_checked).toLocaleTimeString()}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
