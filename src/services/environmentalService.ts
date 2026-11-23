/**
 * UrbanShield AI - Environmental Intelligence Service
 * Statewide Environmental Telemetry, Flood Risk Modeling, Heat Stress Analysis,
 * and Multi-Source Risk Evaluation Engine.
 */

import { KARNATAKA_DISTRICTS } from '../data/karnatakaDistricts';
import { getDistrictBaseline } from '../data/karnatakaAgroMetBaseline';
import { incidentService } from './incidentService';
import type { KarnatakaDistrict } from '../types/incident';
import type {
  DataSourceType,
  EnvironmentalRiskLevel,
  WeatherObservation,
  HourlyTrendPoint,
  DailyTrendPoint,
  FloodRiskAssessment,
  HeatRiskAssessment,
  WaterStressAssessment,
  EnvironmentalRiskAssessment,
  DistrictEnvironmentalProfile,
  EnvironmentalAlert,
  EnvironmentalFeedStatus,
  ContributingRiskFactor
} from '../types/environmental';

// WMO Weather Interpretation Codes
export function interpretWeatherCode(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code === 1) return 'Mainly Clear';
  if (code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Fog & Depositing Rime';
  if (code >= 51 && code <= 55) return 'Drizzle (Light to Dense)';
  if (code >= 61 && code <= 65) return 'Rain (Slight to Heavy)';
  if (code === 80 || code === 81 || code === 82) return 'Rain Showers (Violent)';
  if (code >= 95 && code <= 99) return 'Thunderstorm with Precipitation';
  return 'Variable Atmospheric Conditions';
}

/**
 * Common Provider Interface for Environmental Telemetry
 */
export interface IEnvironmentalDataProvider {
  readonly providerName: string;
  readonly sourceType: DataSourceType;
  readonly attribution: string;
  fetchDistrictProfile(district: KarnatakaDistrict, bypassCache?: boolean): Promise<DistrictEnvironmentalProfile>;
}

/**
 * Open-Meteo Live API Provider
 * Free public meteorological API with CORS support. Requires no API keys.
 */
class OpenMeteoLiveProvider implements IEnvironmentalDataProvider {
  readonly providerName = 'Open-Meteo Global Meteorological Engine';
  readonly sourceType: DataSourceType = 'LIVE';
  readonly attribution = 'Weather data by Open-Meteo.com under CC BY 4.0';

  private cache = new Map<string, { profile: DistrictEnvironmentalProfile; timestamp: number }>();
  private readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5-minute cache to respect rate limits

  public clearCache() {
    this.cache.clear();
  }

