/**
 * UrbanShield AI - Demonstration Incident Dataset
 * Karnataka Urban Risk Intelligence and Citizen Response Platform
 * 
 * NOTICE:
 * This dataset consists of geographically accurate prototype simulation records
 * across Karnataka's districts. In production, this data feeds from verified citizen submissions,
 * IoT stormwater sensors, CCTV computer vision, and KDMA emergency dispatch streams.
 */

import type { UrbanIncident } from '../types/incident';

export const MOCK_INCIDENTS: UrbanIncident[] = [
  // ==========================================
  // BENGALURU URBAN
  // ==========================================
  {
    id: 'KA-BLR-2026-0101',
    title: 'Severe Silk Board Junction Underpass Inundation',
    category: 'flooding_waterlogging',
    severity: 'critical',
    status: 'assigned',
    latitude: 12.9176,
    longitude: 77.6234,
    district: 'Bengaluru Urban',
    cityOrTown: 'Bengaluru',
    area: 'Central Silk Board',
    landmark: 'Hosur Road Junction towards BTM',
    description: '3.5ft stormwater accumulation blocking southbound expressway lanes. Pumping machinery requested by traffic police.',
    reportedAt: '2026-10-28T08:15:00+05:30',
    updatedAt: '2026-10-28T10:30:00+05:30',
    reportCount: 42,
    dataSource: 'BBMP Stormwater Telemetry & Citizen Sensor',
    verificationStatus: 'verified',
    assignedUnit: 'BBMP Disaster Quick Response Team Unit-4'
  },
  {
    id: 'KA-BLR-2026-0102',
    title: 'Deep Multi-Crater Pothole Cluster on Outer Ring Road',
    category: 'potholes',
    severity: 'high',
    status: 'prioritized',
    latitude: 12.9298,
    longitude: 77.6841,
    district: 'Bengaluru Urban',
    cityOrTown: 'Bengaluru',
    area: 'Bellandur EcoSpace',
    landmark: 'Opposite Pritech Park Gate 2',
    description: 'Repeated two-wheeler skid hazards following overnight rain. Sub-base aggregate exposed across 15 meters.',
    reportedAt: '2026-10-28T07:45:00+05:30',
    updatedAt: '2026-10-28T09:10:00+05:30',
    reportCount: 29,
    dataSource: 'Citizen Mobile App Telemetry',
    verificationStatus: 'citizen_confirmed',
    assignedUnit: 'Mahadevapura Road Maintenance Cell'
  },
  {
    id: 'KA-BLR-2026-0103',
    title: 'Primary Rajakaluve Blocked with Industrial Silt & Debris',
    category: 'blocked_drainage',
    severity: 'critical',
    status: 'under_service',
    latitude: 12.9421,
    longitude: 77.6987,
    district: 'Bengaluru Urban',
    cityOrTown: 'Bengaluru',
    area: 'Marathahalli',
    landmark: 'Kalamandir Stormwater Drain Culvert',
    description: 'Excavator deployed to clear plastic choking and structural silt impeding secondary flow into Varthur lake basin.',
    reportedAt: '2026-10-27T16:20:00+05:30',
    updatedAt: '2026-10-28T09:45:00+05:30',
    reportCount: 18,
    dataSource: 'Automated Acoustic Silt Sensor #KA-SWD-90',
    verificationStatus: 'field_audited',
    assignedUnit: 'KDMA Hydraulic Field Division'
  },
  {
    id: 'KA-BLR-2026-0104',
    title: 'Peenya Industrial Flyover Expansion Joint Fissure',
    category: 'infrastructure_damage',
    severity: 'critical',
    status: 'verified',
    latitude: 13.0315,
    longitude: 77.5186,
    district: 'Bengaluru Urban',
    cityOrTown: 'Bengaluru',
    area: 'Peenya 1st Stage',
    landmark: 'Pier 104 Near Metro Station',
    description: 'Vibration anomaly detected during heavy multi-axle freight transit. Preliminary thermal scan confirms 14mm joint displacement.',
    reportedAt: '2026-10-28T06:10:00+05:30',
    updatedAt: '2026-10-28T08:00:00+05:30',
    reportCount: 14,
    dataSource: 'Structural IoT Accelerometer Array',
    verificationStatus: 'verified',
    assignedUnit: 'NHAI & Karnataka PWD Bridge Wing'
  },
  {
    id: 'KA-BLR-2026-0105',
    title: 'Illegal Solid Waste Dumping Black Spot Near K.R. Market',
    category: 'waste_accumulation',
    severity: 'moderate',
    status: 'reported',
    latitude: 12.9654,
    longitude: 77.5768,
    district: 'Bengaluru Urban',
    cityOrTown: 'Bengaluru',
    area: 'K.R. Market',
    landmark: 'Behind Kalasipalya Bus Stand',
    description: 'Over 4 tonnes of organic vegetable compost and plastic sacks overflowing into pedestrian corridor.',
    reportedAt: '2026-10-28T09:05:00+05:30',
    updatedAt: '2026-10-28T09:05:00+05:30',
    reportCount: 8,
    dataSource: 'Citizen Response Portal',
    verificationStatus: 'unverified'
  },
  {
    id: 'KA-BLR-2026-0106',
    title: 'Bellandur Lake Boundary Chemical Foam Surge',
    category: 'environmental_risks',
    severity: 'high',
    status: 'assigned',
    latitude: 12.9360,
    longitude: 77.6620,
    district: 'Bengaluru Urban',
    cityOrTown: 'Bengaluru',
    area: 'Yemalur Boundary',
    landmark: 'Yemalur Bridge Overflow Weir',
    description: 'Wind-driven toxic surfactant froth spilling onto connecting village road. Odor intensity index elevated.',
    reportedAt: '2026-10-28T07:20:00+05:30',
    updatedAt: '2026-10-28T08:50:00+05:30',
    reportCount: 22,
    dataSource: 'KSPCB Water Monitoring Node',
    verificationStatus: 'verified',
    assignedUnit: 'Karnataka State Pollution Control Board Rapid Cell'
  },
  {
    id: 'KA-BLR-2026-0107',
    title: 'Koramangala 80ft Road Stormwater Grate Replaced',
    category: 'blocked_drainage',
    severity: 'moderate',
    status: 'resolved',
    latitude: 12.9344,
    longitude: 77.6190,
    district: 'Bengaluru Urban',
    cityOrTown: 'Bengaluru',
    area: 'Koramangala 4th Block',
    landmark: 'Near Maharaja Signal',
    description: 'Choked grating removed, desilted, and replaced with high-flow ductile iron grate. Verified flow restored.',
    reportedAt: '2026-10-26T11:00:00+05:30',
    updatedAt: '2026-10-28T07:30:00+05:30',
    resolvedAt: '2026-10-28T07:30:00+05:30',
    reportCount: 16,
    dataSource: 'BBMP Ward Field Unit',
    verificationStatus: 'field_audited',
    resolutionNotes: 'Civil works signed off by Ward Assistant Executive Engineer.'
  },

  // ==========================================
  // DAKSHINA KANNADA (MANGALURU)
  // ==========================================
  {
    id: 'KA-DKN-2026-0201',
    title: 'Netravati River Overflow at Jeppinamogaru Low Corridor',
    category: 'flooding_waterlogging',
    severity: 'critical',
    status: 'prioritized',
    latitude: 12.8450,
    longitude: 74.8620,
    district: 'Dakshina Kannada (Mangaluru)',
    cityOrTown: 'Mangaluru',
    area: 'Jeppinamogaru',
    landmark: 'Old Bridge Approach Ramp',
    description: 'High tide combined with Western Ghats monsoon discharge causing tidal backflow into residential basements.',
    reportedAt: '2026-10-28T05:30:00+05:30',
    updatedAt: '2026-10-28T08:40:00+05:30',
    reportCount: 36,
    dataSource: 'Coastal Telemetry & River Gauge Alert',
    verificationStatus: 'verified',
    assignedUnit: 'Mangaluru City Corporation Emergency Rescue Group'
  },
  {
    id: 'KA-DKN-2026-0202',
    title: 'Severe Culvert Choke Causing Pumpwell Flyover Waterlogging',
    category: 'blocked_drainage',
    severity: 'high',
    status: 'under_service',
    latitude: 12.8681,
    longitude: 74.8610,
    district: 'Dakshina Kannada (Mangaluru)',
    cityOrTown: 'Mangaluru',
    area: 'Pumpwell Circle',
    landmark: 'NH-66 Junction',
    description: 'Intermittent water stagnation up to 2 feet on coastal highway lane. Sandbags deployed.',
    reportedAt: '2026-10-28T06:40:00+05:30',
    updatedAt: '2026-10-28T09:15:00+05:30',
    reportCount: 19,
    dataSource: 'Traffic CCTV Flow Analytics',
    verificationStatus: 'verified',
    assignedUnit: 'MCC Drainage Maintenance Wing'
  },
  {
    id: 'KA-DKN-2026-0203',
    title: 'Kottara Chowki Drainage Clearing Completed',
    category: 'blocked_drainage',
    severity: 'moderate',
    status: 'resolved',
    latitude: 12.8980,
    longitude: 74.8360,
    district: 'Dakshina Kannada (Mangaluru)',
    cityOrTown: 'Mangaluru',
    area: 'Kottara Chowki',
    landmark: 'Underpass Drain Canal',
    description: 'Complete removal of sand bars and tree debris. Stormwater now drains unobstructed into Gurupura river.',
    reportedAt: '2026-10-27T09:00:00+05:30',
    updatedAt: '2026-10-28T08:15:00+05:30',
    resolvedAt: '2026-10-28T08:15:00+05:30',
    reportCount: 12,
    dataSource: 'Citizen Feedback Verification',
    verificationStatus: 'citizen_confirmed',
    resolutionNotes: 'Local trade association verified zero stagnation after 40mm downpour.'
  },

  // ==========================================
  // DHARWAD (HUBBALLI)
  // ==========================================
  {
    id: 'KA-DHD-2026-0301',
    title: 'Chronic Waterlogging on Hubballi-Dharwad BRTS Corridor',
    category: 'flooding_waterlogging',
    severity: 'high',
    status: 'assigned',
    latitude: 15.3850,
    longitude: 75.1050,
    district: 'Dharwad (Hubballi)',
    cityOrTown: 'Hubballi',
    area: 'Unkal Lake Bypass',
    landmark: 'Opposite BVB College Road',
    description: 'Stormwater overflow across segregated BRTS bus lanes causing transit halting. Desilting crew dispatched.',
    reportedAt: '2026-10-28T07:15:00+05:30',
    updatedAt: '2026-10-28T09:30:00+05:30',
    reportCount: 24,
    dataSource: 'HDBRTS Telemetry & Citizen Mobile',
    verificationStatus: 'verified',
    assignedUnit: 'HDMC Zone 3 Rapid Works'
  },
  {
    id: 'KA-DHD-2026-0302',
    title: 'Gabbur Toll Bypass Asphalt Road Cave-in',
    category: 'road_damage',
    severity: 'critical',
    status: 'under_verification',
    latitude: 15.3210,
    longitude: 75.1680,
    district: 'Dharwad (Hubballi)',
    cityOrTown: 'Hubballi',
    area: 'Gabbur',
    landmark: 'NH-48 Bengaluru Highway Split',
    description: '1.2m diameter road subsidence in outer lane. Barricades placed; structural geotech audit requested.',
    reportedAt: '2026-10-28T08:50:00+05:30',
    updatedAt: '2026-10-28T09:20:00+05:30',
    reportCount: 15,
    dataSource: 'Highway Patrol Radiotelemetry',
    verificationStatus: 'unverified'
  },

  // ==========================================
  // BELAGAVI
  // ==========================================
  {
    id: 'KA-BGM-2026-0401',
    title: 'Krishna River Tributary Backwater Threat in Chikkodi Lowland',
    category: 'flooding_waterlogging',
    severity: 'critical',
    status: 'prioritized',
    latitude: 16.4320,
    longitude: 74.5980,
    district: 'Belagavi',
    cityOrTown: 'Chikkodi',
    area: 'Dudhganga River Basin',
    landmark: 'Malikwad Barrage Bridge',
    description: 'Water level within 0.8m of danger mark following dam release in upstream Maharashtra. Evacuation alert advisory triggered.',
    reportedAt: '2026-10-28T04:15:00+05:30',
    updatedAt: '2026-10-28T08:00:00+05:30',
    reportCount: 51,
    dataSource: 'KDMA River Hydrology Radar',
    verificationStatus: 'field_audited',
    assignedUnit: 'Belagavi District Disaster Cell & SDRF Team'
  },
  {
    id: 'KA-BGM-2026-0402',
    title: 'Cantonment Road Monsoon Pothole Strip Repaired',
    category: 'potholes',
    severity: 'low',
    status: 'resolved',
    latitude: 15.8520,
    longitude: 74.5080,
    district: 'Belagavi',
    cityOrTown: 'Belagavi',
    area: 'Camp Area',
    landmark: 'Near Military Hospital Road',
    description: 'Cold-mix asphalt application completed on 8 consecutive potholes. Surface leveled and opened for traffic.',
    reportedAt: '2026-10-26T14:00:00+05:30',
    updatedAt: '2026-10-28T06:00:00+05:30',
    resolvedAt: '2026-10-28T06:00:00+05:30',
    reportCount: 7,
    dataSource: 'Belagavi City Corporation Works',
    verificationStatus: 'field_audited'
  },

  // ==========================================
  // KALABURAGI
  // ==========================================
  {
    id: 'KA-KLB-2026-0501',
    title: 'Severe Urban Heat Island & Water Distribution Deficit',
    category: 'extreme_heat',
    severity: 'critical',
    status: 'assigned',
    latitude: 17.3410,
    longitude: 76.8220,
    district: 'Kalaburagi (Gulbarga)',
    cityOrTown: 'Kalaburagi',
    area: 'MSK Mill Compound',
    landmark: 'Ward 22 Community Tank Hub',
    description: 'Surface temperature anomaly exceeding 43.8°C with concurrent failure of community borewell pump. Emergency tankers dispatched.',
    reportedAt: '2026-10-28T09:30:00+05:30',
    updatedAt: '2026-10-28T10:15:00+05:30',
    reportCount: 31,
    dataSource: 'Karnataka State Heat & Aquifer Monitoring Network',
    verificationStatus: 'verified',
    assignedUnit: 'Kalaburagi City Corporation Water Crisis Wing'
  },
  {
    id: 'KA-KLB-2026-0502',
    title: 'Ganj Area Open Drain Clogged with Plastic Waste',
    category: 'waste_accumulation',
    severity: 'moderate',
    status: 'reported',
    latitude: 17.3180,
    longitude: 76.8450,
    district: 'Kalaburagi (Gulbarga)',
    cityOrTown: 'Kalaburagi',
    area: 'Ganj Road',
    landmark: 'Near Grain Market Gate 3',
    description: 'Grain packaging waste blocking open masonry drain. Fly breeding and stench reported by merchants.',
    reportedAt: '2026-10-28T08:20:00+05:30',
    updatedAt: '2026-10-28T08:20:00+05:30',
    reportCount: 9,
    dataSource: 'Citizen Web Portal',
    verificationStatus: 'unverified'
  },

  // ==========================================
  // MYSURU
  // ==========================================
  {
    id: 'KA-MYS-2026-0601',
    title: 'Kukkarahalli Lake Surrounding Silt Damaged Retention Masonry',
    category: 'infrastructure_damage',
    severity: 'high',
    status: 'under_verification',
    latitude: 12.3080,
    longitude: 76.6320,
    district: 'Mysuru',
    cityOrTown: 'Mysuru',
    area: 'Kukkarahalli Lake Park',
    landmark: 'Western Jogging Track Bund',
    description: 'Partial breach in stone embankment following lake overflow. Erosion of pedestrian pathway.',
    reportedAt: '2026-10-28T07:00:00+05:30',
    updatedAt: '2026-10-28T08:30:00+05:30',
    reportCount: 17,
    dataSource: 'Mysuru Environmental Watch & Citizen App',
    verificationStatus: 'unverified'
  },
  {
    id: 'KA-MYS-2026-0602',
    title: 'Sayyaji Rao Road Road Surface Raveling',
    category: 'road_damage',
    severity: 'low',
    status: 'reopened',
    latitude: 12.3160,
    longitude: 76.6530,
    district: 'Mysuru',
    cityOrTown: 'Mysuru',
    area: 'Devaraja Mohalla',
    landmark: 'Near K.R. Hospital Circle',
    description: 'Previously patched trench by utility service sunken by 4 inches. Reopened after renewed citizen reports.',
    reportedAt: '2026-10-27T18:00:00+05:30',
    updatedAt: '2026-10-28T09:00:00+05:30',
    reportCount: 11,
    dataSource: 'Citizen Mobile App Telemetry',
    verificationStatus: 'verified'
  },
  {
    id: 'KA-MYS-2026-0603',
    title: 'Chamundi Hill Road Landslide Debris Cleared',
    category: 'infrastructure_damage',
    severity: 'high',
    status: 'resolved',
    latitude: 12.2850,
    longitude: 76.6710,
    district: 'Mysuru',
    cityOrTown: 'Mysuru',
    area: 'Chamundi Foothills',
    landmark: 'Viewpoint Turn 4',
    description: 'Fallen rock boulders and loose soil removed. Wire mesh protection wall inspected and certified secure.',
    reportedAt: '2026-10-25T15:30:00+05:30',
    updatedAt: '2026-10-27T17:00:00+05:30',
    resolvedAt: '2026-10-27T17:00:00+05:30',
    reportCount: 28,
    dataSource: 'Mysuru District Administration',
    verificationStatus: 'field_audited',
    resolutionNotes: 'PWD Highway division completed slope stabilization.'
  },

  // ==========================================
  // KODAGU (COORG)
  // ==========================================
  {
    id: 'KA-KDG-2026-0701',
    title: 'Shiradi / Madikeri Ghat Soil Liquefaction Warning',
    category: 'environmental_risks',
    severity: 'critical',
    status: 'assigned',
    latitude: 12.4350,
    longitude: 75.7280,
    district: 'Kodagu (Coorg)',
    cityOrTown: 'Madikeri',
    area: 'Jodupala Slope',
    landmark: 'Mangaluru-Madikeri Highway Km 42',
    description: 'Geotechnical moisture probe indicates saturated soil mantle. Creep displacement of 6cm recorded in last 12 hours.',
    reportedAt: '2026-10-28T06:00:00+05:30',
    updatedAt: '2026-10-28T09:10:00+05:30',
    reportCount: 38,
    dataSource: 'Geological Survey IoT Inclinometer',
    verificationStatus: 'verified',
    assignedUnit: 'Kodagu District Quick Response Force'
  },

  // ==========================================
  // KOLAR
  // ==========================================
  {
    id: 'KA-KLR-2026-0801',
    title: 'Acute Groundwater Depletion & Agricultural Tanker Drought',
    category: 'water_stress',
    severity: 'critical',
    status: 'prioritized',
    latitude: 13.1420,
    longitude: 78.1340,
    district: 'Kolar',
    cityOrTown: 'Kolar',
    area: 'Bangarapet Road Belt',
    landmark: 'KGF Cross Sub-basin',
    description: 'Aquifer depth dropped below 1450ft in 8 consecutive monitoring wells. High mineral turbidity in active pipes.',
    reportedAt: '2026-10-28T07:30:00+05:30',
    updatedAt: '2026-10-28T10:00:00+05:30',
    reportCount: 27,
    dataSource: 'Central Ground Water Board Telemetry',
    verificationStatus: 'verified',
    assignedUnit: 'Kolar Rural Water Supply Taskforce'
  },

  // ==========================================
  // BALLARI
  // ==========================================
  {
    id: 'KA-BLI-2026-0901',
    title: 'Heavy Ore Truck Spillage & Mining Dust Air Surge (AQI 320)',
    category: 'environmental_risks',
    severity: 'high',
    status: 'verified',
    latitude: 15.1520,
    longitude: 76.9140,
    district: 'Ballari (Bellary)',
    cityOrTown: 'Ballari',
    area: 'Toranagallu Industrial Corridor',
    landmark: 'Jindal Steel Bypass Flyover',
    description: 'Fine particulate matter PM2.5 spike to 320 ug/m3. Iron ore dust settling across school zone.',
    reportedAt: '2026-10-28T08:00:00+05:30',
    updatedAt: '2026-10-28T09:15:00+05:30',
    reportCount: 19,
    dataSource: 'Ambient Air Quality Telemetry Station #BLI-02',
    verificationStatus: 'verified',
    assignedUnit: 'KSPCB Regional Inspectorate'
  },

  // ==========================================
  // UDUPI
  // ==========================================
  {
    id: 'KA-UDP-2026-1001',
    title: 'Swarna River High Level Backing into Gundibail Lowland',
    category: 'flooding_waterlogging',
    severity: 'high',
    status: 'under_service',
    latitude: 13.3480,
    longitude: 74.7550,
    district: 'Udupi',
    cityOrTown: 'Udupi',
    area: 'Gundibail',
    landmark: 'Baje Dam Backwater Zone',
    description: 'Water entering municipal road and cutting off connectivity to 120 houses. High-capacity dewatering pumps operational.',
    reportedAt: '2026-10-28T05:50:00+05:30',
    updatedAt: '2026-10-28T08:45:00+05:30',
    reportCount: 23,
    dataSource: 'Udupi Municipal Disaster Cell',
    verificationStatus: 'field_audited',
    assignedUnit: 'Udupi Fire and Emergency Response Unit'
  },

  // ==========================================
  // SHIVAMOGGA
  // ==========================================
  {
    id: 'KA-SHV-2026-1101',
    title: 'Tunga River Embankment Stone Bund Scour Near Mandli',
    category: 'infrastructure_damage',
    severity: 'high',
    status: 'assigned',
    latitude: 13.9120,
    longitude: 75.5820,
    district: 'Shivamogga',
    cityOrTown: 'Shivamogga',
    area: 'Mandli',
    landmark: 'Riverbank Ghat Road',
    description: 'High discharge from Gajanur Dam causing toe erosion along 45m of floodwall. Geo-textile riprap required.',
    reportedAt: '2026-10-28T06:30:00+05:30',
    updatedAt: '2026-10-28T09:40:00+05:30',
    reportCount: 16,
    dataSource: 'Water Resources Department Stream Sensor',
    verificationStatus: 'verified',
    assignedUnit: 'Shivamogga Irrigation Division'
  },

  // ==========================================
  // RAICHUR
  // ==========================================
  {
    id: 'KA-RCH-2026-1201',
    title: 'Ash Slurry Pipe Fracture Near Thermal Power Plant',
    category: 'environmental_risks',
    severity: 'critical',
    status: 'verified',
    latitude: 16.2340,
    longitude: 77.3560,
    district: 'Raichur',
    cityOrTown: 'Raichur',
    area: 'Shaktinagar',
    landmark: 'RTPS Canal Culvert Km 3',
    description: 'Fly ash slurry overflowing into tributary stream. Containment dyke breached.',
    reportedAt: '2026-10-28T07:10:00+05:30',
    updatedAt: '2026-10-28T08:30:00+05:30',
    reportCount: 34,
    dataSource: 'Thermal Plant Environmental Sensor',
    verificationStatus: 'verified',
    assignedUnit: 'KPCL Rapid Remediation Squad'
  },

  // ==========================================
  // HASSAN
  // ==========================================
  {
    id: 'KA-HSN-2026-1301',
    title: 'Hemavathi River Canal Silt Clearance Completed',
    category: 'blocked_drainage',
    severity: 'low',
    status: 'resolved',
    latitude: 13.0110,
    longitude: 76.1150,
    district: 'Hassan',
    cityOrTown: 'Hassan',
    area: 'Gorur Road Outskirts',
    landmark: 'Distributary Canal 4',
    description: '2.5km canal stretch desilted and aquatic weeds eradicated before peak irrigation release.',
    reportedAt: '2026-10-24T10:00:00+05:30',
    updatedAt: '2026-10-27T16:00:00+05:30',
    resolvedAt: '2026-10-27T16:00:00+05:30',
    reportCount: 14,
    dataSource: 'Hassan Irrigation Board',
    verificationStatus: 'citizen_confirmed',
    resolutionNotes: 'Water delivery to tail-end farms restored at design flow rate.'
  },

  // ==========================================
  // VIJAYAPURA
  // ==========================================
  {
    id: 'KA-VJP-2026-1401',
    title: 'Historic Gol Gumbaz Perimeter Drainage Desilted',
    category: 'blocked_drainage',
    severity: 'low',
    status: 'resolved',
    latitude: 16.8320,
    longitude: 75.7360,
    district: 'Vijayapura (Bijapur)',
    cityOrTown: 'Vijayapura',
    area: 'Station Road',
    landmark: 'Monument East Entrance',
    description: 'Perimeter heritage moat and stormwater pipes cleared of tourist litter and leaf silt.',
    reportedAt: '2026-10-25T11:00:00+05:30',
    updatedAt: '2026-10-27T18:00:00+05:30',
    resolvedAt: '2026-10-27T18:00:00+05:30',
    reportCount: 10,
    dataSource: 'ASI & Municipal Corporation Audit',
    verificationStatus: 'field_audited'
  }
];
