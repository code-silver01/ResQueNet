import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const { status } = body;

    const db = getDb();
    db.prepare("UPDATE requests SET status = ? WHERE id = ?").run(status, id);

    const reqItem = db.prepare("SELECT incident_id FROM requests WHERE id = ?").get(id) as { incident_id?: string } | undefined;
    if (reqItem?.incident_id && reqItem.incident_id !== "portal-direct") {
      db.prepare("UPDATE incidents SET status = ? WHERE id = ?").run(status, reqItem.incident_id);
    }

    return NextResponse.json({ success: true, status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
