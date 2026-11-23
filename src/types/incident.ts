/**
 * UrbanShield AI - Incident & Geospatial Types
 * Karnataka Urban Risk Intelligence and Citizen Response Platform
 */

export type IncidentCategory = 
  | 'potholes'
  | 'road_damage'
  | 'blocked_drainage'
  | 'waste_accumulation'
  | 'flooding_waterlogging'
  | 'extreme_heat'
  | 'water_stress'
  | 'infrastructure_damage'
  | 'environmental_risks'
  | 'other_civic';

export type IncidentSeverity = 'critical' | 'high' | 'moderate' | 'low';

export type IncidentStatus = 
  | 'submitted'
  | 'under_verification'
  | 'reported'
  | 'verified'
  | 'prioritized'
  | 'assigned'
  | 'in_progress'
  | 'under_service'
  | 'resolution_submitted'
  | 'awaiting_verification'
  | 'resolved'
  | 'rejected'
  | 'reopened';

export type SafetyHazardIndicator = 
  | 'traffic_obstruction'
  | 'risk_to_pedestrians'
  | 'water_accumulation'
  | 'property_damage'
  | 'immediate_safety_concern';

export interface ReportPhotoEvidence {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
  uploadedAt: string;
}

export interface CitizenProblemReportInput {
  category: IncidentCategory;
  title: string;
  description: string;
  observedSeverity: IncidentSeverity;
  firstObserved?: string;
  safetyIndicators: SafetyHazardIndicator[];
  
  // Location
  state: string; // "Karnataka"
  district: string;
  cityOrTown: string;
  area: string;
  landmark?: string;
  latitude?: number;
  longitude?: number;
  locationVerified: boolean;
  
  // Evidence
  photos: ReportPhotoEvidence[];
  
  // Citizen Details
  reportedByUserId?: string;
  reportedByUserName?: string;
  reportedByUserEmail?: string;
}

export interface UrbanIncident {
  id: string; // e.g. 'KA-BLR-2026-0814'
  title: string;
  category: IncidentCategory;
  severity: IncidentSeverity;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  district: string;
  cityOrTown: string;
  area: string;
  landmark?: string;
  description: string;
  reportedAt: string;
  updatedAt: string;
  reportCount: number;
  reportedByRole?: string;
  assignedUnit?: string;
  imageUrls?: string[];
  dataSource: string; // e.g. "Citizen Mobile Telemetry", "KDMA Stormwater Sensor"
  verificationStatus: 'verified' | 'unverified' | 'citizen_confirmed' | 'field_audited';
  resolutionNotes?: string;
  resolvedAt?: string;
  citizenReportedSeverity?: IncidentSeverity;
  safetyIndicators?: SafetyHazardIndicator[];
  firstObserved?: string;
  reportedByUserId?: string;
  reportedByUserName?: string;
  reportedByUserEmail?: string;
  evidencePhotos?: ReportPhotoEvidence[];

  // Task 05: Resolution Tracking & Lifecycle Workflow Extensions
  history?: IncidentHistoryEvent[];
  assignedTeam?: string;
  assignedAt?: string;
  assignedBy?: string;
  estimatedCompletionDate?: string;
  priorityNotes?: string;
  verificationNotes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  workProgressNotes?: WorkProgressNote[];
  resolutionSummary?: string;
  resolutionWorkCompletedAt?: string;
  resolutionNotesDetail?: string;
  resolutionSubmittedBy?: string;
  resolutionSubmittedAt?: string;
  resolutionEvidencePhotos?: ReportPhotoEvidence[];
  resolutionVerifiedBy?: string;
  resolutionVerifiedAt?: string;
  resolutionAuditNotes?: string;
  potentialRecurringMatch?: PotentialRecurringMatch;
}

export interface IncidentHistoryEvent {
  id: string;
  previousStatus: IncidentStatus;
  newStatus: IncidentStatus;
  action: string;
  actorRole: string;
  actorName: string;
  timestamp: string;
  notes?: string;
  evidencePhotoUrl?: string;
}

export interface WorkProgressNote {
  id: string;
  note: string;
  author: string;
  authorRole: string;
  timestamp: string;
}

export interface PotentialRecurringMatch {
  relatedIncidentId: string;
  relatedIncidentTitle: string;
  previousResolutionDate?: string;
  previousReportDate: string;
  daysSinceResolution?: number;
  distanceKm: number;
  similarityReason: string;
}

export interface VerifyIncidentInput {
  incidentId: string;
  verifiedBy: string;
  actorRole?: string;
  notes: string;
  confirmedSeverity?: IncidentSeverity;
}

export interface RejectIncidentInput {
  incidentId: string;
  rejectedBy: string;
  actorRole?: string;
  rejectionReason: string;
}

export interface PrioritizeIncidentInput {
  incidentId: string;
  priority: IncidentSeverity;
  priorityNotes?: string;
  actorName: string;
  actorRole?: string;
}

export interface AssignIncidentInput {
  incidentId: string;
  assignedTeam: string;
  estimatedCompletionDate?: string;
  instructions?: string;
  assignedBy: string;
  actorRole?: string;
}

export interface StartWorkInput {
  incidentId: string;
  startedBy: string;
  actorRole?: string;
  notes?: string;
}

export interface AddProgressNoteInput {
  incidentId: string;
  note: string;
  author: string;
  authorRole?: string;
}

export interface SubmitResolutionInput {
  incidentId: string;
  resolutionSummary: string;
  workCompletionDate: string;
  resolutionNotes?: string;
  evidencePhotos?: ReportPhotoEvidence[];
  submittedBy: string;
  actorRole?: string;
}

export interface VerifyResolutionInput {
  incidentId: string;
  verifiedBy: string;
  actorRole?: string;
  verificationNotes: string;
}

export interface RequestFurtherWorkInput {
  incidentId: string;
  requestedBy: string;
  actorRole?: string;
  reason: string;
}

export interface KarnatakaDistrict {
  id: string;
  name: string;
  kannadaName: string;
  division: 'Bengaluru' | 'Mysuru' | 'Belagavi' | 'Kalaburagi';
  center: [number, number]; // [lat, lng]
  zoomLevel: number;
  vulnerabilityIndex: number; // 0 - 100
  headquarters: string;
  keyRisks: string[];
}

export type MapLayerType = 
  | 'standard'
  | 'satellite'
  | 'density'
  | 'severity'
  | 'flood'
  | 'heat'
  | 'environmental';

export interface IncidentFilterState {
  category?: IncidentCategory | 'all';
  severity?: IncidentSeverity | 'all';
  status?: 'all' | 'unresolved' | 'resolved' | IncidentStatus;
  district?: string | 'all';
  searchQuery?: string;
  quickFilter?: 'all' | 'critical' | 'high' | 'moderate' | 'today' | 'unresolved' | 'resolved';
}

export interface AiRiskInsight {
  id: string;
  title: string;
  explanation: string;
  location: string;
  district: string;
  coordinates: [number, number];
  zoom: number;
  severity: IncidentSeverity;
  supportingEvidence: string;
  category: IncidentCategory;
  incidentId?: string;
}
