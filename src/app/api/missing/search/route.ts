import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db/index";
import { seedDatabase } from "@/lib/db/seed";
import { nameSimilarity, ageRangeOverlap } from "@/lib/fuzzyMatch";
import { SHELTER_REGISTRY_DATA, HOSPITAL_REGISTRY_DATA } from "@/lib/registriesData";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    seedDatabase();
    const db = getDb();
    const body = await req.json();
    const { name, approxAge, lastSeenLocation, description } = body;

    const queryName = (name || "").trim();
    if (!queryName) {
      return NextResponse.json({ error: "Name is required for registry search." }, { status: 400 });
    }

    const allRecords = [
      ...SHELTER_REGISTRY_DATA.map((r) => ({ ...r, source_type: "Shelter Public Intake" })),
      ...HOSPITAL_REGISTRY_DATA.map((r) => ({ ...r, source_type: "Hospital Patient Reception" })),
    ];

    const candidates = allRecords
      .map((rec) => {
        const nameSim = nameSimilarity(queryName, rec.display_name);
        const ageMatch = approxAge ? ageRangeOverlap(Number(approxAge), rec.age_range) : true;
        const locMatch =
          lastSeenLocation && rec.last_seen_area.toLowerCase().includes(lastSeenLocation.toLowerCase())
            ? 0.2
            : 0;

        const totalConfidence = Math.min(
          0.99,
          Math.round((nameSim * 0.7 + (ageMatch ? 0.2 : 0) + locMatch) * 100) / 100
        );

        return {
          ...rec,
          match_score: Math.round(totalConfidence * 100),
          disclaimer: "POSSIBLE MATCH: must be verified by authorised staff",
          verified: false,
        };
      })
      .filter((c) => c.match_score >= 30)
      .sort((a, b) => b.match_score - a.match_score);

    const reportId = `ML-${uuidv4().substring(0, 8).toUpperCase()}`;
    db.prepare(`
      INSERT INTO missing_reports (id, created_at, name, approx_age, last_seen_location, description, status, matches)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      reportId,
      new Date().toISOString(),
      queryName,
      approxAge ? Number(approxAge) : null,
      lastSeenLocation || "",
      description || "",
      "Searching",
      JSON.stringify(candidates)
    );

    return NextResponse.json({
      success: true,
      reportId,
      candidates,
      count: candidates.length,
      notice: "POSSIBLE MATCH: must be verified by authorised staff",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
