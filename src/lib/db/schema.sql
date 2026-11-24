CREATE TABLE IF NOT EXISTS incidents (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  incident_type TEXT,
  people_count INTEGER,
  location_text TEXT,
  lat REAL,
  lng REAL,
  needs TEXT,
  mobility_assistance_count INTEGER DEFAULT 0,
  injuries_text TEXT,
  hazards TEXT,
  priority_score INTEGER DEFAULT 0,
  priority_breakdown TEXT,
  status TEXT DEFAULT 'Reported',
  medical_consent INTEGER DEFAULT 0,
  raw_text TEXT
);

CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  status TEXT DEFAULT 'Awaiting approval',
  portal_ref TEXT,
  source_url TEXT,
  resource_id TEXT,
  resource_name TEXT,
  resource_type TEXT,
  filled_form_screenshot TEXT,
  confirmation_text TEXT,
  FOREIGN KEY(incident_id) REFERENCES incidents(id)
);

CREATE TABLE IF NOT EXISTS resources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  lat REAL,
  lng REAL,
  capabilities TEXT,
  accessibility TEXT,
  capacity_text TEXT,
  source_type TEXT DEFAULT 'SIMULATED',
  confirmed INTEGER DEFAULT 0,
  last_checked TEXT,
  portal_url TEXT,
  phone TEXT,
  address TEXT
);

CREATE TABLE IF NOT EXISTS agent_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id TEXT,
  incident_id TEXT,
  tool TEXT,
  url TEXT,
  summary TEXT,
  screenshot_path TEXT,
  ts TEXT,
  badge TEXT DEFAULT 'SIMULATED'
);

CREATE TABLE IF NOT EXISTS missing_reports (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  name TEXT,
  approx_age INTEGER,
  last_seen_location TEXT,
  description TEXT,
  status TEXT DEFAULT 'Searching',
  matches TEXT
);

CREATE TABLE IF NOT EXISTS medical_profiles (
  id TEXT PRIMARY KEY,
  name TEXT,
  dob TEXT,
  blood_type TEXT,
  allergies TEXT,
  conditions TEXT,
  medications TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TEXT
);

CREATE TABLE IF NOT EXISTS handovers (
  id TEXT PRIMARY KEY,
  incident_id TEXT,
  profile_id TEXT,
  created_at TEXT,
  content_html TEXT,
  FOREIGN KEY(incident_id) REFERENCES incidents(id)
);
