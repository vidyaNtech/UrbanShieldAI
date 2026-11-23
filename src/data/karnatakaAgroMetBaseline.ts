/**
 * UrbanShield AI - Karnataka Agro-Meteorological & Hydrogeological Baseline Data
 *
 * DATA PROVENANCE NOTICE
 * ─────────────────────────────────────────────────────────────────────────────
 * This file contains project-compiled reference values for all 31 Karnataka
 * districts. The values are drawn from published public-domain sources, but
 * individual district entries have NOT been independently re-verified against
 * the original source documents.
 *
 * Value categories used:
 *
 *  BASELINE — Project-compiled reference value sourced from the publications
 *             cited below. Treat as a reasonable approximation, not a certified
 *             observation.
 *
 *  ESTIMATED — Derived or interpolated; no direct source measurement.
 *
 * Primary reference sources (not all values are traceable to a specific table):
 *  • India Meteorological Department (IMD) — Climatological Normals 1991–2020
 *    for Karnataka districts (published district-level summaries).
 *  • Central Ground Water Board (CGWB) — "Dynamic Ground Water Resources of
 *    India" (various annual editions, Karnataka State section).
 *    cgwb.gov.in
 *  • Karnataka State Natural Disaster Monitoring Centre (KSNDMC) — District
 *    rainfall and temperature monitoring archives.
 *    ksndmc.org
 *
 * Limitations:
 *  • annualNormalRainfallMm: Representative 30-year normal. Actual inter-annual
 *    variability is high; individual years can deviate significantly.
 *  • cgwbAquiferStatus: Based on CGWB assessment year(s) available; aquifer
 *    status can change between assessment cycles.
 *  • typicalSoilMoistureRange: Project-estimated from soil texture and crop
 *    calendars; no direct sensor measurements are incorporated.
 *  • All values are district-level aggregates; sub-district spatial variability
 *    is not captured.
 */

export interface DistrictHistoricalBaseline {
  districtId: string;
  districtName: string;
  annualNormalRainfallMm: number;
  monsoonNormalRainfallMm: number; // June - Sept Southwest Monsoon
  postMonsoonNormalRainfallMm: number; // Oct - Dec Northeast / Retreating Monsoon
  elevationMeters: number;
  averageMaxTempSummer: number; // °C
  averageMinTempWinter: number; // °C
  averageAnnualTemp: number; // °C
  cgwbAquiferStatus: 'Safe' | 'Semi-Critical' | 'Critical' | 'Over-Exploited';
  historicalFloodVulnerability: 'Low' | 'Moderate' | 'High' | 'Severe';
  historicalDroughtVulnerability: 'Low' | 'Moderate' | 'High' | 'Severe';
  typicalSoilMoistureRange: [number, number]; // [min, max] m³/m³
  catchmentBasin: string;
}

