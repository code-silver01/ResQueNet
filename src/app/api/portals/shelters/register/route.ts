import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";
import { seedDatabase } from "@/lib/db/seed";

export async function POST(req: NextRequest) {
  try {
    seedDatabase();
    const db = getDb();
    const body = await req.json();

    const ref = `SHLT-${Math.floor(1000 + Math.random() * 9000)}`;
    const regId = body.reg_id || `SH-${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = db.prepare("SELECT * FROM requests WHERE id = ?").get(regId) as Record<string, unknown> | undefined;

    if (existing) {
      db.prepare(`
        UPDATE requests
        SET portal_ref = ?, status = 'Submitted', confirmation_text = ?
        WHERE id = ?
      `).run(ref, `Registration Reference: ${ref} — Reserved at ${body.shelter_name || "Shelter A"}`, regId);
    } else {
      db.prepare(`
        INSERT OR IGNORE INTO requests (id, incident_id, created_at, status, portal_ref, source_url, resource_name, confirmation_text)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        regId,
        "portal-direct",
        new Date().toISOString(),
        "Submitted",
        ref,
        "/portals/shelters/register",
        body.shelter_name || "City Relief Shelter A",
        `Registration Reference: ${ref}`
      );
    }

    return NextResponse.json({ success: true, ref });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
