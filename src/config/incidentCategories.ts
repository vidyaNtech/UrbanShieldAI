/**
 * UrbanShield AI - Problem Categories Configuration
 * Karnataka Urban Risk Intelligence and Citizen Response Platform
 */

import type { IncidentCategory } from '../types/incident';

export interface CategoryMetadata {
  id: IncidentCategory;
  label: string;
  iconName: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const INCIDENT_CATEGORIES: CategoryMetadata[] = [
  {
    id: 'potholes',
    label: 'Potholes',
    iconName: 'AlertCircle',
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    description: 'Crater formations, missing asphalt patches, and surface gouges.'
  },
  {
    id: 'road_damage',
    label: 'Road Damage',
    iconName: 'TrendingDown',
    color: '#EA580C',
    bgColor: '#FFF7ED',
    borderColor: '#FED7AA',
    description: 'Cave-ins, shoulder collapse, structural fissuring, and speed breaker decay.'
  },
  {
    id: 'blocked_drainage',
    label: 'Blocked Drainage',
    iconName: 'Waves',
    color: '#0284C7',
    bgColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    description: 'Choked stormwater drains (SWD), culvert debris, and silt accumulations.'
  },
  {
    id: 'waste_accumulation',
    label: 'Waste Accumulation',
    iconName: 'Trash2',
    color: '#65A30D',
    bgColor: '#F7FEE7',
    borderColor: '#D9F99D',
    description: 'Illegal black spots, construction debris dumping, and overflowing municipal bins.'
  },
  {
    id: 'flooding_waterlogging',
    label: 'Flooding and Waterlogging',
    iconName: 'CloudRain',
    color: '#2563EB',
    bgColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    description: 'Inundated junctions, monsoon backflow, low-lying submergence, and underpass waterlocks.'
  },
  {
    id: 'extreme_heat',
    label: 'Extreme Heat',
    iconName: 'Sun',
    color: '#DC2626',
    bgColor: '#FEF2F2',
    borderColor: '#FECACA',
    description: 'Urban heat islands, high thermal radiation anomalies, and micro-climate stress zones.'
  },
  {
    id: 'water_stress',
    label: 'Water Stress',
    iconName: 'Droplets',
    color: '#0D9488',
    bgColor: '#F0FDFA',
    borderColor: '#99F6E4',
    description: 'Severe borewell depletion, drinking water tanker bottlenecks, and aquifer deficit.'
  },
  {
    id: 'infrastructure_damage',
    label: 'Infrastructure Damage',
    iconName: 'Building2',
    color: '#7C3AED',
    bgColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    description: 'Flyover joint displacements, tilted electrical poles, and cracked retention walls.'
  },
  {
    id: 'environmental_risks',
    label: 'Environmental Risks',
    iconName: 'Wind',
    color: '#059669',
    bgColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    description: 'Toxic lake foaming, high particulate air pollution (AQI), and industrial discharge.'
  },
  {
    id: 'other_civic',
    label: 'Other Civic Problem',
    iconName: 'HelpCircle',
    color: '#64748B',
    bgColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    description: 'General urban safety hazards, missing signage, street lighting defects, or civic nuisances.'
  }
];

export function getCategoryMeta(category: IncidentCategory): CategoryMetadata {
  return INCIDENT_CATEGORIES.find(c => c.id === category) || INCIDENT_CATEGORIES[0];
}
