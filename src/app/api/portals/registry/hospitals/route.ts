import { NextResponse } from "next/server";
import { HOSPITAL_REGISTRY_DATA } from "@/lib/registriesData";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    source: "HOSPITAL_PATIENT_LOCATOR_REGISTRY",
    disclaimer: "SIMULATED DATA - NO SENSITIVE MEDICAL FIELDS",
    records: HOSPITAL_REGISTRY_DATA,
  });
}
