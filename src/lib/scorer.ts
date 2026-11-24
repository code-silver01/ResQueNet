import { haversine } from "./haversine";

export interface ResourceScoreBreakdown {
  capabilityFit: number;
  distance: number;
  accessibilityFit: number;
  verificationLevel: number;
  dataFreshness: number;
}

export interface ScoredResource {
  resource: {
    id: string;
    name: string;
    type: string;
    lat: number;
    lng: number;
    capabilities: string[];
    accessibility: string[];
    capacity_text: string;
    source_type: "OFFICIAL" | "USER-REPORTED" | "SIMULATED";
    confirmed: number;
    last_checked: string;
    portal_url: string;
    phone?: string;
    address?: string;
  };
  totalScore: number;
  breakdown: ResourceScoreBreakdown;
  hardFilterPassed: boolean;
  hardFilterReason?: string;
  distanceKm: number;
}

export interface ScoringContext {
  needs: string[];
  lat: number;
  lng: number;
  mobilityAssistanceCount: number;
  medicalUrgent: boolean;
}

export function scoreResource(
  rawResource: {
    id: string;
    name: string;
    type: string;
    lat: number;
    lng: number;
    capabilities: string | string[];
    accessibility: string | string[];
    capacity_text: string;
    source_type: string;
    confirmed: number;
    last_checked: string;
    portal_url: string;
    phone?: string;
    address?: string;
  },
  ctx: ScoringContext
): ScoredResource {
  const capabilities: string[] = Array.isArray(rawResource.capabilities)
    ? rawResource.capabilities
    : JSON.parse(rawResource.capabilities || "[]");

  const accessibility: string[] = Array.isArray(rawResource.accessibility)
    ? rawResource.accessibility
    : JSON.parse(rawResource.accessibility || "[]");

  const resource = {
    ...rawResource,
    capabilities,
    accessibility,
    source_type: (rawResource.source_type || "SIMULATED") as "OFFICIAL" | "USER-REPORTED" | "SIMULATED",
  };

  let hardFilterPassed = true;
  let hardFilterReason: string | undefined;

  // 1. HARD FILTER: Capability match
  // Resource capability must cover at least one primary need or match appropriate disaster type
  const coversNeeds = ctx.needs.some((need) => {
    if (need === "water_rescue") {
      return capabilities.includes("water_rescue") || capabilities.includes("boat_rescue") || capabilities.includes("swift_water");
    }
    if (need === "medical") {
      return (
        capabilities.includes("medical") ||
        capabilities.includes("ambulance") ||
        capabilities.includes("first_aid") ||
        capabilities.includes("emergency") ||
        capabilities.includes("icu")
      );
    }
    if (need === "shelter") {
      return capabilities.includes("shelter");
    }
    if (need === "food_water") {
      return capabilities.includes("food_water") || capabilities.includes("shelter");
    }
    if (need === "transport") {
      return capabilities.includes("transport") || capabilities.includes("evacuation");
    }
    return capabilities.includes(need);
  });

  if (ctx.needs.length > 0 && !coversNeeds) {
    hardFilterPassed = false;
    hardFilterReason = `Capability mismatch: resource does not provide ${ctx.needs.join(", ")}`;
  }

  // 2. HARD FILTER: Wheelchair / Mobility Requirement
  // Rule: if mobility_assistance_count > 0, shelter MUST be wheelchair accessible
  if (ctx.mobilityAssistanceCount > 0 && resource.type === "shelter") {
    const isAccessible = accessibility.includes("wheelchair_accessible");
    if (!isAccessible) {
      hardFilterPassed = false;
      hardFilterReason = "Strict Filter: Shelter lacks wheelchair accessibility for non-ambulatory patient.";
    }
  }

  // Calculate Distance (Haversine)
  const distanceKm = haversine(ctx.lat, ctx.lng, resource.lat, resource.lng);

  // 3. CAPABILITY FIT (Max 40 points)
  let capabilityFit = 0;
  if (hardFilterPassed) {
    const matchingCount = ctx.needs.filter((need) => {
      if (need === "water_rescue") return capabilities.includes("water_rescue") || capabilities.includes("boat_rescue");
      if (need === "medical") return capabilities.includes("medical") || capabilities.includes("ambulance") || capabilities.includes("emergency");
      if (need === "shelter") return capabilities.includes("shelter");
      if (need === "food_water") return capabilities.includes("food_water");
      if (need === "transport") return capabilities.includes("transport") || capabilities.includes("evacuation");
      return capabilities.includes(need);
    }).length;
    capabilityFit = ctx.needs.length > 0 ? Math.round((matchingCount / ctx.needs.length) * 40) : 25;
  }

  // 4. DISTANCE SCORE (Max 30 points, inverse distance)
  // 0 km = 30 pts, 10 km = 0 pts
  let distanceScore = 0;
  if (hardFilterPassed) {
    distanceScore = Math.max(0, Math.round(30 - (distanceKm / 10) * 30));
  }

  // 5. ACCESSIBILITY FIT (Max 15 points)
  let accessibilityFit = 8;
  if (hardFilterPassed) {
    if (ctx.mobilityAssistanceCount > 0) {
      if (accessibility.includes("wheelchair_accessible") || accessibility.includes("mobility_assistance")) {
        accessibilityFit = 15;
      } else {
        accessibilityFit = 0;
      }
    } else if (accessibility.includes("wheelchair_accessible")) {
      accessibilityFit = 12;
    }
  } else {
    accessibilityFit = 0;
  }

  // 6. VERIFICATION LEVEL (Max 10 points)
  // Confirmed = 10 pts, Unconfirmed = 4 pts
  const verificationLevel = hardFilterPassed ? (resource.confirmed ? 10 : 4) : 0;

  // 7. DATA FRESHNESS (Max 5 points)
  let dataFreshness = 0;
  if (hardFilterPassed && resource.last_checked) {
    const ageMinutes = (Date.now() - new Date(resource.last_checked).getTime()) / (1000 * 60);
    if (ageMinutes < 60) dataFreshness = 5;
    else if (ageMinutes < 360) dataFreshness = 3;
    else if (ageMinutes < 1440) dataFreshness = 2;
    else dataFreshness = 1;
  }

  const totalScore = hardFilterPassed
    ? capabilityFit + distanceScore + accessibilityFit + verificationLevel + dataFreshness
    : 0;

  return {
    resource,
    totalScore,
    breakdown: {
      capabilityFit,
      distance: distanceScore,
      accessibilityFit,
      verificationLevel,
      dataFreshness,
    },
    hardFilterPassed,
    hardFilterReason,
    distanceKm,
  };
}
