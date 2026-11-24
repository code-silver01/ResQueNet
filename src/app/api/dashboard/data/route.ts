import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";
import { seedDatabase } from "@/lib/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  seedDatabase();
  const db = getDb();

  const incidents = db.prepare("SELECT * FROM incidents ORDER BY created_at DESC").all();
  const requests = db.prepare("SELECT * FROM requests ORDER BY created_at DESC").all();
  const steps = db.prepare("SELECT * FROM agent_steps ORDER BY ts ASC").all();
  const resources = db.prepare("SELECT * FROM resources").all();

  return NextResponse.json({
    incidents,
    requests,
    steps,
    resources,
  });
}
