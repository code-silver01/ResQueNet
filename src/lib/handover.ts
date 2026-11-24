export interface MedicalProfileData {
  id?: string;
  name: string;
  dob: string;
  blood_type: string;
  allergies: string;
  conditions: string;
  medications: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

export function generateHandoverHTML(profile: MedicalProfileData, incident: {
  id: string;
  incident_type?: string;
  people_count?: number;
  location_text?: string;
  injuries_text?: string;
  priority_score?: number;
}): string {
  const now = new Date().toLocaleString();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Emergency Medical Handover - RESQNET</title>
  <style>
    @media print {
      .no-print { display: none !important; }
      body { margin: 0; padding: 12mm; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      line-height: 1.5;
      padding: 24px;
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
    }
    .badge-simulated {
      display: inline-block;
      background-color: #f3e8ff;
      color: #6b21a8;
      border: 1px solid #d8b4fe;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 12px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .emergency-banner {
      background-color: #fef2f2;
      border: 2px solid #ef4444;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
      color: #991b1b;
      font-weight: 600;
      font-size: 14px;
    }
    .header {
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 16px;
      margin-bottom: 20px;
    }
    .header h1 {
      margin: 0 0 4px 0;
      font-size: 24px;
      color: #1e3a8a;
    }
    .header p {
      margin: 0;
      font-size: 13px;
      color: #6b7280;
    }
    .section {
      margin-bottom: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 16px;
      background: #fafafa;
    }
    .section-title {
      font-size: 15px;
      font-weight: 700;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 6px;
    }
    .critical-allergy {
      background-color: #fee2e2;
      border-left: 4px solid #dc2626;
      padding: 10px 14px;
      color: #991b1b;
      font-weight: 700;
      font-size: 15px;
      border-radius: 4px;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    .field label {
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      color: #6b7280;
      font-weight: 600;
    }
    .field span {
      font-size: 14px;
      font-weight: 500;
      color: #111827;
    }
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px dashed #d1d5db;
      font-size: 11px;
      color: #9ca3af;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="badge-simulated">SIMULATED DATA — TRAINING / DEMONSTRATION USE ONLY</div>
  <div class="emergency-banner">
    🚨 EMERGENCY MEDICAL RELAY DOCUMENT — CALL 112 FIRST. Hand over this copy directly to paramedics or triage staff.
  </div>

  <div class="header">
    <h1>EMERGENCY MEDICAL HANDOVER REPORT</h1>
    <p>Generated: ${now} | Incident Reference: <strong>${incident.id}</strong> | Priority Score: <strong>${incident.priority_score || 10}/15</strong></p>
  </div>

  <div class="section">
    <div class="section-title">Critical Safety & Allergies</div>
    <div class="critical-allergy">
      ⚠️ KNOWN ALLERGIES: ${profile.allergies || "None reported"}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Patient Identification</div>
    <div class="grid">
      <div class="field">
        <label>Full Name</label>
        <span>${profile.name}</span>
      </div>
      <div class="field">
        <label>Date of Birth</label>
        <span>${profile.dob}</span>
      </div>
      <div class="field">
        <label>Blood Type</label>
        <span><strong>${profile.blood_type}</strong></span>
      </div>
      <div class="field">
        <label>Emergency Contact</label>
        <span>${profile.emergency_contact_name} (${profile.emergency_contact_phone})</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Chronic Conditions & Baseline Status</div>
    <p style="margin: 0; font-size: 14px;"><strong>Conditions:</strong> ${profile.conditions || "None reported"}</p>
    <p style="margin: 8px 0 0 0; font-size: 14px;"><strong>Active Medications:</strong> ${profile.medications || "None reported"}</p>
  </div>

  <div class="section">
    <div class="section-title">Disaster Field Intake Context</div>
    <div class="grid">
      <div class="field">
        <label>Incident Type</label>
        <span style="text-transform: capitalize;">${incident.incident_type || "Flood Disaster"}</span>
      </div>
      <div class="field">
        <label>Party Headcount</label>
        <span>${incident.people_count || 1} Persons</span>
      </div>
      <div class="field" style="grid-column: span 2;">
        <label>Stranded Location</label>
        <span>${incident.location_text || "Near Flooded Road"}</span>
      </div>
      <div class="field" style="grid-column: span 2;">
        <label>Field Injuries / Immediate Symptoms</label>
        <span>${incident.injuries_text || "Elderly individual non-ambulatory; requires stretcher and medical check."}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    RESQNET Supervised Browser-Agent Protocol • All records marked SIMULATED • Does not replace official 112 dispatch
  </div>
</body>
</html>`;
}
