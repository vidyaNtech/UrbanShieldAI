/**
 * UrbanShield AI - Environmental Intelligence Types
 * Statewide Environmental Telemetry, Flood Risk, Urban Heat, and Automatic Risk Monitoring
 */

export type DataSourceType = 'LIVE' | 'HISTORICAL' | 'SIMULATED' | 'BASELINE' | 'ESTIMATED' | 'UNAVAILABLE';

export type EnvironmentalRiskLevel = 'low' | 'moderate' | 'high' | 'critical';

export interface WeatherObservation {
  time: string; // ISO
  temperature: number; // °C
  apparentTemperature: number; // °C — from API apparent_temperature field (NWP model output), NOT calculated HI
  relativeHumidity: number; // %
  precipitationRate: number; // mm/h
  precipitation24h: number | null; // mm (observed previous 24h, null if unavailable)
  forecastPrecipitation24h?: number; // mm (future forecast 24h — NWP model output, not observed)
  precipitationSum7d: number | null; // mm (observed 7-day sum, null if unavailable from standard endpoint)
  precipitationSum7dSource: 'OBSERVED' | 'FORECAST' | 'ESTIMATED' | 'UNAVAILABLE'; // provenance of 7d sum
  weatherCode: number;
  weatherDescription: string;
  windSpeed: number; // km/h
  windDirection?: number; // degrees
  surfacePressure?: number; // hPa
  soilMoisture?: number; // m³/m³ (0-1) - labeled as ESTIMATED
  soilMoistureMethod?: string; // methodology description
  uvIndex?: number;
}

export interface HourlyTrendPoint {
  time: string; // e.g. "14:00" or ISO
  hourLabel: string;
  temperature: number; // °C
  apparentTemperature: number; // °C
  precipitation: number; // mm
  relativeHumidity: number; // %
}

export interface DailyTrendPoint {
  date: string; // YYYY-MM-DD
  dayLabel: string;
  maxTemperature: number; // °C
  minTemperature: number; // °C
  precipitationSum: number; // mm
  riskLevel: EnvironmentalRiskLevel;
}

export interface ContributingRiskFactor {
  factor: string;
  impact: 'low' | 'moderate' | 'high' | 'critical';
  detail: string;
  weightPercent: number;
}

export interface FloodRiskAssessment {
  level: EnvironmentalRiskLevel;
  score: number; // 0 - 100
  explanation: string;
  measuredRainfallRate: number; // mm/h
  accumulatedRainfall24h: number; // mm
  activeDrainageIncidentsCount: number;
  drainageIncidentsSummary?: string;
  districtVulnerabilityIndex: number;
  contributingFactors: ContributingRiskFactor[];
}

export interface HeatRiskAssessment {
  level: EnvironmentalRiskLevel;
  score: number; // 0 - 100
  explanation: string;
  measuredTemperature: number; // °C — from NWP model/API, not physical sensor
  heatIndex: number; // °C apparent (capped at HEAT_INDEX_RELIABILITY_CEILING if polynomial unreliable)
  heatIndexReliable: boolean; // false if inputs outside Rothfusz valid range (27–57°C, 40–100% RH)
  heatIndexSource: 'API_APPARENT_TEMPERATURE' | 'ROTHFUSZ_POLYNOMIAL' | 'AMBIENT_PROXY';
  // API_APPARENT_TEMPERATURE = Open-Meteo's pre-computed apparent temperature (NWP model output)
  // ROTHFUSZ_POLYNOMIAL      = Calculated from Rothfusz (1990) formula within valid range
  // AMBIENT_PROXY            = Formula unreliable; heat index set equal to dry-bulb temperature
  relativeHumidity: number; // %
  heatWaveAdvisory: boolean;
  contributingFactors: ContributingRiskFactor[];
}

export interface WaterStressAssessment {
  level: EnvironmentalRiskLevel;
  score: number; // 0 - 100
  explanation: string;
  soilMoisturePercent: number | null; // % (ESTIMATED)
  soilMoistureProvenance: 'ESTIMATED' | 'UNAVAILABLE';
  groundwaterZoneStatus: 'Safe' | 'Semi-Critical' | 'Critical' | 'Over-Exploited';
  groundwaterProvenance: 'BASELINE' | 'HISTORICAL';
  rainfallDeficitPercent: number | null; // % vs annual/52 approximation, null if 7d observed unavailable
  rainfallDeficitPeriod?: string;         // Always includes "annual÷52 approximation" disclaimer
  rainfallDeficitIsApproximation: boolean; // Always true: annual/52 is not a season-specific normal
  assessmentConfidence: 'full' | 'partial' | 'low'; // Confidence given missing inputs
  missingInputs: string[];                 // List of unavailable inputs affecting this assessment
  contributingFactors: ContributingRiskFactor[];
}

export interface EnvironmentalRiskAssessment {
  flood: FloodRiskAssessment;
  heat: HeatRiskAssessment;
  waterStress: WaterStressAssessment;
  compositeLevel: EnvironmentalRiskLevel;
  compositeScore: number; // 0 - 100
  primaryThreat: 'flood' | 'heat' | 'water_stress' | 'nominal';
  calculationTimestamp: string;
  evaluationMethod: string;
}

export interface DistrictEnvironmentalProfile {

  // *** NEW *** Baseline data for UI tables
  baseline?: {
    annualNormalRainfallMm: number;
    monsoonNormalRainfallMm: number;
    averageMaxTempSummer: number;
    catchmentBasin: string;
  };

  districtId: string;
  districtName: string;
  kannadaName: string;
  division: string;
  coordinates: [number, number]; // [lat, lng]
  elevationMeters: number;
  
  // Current Observation
  observation: WeatherObservation;
  
  // Risk Analysis
  risk: EnvironmentalRiskAssessment;
  
  // Forecast Trends
  hourlyTrends: HourlyTrendPoint[];
  dailyTrends: DailyTrendPoint[];
  
  // Provenance & Source Metadata
  dataSource: DataSourceType;
  providerName: string;
  providerAttribution: string;
  lastUpdated: string;
  isStale: boolean;
}

export interface EnvironmentalAlert {
  id: string;
  districtId: string;
  districtName: string;
  severity: EnvironmentalRiskLevel;
  type: 'HEAVY_RAINFALL' | 'URBAN_HEAT' | 'FLASH_FLOOD_WATCH' | 'WATER_DEFICIT' | 'DRAINAGE_SURGE' | 'SYSTEM_STATUS';
  title: string;
  description: string;
  metricObserved: string;
  thresholdValue: string;
  timestamp: string;
  source: string;
  status: 'ACTIVE' | 'MONITORING' | 'RESOLVED';
  recommendedAction: string;
}

export interface EnvironmentalFeedStatus {
  status: 'online' | 'degraded' | 'offline';
  sourceType: DataSourceType;
  primarySource: string;
  attribution: string;
  lastAttemptedSync: string | null;
  lastSuccessfulSync: string | null;
  nextScheduledSync: string | null;
  refreshIntervalSeconds: number;
  autoRefreshEnabled: boolean;
  activeAlertCount: number;
  monitoredDistrictsCount: number;
  totalLivePoints: number;
  totalFallbackPoints: number;
  totalUnavailablePoints: number;
  connectionLatencyMs: number;
  districtSyncResults?: Record<string, { status: 'SUCCESS' | 'FAILED' | 'FALLBACK'; timestamp: string; error?: string }>;
}

