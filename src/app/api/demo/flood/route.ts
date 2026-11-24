import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";
import { seedDatabase } from "@/lib/db/seed";
import { computePriority } from "@/lib/priority";
import { findCoordinates } from "@/lib/locations";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

const SAMPLE_FLOOD_REPORT =
  "I'm stranded near a flooded road with three other people. One person is elderly and cannot walk. We need a boat or rescue team. One person needs medical help.";

export async function POST() {
  try {
    seedDatabase();
    const db = getDb();

    const id = `INC-${uuidv4().substring(0, 8).toUpperCase()}`;
    const now = new Date().toISOString();

    const mappedCoords = findCoordinates("flooded road");
    const lat = mappedCoords?.lat || 28.6200;
    const lng = mappedCoords?.lng || 77.2100;

    const incidentData = {
      incident_type: "flood",
      people_count: 4,
      location_text: "Near Flooded Road Sector 5",
      needs: ["water_rescue", "medical", "mobility_assistance", "shelter"],
      mobility_assistance_count: 1,
      injuries_text: "Elderly party member non-ambulatory; requires medical check and wheelchair/stretcher.",
      hazards: "Active rising water on roadway, impassable by passenger vehicles.",
      raw_text: SAMPLE_FLOOD_REPORT,
    };

    const priority = computePriority(incidentData);

    db.prepare(`
      INSERT INTO incidents (
        id, created_at, incident_type, people_count, location_text, lat, lng,
        needs, mobility_assistance_count, injuries_text, hazards, priority_score,
        priority_breakdown, status, medical_consent, raw_text
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      now,
      incidentData.incident_type,
      incidentData.people_count,
      incidentData.location_text,
      lat,
      lng,
      JSON.stringify(incidentData.needs),
      incidentData.mobility_assistance_count,
      incidentData.injuries_text,
      incidentData.hazards,
      priority.score,
      JSON.stringify(priority.breakdown),
      "Reported",
      1, // default medical consent on for demo
      SAMPLE_FLOOD_REPORT
    );

    return NextResponse.json({ success: true, incidentId: id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
