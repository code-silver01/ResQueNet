import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";
import { seedDatabase } from "@/lib/db/seed";
import { generateHandoverHTML, MedicalProfileData } from "@/lib/handover";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    seedDatabase();
    const db = getDb();
    const { incidentId, profileId } = await req.json();

    if (!incidentId) {
      return NextResponse.json({ error: "Missing incidentId" }, { status: 400 });
    }

    const incident = db.prepare("SELECT * FROM incidents WHERE id = ?").get(incidentId) as any;
    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    let profile = (
      profileId
        ? db.prepare("SELECT * FROM medical_profiles WHERE id = ?").get(profileId)
        : db.prepare("SELECT * FROM medical_profiles LIMIT 1").get()
    ) as MedicalProfileData | undefined;

    if (!profile) {
      profile = {
        name: "Demo Patient (Elderly Family Member)",
        dob: "1950-05-12",
        blood_type: "B+",
        allergies: "Penicillin, Sulfa drugs",
        conditions: "Type 2 Diabetes, Non-ambulatory Osteoarthritis, Hypertension",
        medications: "Insulin Glargine 20u qPM, Metformin 500mg, Lisinopril 10mg",
        emergency_contact_name: "Suresh Sharma (Son)",
        emergency_contact_phone: "+91-98765-43210",
      };
    }

    const html = generateHandoverHTML(profile, incident);
    const handoverId = `HO-${uuidv4().substring(0, 8).toUpperCase()}`;

    db.prepare(`
      INSERT INTO handovers (id, incident_id, profile_id, created_at, content_html)
      VALUES (?, ?, ?, ?, ?)
    `).run(handoverId, incidentId, profileId || "mp1", new Date().toISOString(), html);

    // Update incident medical consent flag
    db.prepare("UPDATE incidents SET medical_consent = 1 WHERE id = ?").run(incidentId);

    return NextResponse.json({ success: true, handoverId, html });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
