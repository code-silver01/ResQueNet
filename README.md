# RESQNET

**From emergency reports to coordinated rescue.**

RESQNET is a supervised browser agent that turns a single emergency report into matched, pre-filled and human-approved rescue and relief requests across separate portals, then tracks each request to its outcome.

> **Important:** RESQNET is not an emergency service and does not dispatch rescue. In an emergency, call **112** or your local disaster helpline first. All portals and records bundled with this project are **simulated** for development and demonstration.

---

## Table of contents

- [Overview](#overview)
- [The problem](#the-problem)
- [The solution](#the-solution)
- [Features](#features)
- [How it works](#how-it-works)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Resource matching](#resource-matching)
- [Request lifecycle](#request-lifecycle)
- [Trust and safety](#trust-and-safety)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Project structure](#project-structure)
- [Limitations](#limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

During floods and other disasters, the information and services people need are spread across many unconnected websites: official advisories, rescue directories, shelter listings, hospital pages, missing-person registries and relief schemes. People in distress end up searching, comparing and re-typing the same details again and again.

RESQNET acts as a coordination layer on top of those fragmented systems. It does the browsing, extraction, comparison and form-filling, and keeps the human in control of every submission.

## The problem

- Rescue, shelter and relief information lives on different portals with different formats.
- Affected people must repeat the same details (location, headcount, injuries, mobility needs) to every agency.
- Generic "rescue near me" searches ignore needs. A wheelchair user in floodwater needs a different resource than someone who can walk to a shelter.
- Coordinators and families have no shared, trustworthy view of what has been requested, acknowledged or resolved.
- Unverified listings and real confirmations look the same, so people cannot tell what to rely on.

## The solution

RESQNET converts one report into a structured incident, then a browser agent:

1. opens advisory pages and resource directories,
2. extracts locations, capabilities, accessibility and contacts,
3. ranks resources against the incident using transparent, rule-based scoring,
4. prepares and pre-fills the relevant request forms,
5. waits for explicit user approval before anything is submitted,
6. records the portal's actual response and tracks the request's status.

Every record shows where it came from and whether availability has actually been confirmed.

## Features

### Core

- **Incident Intake.** A free-text report is turned into a structured incident: incident type, number of people, location or landmark, injuries, mobility needs, hazards and the resources needed. Everything is editable before the agent runs.
- **RescueMatch.** The agent browses advisory pages and directories and compares rescue teams, ambulances, shelters and hospitals against the incident. Matching considers capability, distance and accessibility, and shows a per-resource score breakdown.
- **Approval-gated submission.** The agent fills the request form and stops. A screenshot of the filled form is shown, and nothing is submitted until the user clicks **Approve**. Submission results come from the portal's real confirmation, never from an assumption.
- **Live incident dashboard.** Every incident and request has an ID, a status, a timeline and a full audit trail of agent steps, source URLs and screenshots.
- **Source trust labels.** Each record carries a badge (`OFFICIAL`, `USER-REPORTED`, `SIMULATED`), an availability-confirmed flag and a last-checked timestamp.

### Secondary

- **MissingLink.** Searches participating shelter and hospital registries using only publicly exposed fields (name, age range, facility, last-seen area). Candidates are ranked by fuzzy name similarity, age-range overlap and location proximity, and are always labelled *possible match, needs verification by authorised staff*. A tracked missing-person report is created for each search.
- **Medical Relay.** An optional, consent-gated medical handover. When the user opts in for an incident, a one-page handover (allergies, conditions, medications, emergency contact) is generated and attached to the rescue request. When urgent medical risk is detected, a prominent "Call 112 now" prompt appears before any search runs.

## How it works

```
Report  →  Extract & confirm  →  Agent browses sources  →  Score & compare
                                                                │
Track status  ←  Portal confirmation  ←  Submit on Approve  ←  Fill forms
```

1. **Report.** The user describes the emergency in plain text (or loads the sample flood report).
2. **Extract and confirm.** An LLM converts the text into incident JSON. The user reviews and corrects the fields.
3. **Browse.** The agent opens each source in a real browser, with each step streamed live to the UI.
4. **Score.** Deterministic rules rank candidate resources; no LLM decides priority or availability.
5. **Fill.** The agent prepares the structured request (for example `RQ-1042`) and fills the portal forms.
6. **Approve.** The user reviews the filled form and approves, edits or cancels.
7. **Submit and track.** After approval the agent submits, parses the confirmation and keeps checking the portal for acknowledgement and resolution.

## Architecture

```
┌────────────────────┐    report     ┌────────────────────┐   text    ┌────────────────┐
│  Web UI            │ ────────────► │  API routes        │ ────────► │  LLM           │
│  Next.js / React   │               │  Next.js (Node)    │ ◄──────── │  (incident /   │
│  Tailwind          │ ◄──────────── │                    │   JSON    │  page parsing) │
└─────────▲──────────┘   SSE events  └─────────┬──────────┘           └────────────────┘
          │                                    │ incident
          │                          ┌─────────▼──────────┐   browse / fill   ┌─────────────────────┐
          │                          │  Agent worker      │ ────────────────► │ Advisory page       │
          │                          │  Playwright        │                   │ (read-only)         │
          │                          │  + tool functions  │                   │ Rescue / Shelter /  │
          │                          └─────────┬──────────┘ ◄──────────────── │ Hospital / Registry │
          │                                    │   results                    │ portals (simulated) │
          │                          ┌─────────▼──────────┐                   └─────────────────────┘
          └────────────────────────  │  Scorer + SQLite   │
                                     │  incidents, requests, resources,
                                     │  agent steps, reports, handovers
                                     └────────────────────┘
```

### Agent tools

| Tool | Purpose |
|---|---|
| `search_official_sources` | Find and read official advisory and relief pages |
| `open_resource_directory` | Navigate to a rescue, shelter or hospital listing |
| `extract_resource_details` | Pull location, capabilities, accessibility and contacts |
| `compare_resources` | Score and rank resources against the incident |
| `prepare_rescue_request` | Build the structured request |
| `fill_rescue_form` | Fill an external request or registration form |
| `track_request` | Check acknowledgement and status on the portal |
| `find_relief_schemes` | Search relief and assistance pages |

## Tech stack

| Layer | Technology | Role |
|---|---|---|
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS | UI, approval screen, dashboard |
| Backend | Next.js API routes, Node worker | Orchestration and agent control |
| Browser agent | Playwright (Chromium) | Navigation, extraction, form filling, screenshots |
| AI | Gemini API with JSON-schema output | Report-to-incident extraction and fallback page parsing |
| Matching | Deterministic rule-based scorer | Transparent resource ranking |
| Database | SQLite | Incidents, requests, resources, audit trail |
| Live updates | Server-Sent Events | Real-time agent activity stream |
| Portals | Bundled simulated portals under `/portals/*` | Safe targets for form filling and tracking |

## Resource matching

Matching is rule-based and fully explainable.

**Hard filters**

- The resource's capability must cover the needed resource type.
- If the incident includes people needing mobility assistance, shelters must be wheelchair accessible.

**Score (0-100)**

| Factor | Weight |
|---|---|
| Capability fit | 40 |
| Distance (haversine) | 30 |
| Accessibility fit | 15 |
| Verification level | 10 |
| Data freshness | 5 |

**Incident priority** is also rule-based: hazard exposure, mobility limitation, medical need, and presence of children or elderly people each add weighted points, scaled by headcount. The breakdown is always shown.

## Request lifecycle

| Status | Meaning | Set by |
|---|---|---|
| Reported | Incident captured and confirmed by the user | RESQNET |
| Matched | Suitable resources identified | RESQNET |
| Submitted | Request actually submitted to a portal (with a parsed confirmation) | RESQNET |
| Acknowledged | Portal confirmed receipt | Portal response |
| Verified | Details checked by an authorised coordinator | Coordinator |
| Resolved | Assistance confirmed as completed | Coordinator |

A failed submission is shown as **Submission failed** with the reason. RESQNET never shows "dispatched" or implies a rescue is on its way.

## Trust and safety

- A permanent banner directs users to **112 / local disaster helpline** first.
- The agent **never submits** without an explicit user approval.
- Every record is badged `OFFICIAL`, `USER-REPORTED` or `SIMULATED`, with an availability-confirmed flag and a last-checked time.
- The LLM only extracts structure from text. It does not rank resources, assign priority or claim availability.
- Medical data is stored locally, attached only with per-incident consent, and never scraped from third parties.
- MissingLink uses only public registry fields and never states that a person has been found; results are possible matches pending human verification.
- Real public pages are accessed read-only. Form submission only targets the bundled simulated portals.

## Getting started

### Prerequisites

- Node.js 18 or later
- A Gemini API key

### Installation

```bash
git clone https://github.com/<your-username>/resqnet.git
cd resqnet
npm install
npx playwright install chromium
cp .env.example .env
```

Add your API key to `.env`, then seed the database and start the app:

```bash
npm run seed
npm run dev
```

Open `http://localhost:3000`.

### Quick tour

1. Click **Use sample flood report**.
2. Review and confirm the extracted incident.
3. Watch the agent open sources and build the comparison table.
4. Review the pre-filled rescue request and click **Approve**.
5. Open `/portals/admin` and mark the request **Acknowledged**.
6. Watch the dashboard status update.
7. Try **Find a person** and the medical handover from the incident page.

## Configuration

| Variable | Description | Default |
|---|---|---|
| `GEMINI_API_KEY` | API key for incident extraction and fallback parsing | required |
| `HEADLESS` | Run the agent browser headless (`true`) or visible (`false`) | `false` |
| `REAL_ADVISORY_URL` | Optional public advisory page to read (read-only) | cached snapshot |
| `DATABASE_PATH` | SQLite file location | `./data/resqnet.db` |

## Project structure

```
resqnet/
├── app/                    # Next.js pages and API routes
│   ├── (ui)/               # report, confirm, agent run, approval, dashboard
│   ├── api/                # incidents, requests, SSE stream, MissingLink, handover
│   └── portals/            # simulated rescue, shelter, hospital, registry, admin portals
├── agent/                  # Playwright worker and tool functions
├── lib/
│   ├── scoring/            # rule-based matching and priority scoring
│   ├── extraction/         # LLM incident and page extraction
│   └── db/                 # schema, queries, seed data
├── data/                   # SQLite file and cached advisory snapshot
├── public/screenshots/     # agent step screenshots
└── README.md
```

## Limitations

- Bundled portals and records are simulated; no real rescue availability is implied.
- Intake is text-based in the current version.
- The agent depends on page structure; the LLM fallback and cached snapshots reduce but do not remove this fragility.
- Distance uses straight-line calculation, not road or flood-aware routing.
- This is not a substitute for emergency services.

## Roadmap

- Voice intake with real-time speech recognition and spoken read-back
- Cloud backend: managed auth, queues, notifications and a containerised browser worker
- Multilingual intake and responses for regional languages
- Flood-aware routing and live resource status feeds
- Fuller MissingLink and Medical Relay with formal consent and data-governance controls
- Adapters for additional portals and disaster types

## Contributing

Contributions are welcome. Please open an issue to discuss a change, keep new portal adapters isolated under `agent/`, and include tests for any scoring changes.

## License

Add a license of your choice (for example MIT) in a `LICENSE` file.
