import { getDb } from "./index";

export function seedDatabase() {
  const db = getDb();

  const countRow = db.prepare("SELECT COUNT(*) as c FROM resources").get() as { c: number } | undefined;
  if (countRow && countRow.c > 0) {
    return; // Already seeded
  }

  const insertResource = db.prepare(`
    INSERT OR IGNORE INTO resources (id, name, type, lat, lng, capabilities, accessibility, capacity_text, source_type, confirmed, last_checked, portal_url, phone, address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();

  // 1. Rescue Teams
  insertResource.run(
    "r1",
    "Rapid Flood Response Unit",
    "rescue",
    28.6139,
    77.2090,
    JSON.stringify(["water_rescue", "boat_rescue", "swift_water"]),
    JSON.stringify(["mobility_assistance", "stretcher"]),
    "Available (Boat units on standby)",
    "SIMULATED",
    1,
    now,
    "/portals/rescue",
    "1800-FLOOD-01",
    "NDRF Base, Delhi"
  );

  insertResource.run(
    "r2",
    "Metro Ambulance Service",
    "rescue",
    28.6200,
    77.2200,
    JSON.stringify(["medical", "ambulance", "first_aid"]),
    JSON.stringify(["wheelchair_accessible", "oxygen_equipped"]),
    "Available (4 Advanced Life Support Ambulances)",
    "SIMULATED",
    1,
    now,
    "/portals/rescue",
    "1800-MED-002",
    "City Hospital Annex"
  );

  insertResource.run(
    "r3",
    "General Rescue Team Alpha",
    "rescue",
    28.6300,
    77.1900,
    JSON.stringify(["transport", "evacuation", "search_rescue"]),
    JSON.stringify(["high_clearance_vehicle"]),
    "Available (High-water transport)",
    "SIMULATED",
    0,
    now,
    "/portals/rescue",
    "1800-RES-003",
    "Civil Defence HQ"
  );

  insertResource.run(
    "r4",
    "Community Boat Volunteers",
    "rescue",
    28.6050,
    77.2300,
    JSON.stringify(["water_rescue", "boat_rescue"]),
    JSON.stringify([]),
    "Partially Available (Volunteer dinghies)",
    "SIMULATED",
    0,
    now,
    "/portals/rescue",
    "1800-VOL-004",
    "Riverside Jetty"
  );

  // 2. Shelters
  insertResource.run(
    "s1",
    "City Relief Shelter A",
    "shelter",
    28.6180,
    77.2150,
    JSON.stringify(["shelter", "food_water", "medical"]),
    JSON.stringify(["wheelchair_accessible", "emergency_power", "beds"]),
    "Capacity: 200 (120 occupied, 80 available)",
    "SIMULATED",
    1,
    now,
    "/portals/shelters",
    "011-2338-0011",
    "Community Hall, Sector 5"
  );

  insertResource.run(
    "s2",
    "School Emergency Camp",
    "shelter",
    28.6400,
    77.2000,
    JSON.stringify(["shelter", "food_water"]),
    JSON.stringify(["emergency_power", "beds"]),
    "Capacity: 150 (50 occupied, 100 available) - Stairs only",
    "SIMULATED",
    1,
    now,
    "/portals/shelters",
    "011-2338-0022",
    "Govt Senior School, Block C"
  );

  insertResource.run(
    "s3",
    "Riverside Relief Point",
    "shelter",
    28.6100,
    77.2350,
    JSON.stringify(["shelter", "food_water", "transport"]),
    JSON.stringify(["wheelchair_accessible", "beds", "kitchen"]),
    "Capacity: 100 (30 occupied, 70 available)",
    "SIMULATED",
    0,
    now,
    "/portals/shelters",
    "011-2338-0033",
    "Youth Centre, River Road"
  );

  insertResource.run(
    "s4",
    "Elevated Ground Camp",
    "shelter",
    28.6500,
    77.1800,
    JSON.stringify(["shelter", "food_water"]),
    JSON.stringify(["basic_cots"]),
    "Capacity: 80 (10 occupied, 70 available) - No ramp",
    "SIMULATED",
    0,
    now,
    "/portals/shelters",
    "011-2338-0044",
    "High School Grounds, North Zone"
  );

  // 3. Hospitals
  insertResource.run(
    "h1",
    "City General Hospital",
    "hospital",
    28.6250,
    77.2100,
    JSON.stringify(["medical", "emergency", "surgery", "icu", "trauma"]),
    JSON.stringify(["wheelchair_accessible", "ambulance_bay", "24hr_triage"]),
    "24/7 Emergency & Trauma Center (15 ICU beds open)",
    "SIMULATED",
    1,
    now,
    "/portals/hospitals",
    "011-4000-0100",
    "10 Medical Drive, Central"
  );

  insertResource.run(
    "h2",
    "District Community Clinic",
    "hospital",
    28.6350,
    77.2250,
    JSON.stringify(["medical", "first_aid", "pharmacy"]),
    JSON.stringify(["wheelchair_accessible", "basic_lab"]),
    "Open 8:00 AM - 10:00 PM (Emergency First Aid)",
    "SIMULATED",
    0,
    now,
    "/portals/hospitals",
    "011-4000-0200",
    "45 Health Street, Sector 12"
  );

  // 4. Seed Medical Profile
  const profileCount = db.prepare("SELECT COUNT(*) as c FROM medical_profiles").get() as { c: number } | undefined;
  if (!profileCount || profileCount.c === 0) {
    db.prepare(`
      INSERT INTO medical_profiles (id, name, dob, blood_type, allergies, conditions, medications, emergency_contact_name, emergency_contact_phone, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      "mp1",
      "Demo Patient (Elderly Family Member)",
      "1950-05-12",
      "B+",
      "Penicillin, Sulfa drugs",
      "Type 2 Diabetes, Severe Osteoarthritis (cannot walk/non-ambulatory), Hypertension",
      "Insulin Glargine 20u qPM, Metformin 500mg, Lisinopril 10mg",
      "Suresh Sharma (Son)",
      "+91-98765-43210",
      now
    );
  }
}
