export const LANDMARK_COORDINATES: Record<string, { lat: number; lng: number; label: string }> = {
  "delhi": { lat: 28.6139, lng: 77.2090, label: "Delhi Central" },
  "connaught place": { lat: 28.6315, lng: 77.2167, label: "Connaught Place, Central" },
  "india gate": { lat: 28.6129, lng: 77.2295, label: "India Gate" },
  "sector 5": { lat: 28.6180, lng: 77.2150, label: "Sector 5 Community Center" },
  "river road": { lat: 28.6100, lng: 77.2350, label: "River Road Lowlands" },
  "north zone": { lat: 28.6500, lng: 77.1800, label: "North Zone Ridge" },
  "flooded road": { lat: 28.6200, lng: 77.2100, label: "Flooded Arterial Road" },
  "riverside": { lat: 28.6080, lng: 77.2370, label: "Yamuna Riverside Area" },
  "block c": { lat: 28.6400, lng: 77.2000, label: "Block C Residential Sector" },
  "civil defence hq": { lat: 28.6300, lng: 77.1900, label: "Civil Defence HQ" },
};

export function findCoordinates(locationText: string): { lat: number; lng: number; label: string } | null {
  if (!locationText) return null;
  const lower = locationText.toLowerCase();
  for (const [key, coords] of Object.entries(LANDMARK_COORDINATES)) {
    if (lower.includes(key)) {
      return coords;
    }
  }
  // Default to central flooded area if coordinates not explicitly found
  return { lat: 28.6200, lng: 77.2100, label: "Estimated Vicinity (Flooded Arterial Road)" };
}