export const KARNATAKA_AGROMET_BASELINE: Record<string, DistrictHistoricalBaseline> = {
  'bengaluru-urban': {
    districtId: 'bengaluru-urban',
    districtName: 'Bengaluru Urban',
    annualNormalRainfallMm: 986,
    monsoonNormalRainfallMm: 560,
    postMonsoonNormalRainfallMm: 245,
    elevationMeters: 920,
    averageMaxTempSummer: 34.2,
    averageMinTempWinter: 15.6,
    averageAnnualTemp: 23.8,
    cgwbAquiferStatus: 'Over-Exploited',
    historicalFloodVulnerability: 'High',
    historicalDroughtVulnerability: 'Moderate',
    typicalSoilMoistureRange: [0.18, 0.32],
    catchmentBasin: 'Arkavathi / Dakshina Pinakini'
  },
  'bengaluru-rural': {
    districtId: 'bengaluru-rural',
    districtName: 'Bengaluru Rural',
    annualNormalRainfallMm: 852,
    monsoonNormalRainfallMm: 480,
    postMonsoonNormalRainfallMm: 210,
    elevationMeters: 890,
    averageMaxTempSummer: 35.1,
    averageMinTempWinter: 15.2,
    averageAnnualTemp: 24.1,
    cgwbAquiferStatus: 'Over-Exploited',
    historicalFloodVulnerability: 'Moderate',
    historicalDroughtVulnerability: 'High',
    typicalSoilMoistureRange: [0.15, 0.28],
    catchmentBasin: 'Arkavathi'
  },
  'ramanagara': {
    districtId: 'ramanagara',
    districtName: 'Ramanagara',
    annualNormalRainfallMm: 835,
    monsoonNormalRainfallMm: 470,
    postMonsoonNormalRainfallMm: 215,
    elevationMeters: 747,
    averageMaxTempSummer: 36.0,
    averageMinTempWinter: 16.4,
    averageAnnualTemp: 24.8,
    cgwbAquiferStatus: 'Critical',
    historicalFloodVulnerability: 'High',
    historicalDroughtVulnerability: 'Moderate',
    typicalSoilMoistureRange: [0.16, 0.30],
    catchmentBasin: 'Shimsha / Arkavathi'
  },
  'kolar': {
    districtId: 'kolar',
    districtName: 'Kolar',
    annualNormalRainfallMm: 744,
    monsoonNormalRainfallMm: 410,
    postMonsoonNormalRainfallMm: 205,
    elevationMeters: 822,
    averageMaxTempSummer: 36.8,
    averageMinTempWinter: 14.8,
    averageAnnualTemp: 24.5,
    cgwbAquiferStatus: 'Over-Exploited',
    historicalFloodVulnerability: 'Low',
    historicalDroughtVulnerability: 'Severe',
    typicalSoilMoistureRange: [0.12, 0.22],
    catchmentBasin: 'Palar / Ponnaiyar'
  },
  'chikkaballapura': {
    districtId: 'chikkaballapura',
    districtName: 'Chikkaballapura',
    annualNormalRainfallMm: 760,
    monsoonNormalRainfallMm: 430,
    postMonsoonNormalRainfallMm: 198,
    elevationMeters: 915,
    averageMaxTempSummer: 36.2,
    averageMinTempWinter: 14.5,
    averageAnnualTemp: 24.2,
    cgwbAquiferStatus: 'Over-Exploited',
    historicalFloodVulnerability: 'Low',
    historicalDroughtVulnerability: 'Severe',
    typicalSoilMoistureRange: [0.13, 0.24],
    catchmentBasin: 'Uttara Pinakini'
  },
  'tumakuru': {
    districtId: 'tumakuru',
    districtName: 'Tumakuru',
    annualNormalRainfallMm: 712,
    monsoonNormalRainfallMm: 415,
    postMonsoonNormalRainfallMm: 175,
    elevationMeters: 822,
    averageMaxTempSummer: 37.4,
    averageMinTempWinter: 15.5,
    averageAnnualTemp: 25.1,
    cgwbAquiferStatus: 'Critical',
    historicalFloodVulnerability: 'Moderate',
    historicalDroughtVulnerability: 'High',
    typicalSoilMoistureRange: [0.14, 0.25],
    catchmentBasin: 'Jayamangali / Shimsha'
  },
  'chitradurga': {
    districtId: 'chitradurga',
    districtName: 'Chitradurga',
    annualNormalRainfallMm: 574,
    monsoonNormalRainfallMm: 335,
    postMonsoonNormalRainfallMm: 142,
    elevationMeters: 732,
    averageMaxTempSummer: 39.2,
    averageMinTempWinter: 16.2,
    averageAnnualTemp: 26.3,
    cgwbAquiferStatus: 'Over-Exploited',
    historicalFloodVulnerability: 'Low',
    historicalDroughtVulnerability: 'Severe',
    typicalSoilMoistureRange: [0.11, 0.20],
    catchmentBasin: 'Vedavathi'
  },
  'davanagere': {
    districtId: 'davanagere',
    districtName: 'Davanagere',
    annualNormalRainfallMm: 680,
    monsoonNormalRainfallMm: 430,
    postMonsoonNormalRainfallMm: 135,
    elevationMeters: 602,
    averageMaxTempSummer: 38.6,
    averageMinTempWinter: 16.8,
    averageAnnualTemp: 26.0,
    cgwbAquiferStatus: 'Semi-Critical',
    historicalFloodVulnerability: 'Moderate',
    historicalDroughtVulnerability: 'High',
    typicalSoilMoistureRange: [0.15, 0.27],
    catchmentBasin: 'Tungabhadra'
  },
  'shivamogga': {
    districtId: 'shivamogga',
    districtName: 'Shivamogga',
    annualNormalRainfallMm: 1813,
    monsoonNormalRainfallMm: 1450,
    postMonsoonNormalRainfallMm: 175,
    elevationMeters: 569,
    averageMaxTempSummer: 35.8,
    averageMinTempWinter: 15.0,
    averageAnnualTemp: 24.6,
    cgwbAquiferStatus: 'Safe',
    historicalFloodVulnerability: 'High',
    historicalDroughtVulnerability: 'Low',
    typicalSoilMoistureRange: [0.25, 0.42],
    catchmentBasin: 'Tunga / Bhadra'
  },
  'mysuru': {
    districtId: 'mysuru',
    districtName: 'Mysuru',
    annualNormalRainfallMm: 798,
    monsoonNormalRainfallMm: 460,
    postMonsoonNormalRainfallMm: 210,
    elevationMeters: 763,
    averageMaxTempSummer: 34.8,
    averageMinTempWinter: 16.5,
    averageAnnualTemp: 24.4,
    cgwbAquiferStatus: 'Semi-Critical',
    historicalFloodVulnerability: 'Moderate',
    historicalDroughtVulnerability: 'Moderate',
    typicalSoilMoistureRange: [0.18, 0.31],
    catchmentBasin: 'Cauvery / Kabini'
  },
  'mandya': {
    districtId: 'mandya',
    districtName: 'Mandya',
    annualNormalRainfallMm: 705,
    monsoonNormalRainfallMm: 410,
    postMonsoonNormalRainfallMm: 195,
    elevationMeters: 678,
    averageMaxTempSummer: 35.5,
    averageMinTempWinter: 16.2,
    averageAnnualTemp: 24.9,
    cgwbAquiferStatus: 'Semi-Critical',
    historicalFloodVulnerability: 'Moderate',
    historicalDroughtVulnerability: 'Moderate',
    typicalSoilMoistureRange: [0.17, 0.30],
    catchmentBasin: 'Cauvery / Lokapavani'
  },
  'hassan': {
    districtId: 'hassan',
    districtName: 'Hassan',
    annualNormalRainfallMm: 1045,
    monsoonNormalRainfallMm: 750,
    postMonsoonNormalRainfallMm: 170,
    elevationMeters: 957,
    averageMaxTempSummer: 33.5,
    averageMinTempWinter: 14.8,
    averageAnnualTemp: 23.2,
    cgwbAquiferStatus: 'Safe',
    historicalFloodVulnerability: 'Moderate',
    historicalDroughtVulnerability: 'Low',
    typicalSoilMoistureRange: [0.22, 0.36],
    catchmentBasin: 'Hemavathi'
  },
  'kodagu': {
    districtId: 'kodagu',
    districtName: 'Kodagu',
    annualNormalRainfallMm: 2718,
    monsoonNormalRainfallMm: 2280,
    postMonsoonNormalRainfallMm: 215,
    elevationMeters: 1150,
    averageMaxTempSummer: 31.0,
    averageMinTempWinter: 12.5,
    averageAnnualTemp: 21.4,
    cgwbAquiferStatus: 'Safe',
    historicalFloodVulnerability: 'Severe',
    historicalDroughtVulnerability: 'Low',
    typicalSoilMoistureRange: [0.30, 0.50],
    catchmentBasin: 'Upper Cauvery / Lakshmana Tirtha'
  },
  'chamarajanagara': {
    districtId: 'chamarajanagara',
    districtName: 'Chamarajanagara',
    annualNormalRainfallMm: 751,
    monsoonNormalRainfallMm: 410,
    postMonsoonNormalRainfallMm: 230,
    elevationMeters: 662,
    averageMaxTempSummer: 36.2,
    averageMinTempWinter: 16.0,
    averageAnnualTemp: 25.2,
    cgwbAquiferStatus: 'Critical',
    historicalFloodVulnerability: 'Low',
    historicalDroughtVulnerability: 'High',
    typicalSoilMoistureRange: [0.14, 0.26],
    catchmentBasin: 'Suvarnavathi'
  },
  'dakshina-kannada': {
    districtId: 'dakshina-kannada',
    districtName: 'Dakshina Kannada',
    annualNormalRainfallMm: 3912,
    monsoonNormalRainfallMm: 3390,
    postMonsoonNormalRainfallMm: 280,
    elevationMeters: 22,
    averageMaxTempSummer: 34.5,
    averageMinTempWinter: 21.0,
    averageAnnualTemp: 27.2,
    cgwbAquiferStatus: 'Safe',
    historicalFloodVulnerability: 'Severe',
    historicalDroughtVulnerability: 'Low',
    typicalSoilMoistureRange: [0.28, 0.48],
    catchmentBasin: 'Netravati / Gurupura'
  },
  'udupi': {
    districtId: 'udupi',
    districtName: 'Udupi',
    annualNormalRainfallMm: 4118,
    monsoonNormalRainfallMm: 3620,
    postMonsoonNormalRainfallMm: 260,
    elevationMeters: 15,
    averageMaxTempSummer: 34.0,
    averageMinTempWinter: 21.5,
    averageAnnualTemp: 27.0,
    cgwbAquiferStatus: 'Safe',
    historicalFloodVulnerability: 'Severe',
    historicalDroughtVulnerability: 'Low',
    typicalSoilMoistureRange: [0.28, 0.50],
    catchmentBasin: 'Swarna / Varahi'
  },
  'uttara-kannada': {
    districtId: 'uttara-kannada',
    districtName: 'Uttara Kannada',
    annualNormalRainfallMm: 2835,
    monsoonNormalRainfallMm: 2470,
    postMonsoonNormalRainfallMm: 180,
    elevationMeters: 18,
    averageMaxTempSummer: 34.0,
    averageMinTempWinter: 19.8,
    averageAnnualTemp: 26.5,
    cgwbAquiferStatus: 'Safe',
    historicalFloodVulnerability: 'Severe',
    historicalDroughtVulnerability: 'Low',
    typicalSoilMoistureRange: [0.26, 0.46],
    catchmentBasin: 'Sharavathi / Kali'
  },
  'belagavi': {
    districtId: 'belagavi',
    districtName: 'Belagavi',
    annualNormalRainfallMm: 808,
    monsoonNormalRainfallMm: 620,
    postMonsoonNormalRainfallMm: 110,
    elevationMeters: 762,
    averageMaxTempSummer: 36.5,
    averageMinTempWinter: 14.5,
    averageAnnualTemp: 24.5,
    cgwbAquiferStatus: 'Semi-Critical',
    historicalFloodVulnerability: 'Severe',
    historicalDroughtVulnerability: 'Moderate',
    typicalSoilMoistureRange: [0.18, 0.32],
    catchmentBasin: 'Krishna / Malaprabha'
  },
  'dharwad': {
    districtId: 'dharwad',
    districtName: 'Dharwad',
    annualNormalRainfallMm: 772,
    monsoonNormalRainfallMm: 520,
    postMonsoonNormalRainfallMm: 125,
    elevationMeters: 750,
    averageMaxTempSummer: 37.0,
    averageMinTempWinter: 15.5,
    averageAnnualTemp: 25.0,
    cgwbAquiferStatus: 'Semi-Critical',
    historicalFloodVulnerability: 'Moderate',
    historicalDroughtVulnerability: 'Moderate',
    typicalSoilMoistureRange: [0.17, 0.30],
    catchmentBasin: 'Malaprabha / Bennihalla'
  },
  'gadag': {
    districtId: 'gadag',
    districtName: 'Gadag',
    annualNormalRainfallMm: 612,
    monsoonNormalRainfallMm: 390,
    postMonsoonNormalRainfallMm: 120,
    elevationMeters: 654,
    averageMaxTempSummer: 39.5,
    averageMinTempWinter: 16.0,
    averageAnnualTemp: 26.2,
    cgwbAquiferStatus: 'Critical',
    historicalFloodVulnerability: 'Low',
    historicalDroughtVulnerability: 'Severe',
    typicalSoilMoistureRange: [0.13, 0.23],
    catchmentBasin: 'Tungabhadra / Malaprabha'
  },
  'haveri': {
    districtId: 'haveri',
    districtName: 'Haveri',
    annualNormalRainfallMm: 753,
    monsoonNormalRainfallMm: 510,
    postMonsoonNormalRainfallMm: 125,
    elevationMeters: 572,
    averageMaxTempSummer: 37.2,
    averageMinTempWinter: 16.0,
    averageAnnualTemp: 25.4,
    cgwbAquiferStatus: 'Semi-Critical',
    historicalFloodVulnerability: 'Moderate',
    historicalDroughtVulnerability: 'Moderate',
    typicalSoilMoistureRange: [0.16, 0.28],
    catchmentBasin: 'Varada / Tungabhadra'
  },
  'vijayanagara': {
    districtId: 'vijayanagara',
    districtName: 'Vijayanagara',
    annualNormalRainfallMm: 630,
    monsoonNormalRainfallMm: 410,
    postMonsoonNormalRainfallMm: 120,
    elevationMeters: 460,
    averageMaxTempSummer: 41.5,
    averageMinTempWinter: 17.5,
    averageAnnualTemp: 27.5,
    cgwbAquiferStatus: 'Critical',
    historicalFloodVulnerability: 'Moderate',
    historicalDroughtVulnerability: 'Severe',
    typicalSoilMoistureRange: [0.12, 0.22],
    catchmentBasin: 'Tungabhadra'
  },
  'ballari': {
    districtId: 'ballari',
    districtName: 'Ballari',
    annualNormalRainfallMm: 611,
    monsoonNormalRainfallMm: 395,
    postMonsoonNormalRainfallMm: 120,
    elevationMeters: 449,
    averageMaxTempSummer: 42.4,
    averageMinTempWinter: 17.8,
    averageAnnualTemp: 27.9,
    cgwbAquiferStatus: 'Critical',
    historicalFloodVulnerability: 'Low',
    historicalDroughtVulnerability: 'Severe',
    typicalSoilMoistureRange: [0.11, 0.21],
    catchmentBasin: 'Hagari / Vedavathi'
  },
  'bagalkote': {
    districtId: 'bagalkote',
    districtName: 'Bagalkote',
    annualNormalRainfallMm: 562,
    monsoonNormalRainfallMm: 370,
    postMonsoonNormalRainfallMm: 110,
    elevationMeters: 533,
    averageMaxTempSummer: 41.2,
    averageMinTempWinter: 16.5,
    averageAnnualTemp: 27.1,
    cgwbAquiferStatus: 'Over-Exploited',
    historicalFloodVulnerability: 'High',
    historicalDroughtVulnerability: 'Severe',
    typicalSoilMoistureRange: [0.12, 0.22],
    catchmentBasin: 'Ghataprabha / Krishna'
  },
  'vijayapura': {
    districtId: 'vijayapura',
    districtName: 'Vijayapura',
    annualNormalRainfallMm: 594,
    monsoonNormalRainfallMm: 405,
    postMonsoonNormalRainfallMm: 115,
    elevationMeters: 606,
    averageMaxTempSummer: 41.8,
    averageMinTempWinter: 15.8,
    averageAnnualTemp: 27.0,
    cgwbAquiferStatus: 'Over-Exploited',
    historicalFloodVulnerability: 'Moderate',
    historicalDroughtVulnerability: 'Severe',
    typicalSoilMoistureRange: [0.12, 0.21],
    catchmentBasin: 'Krishna / Doni River'
  },
  'kalaburagi': {
    districtId: 'kalaburagi',
    districtName: 'Kalaburagi',
    annualNormalRainfallMm: 750,
    monsoonNormalRainfallMm: 590,
    postMonsoonNormalRainfallMm: 95,
    elevationMeters: 454,
    averageMaxTempSummer: 43.8,
    averageMinTempWinter: 16.5,
    averageAnnualTemp: 27.8,
    cgwbAquiferStatus: 'Critical',
    historicalFloodVulnerability: 'High',
    historicalDroughtVulnerability: 'Severe',
    typicalSoilMoistureRange: [0.13, 0.24],
    catchmentBasin: 'Bhima / Bennithora'
  },
  'yadgir': {
    districtId: 'yadgir',
    districtName: 'Yadgir',
    annualNormalRainfallMm: 720,
    monsoonNormalRainfallMm: 560,
    postMonsoonNormalRainfallMm: 90,
    elevationMeters: 389,
    averageMaxTempSummer: 43.2,
    averageMinTempWinter: 17.2,
    averageAnnualTemp: 28.0,
    cgwbAquiferStatus: 'Semi-Critical',
    historicalFloodVulnerability: 'High',
    historicalDroughtVulnerability: 'Severe',
    typicalSoilMoistureRange: [0.12, 0.23],
    catchmentBasin: 'Krishna / Bhima'
  },
  'bidar': {
    districtId: 'bidar',
    districtName: 'Bidar',
    annualNormalRainfallMm: 847,
    monsoonNormalRainfallMm: 670,
    postMonsoonNormalRainfallMm: 85,
    elevationMeters: 615,
    averageMaxTempSummer: 42.0,
    averageMinTempWinter: 15.0,
    averageAnnualTemp: 26.8,
    cgwbAquiferStatus: 'Semi-Critical',
    historicalFloodVulnerability: 'Moderate',
    historicalDroughtVulnerability: 'Moderate',
    typicalSoilMoistureRange: [0.15, 0.28],
    catchmentBasin: 'Manjra / Godavari'
  },
  'raichur': {
    districtId: 'raichur',
    districtName: 'Raichur',
    annualNormalRainfallMm: 621,
    monsoonNormalRainfallMm: 450,
    postMonsoonNormalRainfallMm: 95,
    elevationMeters: 407,
    averageMaxTempSummer: 43.5,
    averageMinTempWinter: 17.5,
    averageAnnualTemp: 28.2,
    cgwbAquiferStatus: 'Critical',
    historicalFloodVulnerability: 'High',
    historicalDroughtVulnerability: 'Severe',
    typicalSoilMoistureRange: [0.12, 0.22],
    catchmentBasin: 'Krishna-Tungabhadra Doab'
  },
  'koppal': {
    districtId: 'koppal',
    districtName: 'Koppal',
    annualNormalRainfallMm: 572,
    monsoonNormalRainfallMm: 380,
    postMonsoonNormalRainfallMm: 110,
    elevationMeters: 530,
    averageMaxTempSummer: 41.5,
    averageMinTempWinter: 16.5,
    averageAnnualTemp: 27.2,
    cgwbAquiferStatus: 'Critical',
    historicalFloodVulnerability: 'Low',
    historicalDroughtVulnerability: 'Severe',
    typicalSoilMoistureRange: [0.12, 0.22],
    catchmentBasin: 'Tungabhadra'
  },
  'chikkamagaluru': {
    districtId: 'chikkamagaluru',
    districtName: 'Chikkamagaluru',
    annualNormalRainfallMm: 1925,
    monsoonNormalRainfallMm: 1560,
    postMonsoonNormalRainfallMm: 180,
    elevationMeters: 1090,
    averageMaxTempSummer: 32.5,
    averageMinTempWinter: 13.0,
    averageAnnualTemp: 22.1,
    cgwbAquiferStatus: 'Safe',
    historicalFloodVulnerability: 'High',
    historicalDroughtVulnerability: 'Low',
    typicalSoilMoistureRange: [0.26, 0.45],
    catchmentBasin: 'Bhadra / Hemavathi'
  }
};

