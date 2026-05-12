// Embedded sample dataset — works without a backend connection
export const SAMPLE_DATA = [
  {
    Site: "Ennore Plant (TN)",
    Latitude: 13.216,
    Longitude: 80.329,
    "Vendor Base": 0.95,
    "Manpower/Skill": 0.90,
    Capex: 450,
    "Govt Norms/Tax SOPs": "Standard",
    "Logistics Cost": 0.92,
    "Economies of Scale": 9,
    Risk: "Low",
  },
  {
    Site: "Hosur Hub (TN)",
    Latitude: 12.731,
    Longitude: 77.831,
    "Vendor Base": 0.90,
    "Manpower/Skill": 0.85,
    Capex: 520,
    "Govt Norms/Tax SOPs": "High-Tech Subsidy",
    "Logistics Cost": 0.88,
    "Economies of Scale": 8,
    Risk: "Low",
  },
  {
    Site: "Bhandara Estate (MH)",
    Latitude: 21.176,
    Longitude: 79.658,
    "Vendor Base": 0.70,
    "Manpower/Skill": 0.75,
    Capex: 380,
    "Govt Norms/Tax SOPs": "Basic SOP",
    "Logistics Cost": 0.85,
    "Economies of Scale": 6,
    Risk: "Medium",
  },
  {
    Site: "Alwar Unit (RJ)",
    Latitude: 27.553,
    Longitude: 76.634,
    "Vendor Base": 0.75,
    "Manpower/Skill": 0.80,
    Capex: 410,
    "Govt Norms/Tax SOPs": "Tax-Free Zone",
    "Logistics Cost": 0.75,
    "Economies of Scale": 7,
    Risk: "High",
  },
  {
    Site: "Pantnagar Hub (UK)",
    Latitude: 29.030,
    Longitude: 79.467,
    "Vendor Base": 0.80,
    "Manpower/Skill": 0.85,
    Capex: 600,
    "Govt Norms/Tax SOPs": "Extensive Incentives",
    "Logistics Cost": 0.78,
    "Economies of Scale": 8,
    Risk: "Low",
  },
];

export const SAMPLE_FEATURES = [
  "Vendor Base",
  "Manpower/Skill",
  "Capex",
  "Logistics Cost",
  "Economies of Scale",
];

export function loadSampleDataToStorage() {
  localStorage.setItem("dss_live_data", JSON.stringify(SAMPLE_DATA));
  localStorage.setItem("dss_live_features", JSON.stringify(SAMPLE_FEATURES));
}
