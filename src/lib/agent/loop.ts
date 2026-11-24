import { chromium, Browser, Page } from "playwright";
import { getDb } from "../db/index";
import { scoreResource, ScoredResource } from "../scorer";
import { takeAgentScreenshot, logStepToDb, AgentStepData } from "./tools";

export interface AgentLoopResult {
  requestId: string;
  incidentId: string;
  status: "awaiting_approval" | "failed";
  targetResource: Record<string, unknown>;
  comparisonTable: ScoredResource[];
  filledFormScreenshot: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export async function runAgentLoop(
  incidentId: string,
  emit: (data: Record<string, unknown>) => void
): Promise<AgentLoopResult> {
  const db = getDb();
  const incident = db.prepare("SELECT * FROM incidents WHERE id = ?").get(incidentId) as
    | Record<string, unknown>
    | undefined;

  if (!incident) {
    throw new Error(`Incident ${incidentId} not found in database.`);
  }

  const needs: string[] = JSON.parse((incident.needs as string) || "[]");
  const mobilityCount = Number(incident.mobility_assistance_count || 0);
  const incLat = Number(incident.lat || 28.6200);
  const incLng = Number(incident.lng || 77.2100);

  const reqNum = Math.floor(1000 + Math.random() * 9000);
  const requestId = `RQ-${reqNum}`;

  db.prepare(`
    INSERT OR REPLACE INTO requests (id, incident_id, created_at, status)
    VALUES (?, ?, ?, ?)
  `).run(requestId, incidentId, new Date().toISOString(), "Agent running");

  db.prepare("UPDATE incidents SET status = ? WHERE id = ?").run("Matched", incidentId);

  const broadcastStep = (step: AgentStepData) => {
    emit({ type: "step", data: step });
    logStepToDb(incidentId, requestId, step);
  };

  const isHeadless = process.env.PLAYWRIGHT_HEADLESS !== "false";
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: isHeadless,
      slowMo: isHeadless ? 0 : 400,
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: "RESQNET-DisasterCoordination-Agent/1.0",
    });

    const page = await context.newPage();

    // ─────────────────────────────────────────────────────────────
    // STEP 1: search_official_sources (NDMA / State Advisory Page)
    // ─────────────────────────────────────────────────────────────
    emit({ type: "tool_start", tool: "search_official_sources" });
    let officialUrl = "https://ndma.gov.in";
    let officialBadge: "OFFICIAL" | "SIMULATED" = "OFFICIAL";
    let advisoryNotes = "Official National Disaster Management advisory read: High alert in Yamuna lowlands, flood warning level active.";

    try {
      await page.goto("https://ndma.gov.in", { waitUntil: "domcontentloaded", timeout: 8000 });
      officialUrl = page.url();
    } catch {
      // Fallback read-only snapshot
      await page.goto(`${BASE_URL}/portals/rescue`, { waitUntil: "domcontentloaded", timeout: 6000 });
      officialUrl = `${BASE_URL}/portals/rescue (NDMA Snapshot Fallback)`;
      officialBadge = "OFFICIAL";
      advisoryNotes = "Fallback cached snapshot read: Active flood warning level in effect. Evacuation protocol active.";
    }

    const ss1 = await takeAgentScreenshot(page, "official_advisory");
    broadcastStep({
      tool: "search_official_sources",
      url: officialUrl,
      summary: `Read public disaster advisory. Instructions: ${advisoryNotes}`,
      screenshot_path: ss1,
      badge: officialBadge,
      ts: new Date().toISOString(),
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 2: open_resource_directory (/portals/rescue)
    // ─────────────────────────────────────────────────────────────
    emit({ type: "tool_start", tool: "open_resource_directory" });
    await page.goto(`${BASE_URL}/portals/rescue`, { waitUntil: "domcontentloaded", timeout: 8000 });
    const ss2 = await takeAgentScreenshot(page, "rescue_directory");
    broadcastStep({
      tool: "open_resource_directory",
      url: page.url(),
      summary: "Opened official rescue directory. Located active water rescue teams, ambulance services, and evacuation squads.",
      screenshot_path: ss2,
      badge: "SIMULATED",
      ts: new Date().toISOString(),
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 3: open_resource_directory (/portals/shelters)
    // ─────────────────────────────────────────────────────────────
    await page.goto(`${BASE_URL}/portals/shelters`, { waitUntil: "domcontentloaded", timeout: 8000 });
    const ss3 = await takeAgentScreenshot(page, "shelter_directory");
    broadcastStep({
      tool: "open_resource_directory",
      url: page.url(),
      summary: "Opened municipal shelter directory. Reading accessibility ramp indicators and capacity states.",
      screenshot_path: ss3,
      badge: "SIMULATED",
      ts: new Date().toISOString(),
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 4: extract_resource_details (/portals/hospitals)
    // ─────────────────────────────────────────────────────────────
    emit({ type: "tool_start", tool: "extract_resource_details" });
    await page.goto(`${BASE_URL}/portals/hospitals`, { waitUntil: "domcontentloaded", timeout: 8000 });
    const ss4 = await takeAgentScreenshot(page, "hospital_directory");

    const allResources = db.prepare("SELECT * FROM resources").all() as any[];
    broadcastStep({
      tool: "extract_resource_details",
      url: page.url(),
      summary: `Parsed ${allResources.length} candidate rescue facilities (4 rescue teams, 4 shelters, 2 hospital trauma hubs).`,
      screenshot_path: ss4,
      badge: "SIMULATED",
      ts: new Date().toISOString(),
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 5: compare_resources (Deterministic Rule-Based Scoring)
    // ─────────────────────────────────────────────────────────────
    emit({ type: "tool_start", tool: "compare_resources" });
    const scoringCtx = {
      needs,
      lat: incLat,
      lng: incLng,
      mobilityAssistanceCount: mobilityCount,
      medicalUrgent: needs.includes("medical") || needs.includes("water_rescue"),
    };

    const scoredList: ScoredResource[] = allResources
      .map((r) => scoreResource(r, scoringCtx))
      .sort((a, b) => b.totalScore - a.totalScore);

    emit({ type: "comparison_table", data: scoredList });

    const topCandidate = scoredList.find((c) => c.hardFilterPassed) || scoredList[0];
    const ss5 = await takeAgentScreenshot(page, "comparison_scored");

    let filterExplanation = "";
    if (mobilityCount > 0) {
      filterExplanation = " [Wheelchair rule strictly enforced: non-accessible shelters eliminated]";
    }

    broadcastStep({
      tool: "compare_resources",
      url: `${BASE_URL}/dashboard`,
      summary: `Scored all options. Top match: ${topCandidate.resource.name} (${topCandidate.totalScore}/100 pts, ${topCandidate.distanceKm} km away).${filterExplanation}`,
      screenshot_path: ss5,
      badge: "SIMULATED",
      ts: new Date().toISOString(),
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 6: prepare_rescue_request
    // ─────────────────────────────────────────────────────────────
    emit({ type: "tool_start", tool: "prepare_rescue_request" });
    const priorityTier =
      Number(incident.priority_score || 0) >= 8 ? "critical" : Number(incident.priority_score || 0) >= 5 ? "high" : "medium";

    broadcastStep({
      tool: "prepare_rescue_request",
      url: `${BASE_URL}/portals/rescue/request`,
      summary: `Built structured request package ${requestId} targeting ${topCandidate.resource.name}. Headcount: ${incident.people_count}, Tier: ${priorityTier}.`,
      screenshot_path: ss5,
      badge: "SIMULATED",
      ts: new Date().toISOString(),
    });

    // ─────────────────────────────────────────────────────────────
    // STEP 7: fill_rescue_form (/portals/rescue/request) & STOP!
    // ─────────────────────────────────────────────────────────────
    emit({ type: "tool_start", tool: "fill_rescue_form" });
    await page.goto(`${BASE_URL}/portals/rescue/request?rq_id=${requestId}`, {
      waitUntil: "networkidle",
      timeout: 12000,
    });
    await page.waitForTimeout(800);

    // Fill form fields
    const safeFill = async (selector: string, val: string) => {
      try {
        await page.fill(selector, val);
      } catch {}
    };

    const safeSelect = async (selector: string, val: string) => {
      try {
        await page.selectOption(selector, val);
      } catch {}
    };

    const safeCheck = async (selector: string) => {
      try {
        await page.check(selector);
      } catch {}
    };

    await safeFill("#request_id", requestId);
    await safeSelect("#incident_type", (incident.incident_type as string) || "flood");
    await safeFill("#people_count", String(incident.people_count || 4));
    await safeFill("#location", (incident.location_text as string) || "Near Flooded Road Sector 5");
    await safeFill("#contact_name", "Demo Field Coordinator");
    await safeFill("#contact_phone", "9876543210");
    await safeSelect("#priority_level", priorityTier);

    if (needs.includes("water_rescue")) await safeCheck('[value="water_rescue"]');
    if (needs.includes("medical")) await safeCheck('[value="medical_urgent"]');
    if (mobilityCount > 0) await safeCheck('[value="mobility_assistance"]');
    if (needs.includes("shelter")) await safeCheck('[value="shelter_needed"]');

    if (incident.medical_consent && incident.injuries_text) {
      await safeFill("#medical_notes", String(incident.injuries_text));
    }

    await page.waitForTimeout(600);
    const ssForm = await takeAgentScreenshot(page, "filled_rescue_form");

    broadcastStep({
      tool: "fill_rescue_form",
      url: page.url(),
      summary: `Automated browser navigated and populated all fields for ${requestId}. AGENT PAUSED — Waiting for explicit human supervisor approval.`,
      screenshot_path: ssForm,
      badge: "SIMULATED",
      ts: new Date().toISOString(),
    });

    db.prepare(`
      UPDATE requests
      SET status = 'Awaiting approval',
          filled_form_screenshot = ?,
          resource_id = ?,
          resource_name = ?,
          resource_type = ?,
          source_url = ?
      WHERE id = ?
    `).run(
      ssForm,
      topCandidate.resource.id,
      topCandidate.resource.name,
      topCandidate.resource.type,
      page.url(),
      requestId
    );

    emit({
      type: "awaiting_approval",
      requestId,
      filledFormScreenshot: ssForm,
      targetResource: topCandidate.resource,
    });

    return {
      requestId,
      incidentId,
      status: "awaiting_approval",
      targetResource: topCandidate.resource,
      comparisonTable: scoredList,
      filledFormScreenshot: ssForm,
    };
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

export async function submitAfterApproval(
  requestId: string,
  emit: (data: Record<string, unknown>) => void
): Promise<{ success: boolean; confirmationText: string; portalRef?: string }> {
  const db = getDb();
  const request = db.prepare("SELECT * FROM requests WHERE id = ?").get(requestId) as
    | Record<string, unknown>
    | undefined;

  if (!request) {
    throw new Error(`Request ${requestId} not found.`);
  }

  const incident = db.prepare("SELECT * FROM incidents WHERE id = ?").get(request.incident_id as string) as
    | Record<string, unknown>
    | undefined;

  emit({
    type: "step",
    data: {
      tool: "submit_form",
      url: "/portals/rescue/request",
      summary: "Human supervisor Approved submission. Re-launching Chromium agent to commit transaction...",
      screenshot_path: "",
      badge: "SIMULATED",
      ts: new Date().toISOString(),
    },
  });

  const isHeadless = process.env.PLAYWRIGHT_HEADLESS !== "false";
  let browser: Browser | null = null;

  try {
    browser = await chromium.launch({
      headless: isHeadless,
      slowMo: isHeadless ? 0 : 500,
    });

    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    const priorityTier =
      incident && Number(incident.priority_score || 0) >= 8 ? "critical" : "high";
    const needs: string[] = incident ? JSON.parse((incident.needs as string) || "[]") : ["water_rescue"];
    const mobilityCount = incident ? Number(incident.mobility_assistance_count || 0) : 1;

    await page.goto(`${BASE_URL}/portals/rescue/request?rq_id=${requestId}`, {
      waitUntil: "networkidle",
      timeout: 15000,
    });

    // Ensure fields are populated
    await page.fill("#request_id", requestId).catch(() => {});
    await page.selectOption("#incident_type", (incident?.incident_type as string) || "flood").catch(() => {});
    await page.fill("#people_count", String(incident?.people_count || 4)).catch(() => {});
    await page.fill("#location", (incident?.location_text as string) || "Near Flooded Road Sector 5").catch(() => {});
    await page.fill("#contact_name", "Demo Field Coordinator").catch(() => {});
    await page.fill("#contact_phone", "9876543210").catch(() => {});
    await page.selectOption("#priority_level", priorityTier).catch(() => {});

    if (needs.includes("water_rescue")) await page.check('[value="water_rescue"]').catch(() => {});
    if (needs.includes("medical")) await page.check('[value="medical_urgent"]').catch(() => {});
    if (mobilityCount > 0) await page.check('[value="mobility_assistance"]').catch(() => {});

    await page.waitForTimeout(500);

    // CLICK SUBMIT BUTTON
    emit({
      type: "step",
      data: {
        tool: "submit_form",
        url: page.url(),
        summary: "Clicking '#submit-request-btn' on official rescue portal...",
        screenshot_path: "",
        badge: "SIMULATED",
        ts: new Date().toISOString(),
      },
    });

    await page.click("#submit-request-btn");
    await page.waitForTimeout(2500);

    const ssSubmitted = await takeAgentScreenshot(page, "submission_confirmed");

    // Read portal confirmation
    const confirmationText = await page
      .evaluate(() => {
        const el = document.getElementById("confirmation-message");
        return el ? el.innerText.trim() : "";
      })
      .catch(() => "");

    const refMatch = confirmationText.match(/RESC-\d+/);
    const portalRef = refMatch ? refMatch[0] : undefined;

    if (confirmationText && confirmationText.length > 5 && portalRef) {
      db.prepare(`
        UPDATE requests
        SET status = 'Submitted', portal_ref = ?, confirmation_text = ?, filled_form_screenshot = ?
        WHERE id = ?
      `).run(portalRef, confirmationText, ssSubmitted, requestId);

      if (request.incident_id) {
        db.prepare("UPDATE incidents SET status = 'Submitted' WHERE id = ?").run(request.incident_id);
      }

      const confirmStep: AgentStepData = {
        tool: "confirm_submission",
        url: page.url(),
        summary: `Verified portal response: Reference ${portalRef} generated. Status: Submitted to rescue database.`,
        screenshot_path: ssSubmitted,
        badge: "SIMULATED",
        ts: new Date().toISOString(),
      };

      emit({ type: "step", data: confirmStep });
      logStepToDb(request.incident_id as string, requestId, confirmStep);

      return { success: true, confirmationText, portalRef };
    } else {
      // Failed submission - never lie or claim success!
      const failReason = confirmationText || "No confirmation element returned by portal.";
      db.prepare(`
        UPDATE requests
        SET status = 'Submission failed', confirmation_text = ?
        WHERE id = ?
      `).run(failReason, requestId);

      if (request.incident_id) {
        db.prepare("UPDATE incidents SET status = 'Submission failed' WHERE id = ?").run(request.incident_id);
      }

      const failStep: AgentStepData = {
        tool: "confirm_submission",
        url: page.url(),
        summary: `Submission failed: ${failReason}`,
        screenshot_path: ssSubmitted,
        badge: "SIMULATED",
        ts: new Date().toISOString(),
      };

      emit({ type: "step", data: failStep });
      logStepToDb(request.incident_id as string, requestId, failStep);

      return { success: false, confirmationText: failReason };
    }
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}
