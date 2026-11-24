import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const requestId = req.nextUrl.searchParams.get("requestId");
  if (!requestId) {
    return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
  }

  const db = getDb();
  const request = db.prepare("SELECT * FROM requests WHERE id = ?").get(requestId);
  const steps = db.prepare("SELECT * FROM agent_steps WHERE request_id = ? ORDER BY ts ASC").all(requestId);

  return NextResponse.json({ request, steps });
}
