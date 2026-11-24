import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";
import { seedDatabase } from "@/lib/db/seed";
import { computePriority } from "@/lib/priority";
import { findCoordinates } from "@/lib/locations";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    seedDatabase();
    const db = getDb();
    const body = await req.json();

    const id = `INC-${uuidv4().substring(0, 8).toUpperCase()}`;
    const now = new Date().toISOString();

    const locationText = body.location_text || "Near Flooded Road Sector 5";
    const mapped = findCoordinates(locationText);
    const lat = body.lat || mapped?.lat || 28.6200;
    const lng = body.lng || mapped?.lng || 77.2100;

    const incidentData = {
      incident_type: body.incident_type || "flood",
      people_count: Number(body.people_count || 4),
      location_text: locationText,
      needs: body.needs || ["water_rescue"],
      mobility_assistance_count: Number(body.mobility_assistance_count || 0),
      injuries_text: body.injuries_text || "",
      hazards: body.hazards || "",
      raw_text: body.raw_text || "",
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
      body.medical_consent ? 1 : 0,
      incidentData.raw_text
    );

    return NextResponse.json({
      success: true,
      id,
      priorityScore: priority.score,
      priorityBreakdown: priority.breakdown,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
