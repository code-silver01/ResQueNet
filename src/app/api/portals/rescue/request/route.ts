import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";
import { seedDatabase } from "@/lib/db/seed";

export async function POST(req: NextRequest) {
  try {
    seedDatabase();
    const db = getDb();
    const body = await req.json();

    const ref = `RESC-${Math.floor(1000 + Math.random() * 9000)}`;

    const existing = body.request_id
      ? (db.prepare("SELECT * FROM requests WHERE id = ?").get(body.request_id) as Record<string, unknown> | undefined)
      : null;

    if (existing) {
      db.prepare(`
        UPDATE requests
        SET portal_ref = ?, status = 'Submitted', confirmation_text = ?
        WHERE id = ?
      `).run(ref, `Request Reference: ${ref} — Received and logged at official rescue portal.`, body.request_id);

      if (existing.incident_id) {
        db.prepare("UPDATE incidents SET status = 'Submitted' WHERE id = ?").run(existing.incident_id);
      }
    } else {
      // Direct submission from the portal web page
      const reqId = body.request_id || `RQ-${Math.floor(1000 + Math.random() * 9000)}`;
      db.prepare(`
        INSERT OR IGNORE INTO requests (id, incident_id, created_at, status, portal_ref, source_url, resource_name, confirmation_text)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        reqId,
        "portal-direct",
        new Date().toISOString(),
        "Submitted",
        ref,
        "/portals/rescue/request",
        "Rapid Flood Response Unit",
        `Request Reference: ${ref}`
      );
    }

    return NextResponse.json({ success: true, ref });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
