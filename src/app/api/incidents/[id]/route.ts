import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = getDb();
    const incident = db.prepare("SELECT * FROM incidents WHERE id = ?").get(id);
    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    const requests = db.prepare("SELECT * FROM requests WHERE incident_id = ? ORDER BY created_at DESC").all(id);
    const steps = db.prepare("SELECT * FROM agent_steps WHERE incident_id = ? ORDER BY ts ASC").all(id);

    return NextResponse.json({ incident, requests, steps });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
