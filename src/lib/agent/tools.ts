import type { Page } from "playwright";
import path from "path";
import fs from "fs";
import { getDb } from "../db/index";

const SCREENSHOTS_DIR = path.join(process.cwd(), "public", "screenshots");

export interface AgentStepData {
  tool:
    | "search_official_sources"
    | "open_resource_directory"
    | "extract_resource_details"
    | "compare_resources"
    | "prepare_rescue_request"
    | "fill_rescue_form"
    | "track_request"
    | "find_relief_schemes"
    | "submit_form"
    | "confirm_submission";
  url: string;
  summary: string;
  screenshot_path: string;
  badge: "OFFICIAL" | "USER-REPORTED" | "SIMULATED";
  ts: string;
  details?: Record<string, unknown>;
}

export function ensureScreenshotsDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

export async function takeAgentScreenshot(page: Page, stepName: string): Promise<string> {
  ensureScreenshotsDir();
  const safeName = stepName.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
  const filename = `${Date.now()}_${safeName}.png`;
  const fullPath = path.join(SCREENSHOTS_DIR, filename);

  try {
    await page.screenshot({ path: fullPath, fullPage: false });
    return `/screenshots/${filename}`;
  } catch (err) {
    console.warn(`Screenshot error for ${stepName}:`, err);
    return "";
  }
}

export function logStepToDb(
  incidentId: string | null,
  requestId: string | null,
  step: AgentStepData
) {
  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO agent_steps (request_id, incident_id, tool, url, summary, screenshot_path, ts, badge)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      requestId,
      incidentId,
      step.tool,
      step.url,
      step.summary,
      step.screenshot_path,
      step.ts,
      step.badge
    );
  } catch (err) {
    console.error("Failed to log agent step to DB:", err);
  }
}
