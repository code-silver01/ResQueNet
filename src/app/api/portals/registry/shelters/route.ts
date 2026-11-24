import { NextResponse } from "next/server";
import { SHELTER_REGISTRY_DATA } from "@/lib/registriesData";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    source: "MUNICIPAL_SHELTER_PUBLIC_REGISTRY",
    disclaimer: "SIMULATED DATA - PUBLIC FIELDS ONLY",
    records: SHELTER_REGISTRY_DATA,
  });
}
