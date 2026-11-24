# RESQNET — Supervised Browser-Agent Disaster Rescue Coordination

> 🚨 **PERMANENT SAFETY NOTICE**: In an emergency, call **112** (or your local disaster helpline) first. RESQNET is a demonstration system and does not dispatch real-world rescue units.

---

## 🏆 Track Fit: "Beyond the Browser"

RESQNET demonstrates a supervised browser agent acting in a high-stakes, time-sensitive disaster domain. Rather than merely querying an LLM in a chatbox, the agent **visibly operates real web pages**:
1. Visibly navigates official disaster management advisory websites.
2. Explores directory listings for water rescue teams, relief shelters, and hospitals.
3. Evaluates capability fit, haversine distance, and strict physical accessibility filters (e.g. non-ambulatory wheelchair need).
4. Navigates into live web forms, populates critical field data, captures a visual screenshot, and **STOPS**.
5. **Human-in-the-Loop Gate**: The agent *never* submits a form without an explicit, verified human supervisor approval click.
6. Upon approval, executes the transaction, parses confirmation vouchers from the portal DOM, and updates live status dashboards.

---

## 🛠️ Free Local Stack (NO AWS • NO Voice • 100% Free)

- **Frontend & API**: Next.js 15+ (App Router) with React 19, TypeScript, and Tailwind CSS.
- **Persistence**: SQLite via `better-sqlite3` (zero-config, high-speed local storage, WAL mode enabled).
- **Browser Agent Engine**: Playwright Chromium (supports both headed mode toggle and headless execution).
- **AI Triage**: Google Gemini 1.5 Flash (`@google/generative-ai`) with structured JSON schema output, used **strictly for report text → structured incident extraction**.
- **Real-Time Streaming**: Server-Sent Events (SSE) streaming live agent steps, tool invocations, and visual screenshots to the UI.
- **Mock Portals**: Self-hosted portals served by Next.js under `/portals/*` with standard HTML forms that Playwright navigates and fills.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js 18+ (tested on Node 20 / 22)
- Playwright Chromium installed (`npx playwright install chromium`)
- (Optional) Free Gemini API key from [Google AI Studio](https://aistudio.google.com). *Note: RESQNET includes a built-in deterministic heuristic fallback, so the demo runs even without an API key!*

### 2. Installation
```bash
git clone <repo-url>
cd ResQueNet
npm install
npx playwright install chromium
```

### 3. Configure Environment
Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

| Environment Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Free Google AI Studio API key (heuristic fallback provided if omitted) |
| `PLAYWRIGHT_HEADLESS` | Optional | Set to `false` to visibly watch the browser open and fill forms on your monitor! (Default: `true`) |
| `NEXT_PUBLIC_BASE_URL` | Optional | Base URL for local mock portals (Default: `http://localhost:3000`) |

### 4. Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## ⏱️ 3-Minute Interactive Demo Script

Follow this script to experience the full end-to-end workflow in under 3 minutes:

### Step 1: One-Click Flood Rescue Launch (0:00 – 0:30)
1. Open [http://localhost:3000](http://localhost:3000).
2. Notice the permanent red **112 Emergency Banner** at the top.
3. Click the blue button: **"🚀 Launch Live Coordination"** (or go to `/report` and click *"Use Sample Flood Report"*).
4. Watch the incident register in SQLite:
   - **Disaster Type**: Flood / Rising Water
   - **Party Headcount**: 4 People
   - **Special Needs**: Water / Boat Rescue, Medical Assistance
   - **Mobility**: 1 Elderly Non-Ambulatory Individual
   - **Deterministic Priority Score**: **10 / 15 (Critical)** with full breakdown.

### Step 2: Supervised Agent Execution & Multi-Page Traversal (0:30 – 1:30)
You are redirected to the live agent execution view (`/agent/[incidentId]`). Watch the live SSE feed as Playwright runs the following 7 tool steps:
1. `search_official_sources`: Visibly visits the official NDMA advisory page (or fallback snapshot) to verify active flood alerts. Badge: **OFFICIAL**.
2. `open_resource_directory`: Navigates to `/portals/rescue` and catalogs 4 specialized rescue strike teams.
3. `open_resource_directory`: Navigates to `/portals/shelters` and inspects capacity and wheelchair ramp availability.
4. `extract_resource_details`: Reads `/portals/hospitals` for 24/7 emergency trauma centers.
5. `compare_resources`: Computes deterministic scoring:
   - **Capability Fit**: 40 pts max
   - **Haversine Distance**: 30 pts max
   - **Accessibility Fit**: 15 pts max
   - **Verification Level**: 10 pts max
   - **Data Freshness**: 5 pts max
   - ⚠️ **Strict Hard Filter**: Automatically strikes out non-accessible shelters (`School Emergency Camp`, `Elevated Ground Camp`) because the party has an elderly non-ambulatory member.
6. `prepare_rescue_request`: Formulates request package `RQ-####`.
7. `fill_rescue_form`: Visibly opens `/portals/rescue/request`, fills in every field, takes a high-resolution screenshot, and **STOPS**.

### Step 3: Human Approval Gate & Verified Submission (1:30 – 2:15)
1. In the right panel, observe the yellow **"Approval Required"** card.
2. Click the screenshot thumbnail to inspect the filled form in the full-resolution lightbox.
3. The agent has paused — no transaction has occurred.
4. Click **"✓ Approve Submission"**.
5. The agent re-engages, clicks `#submit-request-btn`, waits for the portal to generate a voucher, and reads the confirmation text (`RESC-####`).
6. Status updates to **Submitted**.

### Step 4: Live Dashboard & Simulated Dispatcher Verification (2:15 – 3:00)
1. Navigate to **[Incident Dashboard](/dashboard)**.
2. Observe the lifecycle ribbon: `Reported` → `Matched` → `Submitted`.
3. Expand your incident to view coordinates, needs, and the complete audit timeline with clickable screenshots.
4. Open the **[Admin Portal](/portals/admin)** in a new tab:
   - Click **"Acknowledge"** to simulate municipal dispatch confirmation.
   - Return to the Dashboard and watch the status update to `Acknowledged` in real-time.
5. Visit **[Find a Person](/find)** (MissingLink):
   - Search for `"Raju"` (Age 35).
   - Review fuzzy Levenshtein matches from shelter and hospital logs.
   - Notice the mandatory safety disclaimer on every result: *"POSSIBLE MATCH: must be verified by authorised staff"*.
6. Visit **[Medical Relay](/medical/[incidentId])**:
   - Inspect the generated one-page medical handover report with allergy highlights.
   - Click **"Print Official Handover"** to see the clean printable print sheet.

---

## 🛡️ Built-in Safety Enforcements

1. **Permanent 112 Banner**: Sticky red warning banner on every page reminds users that RESQNET does not replace official emergency helplines.
2. **Strict Approval Gate**: The Playwright agent never executes a form submit action without explicit human approval.
3. **No False Promises**: The UI and code strictly prohibit language like *"dispatched"* or *"rescue on the way"*. Only confirmed portal states are shown.
4. **Deterministic Ranking**: The LLM is restricted to initial schema parsing. Ranking and scoring are 100% deterministic with transparent point breakdowns.
5. **Source Attribution**: Every record carries an explicit badge: `OFFICIAL`, `USER-REPORTED`, or `SIMULATED`, along with availability status and last checked time.
6. **MissingLink Safeguard**: Missing person search results are strictly labeled *"POSSIBLE MATCH: must be verified by authorised staff"*; the system never asserts a person has been found.

---

## 🐳 Deployment (Docker / Railway / Render / VPS)

Because RESQNET features an autonomous **Playwright Chromium browser** and a local **SQLite** database, persistent container environments are recommended over standard serverless platforms:

### Run with Docker
```bash
docker build -t resqnet .
docker run -p 3000:3000 --env-file .env.local resqnet
```

### 1-Click Cloud Deployment (Railway / Render / Fly.io)
1. Fork or push this repository to GitHub.
2. In **Railway** or **Render**, choose **Deploy from GitHub repo**.
3. It will automatically detect the `Dockerfile` or Node environment.
4. Set optional environment variable `GEMINI_API_KEY` in the dashboard.
5. Your instance will deploy with headless Chromium and live SSE streaming enabled!

---

## 📂 Project Structure

```
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Landing page with One-Click Flood Demo
│   │   ├── report/page.tsx              # Incident intake & Gemini extraction review
│   │   ├── agent/[incidentId]/page.tsx  # Live SSE browser agent execution & approval
│   │   ├── dashboard/page.tsx           # Incident pipeline & audit trail
│   │   ├── find/page.tsx                # MissingLink fuzzy person locator
│   │   ├── medical/[incidentId]/page.tsx# Medical Relay handover preview & print
│   │   ├── portals/                     # Mock portals visited by Playwright
│   │   │   ├── rescue/                  # Rescue team directory & request form
│   │   │   ├── shelters/                # Shelter directory & register form
│   │   │   ├── hospitals/               # Emergency hospital directory
│   │   │   ├── admin/                   # Coordinator dispatcher view
│   │   │   └── registry/                # Public shelter & hospital registries
│   │   └── api/                         # Backend API handlers & SSE endpoints
│   ├── components/                      # SafetyBanner, SourceBadge, StatusBadge, Navbar
│   └── lib/
│       ├── agent/                       # Playwright loop, tools & screenshots
│       ├── db/                          # SQLite schema, connection & seed data
│       ├── gemini.ts                    # Structured Gemini JSON extraction
│       ├── scorer.ts                    # Deterministic resource scoring & filters
│       ├── priority.ts                  # Rule-based priority calculator
│       ├── haversine.ts                 # Geospatial distance calculator
│       ├── locations.ts                 # Seeded landmarks & coordinate lookup
│       ├── fuzzyMatch.ts                # Levenshtein & token similarity
│       └── handover.ts                  # Emergency medical handover generator
├── resqnet.db                           # Local SQLite database (auto-created)
├── public/screenshots/                  # Visual captures saved by Playwright agent
└── next.config.ts                       # Server externals for better-sqlite3 & Playwright
```

---

## 📜 License
MIT License. Built for the Google DeepMind "Beyond the Browser" Hackathon Track.
