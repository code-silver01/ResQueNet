export interface PriorityFactor {
  factor: string;
  points: number;
  reason: string;
}

export interface PriorityResult {
  score: number;
  breakdown: PriorityFactor[];
}

export function computePriority(incident: {
  incident_type?: string;
  needs?: string[] | string;
  mobility_assistance_count?: number;
  injuries_text?: string;
  hazards?: string;
  people_count?: number;
  raw_text?: string;
}): PriorityResult {
  const breakdown: PriorityFactor[] = [];
  let score = 0;

  const rawNeeds = Array.isArray(incident.needs)
    ? incident.needs
    : typeof incident.needs === "string"
    ? JSON.parse(incident.needs || "[]")
    : [];

  const rawText = (incident.raw_text || "").toLowerCase();
  const injuriesText = (incident.injuries_text || "").toLowerCase();
  const hazardsText = (incident.hazards || "").toLowerCase();
  const incType = (incident.incident_type || "").toLowerCase();
  const peopleCount = Number(incident.people_count || 1);
  const mobilityCount = Number(incident.mobility_assistance_count || 0);

  // 1. Flood / Hazard exposure (+3)
  if (
    incType === "flood" ||
    rawNeeds.includes("water_rescue") ||
    hazardsText.includes("flood") ||
    rawText.includes("flood") ||
    rawText.includes("stranded")
  ) {
    score += 3;
    breakdown.push({
      factor: "Flood / Hazard Exposure",
      points: 3,
      reason: "High environmental risk from active flooding or stranded condition.",
    });
  }

  // 2. Mobility limitation (+2)
  if (mobilityCount > 0 || rawText.includes("cannot walk") || rawText.includes("wheelchair") || rawText.includes("elderly")) {
    score += 2;
    breakdown.push({
      factor: "Mobility Limitation",
      points: 2,
      reason: `${mobilityCount > 0 ? mobilityCount : 1} individual(s) require physical mobility assistance or cannot evacuate independently.`,
    });
  }

  // 3. Medical need (+3)
  if (
    rawNeeds.includes("medical") ||
    injuriesText.length > 0 ||
    rawText.includes("medical") ||
    rawText.includes("doctor") ||
    rawText.includes("injur")
  ) {
    score += 3;
    breakdown.push({
      factor: "Acute Medical Need",
      points: 3,
      reason: "Urgent medical assistance or triage required for stranded party.",
    });
  }

  // 4. Children or Elderly vulnerable individuals (+2)
  if (rawText.includes("elderly") || rawText.includes("child") || rawText.includes("baby") || rawText.includes("infant")) {
    score += 2;
    breakdown.push({
      factor: "Vulnerable Demographics",
      points: 2,
      reason: "Elderly or infant dependents present in stranded group.",
    });
  }

  // 5. People count scaled
  if (peopleCount >= 10) {
    score += 2;
    breakdown.push({
      factor: "Large Group (10+ people)",
      points: 2,
      reason: `High rescue payload requirement for ${peopleCount} individuals.`,
    });
  } else if (peopleCount >= 4) {
    score += 1;
    breakdown.push({
      factor: "Group Size (4+ people)",
      points: 1,
      reason: `Multi-person party (${peopleCount} individuals) requiring coordinated capacity.`,
    });
  }

  // 6. Hazards reported (+1)
  if (hazardsText.length > 5 || rawText.includes("water rising") || rawText.includes("power lines") || rawText.includes("current")) {
    score += 1;
    breakdown.push({
      factor: "Compounding Hazards",
      points: 1,
      reason: incident.hazards || "Active site hazards reported in intake.",
    });
  }

  return { score, breakdown };
}
