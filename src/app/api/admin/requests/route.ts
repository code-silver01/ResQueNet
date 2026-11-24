import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";
import { seedDatabase } from "@/lib/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  seedDatabase();
  const db = getDb();
  const requests = db.prepare(`
    SELECT r.*, i.incident_type, i.people_count, i.location_text, i.priority_score
    FROM requests r
    LEFT JOIN incidents i ON r.incident_id = i.id
    ORDER BY r.created_at DESC
  `).all();

  return NextResponse.json({ requests });
}
