import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";
import { seedDatabase } from "@/lib/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  seedDatabase();
  const db = getDb();
  let profile = db.prepare("SELECT * FROM medical_profiles WHERE id = 'mp1'").get();
  if (!profile) {
    profile = db.prepare("SELECT * FROM medical_profiles LIMIT 1").get();
  }
  return NextResponse.json({ profile });
}

export async function POST(req: NextRequest) {
  try {
    seedDatabase();
    const db = getDb();
    const body = await req.json();

    const id = body.id || "mp1";
    db.prepare(`
      INSERT OR REPLACE INTO medical_profiles (
        id, name, dob, blood_type, allergies, conditions, medications,
        emergency_contact_name, emergency_contact_phone, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      body.name || "Demo Patient",
      body.dob || "1950-05-12",
      body.blood_type || "B+",
      body.allergies || "",
      body.conditions || "",
      body.medications || "",
      body.emergency_contact_name || "",
      body.emergency_contact_phone || "",
      new Date().toISOString()
    );

    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