/**
 * Get historical baseline for district or fallback default
 */
export function getDistrictBaseline(districtIdOrName: string): DistrictHistoricalBaseline {
  const normKey = districtIdOrName.toLowerCase().replace(/\s+/g, '-');
  if (KARNATAKA_AGROMET_BASELINE[normKey]) {
    return KARNATAKA_AGROMET_BASELINE[normKey];
  }
  
  // Search by districtName
  const match = Object.values(KARNATAKA_AGROMET_BASELINE).find(
    b => b.districtName.toLowerCase() === districtIdOrName.toLowerCase()
  );
  if (match) return match;

  // Fallback to central Karnataka average
  return {
    districtId: normKey,
    districtName: districtIdOrName,
    annualNormalRainfallMm: 850,
    monsoonNormalRainfallMm: 550,
    postMonsoonNormalRainfallMm: 160,
    elevationMeters: 650,
    averageMaxTempSummer: 37.0,
    averageMinTempWinter: 16.0,
    averageAnnualTemp: 25.5,
    cgwbAquiferStatus: 'Semi-Critical',
    historicalFloodVulnerability: 'Moderate',
    historicalDroughtVulnerability: 'Moderate',
    typicalSoilMoistureRange: [0.15, 0.30],
    catchmentBasin: 'Deccan Plateau'
  };
}

