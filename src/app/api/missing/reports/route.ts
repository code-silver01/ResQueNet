import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";
import { seedDatabase } from "@/lib/db/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  seedDatabase();
  const db = getDb();
  const reports = db.prepare("SELECT * FROM missing_reports ORDER BY created_at DESC").all();
  return NextResponse.json({ reports });
}
