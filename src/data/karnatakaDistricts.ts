/**
 * UrbanShield AI - Karnataka Districts Reference Data
 * Accurate coordinates and regional divisions for all 31 districts of Karnataka
 */

import type { KarnatakaDistrict } from '../types/incident';

export const KARNATAKA_STATE_CENTER: [number, number] = [15.1, 75.8];
export const KARNATAKA_STATE_ZOOM = 7;

export const KARNATAKA_DISTRICTS: KarnatakaDistrict[] = [
  // Bengaluru Division
  {
    id: 'bengaluru-urban',
    name: 'Bengaluru Urban',
    kannadaName: 'ಬೆಂಗಳೂರು ನಗರ',
    division: 'Bengaluru',
    center: [12.9716, 77.5946],
    zoomLevel: 12,
    vulnerabilityIndex: 84,
    headquarters: 'Bengaluru',
    keyRisks: ['Urban Flash Flooding', 'Pothole Density', 'Stormwater Siltation']
  },
  {
    id: 'bengaluru-rural',
    name: 'Bengaluru Rural',
    kannadaName: 'ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ',
    division: 'Bengaluru',
    center: [13.2257, 77.5753],
    zoomLevel: 11,
    vulnerabilityIndex: 58,
    headquarters: 'Doddaballapura',
    keyRisks: ['Groundwater Depletion', 'Industrial Encroachment']
  },
  {
    id: 'ramanagara',
    name: 'Ramanagara',
    kannadaName: 'ರಾಮನಗರ',
    division: 'Bengaluru',
    center: [12.7209, 77.2799],
    zoomLevel: 11,
    vulnerabilityIndex: 52,
    headquarters: 'Ramanagara',
    keyRisks: ['Expressway Flood Runoff', 'Quarry Road Damage']
  },
  {
    id: 'chikkaballapura',
    name: 'Chikkaballapura',
    kannadaName: 'ಚಿಕ್ಕಬಳ್ಳಾಪುರ',
    division: 'Bengaluru',
    center: [13.4325, 77.7275],
    zoomLevel: 11,
    vulnerabilityIndex: 65,
    headquarters: 'Chikkaballapura',
    keyRisks: ['Borewell Depletion', 'Arid Heatwave']
  },
  {
    id: 'kolar',
    name: 'Kolar',
    kannadaName: 'ಕೋಲಾರ',
    division: 'Bengaluru',
    center: [13.1367, 78.1291],
    zoomLevel: 11,
    vulnerabilityIndex: 72,
    headquarters: 'Kolar',
    keyRisks: ['Extreme Water Stress', 'Soil Desiccation']
  },
  {
    id: 'tumakuru',
    name: 'Tumakuru',
    kannadaName: 'ತುಮಕೂರು',
    division: 'Bengaluru',
    center: [13.3392, 77.1017],
    zoomLevel: 11,
    vulnerabilityIndex: 61,
    headquarters: 'Tumakuru',
    keyRisks: ['Highway Spill Hazards', 'Semi-Arid Drought']
  },
  {
    id: 'chitradurga',
    name: 'Chitradurga',
    kannadaName: 'ಚಿತ್ರದುರ್ಗ',
    division: 'Bengaluru',
    center: [14.2251, 76.3980],
    zoomLevel: 11,
    vulnerabilityIndex: 68,
    headquarters: 'Chitradurga',
    keyRisks: ['Windstorm Damage', 'Acute Water Deficit']
  },
  {
    id: 'davanagere',
    name: 'Davanagere',
    kannadaName: 'ದಾವಣಗೆರೆ',
    division: 'Bengaluru',
    center: [14.4644, 75.9218],
    zoomLevel: 11,
    vulnerabilityIndex: 59,
    headquarters: 'Davanagere',
    keyRisks: ['Tunga Canal Inundation', 'Textile Effluent']
  },
  {
    id: 'shivamogga',
    name: 'Shivamogga',
    kannadaName: 'ಶಿವಮೊಗ್ಗ',
    division: 'Bengaluru',
    center: [13.9299, 75.5681],
    zoomLevel: 11,
    vulnerabilityIndex: 74,
    headquarters: 'Shivamogga',
    keyRisks: ['Western Ghats Landslides', 'Tunga River Surge']
  },

  // Mysuru Division
  {
    id: 'mysuru',
    name: 'Mysuru',
    kannadaName: 'ಮೈಸೂರು',
    division: 'Mysuru',
    center: [12.2958, 76.6394],
    zoomLevel: 11,
    vulnerabilityIndex: 62,
    headquarters: 'Mysuru',
    keyRisks: ['Heritage Structure Decay', 'Kukkarahalli Lake Overflow']
  },
  {
    id: 'mandya',
    name: 'Mandya',
    kannadaName: 'ಮಂಡ್ಯ',
    division: 'Mysuru',
    center: [12.5240, 76.8967],
    zoomLevel: 11,
    vulnerabilityIndex: 55,
    headquarters: 'Mandya',
    keyRisks: ['KRS Canal Siltation', 'Sugar Effluent']
  },
  {
    id: 'hassan',
    name: 'Hassan',
    kannadaName: 'ಹಾಸನ',
    division: 'Mysuru',
    center: [13.0033, 76.1004],
    zoomLevel: 11,
    vulnerabilityIndex: 66,
    headquarters: 'Hassan',
    keyRisks: ['Shiradi Ghat Soil Slips', 'Heavy Monsoon Inundation']
  },
  {
    id: 'chamarajanagar',
    name: 'Chamarajanagar',
    kannadaName: 'ಚಾಮರಾಜನಗರ',
    division: 'Mysuru',
    center: [11.9261, 76.9437],
    zoomLevel: 11,
    vulnerabilityIndex: 54,
    headquarters: 'Chamarajanagar',
    keyRisks: ['Forest Margin Fire Risk', 'Dry Belt Water Stress']
  },
  {
    id: 'kodagu',
    name: 'Kodagu (Coorg)',
    kannadaName: 'ಕೊಡಗು',
    division: 'Mysuru',
    center: [12.4244, 75.7382],
    zoomLevel: 11,
    vulnerabilityIndex: 82,
    headquarters: 'Madikeri',
    keyRisks: ['Severe Landslides', 'Slope Failure', 'Flash Floods']
  },
  {
    id: 'dakshina-kannada',
    name: 'Dakshina Kannada (Mangaluru)',
    kannadaName: 'ದಕ್ಷಿಣ ಕನ್ನಡ',
    division: 'Mysuru',
    center: [12.9141, 74.8560],
    zoomLevel: 11,
    vulnerabilityIndex: 79,
    headquarters: 'Mangaluru',
    keyRisks: ['Coastal Sea Incursion', 'Netravati River Overflow', 'Culvert Choking']
  },
  {
    id: 'udupi',
    name: 'Udupi',
    kannadaName: 'ಉಡುಪಿ',
    division: 'Mysuru',
    center: [13.3409, 74.7421],
    zoomLevel: 11,
    vulnerabilityIndex: 76,
    headquarters: 'Udupi',
    keyRisks: ['Estuary Flooding', 'Coastal Road Erosion']
  },
  {
    id: 'chikkamagaluru',
    name: 'Chikkamagaluru',
    kannadaName: 'ಚಿಕ್ಕಮಗಳೂರು',
    division: 'Mysuru',
    center: [13.3161, 75.7720],
    zoomLevel: 11,
    vulnerabilityIndex: 71,
    headquarters: 'Chikkamagaluru',
    keyRisks: ['Charmadi Ghat Blockages', 'Mountain Slope Erosion']
  },

  // Belagavi Division
  {
    id: 'belagavi',
    name: 'Belagavi',
    kannadaName: 'ಬೆಳಗಾವಿ',
    division: 'Belagavi',
    center: [15.8497, 74.4977],
    zoomLevel: 11,
    vulnerabilityIndex: 75,
    headquarters: 'Belagavi',
    keyRisks: ['Krishna Basin Inundation', 'NH-48 Waterlogging']
  },
  {
    id: 'dharwad',
    name: 'Dharwad (Hubballi)',
    kannadaName: 'ಧಾರವಾಡ',
    division: 'Belagavi',
    center: [15.3647, 75.1240],
    zoomLevel: 11,
    vulnerabilityIndex: 69,
    headquarters: 'Dharwad',
    keyRisks: ['Bypass Junction Congestion', 'Nala Overflows', 'Asphalt Raveling']
  },
  {
    id: 'uttara-kannada',
    name: 'Uttara Kannada (Karwar)',
    kannadaName: 'ಉತ್ತರ ಕನ್ನಡ',
    division: 'Belagavi',
    center: [14.8135, 74.1298],
    zoomLevel: 10,
    vulnerabilityIndex: 78,
    headquarters: 'Karwar',
    keyRisks: ['Kali River Flood Swell', 'Anmod Ghat Slips']
  },
  {
    id: 'gadag',
    name: 'Gadag',
    kannadaName: 'ಗದಗ',
    division: 'Belagavi',
    center: [15.4167, 75.6333],
    zoomLevel: 11,
    vulnerabilityIndex: 57,
    headquarters: 'Gadag',
    keyRisks: ['Black Soil Subsidence', 'Windstorm Debris']
  },
  {
    id: 'haveri',
    name: 'Haveri',
    kannadaName: 'ಹಾವೇರಿ',
    division: 'Belagavi',
    center: [14.7954, 75.3991],
    zoomLevel: 11,
    vulnerabilityIndex: 56,
    headquarters: 'Haveri',
    keyRisks: ['Varada River Flash Rise', 'Bridge Approach Scour']
  },
  {
    id: 'vijayapura',
    name: 'Vijayapura (Bijapur)',
    kannadaName: 'ವಿಜಯಪುರ',
    division: 'Belagavi',
    center: [16.8302, 75.7100],
    zoomLevel: 11,
    vulnerabilityIndex: 67,
    headquarters: 'Vijayapura',
    keyRisks: ['Arid Thermal Anomaly', 'Krishna Backwater Swell']
  },
  {
    id: 'bagalkote',
    name: 'Bagalkote',
    kannadaName: 'ಬಾಗಲಕೋಟೆ',
    division: 'Belagavi',
    center: [16.1817, 75.6958],
    zoomLevel: 11,
    vulnerabilityIndex: 64,
    headquarters: 'Bagalkote',
    keyRisks: ['Almatti Submergence Zones', 'Old Town Drainage Choke']
  },

  // Kalaburagi Division
  {
    id: 'kalaburagi',
    name: 'Kalaburagi (Gulbarga)',
    kannadaName: 'ಕಲಬುರಗಿ',
    division: 'Kalaburagi',
    center: [17.3297, 76.8343],
    zoomLevel: 11,
    vulnerabilityIndex: 77,
    headquarters: 'Kalaburagi',
    keyRisks: ['Peak Heat Index (>44°C)', 'Bhima River Inundation']
  },
  {
    id: 'bidar',
    name: 'Bidar',
    kannadaName: 'ಬೀದರ್',
    division: 'Kalaburagi',
    center: [17.9104, 77.5199],
    zoomLevel: 11,
    vulnerabilityIndex: 63,
    headquarters: 'Bidar',
    keyRisks: ['Laterite Soil Collapse', 'Manjra River Siltation']
  },
  {
    id: 'raichur',
    name: 'Raichur',
    kannadaName: 'ರಾಯಚೂರು',
    division: 'Kalaburagi',
    center: [16.2120, 77.3439],
    zoomLevel: 11,
    vulnerabilityIndex: 73,
    headquarters: 'Raichur',
    keyRisks: ['Doab Thermal Stress', 'Thermal Plant Ash Discharge']
  },
  {
    id: 'koppal',
    name: 'Koppal',
    kannadaName: 'ಕೊಪ್ಪಳ',
    division: 'Kalaburagi',
    center: [15.3444, 76.1556],
    zoomLevel: 11,
    vulnerabilityIndex: 59,
    headquarters: 'Koppal',
    keyRisks: ['Tungabhadra Left Bank Breaches', 'Summer Drought']
  },
  {
    id: 'ballari',
    name: 'Ballari (Bellary)',
    kannadaName: 'ಬಳ್ಳಾರಿ',
    division: 'Kalaburagi',
    center: [15.1394, 76.9214],
    zoomLevel: 11,
    vulnerabilityIndex: 70,
    headquarters: 'Ballari',
    keyRisks: ['Mining Dust Pollution', 'Heat Islands', 'Road Pitting']
  },
  {
    id: 'vijayanagara',
    name: 'Vijayanagara (Hosapete)',
    kannadaName: 'ವಿಜಯನಗರ',
    division: 'Kalaburagi',
    center: [15.2689, 76.3909],
    zoomLevel: 11,
    vulnerabilityIndex: 60,
    headquarters: 'Hosapete',
    keyRisks: ['Dam Spillway Surges', 'Heavy Tourist Traffic Corridors']
  },
  {
    id: 'yadgir',
    name: 'Yadgir',
    kannadaName: 'ಯಾದಗಿರಿ',
    division: 'Kalaburagi',
    center: [16.7644, 77.1378],
    zoomLevel: 11,
    vulnerabilityIndex: 67,
    headquarters: 'Yadgir',
    keyRisks: ['High Fluoride Water Deficit', 'Heat Prostration']
  }
];

export function getDistrictById(id: string): KarnatakaDistrict | undefined {
  return KARNATAKA_DISTRICTS.find(d => d.id === id || d.name.toLowerCase() === id.toLowerCase());
}