  async fetchDistrictProfile(district: KarnatakaDistrict, bypassCache: boolean = false): Promise<DistrictEnvironmentalProfile> {
    const [lat, lng] = district.center;
    const cacheKey = district.id;
    const now = Date.now();

    // Check cache unless bypass requested
    if (!bypassCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && now - cached.timestamp < this.CACHE_TTL_MS) {
        return cached.profile;
      }
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&hourly=temperature_2m,apparent_temperature,precipitation,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FKolkata`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Open-Meteo HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const profile = this.transformOpenMeteoResponse(district, data);

      this.cache.set(cacheKey, { profile, timestamp: now });
      return profile;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  private transformOpenMeteoResponse(district: KarnatakaDistrict, apiData: any): DistrictEnvironmentalProfile {
    const current = apiData.current || {};
    const hourly = apiData.hourly || { time: [], temperature_2m: [], precipitation: [], relative_humidity_2m: [], apparent_temperature: [] };
    const daily = apiData.daily || { time: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_sum: [] };
    const baseline = getDistrictBaseline(district.id);

    // Current observation
    const temp = typeof current.temperature_2m === 'number' ? current.temperature_2m : 26.5;
    const appTemp = typeof current.apparent_temperature === 'number' ? current.apparent_temperature : temp;
    const humidity = typeof current.relative_humidity_2m === 'number' ? current.relative_humidity_2m : 60;
    const precipRate = typeof current.precipitation === 'number' ? current.precipitation : 0.0;
    const weatherCode = typeof current.weather_code === 'number' ? current.weather_code : 1;
    const windSpeed = typeof current.wind_speed_10m === 'number' ? current.wind_speed_10m : 10;

    // Distinguish observed previous precipitation from forecast precipitation:
    // Future forecast precipitation for next 24 hours:
    const forecastHourlySlice = (hourly.precipitation || []).slice(0, 24);
    const forecastPrecip24h = forecastHourlySlice.reduce((sum: number, val: number) => sum + (val || 0), 0);

    // Soil moisture derived from precipitation and baseline characteristics is explicitly marked as ESTIMATED
    const estimatedSoilMoisture = baseline.typicalSoilMoistureRange[0] + (precipRate > 2 ? 0.05 : 0.01);

    const observation: WeatherObservation = {
      time: current.time || new Date().toISOString(),
      temperature: Math.round(temp * 10) / 10,
      apparentTemperature: Math.round(appTemp * 10) / 10,
      relativeHumidity: Math.round(humidity),
      precipitationRate: Math.round(precipRate * 10) / 10,
      precipitation24h: null, // Observed past 24h unavailable from forecast endpoint
      forecastPrecipitation24h: Math.round(forecastPrecip24h * 10) / 10,
      precipitationSum7d: null, // Observed past 7d unavailable without historical archive
      weatherCode,
      weatherDescription: interpretWeatherCode(weatherCode),
      windSpeed: Math.round(windSpeed * 10) / 10,
      soilMoisture: Math.round(estimatedSoilMoisture * 100) / 100,
      soilMoistureMethod: 'ESTIMATED via baseline hydrogeology and recent precipitation rate'
    };

    // Transform Hourly trends (next 24 hours)
    const hourlyTrends: HourlyTrendPoint[] = [];
    const hTimes = hourly.time || [];
    const hTemps = hourly.temperature_2m || [];
    const hAppTemps = hourly.apparent_temperature || [];
    const hPrecip = hourly.precipitation || [];
    const hHum = hourly.relative_humidity_2m || [];

    for (let i = 0; i < Math.min(24, hTimes.length); i++) {
      const timeStr = hTimes[i] || '';
      const dateObj = new Date(timeStr);
      const hourLabel = isNaN(dateObj.getTime()) 
        ? `${i}:00` 
        : dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });

      hourlyTrends.push({
        time: timeStr,
        hourLabel,
        temperature: Math.round((hTemps[i] ?? temp) * 10) / 10,
        apparentTemperature: Math.round((hAppTemps[i] ?? appTemp) * 10) / 10,
        precipitation: Math.round((hPrecip[i] ?? 0) * 10) / 10,
        relativeHumidity: Math.round(hHum[i] ?? humidity)
      });
    }

    // Transform Daily trends (7 days)
    const dailyTrends: DailyTrendPoint[] = [];
    const dTimes = daily.time || [];
    const dMax = daily.temperature_2m_max || [];
    const dMin = daily.temperature_2m_min || [];
    const dPrecip = daily.precipitation_sum || [];

    for (let i = 0; i < Math.min(7, dTimes.length); i++) {
      const dateStr = dTimes[i] || '';
      const dateObj = new Date(dateStr);
      const dayLabel = isNaN(dateObj.getTime())
        ? `Day ${i + 1}`
        : dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      const maxT = dMax[i] ?? temp;
      const pSum = dPrecip[i] ?? 0;
      
      let risk: EnvironmentalRiskLevel = 'low';
      if (pSum > 45 || maxT > 41) risk = 'critical';
      else if (pSum > 25 || maxT > 38) risk = 'high';
      else if (pSum > 10 || maxT > 35) risk = 'moderate';

      dailyTrends.push({
        date: dateStr,
        dayLabel,
        maxTemperature: Math.round(maxT * 10) / 10,
        minTemperature: Math.round((dMin[i] ?? (maxT - 8)) * 10) / 10,
        precipitationSum: Math.round(pSum * 10) / 10,
        riskLevel: risk
      });
    }

    // Run transparent multi-factor risk assessment
    const risk = evaluateDistrictRisk(district, observation, baseline);

    return {
      districtId: district.id,
      districtName: district.name,
      kannadaName: district.kannadaName,
      division: district.division,
      coordinates: district.center,
      elevationMeters: baseline.elevationMeters,
      observation,
      risk,
      hourlyTrends,
      dailyTrends,
      dataSource: 'LIVE',
      providerName: this.providerName,
      providerAttribution: this.attribution,
      lastUpdated: new Date().toISOString(),
      isStale: false
    };
  }
}

/**
 * Historical & Simulated Baseline Provider
 * Calibrated against IMD 30-year climate normals for offline and sandbox resilience.
 */
class HistoricalBaselineProvider implements IEnvironmentalDataProvider {
  readonly providerName = 'Karnataka Agro-Met Historical Normals Archive';
  readonly sourceType: DataSourceType = 'BASELINE';
  readonly attribution = 'Historical Baselines: India Meteorological Dept (IMD) & CGWB Karnataka';

  async fetchDistrictProfile(district: KarnatakaDistrict): Promise<DistrictEnvironmentalProfile> {
    const baseline = getDistrictBaseline(district.id);
    const now = new Date();

    // Determine seasonal diurnal cycle
    const hour = now.getHours();
    const diurnalFactor = Math.sin(((hour - 9) / 24) * 2 * Math.PI); // Peak at ~15:00
    const baseTemp = baseline.averageAnnualTemp;
    const currentTemp = Math.round((baseTemp + (diurnalFactor * 4.5)) * 10) / 10;
    const currentHumidity = Math.round(Math.max(25, Math.min(85, 62 - (diurnalFactor * 18))));
    const apparentTemp = calculateHeatIndex(currentTemp, currentHumidity);

    // Baseline dry season reference rainfall
    const isCoastal = ['dakshina-kannada', 'udupi', 'uttara-kannada'].includes(district.id);
    const precipRate = isCoastal ? 1.2 : 0.0;

    const observation: WeatherObservation = {
      time: now.toISOString(),
      temperature: currentTemp,
      apparentTemperature: apparentTemp,
      relativeHumidity: currentHumidity,
      precipitationRate: precipRate,
      precipitation24h: null, // Marked null as no historical observation exists for past 24h
      forecastPrecipitation24h: isCoastal ? 14.5 : 0.0,
      precipitationSum7d: null,
      weatherCode: precipRate > 0 ? 61 : currentTemp > 35 ? 0 : 2,
      weatherDescription: precipRate > 0 ? 'Light Rain Showers' : currentTemp > 35 ? 'Clear Hot Sun' : 'Partly Cloudy',
      windSpeed: Math.round((8 + Math.random() * 6) * 10) / 10,
      soilMoisture: baseline.typicalSoilMoistureRange[0],
      soilMoistureMethod: 'BASELINE reference derived from CGWB hydrogeological survey'
    };

    // 24h Hourly Trend Projection
    const hourlyTrends: HourlyTrendPoint[] = [];
    for (let i = 0; i < 24; i++) {
      const futureHour = (hour + i) % 24;
      const futureFactor = Math.sin(((futureHour - 9) / 24) * 2 * Math.PI);
      const hTemp = Math.round((baseTemp + (futureFactor * 4.5)) * 10) / 10;
      const hHum = Math.round(Math.max(25, Math.min(85, 62 - (futureFactor * 18))));
      const hTime = new Date(now.getTime() + (i * 3600 * 1000));

      hourlyTrends.push({
        time: hTime.toISOString(),
        hourLabel: `${String(futureHour).padStart(2, '0')}:00`,
        temperature: hTemp,
        apparentTemperature: calculateHeatIndex(hTemp, hHum),
        precipitation: isCoastal && (futureHour >= 14 && futureHour <= 18) ? 2.5 : 0.0,
        relativeHumidity: hHum
      });
    }

    // 7-day Daily Trend Projection
    const dailyTrends: DailyTrendPoint[] = [];
    for (let i = 0; i < 7; i++) {
      const dDate = new Date(now.getTime() + (i * 86400 * 1000));
      const maxT = Math.round((baseline.averageMaxTempSummer - 3 + (i % 2 === 0 ? 1 : -1)) * 10) / 10;
      const minT = Math.round((baseline.averageMinTempWinter + 2) * 10) / 10;
      const pSum = isCoastal ? Math.round((8 + (i * 2)) * 10) / 10 : 0.0;

      let rLevel: EnvironmentalRiskLevel = 'low';
      if (maxT > 40 || pSum > 35) rLevel = 'high';
      else if (maxT > 36 || pSum > 15) rLevel = 'moderate';

      dailyTrends.push({
        date: dDate.toISOString().split('T')[0],
        dayLabel: dDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        maxTemperature: maxT,
        minTemperature: minT,
        precipitationSum: pSum,
        riskLevel: rLevel
      });
    }

    const risk = evaluateDistrictRisk(district, observation, baseline);

    return {
      districtId: district.id,
      districtName: district.name,
      kannadaName: district.kannadaName,
      division: district.division,
      coordinates: district.center,
      elevationMeters: baseline.elevationMeters,
      observation,
      risk,
      hourlyTrends,
      dailyTrends,
      dataSource: 'BASELINE',
      providerName: this.providerName,
      providerAttribution: this.attribution,
      lastUpdated: now.toISOString(),
      isStale: false
    };
  }
}

/**
 * Transparent Heat Index Calculation
 *
 * Formula: Rothfusz regression adapted to Celsius inputs.
 * Reference: Rothfusz, L.P. (1990). "The Heat Index Equation."
 *            NWS Technical Attachment SR 90-23, Fort Worth TX.
 *            Steadman, R.G. (1979). JAMC 18(7):861-873.
 *
 * Valid input range: temperature 27–57°C, relative humidity 40–100 %.
 * Outside this range the formula is extrapolated; results should be treated
 * as indicative only.
 *
 * IMPORTANT: RH must be supplied in percentage units (0–100), NOT as a
 * fraction (0–1). This distinguishes it from the erroneous rh/100 usage
 * that was present in the previous implementation.
 *
 * @param tempC    Dry-bulb air temperature (°C)
 * @param rhPct    Relative humidity (%, 0–100)
 * @returns        Apparent temperature / Heat Index (°C), or tempC when < 27°C.
 */
function calculateHeatIndex(tempC: number, rhPct: number): number {
  // Guard: reject non-finite or out-of-range inputs
  if (!Number.isFinite(tempC) || !Number.isFinite(rhPct)) return tempC;
  if (rhPct < 0 || rhPct > 100) {
    // Clamp to valid bounds rather than returning NaN
    rhPct = Math.max(0, Math.min(100, rhPct));
  }

  // Below 27°C the formula is not applicable; apparent temperature equals ambient temperature.
  if (tempC < 27) return tempC;

  const t = tempC;   // Celsius
  const rh = rhPct;  // Percentage units (0–100) as required by the Rothfusz coefficients

  // Rothfusz (1990) regression equation, adapted to Celsius:
  // HI(°C) = -8.78469475556
  //          + 1.61139411 * T
  //          + 2.33854883889 * RH
  //          - 0.14611605 * T * RH
  //          - 0.012308094 * T²
  //          - 0.0164248277778 * RH²
  //          + 0.002211732 * T² * RH
  //          + 0.00072546 * T * RH²
  //          - 0.000003582 * T² * RH²
  // Note: when RH is in % (0-100), coefficient 2.33854883889 on RH is correct.
  // If RH were fractional (0-1) these coefficients would need scaling by 100.
  const hi =
    -8.78469475556 +
    1.61139411 * t +
    2.33854883889 * rh -
    0.14611605 * t * rh -
    0.012308094 * t * t -
    0.0164248277778 * rh * rh +
    0.002211732 * t * t * rh +
    0.00072546 * t * rh * rh -
    0.000003582 * t * t * rh * rh;

  // Heat index is never lower than ambient temperature
  return Math.round(Math.max(t, hi) * 10) / 10;
}

/**
 * Transparent Environmental Risk Evaluation Engine
 * Clear formula calculations combining measured telemetry with physical geography and citizen reports.
 */
function evaluateDistrictRisk(
  district: KarnatakaDistrict,
  obs: WeatherObservation,
  baseline: ReturnType<typeof getDistrictBaseline>
): EnvironmentalRiskAssessment {
  // 1. Cross-reference citizen-reported incidents for drainage blockages
  const allIncidents = incidentService.getAllIncidents();
  const districtDrainageIssues = allIncidents.filter(inc => 
    inc.district.toLowerCase() === district.name.toLowerCase() &&
    (inc.category === 'blocked_drainage' || inc.category === 'flooding_waterlogging') &&
    inc.status !== 'resolved' && inc.status !== 'rejected'
  );

  const activeDrainageIncidentsCount = districtDrainageIssues.length;

  // --- FLOOD RISK CALCULATION ---
  // A. Rainfall Intensity Factor (0 - 100)
  // IMD thresholds: > 15 mm/h = Heavy; > 35 mm/h = Very Heavy; forecast 24h > 65 mm = Severe
  let rainfallFactor = 0;
  const precip24 = obs.precipitation24h ?? obs.forecastPrecipitation24h ?? 0;
  if (obs.precipitationRate > 35 || precip24 > 65) {
    rainfallFactor = 100;
  } else if (obs.precipitationRate > 15 || precip24 > 35) {
    rainfallFactor = 75;
  } else if (obs.precipitationRate > 5 || precip24 > 15) {
    rainfallFactor = 45;
  } else if (obs.precipitationRate > 0.5 || precip24 > 2) {
    rainfallFactor = 20;
  }

  // B. Drainage Obstruction Multiplier (0 - 100)
  // Citizen reports provide real-world bottleneck verification
  const drainageFactor = Math.min(100, activeDrainageIncidentsCount * 25);

  // C. Topographical Vulnerability Index (0 - 100)
  const topoFactor = district.vulnerabilityIndex || 50;

  // Weighted Composite Flood Score:
  // Flood Score = 0.45 * RainfallFactor + 0.30 * TopoFactor + 0.25 * DrainageFactor
  const floodScore = Math.round((0.45 * rainfallFactor) + (0.30 * topoFactor) + (0.25 * drainageFactor));

  let floodLevel: EnvironmentalRiskLevel = 'low';
  if (floodScore >= 75) floodLevel = 'critical';
  else if (floodScore >= 50) floodLevel = 'high';
  else if (floodScore >= 25) floodLevel = 'moderate';

  const floodContributingFactors: ContributingRiskFactor[] = [
    {
      factor: 'Precipitation Intensity',
      impact: rainfallFactor >= 75 ? 'critical' : rainfallFactor >= 45 ? 'high' : rainfallFactor >= 20 ? 'moderate' : 'low',
      detail: `Rate: ${obs.precipitationRate} mm/h (Observed 24h: ${obs.precipitation24h !== null ? `${obs.precipitation24h} mm` : 'Unavailable'}, Forecast 24h: ${obs.forecastPrecipitation24h ?? 'N/A'} mm)`,
      weightPercent: 45
    },
    {
      factor: 'Topographical Vulnerability',
      impact: topoFactor >= 75 ? 'critical' : topoFactor >= 60 ? 'high' : topoFactor >= 40 ? 'moderate' : 'low',
      detail: `District vulnerability index: ${topoFactor}/100 in ${baseline.catchmentBasin} basin`,
      weightPercent: 30
    },
    {
      factor: 'Citizen Drainage Reports',
      impact: drainageFactor >= 50 ? 'critical' : drainageFactor > 0 ? 'moderate' : 'low',
      detail: `${activeDrainageIncidentsCount} active citizen reports in district (district-level indicator)`,
      weightPercent: 25
    }
  ];

  let floodExplanation = '';
  if (floodScore >= 75) {
    floodExplanation = `Critical flood hazard: High precipitation (${obs.precipitationRate} mm/h) exceeds urban stormwater discharge capacity, compounded by ${activeDrainageIncidentsCount} active drainage obstruction report(s) in ${district.name}.`;
  } else if (floodScore >= 50) {
    floodExplanation = `Elevated flood risk: Moderate precipitation combined with district vulnerability (${topoFactor}/100) and ${activeDrainageIncidentsCount} reported drainage obstruction(s).`;
  } else if (floodScore >= 25) {
    floodExplanation = `Moderate localized watch: Light rainfall or seasonal dampening observed. Natural drainage channels currently accommodate runoff.`;
  } else {
    floodExplanation = `Nominal flood risk: Surface precipitation is zero or minimal (${obs.precipitationRate} mm/h). No elevated stormwater hazards detected.`;
  }

  const floodAssessment: FloodRiskAssessment = {
    level: floodLevel,
    score: floodScore,
    explanation: floodExplanation,
    measuredRainfallRate: obs.precipitationRate,
    accumulatedRainfall24h: obs.precipitation24h ?? 0,
    activeDrainageIncidentsCount,
    drainageIncidentsSummary: activeDrainageIncidentsCount > 0 
      ? `${activeDrainageIncidentsCount} unresolved citizen drainage reports in ${district.name}`
      : 'No active drainage blockage tickets reported by citizens',
    districtVulnerabilityIndex: topoFactor,
    contributingFactors: floodContributingFactors
  };

  // --- HEAT RISK CALCULATION ---
  const heatIndex = obs.apparentTemperature;
  let heatScore = 0;
  let heatLevel: EnvironmentalRiskLevel = 'low';
  let heatWaveAdvisory = false;

  // IMD Heat Wave criteria for plains: Max Temp >= 40°C, departure >= 4.5°C; or Apparent Temp >= 42°C
  if (obs.temperature >= 42 || heatIndex >= 45) {
    heatScore = 95;
    heatLevel = 'critical';
    heatWaveAdvisory = true;
  } else if (obs.temperature >= 38 || heatIndex >= 41) {
    heatScore = 75;
    heatLevel = 'high';
    heatWaveAdvisory = true;
  } else if (obs.temperature >= 34 || heatIndex >= 37) {
    heatScore = 45;
    heatLevel = 'moderate';
  } else {
    heatScore = Math.max(10, Math.round((obs.temperature / 34) * 25));
    heatLevel = 'low';
  }

  const heatContributingFactors: ContributingRiskFactor[] = [
    {
      factor: 'Ambient Temperature',
      impact: obs.temperature >= 40 ? 'critical' : obs.temperature >= 36 ? 'high' : 'moderate',
      detail: `Observed: ${obs.temperature}°C (Historical Summer Normal: ${baseline.averageMaxTempSummer}°C)`,
      weightPercent: 50
    },
    {
      factor: 'Apparent Heat Index (Steadman)',
      impact: heatIndex >= 42 ? 'critical' : heatIndex >= 38 ? 'high' : 'low',
      detail: `Effective thermal stress: ${heatIndex}°C at ${obs.relativeHumidity}% humidity`,
      weightPercent: 35
    },
    {
      factor: 'Urban Built-up Heat Retention',
      impact: district.vulnerabilityIndex > 70 ? 'high' : 'moderate',
      detail: `Pavement and masonry radiation amplification factor`,
      weightPercent: 15
    }
  ];

  let heatExplanation = '';
  if (heatLevel === 'critical') {
    heatExplanation = `Severe Heat Wave Advisory: Surface temperature ${obs.temperature}°C (Apparent ${heatIndex}°C) exceeds IMD Red Alert criteria. Extreme risk of heat hyperthermia and urban thermal stress.`;
  } else if (heatLevel === 'high') {
    heatExplanation = `Elevated thermal stress: Apparent temperature of ${heatIndex}°C with ${obs.relativeHumidity}% relative humidity reaches cautionary occupational heat thresholds.`;
  } else if (heatLevel === 'moderate') {
    heatExplanation = `Moderate thermal radiation: Daytime temperature ${obs.temperature}°C within normal semi-arid seasonal envelope. Adequate hydration advised.`;
  } else {
    heatExplanation = `Comfortable ambient thermal regime: Observed temperature ${obs.temperature}°C is well below heat-stress warning levels.`;
  }

  const heatAssessment: HeatRiskAssessment = {
    level: heatLevel,
    score: heatScore,
    explanation: heatExplanation,
    measuredTemperature: obs.temperature,
    heatIndex,
    relativeHumidity: obs.relativeHumidity,
    heatWaveAdvisory,
    contributingFactors: heatContributingFactors
  };

  // --- WATER STRESS CALCULATION ---
  let waterScore = 0;
  // CGWB Aquifer Status is BASELINE reference data from official hydrogeological reports
  if (baseline.cgwbAquiferStatus === 'Over-Exploited') waterScore += 45;
  else if (baseline.cgwbAquiferStatus === 'Critical') waterScore += 30;
  else if (baseline.cgwbAquiferStatus === 'Semi-Critical') waterScore += 18;
  else waterScore += 5;

  // Topsoil moisture is ESTIMATED (derived from baseline and recent rainfall)
  const soilMoistureVal = obs.soilMoisture !== undefined ? obs.soilMoisture : null;
  const soilMoisturePercent = soilMoistureVal !== null ? Math.round(soilMoistureVal * 100) : null;
  if (soilMoisturePercent !== null) {
    if (soilMoisturePercent < 15) waterScore += 35;
    else if (soilMoisturePercent < 22) waterScore += 20;
    else waterScore += 5;
  } else {
    waterScore += 15; // Moderate neutral penalty for unavailable soil moisture
  }

  // Rainfall Deficit Calculation:
  // ⚠ LIMITATION NOTICE: There is no district-specific, season-specific 7-day climatological
  // normal available in this dataset. The approximation below (annualNormal ÷ 52) assumes
  // equal rainfall distribution across all calendar weeks, which is INCORRECT for Karnataka
  // (70-85% of annual rainfall falls during June-September monsoon season).
  //
  // This value is an ANNUAL-AVERAGE WEEKLY APPROXIMATION only.
  // It MUST NOT be used as the basis for a confident seasonal deficit classification,
  // and it MUST NOT contribute to water-stress scoring.
  // It is computed and surfaced in the UI only for informational disclosure.
  let rainfallDeficitPercent: number | null = null;
  let rainfallDeficitPeriod: string | undefined = undefined;

  // Only compute if 7d observed precipitation AND annual normal are available.
  // Explicitly withhold from water-stress scoring (no waterScore += block).
  if (obs.precipitationSum7d !== null && baseline.annualNormalRainfallMm > 0) {
    const expected7dApprox = baseline.annualNormalRainfallMm / 52;
    if (expected7dApprox > 0) {
      const diff = expected7dApprox - obs.precipitationSum7d;
      rainfallDeficitPercent = Math.round((diff / expected7dApprox) * 100);
      // Label clearly identifies this as an approximation, not a true seasonal normal
      rainfallDeficitPeriod =
        '7-day observed vs annual÷52 weekly approximation (not a season-specific normal — informational only)';
    }
  }
  // If 7d data unavailable, rainfallDeficitPercent stays null and is disclosed as unavailable.

  const finalWaterScore = Math.min(100, waterScore);
  let waterLevel: EnvironmentalRiskLevel = 'low';
  if (finalWaterScore >= 70) waterLevel = 'critical';
  else if (finalWaterScore >= 48) waterLevel = 'high';
  else if (finalWaterScore >= 25) waterLevel = 'moderate';

  // --- MISSING-INPUT CONFIDENCE TRACKING ---
  // Every absent input is listed explicitly so the caller and UI can disclose
  // that this assessment is provisional, not fully evidenced.
  const missingInputs: string[] = [];
  if (soilMoisturePercent === null) missingInputs.push('Topsoil moisture (unavailable — ESTIMATED fallback not applicable)');
  if (obs.precipitationSum7d === null) missingInputs.push('7-day observed precipitation (unavailable — rainfall deficit not calculable)');

  let assessmentConfidence: 'full' | 'partial' | 'low';
  if (missingInputs.length === 0) {
    assessmentConfidence = 'full';
  } else if (missingInputs.length === 1) {
    assessmentConfidence = 'partial';
  } else {
    assessmentConfidence = 'low';
  }

  const waterContributingFactors: ContributingRiskFactor[] = [
    {
      factor: 'CGWB Groundwater Basin Status',
      impact: baseline.cgwbAquiferStatus === 'Over-Exploited' ? 'critical' : baseline.cgwbAquiferStatus === 'Critical' ? 'high' : 'low',
      detail: `Central Ground Water Board classification: ${baseline.cgwbAquiferStatus} (BASELINE reference)`,
      weightPercent: 45
    },
    {
      factor: 'Topsoil Moisture Saturation',
      impact: soilMoisturePercent !== null && soilMoisturePercent < 15 ? 'high' : 'low',
      detail: soilMoisturePercent !== null
        ? `Estimated moisture: ${soilMoisturePercent}% saturation (ESTIMATED via baseline hydrogeology + precip rate)`
        : 'Topsoil moisture data unavailable — using neutral default penalty (+15 pts); assessment is PROVISIONAL',
      weightPercent: 35
    },
    {
      factor: 'Rainfall Inflow Indicator',
      impact: 'low',
      // Rainfall deficit approximation is intentionally NOT rated as a risk factor because
      // annual÷52 is not a valid season-specific normal. It is disclosed for transparency only.
      detail: rainfallDeficitPercent !== null
        ? `Informational only: ${rainfallDeficitPercent}% difference vs annual÷52 approximation. NOT used in scoring (not a season-specific normal).`
        : 'Observed 7-day precipitation unavailable — no rainfall deficit calculation possible',
      weightPercent: 20
    }
  ];

  let waterExplanation = '';
  const confidenceNote = assessmentConfidence !== 'full'
    ? ` [PROVISIONAL — ${assessmentConfidence.toUpperCase()} CONFIDENCE: ${missingInputs.join('; ')}]`
    : '';

  if (waterLevel === 'critical') {
    waterExplanation = `Elevated hydrogeological deficit: ${district.name} is classified as ${baseline.cgwbAquiferStatus} by CGWB baseline reference, with estimated topsoil moisture at ${soilMoisturePercent ?? 'N/A'}%. Long-term recharge deficit observed.${confidenceNote}`;
  } else if (waterLevel === 'high') {
    waterExplanation = `Significant water deficit indicator: Baseline groundwater extraction exceeds natural recharge in ${district.name} under dry seasonal conditions.${confidenceNote}`;
  } else if (waterLevel === 'moderate') {
    waterExplanation = `Moderate seasonal water depletion: Baseline groundwater status is ${baseline.cgwbAquiferStatus}. Conservation advised during dry intervals.${confidenceNote}`;
  } else {
    waterExplanation = `Adequate water availability indicator: Baseline aquifer classification (${baseline.cgwbAquiferStatus}) and estimated soil moisture indicate safe conditions.${confidenceNote}`;
  }

  const waterAssessment: WaterStressAssessment = {
    level: waterLevel,
    score: finalWaterScore,
    explanation: waterExplanation,
    soilMoisturePercent,
    soilMoistureProvenance: soilMoisturePercent !== null ? 'ESTIMATED' : 'UNAVAILABLE',
    groundwaterZoneStatus: baseline.cgwbAquiferStatus,
    groundwaterProvenance: 'BASELINE',
    rainfallDeficitPercent,
    rainfallDeficitPeriod,
    rainfallDeficitIsApproximation: true, // Always true: annualNormal÷52 is not a season-specific normal
    assessmentConfidence,
    missingInputs,
    contributingFactors: waterContributingFactors
  };

  // --- COMPOSITE MULTI-HAZARD EVALUATION ---
  // Identify the primary driving threat
  let primaryThreat: 'flood' | 'heat' | 'water_stress' | 'nominal' = 'nominal';
  const maxScore = Math.max(floodScore, heatScore, finalWaterScore);

  if (maxScore === floodScore && floodScore >= 35) primaryThreat = 'flood';
  else if (maxScore === heatScore && heatScore >= 35) primaryThreat = 'heat';
  else if (maxScore === finalWaterScore && finalWaterScore >= 45) primaryThreat = 'water_stress';

  // Overall Composite Score: Weighted dominant hazard
  const compositeScore = Math.round((maxScore * 0.6) + ((floodScore + heatScore + finalWaterScore - maxScore) * 0.2));
  let compositeLevel: EnvironmentalRiskLevel = 'low';
  if (compositeScore >= 70) compositeLevel = 'critical';
  else if (compositeScore >= 48) compositeLevel = 'high';
  else if (compositeScore >= 25) compositeLevel = 'moderate';

  return {
    flood: floodAssessment,
    heat: heatAssessment,
    waterStress: waterAssessment,
    compositeLevel,
    compositeScore,
    primaryThreat,
    calculationTimestamp: new Date().toISOString(),
    evaluationMethod: 'Multi-Factor Algorithmic Matrix (IMD Rainfall Thresholds + Rothfusz Heat Index + CGWB Hydrogeology + Citizen Drainage Telemetry)'
  };
}

/**
 * Singleton Environmental Intelligence Service
 */
class EnvironmentalService {
  private liveProvider = new OpenMeteoLiveProvider();
  private baselineProvider = new HistoricalBaselineProvider();
  
  private profiles = new Map<string, DistrictEnvironmentalProfile>();
  private alerts: EnvironmentalAlert[] = [];
  private listeners: Array<() => void> = [];

  // Configurable Refresh Settings
  private refreshIntervalSeconds = 300; // 5 minutes
  private autoRefreshEnabled = true;
  private refreshTimer: any = null;
  private lastAttemptedSync: string | null = null;
  private lastSuccessfulSync: string | null = null;
  private currentSourceType: DataSourceType = 'BASELINE';
  private connectionStatus: 'online' | 'degraded' | 'offline' = 'online';
  private connectionLatencyMs = 0;
  private isFetching = false;
  private districtSyncResults: Record<string, { status: 'SUCCESS' | 'FAILED' | 'FALLBACK'; timestamp: string; error?: string }> = {};

  constructor() {
    // Listen to incident updates to dynamically re-evaluate drainage-related environmental risks
    incidentService.subscribe(() => {
      this.recalculateIncidentDependentRisks();
    });
    this.startAutoRefresh();
  }

  private recalculateIncidentDependentRisks() {
    this.profiles.forEach((profile, id) => {
      const district = KARNATAKA_DISTRICTS.find(d => d.id === id);
      if (district) {
        const baseline = getDistrictBaseline(district.id);
        profile.risk = evaluateDistrictRisk(district, profile.observation, baseline);
      }
    });
    this.regenerateAlerts();
    this.notify();
  }

  public clearCache() {
    this.liveProvider.clearCache();
    this.profiles.clear();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(cb => {
      try {
        cb();
      } catch (err) {
        console.error('Error in environmentalService listener:', err);
      }
    });
  }

  public startAutoRefresh() {
    this.stopAutoRefresh();
    if (!this.autoRefreshEnabled || this.refreshIntervalSeconds <= 0) return;

    this.refreshTimer = setInterval(() => {
      this.refreshAllDistricts(false);
    }, this.refreshIntervalSeconds * 1000);

    // In Node.js testing/SSR environments, unref timer so it does not block process exit
    if (this.refreshTimer && typeof this.refreshTimer.unref === 'function') {
      this.refreshTimer.unref();
    }
  }

  public stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  public setRefreshInterval(seconds: number) {
    this.refreshIntervalSeconds = seconds;
    this.startAutoRefresh();
    this.notify();
  }

  public setAutoRefresh(enabled: boolean) {
    this.autoRefreshEnabled = enabled;
    if (enabled) this.startAutoRefresh();
    else this.stopAutoRefresh();
    this.notify();
  }

  /**
   * Fetch single district profile (with live provider, falling back to baseline)
   */
  public async getDistrictProfile(districtIdOrName: string, bypassCache: boolean = false): Promise<DistrictEnvironmentalProfile> {
    const district = KARNATAKA_DISTRICTS.find(
      d => d.id.toLowerCase() === districtIdOrName.toLowerCase() ||
           d.name.toLowerCase() === districtIdOrName.toLowerCase()
    ) || KARNATAKA_DISTRICTS[0];

    // If profile already exists in memory and is fresh (< 5 mins), return it unless bypass requested
    if (!bypassCache) {
      const existing = this.profiles.get(district.id);
      if (existing && (Date.now() - new Date(existing.lastUpdated).getTime()) < 5 * 60 * 1000) {
        return existing;
      }
    }

    const startTime = Date.now();
    this.lastAttemptedSync = new Date().toISOString();

    try {
      // Try live API first
      const profile = await this.liveProvider.fetchDistrictProfile(district, bypassCache);
      this.connectionLatencyMs = Date.now() - startTime;
      this.currentSourceType = 'LIVE';
      this.connectionStatus = 'online';
      this.lastSuccessfulSync = new Date().toISOString();
      this.districtSyncResults[district.id] = { status: 'SUCCESS', timestamp: this.lastSuccessfulSync };
      this.profiles.set(district.id, profile);
      this.regenerateAlerts();
      this.notify();
      return profile;
    } catch (liveErr: any) {
      // Graceful fallback to baseline reference data - explicitly marked BASELINE, not LIVE or HISTORICAL
      console.warn(`[EnvironmentalService] Live API unavailable for ${district.name}, using baseline reference:`, liveErr);
      const fallbackProfile = await this.baselineProvider.fetchDistrictProfile(district);
      fallbackProfile.dataSource = 'BASELINE';
      this.currentSourceType = 'BASELINE';
      this.connectionStatus = 'degraded';
      this.districtSyncResults[district.id] = { status: 'FALLBACK', timestamp: new Date().toISOString(), error: liveErr?.message || 'Live request failed' };
      this.profiles.set(district.id, fallbackProfile);
      this.regenerateAlerts();
      this.notify();
      return fallbackProfile;
    }
  }

  /**
   * Pre-fetches or refreshes statewide profiles for key representative districts
   * (e.g. 10 key division centers or all on-demand)
   */
  public async refreshAllDistricts(force: boolean = false): Promise<void> {
    if (this.isFetching) return;
    this.isFetching = true;
    this.lastAttemptedSync = new Date().toISOString();

    // Prioritize high-population and diverse agro-climatic representative districts
    const priorityDistrictIds = [
      'bengaluru-urban',
      'dakshina-kannada',
      'mysuru',
      'belagavi',
      'kalaburagi',
      'ballari',
      'shivamogga',
      'kolar',
      'dharwad',
      'chikkamagaluru'
    ];

    let liveSuccessCount = 0;
    let fallbackCount = 0;
    const startTime = Date.now();

    for (const d of KARNATAKA_DISTRICTS) {
      const isPriority = priorityDistrictIds.includes(d.id);
      
      try {
        if (isPriority || force) {
          const profile = await this.liveProvider.fetchDistrictProfile(d);
          this.profiles.set(d.id, profile);
          this.districtSyncResults[d.id] = { status: 'SUCCESS', timestamp: new Date().toISOString() };
          liveSuccessCount++;
        } else if (!this.profiles.has(d.id)) {
          // Fill baseline reference data for background districts
          const fallback = await this.baselineProvider.fetchDistrictProfile(d);
          fallback.dataSource = 'BASELINE';
          this.profiles.set(d.id, fallback);
          this.districtSyncResults[d.id] = { status: 'FALLBACK', timestamp: new Date().toISOString() };
          fallbackCount++;
        }
      } catch (err: any) {
        const fallback = await this.baselineProvider.fetchDistrictProfile(d);
        fallback.dataSource = 'BASELINE';
        this.profiles.set(d.id, fallback);
        this.districtSyncResults[d.id] = { status: 'FALLBACK', timestamp: new Date().toISOString(), error: err?.message };
        fallbackCount++;
      }
    }

    this.connectionLatencyMs = Math.round((Date.now() - startTime) / Math.max(1, liveSuccessCount));
    
    // Update lastSuccessfulSync ONLY if at least one live request succeeded
    if (liveSuccessCount > 0) {
      this.lastSuccessfulSync = new Date().toISOString();
      this.currentSourceType = 'LIVE';
      this.connectionStatus = fallbackCount > 0 ? 'degraded' : 'online';
    } else {
      this.currentSourceType = 'BASELINE';
      this.connectionStatus = 'offline';
    }
    
    this.isFetching = false;
    this.regenerateAlerts();
    this.notify();
  }

  /**
   * Re-evaluates risk alerts across all loaded district profiles
   */
  private regenerateAlerts() {
    const newAlerts: EnvironmentalAlert[] = [];

    this.profiles.forEach(p => {
      // Check for Heavy Rainfall Alert
      if (p.risk.flood.level === 'critical' || p.observation.precipitationRate > 20) {
        newAlerts.push({
          id: `ALT-RAIN-${p.districtId}`,
          districtId: p.districtId,
          districtName: p.districtName,
          severity: 'critical',
          type: 'HEAVY_RAINFALL',
          title: `Flash Flood Watch: Intense Precipitation in ${p.districtName}`,
          description: `Measured precipitation rate ${p.observation.precipitationRate} mm/h with 24h accumulation ${p.observation.precipitation24h} mm. High risk of low-lying inundation.`,
          metricObserved: `${p.observation.precipitationRate} mm/h`,
          thresholdValue: '15.0 mm/h (IMD Heavy Rain Threshold)',
          timestamp: p.observation.time,
          source: p.providerName,
          status: 'ACTIVE',
          recommendedAction: 'Deploy BBMP / KDMA stormwater de-silting pumps and alert ward emergency responders.'
        });
      } else if (p.risk.flood.level === 'high') {
        newAlerts.push({
          id: `ALT-FLOOD-${p.districtId}`,
          districtId: p.districtId,
          districtName: p.districtName,
          severity: 'high',
          type: 'DRAINAGE_SURGE',
          title: `Drainage Surcharge Warning: ${p.districtName}`,
          description: `${p.risk.flood.activeDrainageIncidentsCount} citizen drainage complaints correlated with rainfall. Risk score: ${p.risk.flood.score}/100.`,
          metricObserved: `Score ${p.risk.flood.score}/100`,
          thresholdValue: 'Score 50/100',
          timestamp: p.observation.time,
          source: p.providerName,
          status: 'ACTIVE',
          recommendedAction: 'Clear culvert trash racks and monitor underpasses.'
        });
      }

      // Check for Urban Heat Wave Alert
      if (p.risk.heat.heatWaveAdvisory || p.risk.heat.level === 'critical') {
        newAlerts.push({
          id: `ALT-HEAT-${p.districtId}`,
          districtId: p.districtId,
          districtName: p.districtName,
          severity: p.risk.heat.level,
          type: 'URBAN_HEAT',
          title: `Extreme Heat Advisory: ${p.districtName}`,
          description: `Surface temperature ${p.observation.temperature}°C (Apparent Heat Index: ${p.risk.heat.heatIndex}°C). Hazardous thermal exposure. [UrbanShield operational threshold — not an official IMD heat-wave declaration]`,
          metricObserved: `${p.risk.heat.heatIndex}°C Apparent Heat Index`,
          thresholdValue: '≥38°C / HI≥41°C (UrbanShield operational threshold)',
          timestamp: p.observation.time,
          source: p.providerName,
          status: 'ACTIVE',
          recommendedAction: 'Activate municipal cool-roof shelters, hydration kiosks, and restrict midday outdoor civic labor.'
        });
      }

    // Check for Acute Water Stress:
    // Only generate alert when water stress level is critical AND topsoil moisture is genuinely depressed (< 15%)
    if (p.risk.waterStress.level === 'critical' && p.risk.waterStress.soilMoisturePercent !== null && p.risk.waterStress.soilMoisturePercent < 15) {
      newAlerts.push({
        id: `ALT-WATER-${p.districtId}`,
        districtId: p.districtId,
        districtName: p.districtName,
        severity: 'critical',
        type: 'WATER_DEFICIT',
        title: `Critical Aquifer Deficit: ${p.districtName}`,
        description: `Over-exploited groundwater baseline with estimated topsoil moisture at ${p.risk.waterStress.soilMoisturePercent}%. Suggests severe local water deficit. [Topsoil moisture is ESTIMATED, not physically measured]`,
        metricObserved: `${p.risk.waterStress.soilMoisturePercent}% Saturation (ESTIMATED)`,
        thresholdValue: '< 15% Moisture + Over-Exploited Basin',
        timestamp: p.observation.time,
        source: 'CGWB Hydrogeological Report (Baseline) + Modeled Moisture',
        status: 'MONITORING',
        recommendedAction: 'Advisory: Prioritize municipal tanker equitable allocation and promote water conservation protocols.'
      });
    }
  });

  // Count genuine environmental warnings BEFORE potentially adding the neutral system-status notice.
  // The neutral notice must NOT be counted in activeWarningCount.
  const activeWarningCount = newAlerts.length;

  // If no genuine environmental warnings exist, add a SYSTEM_STATUS monitoring notice.
  // This notice uses type 'SYSTEM_STATUS' and severity 'low' so it cannot be mistaken
  // for a genuine environmental hazard alert.
  if (activeWarningCount === 0) {
    // Separate LIVE / BASELINE / UNAVAILABLE district counts explicitly
    let liveDistricts = 0;
    let baselineDistricts = 0;
    let unavailableDistricts = 0;
    this.profiles.forEach(p => {
      if (p.dataSource === 'LIVE') liveDistricts++;
      else if (p.dataSource === 'BASELINE' || p.dataSource === 'HISTORICAL') baselineDistricts++;
      else unavailableDistricts++;
    });

    newAlerts.push({
      id: 'SYS-NOMINAL',
      districtId: 'statewide',
      districtName: 'Statewide Karnataka',
      severity: 'low',
      type: 'SYSTEM_STATUS',
      title: 'Monitoring Active — No Severe Environmental Alerts',
      description: `No high-severity environmental thresholds breached in currently evaluated data. Coverage: ${liveDistricts} district(s) with live telemetry, ${baselineDistricts} district(s) on baseline normals, ${unavailableDistricts} district(s) with unavailable data. Active warning count: ${activeWarningCount}.`,
      metricObserved: `${activeWarningCount} active warnings`,
      thresholdValue: 'All monitored thresholds unbreached',
      timestamp: new Date().toISOString(),
      source: 'UrbanShield Environmental Telemetry Platform',
      status: 'MONITORING',
      recommendedAction: 'Maintain routine monitoring. Polling active at configured browser intervals.'
    });
  }

  this.alerts = newAlerts;
}

  // --- PUBLIC GETTERS ---

  public getAllProfiles(): DistrictEnvironmentalProfile[] {
    // Ensure all 31 districts are populated with baseline profiles synchronously
    if (this.profiles.size < KARNATAKA_DISTRICTS.length) {
      for (const d of KARNATAKA_DISTRICTS) {
        if (!this.profiles.has(d.id)) {
          const baseline = getDistrictBaseline(d.id);
          const now = new Date();
          const obs: WeatherObservation = {
            time: now.toISOString(),
            temperature: baseline.averageAnnualTemp,
            apparentTemperature: baseline.averageAnnualTemp,
            relativeHumidity: 55,
            precipitationRate: 0.0,
            precipitation24h: null,
            forecastPrecipitation24h: 0.0,
            precipitationSum7d: null,
            weatherCode: 1,
            weatherDescription: 'Clear / Baseline Reference',
            windSpeed: 10,
            soilMoisture: baseline.typicalSoilMoistureRange[0],
            soilMoistureMethod: 'BASELINE reference derived from CGWB hydrogeological survey'
          };
          const risk = evaluateDistrictRisk(d, obs, baseline);

          this.profiles.set(d.id, {
            districtId: d.id,
            districtName: d.name,
            kannadaName: d.kannadaName,
            division: d.division,
            coordinates: d.center,
            elevationMeters: baseline.elevationMeters,
            observation: obs,
            risk,
            hourlyTrends: [],
            dailyTrends: [],
            dataSource: 'BASELINE',
            providerName: this.baselineProvider.providerName,
            providerAttribution: this.baselineProvider.attribution,
            lastUpdated: now.toISOString(),
            isStale: false,
            baseline: {
              annualNormalRainfallMm: baseline.annualNormalRainfallMm,
              monsoonNormalRainfallMm: baseline.monsoonNormalRainfallMm,
              averageMaxTempSummer: baseline.averageMaxTempSummer,
              catchmentBasin: baseline.catchmentBasin
            }
          });
        }
      }
      this.regenerateAlerts();
    }

    return Array.from(this.profiles.values());
  }

  public getAlerts(): EnvironmentalAlert[] {
    if (this.alerts.length === 0) {
      this.regenerateAlerts();
    }
    return this.alerts;
  }

  public getFeedStatus(): EnvironmentalFeedStatus {
    const nextSyncTime = this.lastSuccessfulSync && this.autoRefreshEnabled
      ? new Date(new Date(this.lastSuccessfulSync).getTime() + (this.refreshIntervalSeconds * 1000)).toISOString()
      : null;

    // Count LIVE / BASELINE / UNAVAILABLE separately.
    // A BASELINE profile is not an "unavailable" profile — it has evaluated data from reference records.
    // UNAVAILABLE means the district has no profile at all, or dataSource is 'UNAVAILABLE'.
    let liveCount = 0;
    let baselineCount = 0;
    let unavailableCount = 0;
    this.profiles.forEach(p => {
      if (p.dataSource === 'LIVE') liveCount++;
      else if (p.dataSource === 'BASELINE' || p.dataSource === 'HISTORICAL') baselineCount++;
      else unavailableCount++;
    });
    // Any monitored district with no profile at all is unavailable
    unavailableCount += Math.max(0, KARNATAKA_DISTRICTS.length - (liveCount + baselineCount + unavailableCount));

    return {
      status: this.connectionStatus,
      sourceType: this.currentSourceType,
      primarySource: this.currentSourceType === 'LIVE' ? this.liveProvider.providerName : this.baselineProvider.providerName,
      attribution: this.currentSourceType === 'LIVE' ? this.liveProvider.attribution : this.baselineProvider.attribution,
      lastAttemptedSync: this.lastAttemptedSync,
      lastSuccessfulSync: this.lastSuccessfulSync,
      nextScheduledSync: nextSyncTime,
      refreshIntervalSeconds: this.refreshIntervalSeconds,
      autoRefreshEnabled: this.autoRefreshEnabled,
      // Active alert count excludes SYSTEM_STATUS notices — only genuine environmental warnings
      activeAlertCount: this.alerts.filter(a => a.type !== 'SYSTEM_STATUS' && (a.severity === 'critical' || a.severity === 'high')).length,
      monitoredDistrictsCount: KARNATAKA_DISTRICTS.length,
      totalLivePoints: liveCount,
      totalFallbackPoints: baselineCount,
      totalUnavailablePoints: unavailableCount,
      connectionLatencyMs: this.connectionLatencyMs,
      districtSyncResults: { ...this.districtSyncResults }
    };
  }

  public async manualRefresh(): Promise<void> {
    await this.refreshAllDistricts(true);
  }
}

export const environmentalService = new EnvironmentalService();
