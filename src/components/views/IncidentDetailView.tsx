import React, { useState, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { NavIcon } from '../common/NavIcon';
import { 
  incidentService, 
  getStatusDisplayName, 
  getStatusBadgeVariant, 
  formatResolutionDuration 
} from '../../services/incidentService';
import { getCategoryMeta } from '../../config/incidentCategories';
import type { 
  IncidentStatus, 
  IncidentSeverity, 
  ReportPhotoEvidence 
} from '../../types/incident';
import type { UserProfile } from '../../types/auth';
import { 
  ArrowLeft, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Shield, 
  Briefcase, 
  FileCheck, 
  RotateCcw, 
  Sparkles, 
  Repeat, 
  X
} from 'lucide-react';

interface IncidentDetailViewProps {
  incidentId: string;
  user?: UserProfile;
  onNavigateBack: () => void;
  onFocusOnMap: (coords: [number, number], zoom: number) => void;
  onNavigateToIncident?: (id: string) => void;
}

const SERVICE_TEAMS = [
  'BBMP Ward 150 Quick Response Engineering Gang',
  'KDMA Rapid Flood Mitigation & De-Watering Taskforce',
  'PWD Karnataka State Asphalt & Highway Maintenance Division',
  'BWSSB Emergency Drainage & Sewerage Operations Unit',
  'BESCOM High-Tension Power & Pole Restoration Crew',
  'Karnataka Fire & Emergency Services Heavy Rescue Unit',
  'District Urban Development Cell (DUDC) Field Squad'
];

export const IncidentDetailView: React.FC<IncidentDetailViewProps> = ({
  incidentId,
  user,
  onNavigateBack,
  onFocusOnMap,
  onNavigateToIncident
}) => {
  const [, setStoreVersion] = useState(0);

  // Modal / Form States for Authority Actions
  const [activeModal, setActiveModal] = useState<
    'verify' | 'reject' | 'prioritize' | 'assign' | 'progress_note' | 'submit_resolution' | 'verify_resolution' | 'further_work' | null
  >(null);

  // Form Inputs
  const [notesInput, setNotesInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [priorityInput, setPriorityInput] = useState<IncidentSeverity>('high');
  const [teamInput, setTeamInput] = useState(SERVICE_TEAMS[0]);
  const [slaInput, setSlaInput] = useState('2026-10-30 18:00');
  const [instructionsInput, setInstructionsInput] = useState('');
  const [resolutionSummaryInput, setResolutionSummaryInput] = useState('');
  const [completionDateInput, setCompletionDateInput] = useState('2026-10-28 16:30');
  const [resolutionPhotos, setResolutionPhotos] = useState<ReportPhotoEvidence[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Lightbox preview state
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);

  // Subscribe to updates from incidentService
  useEffect(() => {
    return incidentService.subscribe(() => {
      setStoreVersion(v => v + 1);
    });
  }, []);

  const incident = incidentService.getIncidentById(incidentId);

  if (!incident) {
    return (
      <div style={{ maxWidth: '800px', margin: '2rem auto', textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.5rem' }}>
          Incident Record Not Found
        </h2>
        <p style={{ color: 'var(--text-muted, #64748b)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          No active or historical incident ticket matches identifier <code style={{ fontFamily: 'monospace' }}>{incidentId}</code>.
        </p>
        <button type="button" onClick={onNavigateBack} className="primary-btn" style={{ width: 'auto', margin: '0 auto' }}>
          <ArrowLeft size={16} />
          <span>Return to Previous View</span>
        </button>
      </div>
    );
  }

  const catMeta = getCategoryMeta(incident.category);
  const isAuthority = user?.role === 'authority' || user?.role === 'administrator';

  // 7 core sequential lifecycle stages
  const lifecycleStages: Array<{ key: IncidentStatus; label: string }> = [
    { key: 'submitted', label: '1. Submitted' },
    { key: 'verified', label: '2. Verified' },
    { key: 'prioritized', label: '3. Prioritized' },
    { key: 'assigned', label: '4. Assigned' },
    { key: 'in_progress', label: '5. In Progress' },
    { key: 'resolution_submitted', label: '6. Resolution Submitted' },
    { key: 'resolved', label: '7. Resolved' }
  ];

  // Map status aliases to linear index
  const getStageIndex = (status: IncidentStatus): number => {
    switch (status) {
      case 'submitted':
      case 'under_verification':
      case 'reported':
        return 0;
      case 'verified':
        return 1;
      case 'prioritized':
        return 2;
      case 'assigned':
        return 3;
      case 'in_progress':
      case 'under_service':
        return 4;
      case 'resolution_submitted':
      case 'awaiting_verification':
        return 5;
      case 'resolved':
        return 6;
      case 'rejected':
        return -1;
      default:
        return 0;
    }
  };

  const currentStageIndex = getStageIndex(incident.status);
  const isRejected = incident.status === 'rejected';

  // Reset modal state
  const closeModal = () => {
    setActiveModal(null);
    setErrorMsg(null);
    setNotesInput('');
    setReasonInput('');
    setInstructionsInput('');
    setResolutionSummaryInput('');
    setResolutionPhotos([]);
  };

  // Authority Handlers
  const handleVerifyReport = () => {
    if (!notesInput.trim()) {
      setErrorMsg('Verification audit notes are required.');
      return;
    }
    try {
      setIsProcessing(true);
      incidentService.verifyIncident({
        incidentId: incident.id,
        verifiedBy: user?.fullName || 'Superintendent Officer (BBMP)',
        actorRole: user?.role || 'authority',
        notes: notesInput.trim(),
        confirmedSeverity: priorityInput
      });
      closeModal();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to verify incident.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectReport = () => {
    if (!reasonInput.trim() || reasonInput.trim().length < 5) {
      setErrorMsg('A detailed rejection reason (minimum 5 characters) is mandatory.');
      return;
    }
    try {
      setIsProcessing(true);
      incidentService.rejectIncident({
        incidentId: incident.id,
        rejectedBy: user?.fullName || 'Triage Officer',
        actorRole: user?.role || 'authority',
        rejectionReason: reasonInput.trim()
      });
      closeModal();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to reject incident.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrioritize = () => {
    try {
      setIsProcessing(true);
      incidentService.prioritizeIncident({
        incidentId: incident.id,
        priority: priorityInput,
        priorityNotes: notesInput.trim() || undefined,
        actorName: user?.fullName || 'Emergency Coordinator',
        actorRole: user?.role || 'authority'
      });
      closeModal();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to update priority.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAssignTeam = () => {
    if (!teamInput.trim()) {
      setErrorMsg('Please select a responsible service team.');
      return;
    }
    try {
      setIsProcessing(true);
      incidentService.assignIncident({
        incidentId: incident.id,
        assignedTeam: teamInput.trim(),
        estimatedCompletionDate: slaInput.trim() || undefined,
        instructions: instructionsInput.trim() || undefined,
        assignedBy: user?.fullName || 'Zonal Engineer',
        actorRole: user?.role || 'authority'
      });
      closeModal();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to assign team.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartWork = () => {
    try {
      setIsProcessing(true);
      incidentService.startWork({
        incidentId: incident.id,
        startedBy: user?.fullName || 'Field Crew Lead',
        actorRole: user?.role || 'authority',
        notes: 'Remediation crew mobilized with required equipment and site safety cordon.'
      });
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to start work.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddProgressNote = () => {
    if (!notesInput.trim()) {
      setErrorMsg('Note content cannot be empty.');
      return;
    }
    try {
      setIsProcessing(true);
      incidentService.addProgressNote({
        incidentId: incident.id,
        note: notesInput.trim(),
        author: user?.fullName || 'Field Supervisor',
        authorRole: user?.role || 'authority'
      });
      closeModal();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to add progress note.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmitResolution = () => {
    if (!resolutionSummaryInput.trim() || resolutionSummaryInput.trim().length < 5) {
      setErrorMsg('A detailed resolution summary (minimum 5 characters) is mandatory.');
      return;
    }
    if (!completionDateInput.trim()) {
      setErrorMsg('Work completion date and time are required.');
      return;
    }
    try {
      setIsProcessing(true);
      incidentService.submitResolution({
        incidentId: incident.id,
        resolutionSummary: resolutionSummaryInput.trim(),
        workCompletionDate: completionDateInput.trim(),
        resolutionNotes: notesInput.trim() || undefined,
        evidencePhotos: resolutionPhotos,
        submittedBy: user?.fullName || 'Lead Engineer Gang #4',
        actorRole: user?.role || 'authority'
      });
      closeModal();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit resolution.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyResolution = () => {
    if (!notesInput.trim() || notesInput.trim().length < 3) {
      setErrorMsg('Verification audit inspection notes are mandatory to officially close ticket.');
      return;
    }
    try {
      setIsProcessing(true);
      incidentService.verifyResolution({
        incidentId: incident.id,
        verifiedBy: user?.fullName || 'Municipal Auditor (BBMP / KDMA)',
        actorRole: user?.role || 'authority',
        verificationNotes: notesInput.trim()
      });
      closeModal();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to verify resolution.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestFurtherWork = () => {
    if (!reasonInput.trim() || reasonInput.trim().length < 5) {
      setErrorMsg('A specific explanation (minimum 5 characters) of why further work is required is mandatory.');
      return;
    }
    try {
      setIsProcessing(true);
      incidentService.requestFurtherWork({
        incidentId: incident.id,
        requestedBy: user?.fullName || 'Supervisory Auditor',
        actorRole: user?.role || 'authority',
        reason: reasonInput.trim()
      });
      closeModal();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to request further work.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Photo Attachment for Resolution
  const handleResolutionPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (loadEvt) => {
        if (loadEvt.target?.result) {
          setResolutionPhotos([
            {
              id: `photo-res-${Date.now()}`,
              name: file.name,
              size: file.size,
              dataUrl: loadEvt.target.result as string,
              uploadedAt: new Date().toISOString()
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="incident-detail-container" style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <PageHeader
        title={incident.title}
        subtitle={`${incident.area}, ${incident.cityOrTown} (${incident.district}) • Ticket: ${incident.id}`}
        badge={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <StatusBadge
              label={`SEVERITY: ${incident.severity.toUpperCase()}`}
              variant={incident.severity === 'critical' ? 'critical' : incident.severity === 'high' ? 'high_risk' : 'warning'}
            />
            <StatusBadge
              label={getStatusDisplayName(incident.status)}
              variant={getStatusBadgeVariant(incident.status)}
            />
          </div>
        }
        breadcrumbs={[
          { label: isAuthority ? 'Authority Operations' : 'Citizen Portal', path: isAuthority ? '#/authority/incoming-reports' : '#/citizen/my-reports' },
          { label: 'Incident Lifecycle & Tracking', path: '#/resolution-tracking' },
          { label: incident.id, isCurrent: true }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={onNavigateBack}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.875rem',
                backgroundColor: 'var(--bg-card, #ffffff)',
                color: 'var(--text-main, #1e293b)',
                border: '1px solid var(--border-color, #cbd5e1)',
                borderRadius: 'var(--radius-md, 6px)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={15} />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => onFocusOnMap([incident.latitude, incident.longitude], 15)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.875rem',
                backgroundColor: '#0d9488',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-md, 6px)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <MapPin size={15} />
              <span>Locate on GIS Map</span>
            </button>
          </div>
        }
      />

      {/* 8-Stage Sequential Lifecycle Progression Bar */}
      <div 
        style={{
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderRadius: 'var(--radius-lg, 10px)',
          border: '1px solid var(--border-color, #cbd5e1)',
          padding: '1.25rem 1.5rem',
          boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: '#0d9488', letterSpacing: '0.5px' }}>
            Formal Incident Lifecycle Progression
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
            Current State: <strong>{getStatusDisplayName(incident.status)}</strong>
          </span>
        </div>

        {isRejected ? (
          <div 
            style={{
              padding: '1rem',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 'var(--radius-md, 8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#991b1b'
            }}
          >
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Report Rejected by Triage Desk:</strong> {incident.rejectionReason}
              <div style={{ fontSize: '0.75rem', color: '#b91c1c', marginTop: '2px' }}>
                Rejected on {new Date(incident.rejectedAt || incident.updatedAt).toLocaleString('en-IN')}. This ticket remains in historical records.
              </div>
            </div>
          </div>
        ) : (
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflowX: 'auto',
              paddingBottom: '0.5rem'
            }}
          >
            {lifecycleStages.map((stage, idx) => {
              const isCompleted = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx;

              return (
                <React.Fragment key={stage.key}>
                  <div 
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      minWidth: '100px',
                      position: 'relative',
                      zIndex: 2
                    }}
                  >
                    <div 
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: isCurrent 
                          ? '#0d9488' 
                          : isCompleted 
                            ? '#10b981' 
                            : 'var(--bg-muted, #f1f5f9)',
                        color: isCurrent || isCompleted ? '#ffffff' : 'var(--text-muted, #94a3b8)',
                        border: isCurrent 
                          ? '2px solid #0d9488' 
                          : isCompleted 
                            ? '2px solid #10b981' 
                            : '1px solid var(--border-color, #cbd5e1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        marginBottom: '0.35rem',
                        boxShadow: isCurrent ? '0 0 0 3px rgba(13, 148, 136, 0.2)' : 'none'
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>
                    <span 
                      style={{
                        fontSize: '0.6875rem',
                        fontWeight: isCurrent ? 700 : 500,
                        color: isCurrent ? '#0d9488' : isCompleted ? 'var(--text-main, #1e293b)' : 'var(--text-muted, #94a3b8)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {stage.label}
                    </span>
                  </div>

                  {idx < lifecycleStages.length - 1 && (
                    <div 
                      style={{
                        flex: 1,
                        height: '2px',
                        backgroundColor: isCompleted ? '#10b981' : 'var(--border-color, #e2e8f0)',
                        margin: '0 0.5rem',
                        minWidth: '20px'
                      }} 
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Details, Photos, Evidence, Timeline, Recurring detection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Card 1: Problem Overview & Description */}
          <div 
            style={{
              backgroundColor: 'var(--bg-card, #ffffff)',
              borderRadius: 'var(--radius-lg, 10px)',
              border: '1px solid var(--border-color, #cbd5e1)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: catMeta.bgColor,
                  color: catMeta.color,
                  border: `1px solid ${catMeta.borderColor}`,
                  fontSize: '0.8125rem',
                  fontWeight: 600
                }}
              >
                <NavIcon name={catMeta.iconName} size={15} />
                {catMeta.label}
              </div>

              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                Reported {new Date(incident.reportedAt).toLocaleString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>

            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', margin: '0 0 0.5rem 0' }}>
                Observed Problem Statement
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted, #475569)', lineHeight: 1.6, margin: 0 }}>
                {incident.description}
              </p>
            </div>

            {incident.firstObserved && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>
                <strong>First Observed:</strong> {incident.firstObserved}
              </div>
            )}

            {/* Safety Indicators */}
            {incident.safetyIndicators && incident.safetyIndicators.length > 0 && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '0.375rem' }}>
                  Safety & Hazard Indicators
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {incident.safetyIndicators.map(ind => (
                    <span 
                      key={ind}
                      style={{
                        padding: '2px 8px',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #cbd5e1',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        color: 'var(--text-main, #334155)',
                        fontWeight: 500
                      }}
                    >
                      {ind.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Submitted Photos */}
            {incident.evidencePhotos && incident.evidencePhotos.length > 0 && (
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '0.5rem' }}>
                  Citizen Submitted Photographic Evidence ({incident.evidencePhotos.length})
                </span>
                <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.375rem' }}>
                  {incident.evidencePhotos.map((photo, pIdx) => (
                    <div 
                      key={photo.id}
                      onClick={() => setPreviewPhotoUrl(photo.dataUrl)}
                      style={{
                        width: '110px',
                        height: '90px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative',
                        flexShrink: 0
                      }}
                    >
                      <img 
                        src={photo.dataUrl} 
                        alt={photo.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <span 
                        style={{
                          position: 'absolute',
                          bottom: '3px',
                          left: '3px',
                          backgroundColor: 'rgba(0,0,0,0.65)',
                          color: '#fff',
                          fontSize: '10px',
                          padding: '1px 4px',
                          borderRadius: '2px'
                        }}
                      >
                        Photo #{pIdx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Potential Recurring Problem Detection Card (Requirement 9) */}
          {incident.potentialRecurringMatch && (
            <div 
              style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: 'var(--radius-lg, 10px)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: 700, fontSize: '0.875rem' }}>
                <Repeat size={18} />
                <span>Potential Recurring Problem Indicator</span>
              </div>

              <p style={{ margin: 0, fontSize: '0.8125rem', color: '#92400e', lineHeight: 1.45 }}>
                {incident.potentialRecurringMatch.similarityReason}. This suggests a chronic drainage, asphalt, or civic structural bottleneck requiring root-cause engineering review.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.75rem' }}>
                <div>
                  <span style={{ color: '#78350f' }}>Related Historical Ticket:</span>
                  <div style={{ fontWeight: 700, color: '#92400e', fontFamily: 'monospace' }}>
                    {incident.potentialRecurringMatch.relatedIncidentId}
                  </div>
                </div>

                <div>
                  <span style={{ color: '#78350f' }}>Previous Resolution Date:</span>
                  <div style={{ fontWeight: 600, color: '#92400e' }}>
                    {incident.potentialRecurringMatch.previousResolutionDate
                      ? new Date(incident.potentialRecurringMatch.previousResolutionDate).toLocaleDateString('en-IN')
                      : 'Earlier report on file'}
                  </div>
                </div>

                {incident.potentialRecurringMatch.daysSinceResolution !== undefined && (
                  <div>
                    <span style={{ color: '#78350f' }}>Recurrence Gap:</span>
                    <div style={{ fontWeight: 700, color: '#b45309' }}>
                      ~{incident.potentialRecurringMatch.daysSinceResolution} days since last resolution
                    </div>
                  </div>
                )}
              </div>

              {onNavigateToIncident && (
                <button
                  type="button"
                  onClick={() => onNavigateToIncident(incident.potentialRecurringMatch!.relatedIncidentId)}
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: '0.375rem',
                    background: 'none',
                    border: 'none',
                    color: '#b45309',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  View Historical Incident #{incident.potentialRecurringMatch.relatedIncidentId} →
                </button>
              )}
            </div>
          )}

          {/* Resolution & Verification Evidence (Before and After Comparison) */}
          {(incident.status === 'resolution_submitted' || incident.status === 'resolved') && (
            <div 
              style={{
                backgroundColor: 'var(--bg-card, #ffffff)',
                borderRadius: 'var(--radius-lg, 10px)',
                border: '1px solid #10b981',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#065f46', fontWeight: 700 }}>
                  <FileCheck size={18} />
                  <span>Resolution Evidence & Repair Audit</span>
                </div>
                <span 
                  style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    backgroundColor: incident.status === 'resolved' ? '#ecfdf5' : '#f0f9ff',
                    color: incident.status === 'resolved' ? '#065f46' : '#0369a1',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  {incident.status === 'resolved' ? 'Verified & Closed' : 'Pending Verification'}
                </span>
              </div>

              {/* Resolution Summary */}
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '2px' }}>
                  Remediation Summary (Mandatory Submission)
                </span>
                <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-main, #0f172a)' }}>
                  {incident.resolutionSummary || 'Resolution details recorded.'}
                </p>
                {incident.resolutionNotesDetail && (
                  <p style={{ margin: '0.375rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-muted, #475569)' }}>
                    {incident.resolutionNotesDetail}
                  </p>
                )}
              </div>

              {/* Time to resolution */}
              {incident.status === 'resolved' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#065f46', backgroundColor: '#f0fdf4', padding: '0.5rem 0.75rem', borderRadius: '6px' }}>
                  <Clock size={15} />
                  <span>Total Time to Resolution: <strong>{formatResolutionDuration(incident.reportedAt, incident.resolvedAt)}</strong></span>
                </div>
              )}

              {/* Before and After Photographic Evidence Comparison (Section 8) */}
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', display: 'block', marginBottom: '0.5rem' }}>
                  Before & After Visual Audit Comparison
                </span>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {/* Before Box */}
                  <div 
                    style={{
                      border: '1px solid var(--border-color, #cbd5e1)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#f8fafc'
                    }}
                  >
                    <div style={{ padding: '0.375rem 0.65rem', backgroundColor: '#f1f5f9', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>
                      BEFORE (Reported Hazard)
                    </div>
                    <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {incident.evidencePhotos && incident.evidencePhotos.length > 0 ? (
                        <img 
                          src={incident.evidencePhotos[0].dataUrl} 
                          alt="Before remediation" 
                          onClick={() => setPreviewPhotoUrl(incident.evidencePhotos![0].dataUrl)}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} 
                        />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic' }}>
                          No evidence uploaded
                        </span>
                      )}
                    </div>
                  </div>

                  {/* After Box */}
                  <div 
                    style={{
                      border: '1px solid var(--border-color, #cbd5e1)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      backgroundColor: '#f8fafc'
                    }}
                  >
                    <div style={{ padding: '0.375rem 0.65rem', backgroundColor: '#f1f5f9', fontSize: '0.75rem', fontWeight: 700, color: '#065f46' }}>
                      AFTER (Completed Repair)
                    </div>
                    <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {incident.resolutionEvidencePhotos && incident.resolutionEvidencePhotos.length > 0 ? (
                        <img 
                          src={incident.resolutionEvidencePhotos[0].dataUrl} 
                          alt="After repair" 
                          onClick={() => setPreviewPhotoUrl(incident.resolutionEvidencePhotos![0].dataUrl)}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} 
                        />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic' }}>
                          No evidence uploaded
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {incident.resolutionAuditNotes && (
                <div style={{ fontSize: '0.8125rem', color: '#047857', borderTop: '1px solid #d1fae5', paddingTop: '0.5rem' }}>
                  <strong>Municipal Auditor Verification Sign-Off:</strong> {incident.resolutionAuditNotes}
                  <div style={{ fontSize: '0.75rem', color: '#065f46', marginTop: '2px' }}>
                    Verified by {incident.resolutionVerifiedBy} on {new Date(incident.resolutionVerifiedAt || incident.updatedAt).toLocaleString('en-IN')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Work Progress Notes List */}
          {incident.workProgressNotes && incident.workProgressNotes.length > 0 && (
            <div 
              style={{
                backgroundColor: 'var(--bg-card, #ffffff)',
                borderRadius: 'var(--radius-lg, 10px)',
                border: '1px solid var(--border-color, #cbd5e1)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                Field Work Progress Log ({incident.workProgressNotes.length})
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {incident.workProgressNotes.map(wp => (
                  <div 
                    key={wp.id}
                    style={{
                      padding: '0.625rem 0.875rem',
                      borderRadius: '6px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.8125rem'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted, #64748b)', fontSize: '0.75rem', marginBottom: '3px' }}>
                      <strong>{wp.author} ({wp.authorRole})</strong>
                      <span>{new Date(wp.timestamp).toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ color: 'var(--text-main, #1e293b)' }}>{wp.note}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chronological Audit Trail & History (Requirement 11) */}
          <div 
            style={{
              backgroundColor: 'var(--bg-card, #ffffff)',
              borderRadius: 'var(--radius-lg, 10px)',
              border: '1px solid var(--border-color, #cbd5e1)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={18} style={{ color: '#0d9488' }} />
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                  Chronological Incident Audit Trail
                </h4>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                Immutable Lifecycle Log
              </span>
            </div>

            <div style={{ position: 'relative', paddingLeft: '1.25rem', borderLeft: '2px solid #e2e8f0', marginLeft: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {(incident.history || []).map((evt) => (
                <div key={evt.id} style={{ position: 'relative' }}>
                  {/* Dot */}
                  <div 
                    style={{
                      position: 'absolute',
                      left: '-1.625rem',
                      top: '3px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: evt.newStatus === 'resolved' 
                        ? '#10b981' 
                        : evt.newStatus === 'rejected' 
                          ? '#ef4444' 
                          : '#0d9488',
                      border: '2px solid #ffffff',
                      boxShadow: '0 0 0 2px rgba(0,0,0,0.1)'
                    }} 
                  />

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.25rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main, #1e293b)' }}>
                      {evt.action}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
                      {new Date(evt.timestamp).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 600, marginTop: '2px' }}>
                    Actor: {evt.actorName} ({evt.actorRole.toUpperCase()})
                  </div>

                  {evt.notes && (
                    <p style={{ margin: '0.375rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-muted, #475569)', lineHeight: 1.45 }}>
                      {evt.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Telemetry Metadata & Authority Interactive Action Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Authority Contextual Action Panel (Requirement 6, 7, 12) */}
          {isAuthority && (
            <div 
              style={{
                backgroundColor: 'var(--bg-card, #ffffff)',
                borderRadius: 'var(--radius-lg, 10px)',
                border: '1.5px solid #0d9488',
                padding: '1.5rem',
                boxShadow: '0 4px 12px rgba(13, 148, 136, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0d9488' }}>
                <Shield size={18} />
                <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                  Authority Operations Dispatch
                </h4>
              </div>

              <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)', lineHeight: 1.4 }}>
                Active role: <strong>{user?.role.toUpperCase()}</strong>. Execute verified lifecycle operations below.
              </p>

              {/* Contextual Actions based on incident status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {/* 1. If SUBMITTED / UNDER_VERIFICATION: Verify or Reject */}
                {(incident.status === 'submitted' || incident.status === 'under_verification' || incident.status === 'reported') && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveModal('verify')}
                      style={{
                        padding: '0.625rem 1rem',
                        backgroundColor: '#0d9488',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-md, 6px)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      Verify Incident Report
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModal('reject')}
                      style={{
                        padding: '0.55rem 1rem',
                        backgroundColor: '#ffffff',
                        color: '#dc2626',
                        border: '1px solid #fecaca',
                        borderRadius: 'var(--radius-md, 6px)',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <X size={15} />
                      Reject Report (With Reason)
                    </button>
                  </>
                )}

                {/* 2. If VERIFIED: Set Priority first, then assign */}
                {incident.status === 'verified' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveModal('prioritize')}
                      style={{
                        padding: '0.625rem 1rem',
                        backgroundColor: '#0d9488',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-md, 6px)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Shield size={16} />
                      Set Priority Level
                    </button>

                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                      ⓘ Assignment requires prioritization first.
                    </p>
                  </>
                )}

                {/* 3. If PRIORITIZED: Assign Team */}
                {incident.status === 'prioritized' && (
                  <button
                    type="button"
                    onClick={() => setActiveModal('assign')}
                    style={{
                      padding: '0.625rem 1rem',
                      backgroundColor: '#0d9488',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 'var(--radius-md, 6px)',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Briefcase size={16} />
                    Assign Service Team
                  </button>
                )}

                {/* 4. If ASSIGNED: Start Work */}
                {incident.status === 'assigned' && (
                  <>
                    <button
                      type="button"
                      onClick={handleStartWork}
                      disabled={isProcessing}
                      style={{
                        padding: '0.625rem 1rem',
                        backgroundColor: '#0d9488',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-md, 6px)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <Sparkles size={16} />
                      Commence Work (On-Site)
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModal('progress_note')}
                      style={{
                        padding: '0.55rem 1rem',
                        backgroundColor: '#ffffff',
                        color: '#1e293b',
                        border: '1px solid #cbd5e1',
                        borderRadius: 'var(--radius-md, 6px)',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        cursor: 'pointer'
                      }}
                    >
                      Add Progress Note
                    </button>
                  </>
                )}

                {/* 5. If IN_PROGRESS: Add note or Submit Resolution */}
                {(incident.status === 'in_progress' || incident.status === 'under_service') && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveModal('submit_resolution')}
                      style={{
                        padding: '0.625rem 1rem',
                        backgroundColor: '#0d9488',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-md, 6px)',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <FileCheck size={16} />
                      Submit Resolution Evidence
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModal('progress_note')}
                      style={{
                        padding: '0.55rem 1rem',
                        backgroundColor: '#ffffff',
                        color: '#1e293b',
                        border: '1px solid #cbd5e1',
                        borderRadius: 'var(--radius-md, 6px)',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        cursor: 'pointer'
                      }}
                    >
                      Add Progress Note
                    </button>
                  </>
                )}

                {/* 6. If RESOLUTION_SUBMITTED: Verify Resolution or Request Further Work */}
                {(incident.status === 'resolution_submitted' || incident.status === 'awaiting_verification') && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActiveModal('verify_resolution')}
                      style={{
                        padding: '0.625rem 1rem',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--radius-md, 6px)',
                        fontWeight: 700,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <CheckCircle2 size={16} />
                      Verify Resolution & Close Ticket
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveModal('further_work')}
                      style={{
                        padding: '0.55rem 1rem',
                        backgroundColor: '#ffffff',
                        color: '#b45309',
                        border: '1px solid #fde68a',
                        borderRadius: 'var(--radius-md, 6px)',
                        fontWeight: 600,
                        fontSize: '0.8125rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem'
                      }}
                    >
                      <RotateCcw size={15} />
                      Request Further Work
                    </button>
                  </>
                )}

                {/* 7. If RESOLVED or REJECTED */}
                {incident.status === 'resolved' && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#ecfdf5', borderRadius: '6px', fontSize: '0.8125rem', color: '#065f46', textAlign: 'center', fontWeight: 600 }}>
                    ✓ This incident is officially resolved and archived in resolution history.
                  </div>
                )}

                {incident.status === 'rejected' && (
                  <div style={{ padding: '0.75rem', backgroundColor: '#fef2f2', borderRadius: '6px', fontSize: '0.8125rem', color: '#991b1b', textAlign: 'center', fontWeight: 600 }}>
                    ✕ This report was rejected by municipal triage.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Telemetry Metadata Card */}
          <div 
            style={{
              backgroundColor: 'var(--bg-card, #ffffff)',
              borderRadius: 'var(--radius-lg, 10px)',
              border: '1px solid var(--border-color, #cbd5e1)',
              padding: '1.5rem',
              boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem'
            }}
          >
            <h4 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
              Operational Telemetry Metadata
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)' }}>District & Locality</span>
                <div style={{ fontWeight: 700, color: 'var(--text-main, #1e293b)' }}>
                  {incident.area}, {incident.cityOrTown}
                </div>
                <div style={{ color: 'var(--text-muted, #64748b)', fontSize: '0.75rem' }}>
                  {incident.district}, Karnataka
                </div>
                {incident.landmark && (
                  <div style={{ fontSize: '0.75rem', color: '#0d9488', marginTop: '2px' }}>
                    Ref: {incident.landmark}
                  </div>
                )}
              </div>

              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)' }}>GPS GIS Coordinates</span>
                <div style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-main, #334155)', backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
                  {incident.latitude.toFixed(5)}° N, {incident.longitude.toFixed(5)}° E
                </div>
              </div>

              {incident.assignedTeam && (
                <div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)' }}>Assigned Response Division</span>
                  <div style={{ fontWeight: 700, color: '#0d9488' }}>
                    {incident.assignedTeam}
                  </div>
                  {incident.estimatedCompletionDate && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
                      Target SLA: <strong>{incident.estimatedCompletionDate}</strong>
                    </div>
                  )}
                </div>
              )}

              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)' }}>Ingestion Stream</span>
                <div style={{ fontWeight: 600, color: 'var(--text-main, #1e293b)' }}>
                  {incident.dataSource}
                </div>
              </div>

              <div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #64748b)' }}>Reported By</span>
                <div style={{ fontWeight: 500, color: 'var(--text-main, #1e293b)' }}>
                  {incident.reportedByUserName || 'Citizen Reporter'} ({incident.reportedByRole || 'citizen'})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Photo Preview Modal */}
      {previewPhotoUrl && (
        <div 
          onClick={() => setPreviewPhotoUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
        >
          <div style={{ position: 'relative', maxWidth: '800px', maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
            <img src={previewPhotoUrl} alt="Inspection view" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px' }} />
            <button
              type="button"
              onClick={() => setPreviewPhotoUrl(null)}
              style={{
                position: 'absolute',
                top: '-12px',
                right: '-12px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* AUTHORITY ACTION MODALS                             */}
      {/* ==================================================== */}
      {activeModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div 
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 'var(--radius-lg, 12px)',
              padding: '1.75rem',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                {activeModal === 'verify' && 'Verify Incident Submission'}
                {activeModal === 'reject' && 'Reject Incident Report'}
                {activeModal === 'prioritize' && 'Update Incident Priority'}
                {activeModal === 'assign' && 'Assign Service Response Team'}
                {activeModal === 'progress_note' && 'Log Field Work Progress Note'}
                {activeModal === 'submit_resolution' && 'Submit Resolution Information'}
                {activeModal === 'verify_resolution' && 'Verify Resolution & Close Ticket'}
                {activeModal === 'further_work' && 'Request Further Work on Hazard'}
              </h3>
              <button type="button" onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.125rem' }}>✕</button>
            </div>

            {errorMsg && (
              <div style={{ padding: '0.625rem 0.875rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#b91c1c', fontSize: '0.8125rem' }}>
                {errorMsg}
              </div>
            )}

            {/* Modal Body: VERIFY */}
            {activeModal === 'verify' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Confirm Priority Level <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select 
                    value={priorityInput} 
                    onChange={e => setPriorityInput(e.target.value as IncidentSeverity)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                    <option value="critical">Critical Emergency</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Verification Inspection Notes <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Enter verification assessment notes (e.g. GIS coordinates and photo confirmed by ward control room)..."
                    value={notesInput}
                    onChange={e => setNotesInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            )}

            {/* Modal Body: REJECT */}
            {activeModal === 'reject' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#991b1b' }}>
                  Rejected reports remain in historical audits, and the citizen can view the reason.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Rejection Reason (Mandatory) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide specific reason (e.g. Duplicate report of ticket KA-BLR-0102, or private property matter outside BBMP jurisdiction)..."
                    value={reasonInput}
                    onChange={e => setReasonInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            )}

            {/* Modal Body: PRIORITIZE */}
            {activeModal === 'prioritize' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Select Priority Level
                  </label>
                  <select 
                    value={priorityInput} 
                    onChange={e => setPriorityInput(e.target.value as IncidentSeverity)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                    <option value="critical">Critical Emergency</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Priority Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Elevated priority due to heavy hospital transit route"
                    value={notesInput}
                    onChange={e => setNotesInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
            )}

            {/* Modal Body: ASSIGN */}
            {activeModal === 'assign' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Responsible Service Team <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select 
                    value={teamInput} 
                    onChange={e => setTeamInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  >
                    {SERVICE_TEAMS.map(team => (
                      <option key={team} value={team}>{team}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Target Completion Date & Time
                  </label>
                  <input
                    type="text"
                    value={slaInput}
                    onChange={e => setSlaInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Operational Dispatch Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Deploy 50mm bitumen cold-mix and barricade outermost lane during non-peak hours..."
                    value={instructionsInput}
                    onChange={e => setInstructionsInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            )}

            {/* Modal Body: PROGRESS NOTE */}
            {activeModal === 'progress_note' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Work Progress Update Note <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Sub-base gravel laid; steamroller compacted 12m section; waiting for asphalt supply..."
                    value={notesInput}
                    onChange={e => setNotesInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            )}

            {/* Modal Body: SUBMIT RESOLUTION (Requirement 7) */}
            {activeModal === 'submit_resolution' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Resolution Summary (Mandatory) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Pothole filled with dense bituminous macadam and hot-mix rolled level"
                    value={resolutionSummaryInput}
                    onChange={e => setResolutionSummaryInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Work Completion Timestamp <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={completionDateInput}
                    onChange={e => setCompletionDateInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Detailed Engineering Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Materials used, compaction tests, drainage slope checked..."
                    value={notesInput}
                    onChange={e => setNotesInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.875rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    After-Service Photo Evidence (Recommended)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleResolutionPhotoUpload}
                    style={{ fontSize: '0.8125rem' }}
                  />
                  {resolutionPhotos.length > 0 && (
                    <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={resolutionPhotos[0].dataUrl} alt="Repair preview" style={{ width: '50px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                      <span style={{ fontSize: '0.75rem', color: '#0d9488', fontWeight: 600 }}>Attached after-service photograph</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Body: VERIFY RESOLUTION */}
            {activeModal === 'verify_resolution' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#065f46' }}>
                  Independent audit sign-off will transition the ticket to <strong>RESOLVED</strong> and remove it from active risk lists.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Verification Inspection Notes (Mandatory) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Field auditor visited site; road surface inspected flush with zero water retention. Sign-off granted."
                    value={notesInput}
                    onChange={e => setNotesInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            )}

            {/* Modal Body: FURTHER WORK REQUIRED */}
            {activeModal === 'further_work' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: '#b45309' }}>
                  The ticket will return to <strong>IN_PROGRESS</strong> status for crew re-work.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                    Reason Further Work is Required (Mandatory) <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Edge compaction is uneven; debris on pavement edge still obstructing stormwater inlet..."
                    value={reasonInput}
                    onChange={e => setReasonInput(e.target.value)}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.875rem' }}
                  />
                </div>
              </div>
            )}

            {/* Modal Footer Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.875rem' }}>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: 'transparent',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              {activeModal === 'verify' && (
                <button
                  type="button"
                  onClick={handleVerifyReport}
                  disabled={isProcessing}
                  style={{
                    padding: '0.5rem 1.25rem',
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Confirm Verification
                </button>
              )}

              {activeModal === 'reject' && (
                <button
                  type="button"
                  onClick={handleRejectReport}
                  disabled={isProcessing}
                  style={{
                    padding: '0.5rem 1.25rem',
                    backgroundColor: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Confirm Rejection
                </button>
              )}

              {activeModal === 'prioritize' && (
                <button
                  type="button"
                  onClick={handlePrioritize}
                  disabled={isProcessing}
                  style={{
                    padding: '0.5rem 1.25rem',
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Update Priority
                </button>
              )}

              {activeModal === 'assign' && (
                <button
                  type="button"
                  onClick={handleAssignTeam}
                  disabled={isProcessing}
                  style={{
                    padding: '0.5rem 1.25rem',
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Dispatch Assignment
                </button>
              )}

              {activeModal === 'progress_note' && (
                <button
                  type="button"
                  onClick={handleAddProgressNote}
                  disabled={isProcessing}
                  style={{
                    padding: '0.5rem 1.25rem',
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Save Progress Note
                </button>
              )}

              {activeModal === 'submit_resolution' && (
                <button
                  type="button"
                  onClick={handleSubmitResolution}
                  disabled={isProcessing}
                  style={{
                    padding: '0.5rem 1.25rem',
                    backgroundColor: '#0d9488',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Submit for Verification
                </button>
              )}

              {activeModal === 'verify_resolution' && (
                <button
                  type="button"
                  onClick={handleVerifyResolution}
                  disabled={isProcessing}
                  style={{
                    padding: '0.5rem 1.25rem',
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Verify & Formally Resolve
                </button>
              )}

              {activeModal === 'further_work' && (
                <button
                  type="button"
                  onClick={handleRequestFurtherWork}
                  disabled={isProcessing}
                  style={{
                    padding: '0.5rem 1.25rem',
                    backgroundColor: '#b45309',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '0.875rem',
                    cursor: 'pointer'
                  }}
                >
                  Send Back for Re-Work
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
