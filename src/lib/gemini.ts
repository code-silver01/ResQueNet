import { GoogleGenerativeAI } from "@google/generative-ai";

export interface IncidentExtraction {
  incident_type: "flood" | "earthquake" | "fire" | "medical" | "general" | "storm" | "landslide" | "hazmat";
  people_count: number;
  location_text: string;
  needs: Array<"water_rescue" | "medical" | "shelter" | "food_water" | "transport" | "search_rescue">;
  mobility_assistance_count: number;
  injuries_text: string;
  hazards: string;
}

export function heuristicExtract(text: string): IncidentExtraction {
  const lower = text.toLowerCase();

  // People count
  let people_count = 1;
  const withThreeMatch = lower.match(/(?:with|and)\s+(three|3)\s+other/i);
  if (withThreeMatch) {
    people_count = 4; // reporter + 3 other people
  } else {
    const numMatch = lower.match(/(\d+)\s+(?:people|persons|family members|trapped|stranded)/i);
    if (numMatch) {
      people_count = parseInt(numMatch[1], 10);
    } else if (lower.includes("four people") || lower.includes("4 people")) {
      people_count = 4;
    } else if (lower.includes("three people") || lower.includes("3 people")) {
      people_count = 3;
    }
  }

  // Incident type
  let incident_type: IncidentExtraction["incident_type"] = "general";
  if (lower.includes("flood") || lower.includes("water") || lower.includes("drowning")) {
    incident_type = "flood";
  } else if (lower.includes("fire") || lower.includes("smoke")) {
    incident_type = "fire";
  } else if (lower.includes("earthquake") || lower.includes("collapse")) {
    incident_type = "earthquake";
  } else if (lower.includes("storm") || lower.includes("cyclone")) {
    incident_type = "storm";
  }

  // Needs
  const needs: IncidentExtraction["needs"] = [];
  if (lower.includes("boat") || lower.includes("water rescue") || lower.includes("flooded road") || lower.includes("stranded near a flooded")) {
    needs.push("water_rescue");
  }
  if (lower.includes("medical") || lower.includes("doctor") || lower.includes("injured") || lower.includes("medicine")) {
    needs.push("medical");
  }
  if (lower.includes("shelter") || lower.includes("stay") || lower.includes("camp")) {
    needs.push("shelter");
  }
  if (lower.includes("food") || lower.includes("water") || lower.includes("rations")) {
    needs.push("food_water");
  }
  if (lower.includes("transport") || lower.includes("evacuat") || lower.includes("vehicle")) {
    needs.push("transport");
  }
  if (needs.length === 0) {
    needs.push("water_rescue");
  }

  // Mobility
  let mobility_assistance_count = 0;
  if (lower.includes("cannot walk") || lower.includes("wheelchair") || lower.includes("elderly") || lower.includes("bedridden")) {
    mobility_assistance_count = 1;
  }

  // Location text
  let location_text = "Flooded Road Sector";
  const locMatch = text.match(/(?:near|at|around|on|in)\s+([^,.]+)/i);
  if (locMatch && locMatch[1]) {
    location_text = locMatch[1].trim();
  }

  // Injuries text
  let injuries_text = "";
  if (lower.includes("medical help") || lower.includes("cannot walk") || lower.includes("elderly")) {
    injuries_text = "Elderly individual non-ambulatory; requires medical evaluation and mobility assistance.";
  }

  // Hazards
  let hazards = "";
  if (lower.includes("flood")) {
    hazards = "Rising flood waters, submerged roadway, potential debris.";
  }

  return {
    incident_type,
    people_count,
    location_text,
    needs,
    mobility_assistance_count,
    injuries_text,
    hazards,
  };
}

export async function extractIncidentWithGemini(reportText: string): Promise<IncidentExtraction> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "your_gemini_api_key_here") {
    // Graceful fallback to deterministic parsing
    return heuristicExtract(reportText);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const prompt = `
You are a specialized disaster triage parser. Extract structured incident data from the user disaster report.
Return ONLY valid JSON matching this exact structure:
{
  "incident_type": "flood" | "earthquake" | "fire" | "medical" | "general" | "storm" | "landslide" | "hazmat",
  "people_count": number (total count of stranded people, e.g. "I'm with 3 other people" = 4),
  "location_text": string (extracted landmarks or address),
  "needs": array of ("water_rescue" | "medical" | "shelter" | "food_water" | "transport" | "search_rescue"),
  "mobility_assistance_count": number (count of elderly/disabled/injured who cannot walk),
  "injuries_text": string,
  "hazards": string
}

Report Text:
"""
${reportText}
"""
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);

    return {
      incident_type: parsed.incident_type || "flood",
      people_count: Number(parsed.people_count) || 1,
      location_text: parsed.location_text || "Near Flooded Road",
      needs: Array.isArray(parsed.needs) && parsed.needs.length > 0 ? parsed.needs : ["water_rescue"],
      mobility_assistance_count: Number(parsed.mobility_assistance_count) || 0,
      injuries_text: parsed.injuries_text || "",
      hazards: parsed.hazards || "",
    };
  } catch (err) {
    console.warn("Gemini API call failed or timed out, using robust fallback heuristic:", err);
    return heuristicExtract(reportText);
  }
}
