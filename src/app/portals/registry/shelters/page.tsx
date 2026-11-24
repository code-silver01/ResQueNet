import { SHELTER_REGISTRY_DATA } from "@/lib/registriesData";

export const dynamic = "force-dynamic";

export default function ShelterRegistryPortalPage() {
  return (
    <div>
      <div className="mb-6">
        <div className="inline-block bg-purple-100 text-purple-800 font-bold text-xs px-2.5 py-0.5 rounded uppercase tracking-wider mb-1">
          SIMULATED PUBLIC REGISTRY
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Municipal Shelter Evacuee Public Directory</h1>
        <p className="text-sm text-slate-600">
          Public safety registry containing only non-sensitive locator fields. Medical details are never exposed.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 mb-6 text-xs text-amber-800 font-medium">
        ⚠️ PUBLIC DIRECTORY NOTICE: These entries indicate possible check-ins at shelter reception desks. Actual identity and relationship must be confirmed with relief camp administration.
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-600">
            <tr>
              <th className="px-4 py-3">Public Name Listing</th>
              <th className="px-4 py-3">Estimated Age Range</th>
              <th className="px-4 py-3">Shelter Location</th>
              <th className="px-4 py-3">Last Seen Vicinity</th>
              <th className="px-4 py-3 text-right">Verification Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {SHELTER_REGISTRY_DATA.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-bold text-slate-900">{row.display_name}</td>
                <td className="px-4 py-3">{row.age_range} yrs</td>
                <td className="px-4 py-3 font-semibold text-blue-700">{row.facility_name}</td>
                <td className="px-4 py-3 text-slate-500">{row.last_seen_area}</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
                    SIMULATED INTAKE
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
