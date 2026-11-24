import Link from "next/link";
import { getDb } from "@/lib/db/index";
import { seedDatabase } from "@/lib/db/seed";

export const dynamic = "force-dynamic";

export default function SheltersPortalPage() {
  seedDatabase();
  const db = getDb();
  const shelters = db.prepare("SELECT * FROM resources WHERE type = 'shelter'").all() as Array<{
    id: string;
    name: string;
    capabilities: string;
    accessibility: string;
    capacity_text: string;
    source_type: string;
    confirmed: number;
    last_checked: string;
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
          <h1 className="text-3xl font-extrabold text-slate-900">Emergency Relief Shelter Directory</h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time public shelters, accessibility profiles, and intake capacities.
          </p>
        </div>
        <Link
          href="/portals/shelters/register"
          className="bg-blue-600 text-white font-bold px-5 py-3 rounded-xl shadow hover:bg-blue-700 transition"
        >
          Direct Shelter Registration Form →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {shelters.map((s) => {
          const access: string[] = JSON.parse(s.accessibility || "[]");
          const isWheelchair = access.includes("wheelchair_accessible");
          return (
            <div
              key={s.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow transition"
              data-testid={`shelter-${s.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{s.name}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{s.address}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full ${
                      s.confirmed ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {s.confirmed ? "✓ Active Shelter" : "Unverified"}
                  </span>
                </div>
              </div>

              <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Capacity Status:</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{s.capacity_text}</p>
              </div>

              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                      isWheelchair
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-rose-50 text-rose-800 border-rose-300"
                    }`}
                  >
                    {isWheelchair ? "♿ Wheelchair Accessible & Ramp Equipped" : "⚠️ NOT Wheelchair Accessible (Stairs Only)"}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Last Checked: {new Date(s.last_checked).toLocaleTimeString()}
                </span>
                <Link
                  href={`/portals/shelters/register?shelter=${encodeURIComponent(s.name)}`}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Register Evacuees Here →
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
