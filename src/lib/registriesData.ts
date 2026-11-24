export interface RegistryRecord {
  id: string;
  display_name: string;
  age_range: string;
  facility_name: string;
  last_seen_area: string;
}

export const SHELTER_REGISTRY_DATA: RegistryRecord[] = [
  { id: "sr1", display_name: "Raju Kumar", age_range: "30-40", facility_name: "City Relief Shelter A", last_seen_area: "Sector 5" },
  { id: "sr2", display_name: "Raja Singh", age_range: "35-45", facility_name: "School Emergency Camp", last_seen_area: "Block C" },
  { id: "sr3", display_name: "Rajesh Sharma", age_range: "40-50", facility_name: "Riverside Relief Point", last_seen_area: "River Road" },
  { id: "sr4", display_name: "Amit Patel", age_range: "25-35", facility_name: "City Relief Shelter A", last_seen_area: "Flooded Road" },
  { id: "sr5", display_name: "Amita Verma", age_range: "25-35", facility_name: "Elevated Ground Camp", last_seen_area: "North Zone" },
  { id: "sr6", display_name: "Priya Nair", age_range: "20-30", facility_name: "School Emergency Camp", last_seen_area: "Riverside" },
  { id: "sr7", display_name: "Priyanka Das", age_range: "22-32", facility_name: "City Relief Shelter A", last_seen_area: "India Gate" },
  { id: "sr8", display_name: "Suresh Yadav", age_range: "45-55", facility_name: "Riverside Relief Point", last_seen_area: "Civil Defence HQ" },
  { id: "sr9", display_name: "Suresh K. Joshi", age_range: "50-60", facility_name: "Elevated Ground Camp", last_seen_area: "North Zone" },
  { id: "sr10", display_name: "Deepak Mehta", age_range: "30-40", facility_name: "School Emergency Camp", last_seen_area: "Connaught Place" },
];

export const HOSPITAL_REGISTRY_DATA: RegistryRecord[] = [
  { id: "hr1", display_name: "Raju R. Sharma", age_range: "28-38", facility_name: "City General Hospital", last_seen_area: "Near Riverside" },
  { id: "hr2", display_name: "Raja Kumar", age_range: "33-43", facility_name: "District Community Clinic", last_seen_area: "Sector 5" },
  { id: "hr3", display_name: "Amit Kumar Patel", age_range: "24-34", facility_name: "City General Hospital", last_seen_area: "Flooded Area" },
  { id: "hr4", display_name: "Priya Sharma", age_range: "20-30", facility_name: "District Community Clinic", last_seen_area: "Block C" },
  { id: "hr5", display_name: "Suresh Verma", age_range: "45-55", facility_name: "City General Hospital", last_seen_area: "India Gate" },
  { id: "hr6", display_name: "Deepak Kumar", age_range: "30-42", facility_name: "City General Hospital", last_seen_area: "North Zone" },
  { id: "hr7", display_name: "Ramesh Joshi", age_range: "55-65", facility_name: "District Community Clinic", last_seen_area: "Civil Defence HQ" },
  { id: "hr8", display_name: "Sunita Das", age_range: "35-45", facility_name: "City General Hospital", last_seen_area: "Connaught Place" },
  { id: "hr9", display_name: "Mohit Yadav", age_range: "20-28", facility_name: "District Community Clinic", last_seen_area: "Riverside" },
  { id: "hr10", display_name: "Kavita Singh", age_range: "40-50", facility_name: "City General Hospital", last_seen_area: "Flooded Road" },
];
