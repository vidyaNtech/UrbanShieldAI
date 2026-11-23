import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { NavIcon } from '../common/NavIcon';
import { EmptyState } from '../common/EmptyState';
import { SummaryCard } from '../common/SummaryCard';
import { 
  incidentService, 
  formatResolutionDuration 
} from '../../services/incidentService';
import { INCIDENT_CATEGORIES, getCategoryMeta } from '../../config/incidentCategories';
import { KARNATAKA_DISTRICTS } from '../../data/karnatakaDistricts';
import type { IncidentCategory, IncidentSeverity, UrbanIncident } from '../../types/incident';
import type { UserProfile } from '../../types/auth';
import { 
  CheckCheck, 
  MapPin, 
  ArrowRight, 
  Clock, 
  FileCheck, 
  Repeat
} from 'lucide-react';

interface ResolutionTrackingViewProps {
  user: UserProfile;
  initialTab?: 'history' | 'queue' | 'recurring';
  onNavigate: (path: string) => void;
}

export const ResolutionTrackingView: React.FC<ResolutionTrackingViewProps> = ({
  user,
  initialTab = 'history',
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'queue' | 'recurring'>(initialTab);
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<IncidentCategory | 'all'>('all');
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [storeVersion, setStoreVersion] = useState(0);

  // Verification modal state for quick audit in queue tab
  const [auditTarget, setAuditTarget] = useState<UrbanIncident | null>(null);
  const [auditMode, setAuditMode] = useState<'verify' | 'rework' | null>(null);
  const [auditNotes, setAuditNotes] = useState('');
  const [auditError, setAuditError] = useState<string | null>(null);

  // Subscribe to real-time incident store changes
  useEffect(() => {
    return incidentService.subscribe(() => {
      setStoreVersion(v => v + 1);
    });
  }, []);

  const allIncidents = useMemo(() => {
    return incidentService.getAllIncidents();
  }, [storeVersion]);

  // Tab 1: Resolved incidents
  const resolvedIncidents = useMemo(() => {
    return allIncidents
      .filter(i => i.status === 'resolved')
      .filter(i => {
        if (districtFilter !== 'all' && !i.district.toLowerCase().includes(districtFilter.toLowerCase())) return false;
        if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
        if (severityFilter !== 'all' && i.severity !== severityFilter) return false;
        if (searchQuery.trim().length > 0) {
          const q = searchQuery.toLowerCase().trim();
          const matches = 
            i.id.toLowerCase().includes(q) ||
            i.title.toLowerCase().includes(q) ||
            i.area.toLowerCase().includes(q) ||
            i.resolutionSummary?.toLowerCase().includes(q);
          if (!matches) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(b.resolvedAt || b.updatedAt).getTime() - new Date(a.resolvedAt || a.updatedAt).getTime());
  }, [allIncidents, districtFilter, categoryFilter, severityFilter, searchQuery]);

  // Tab 2: Resolution submitted queue (awaiting verification)
  const auditQueueIncidents = useMemo(() => {
    return allIncidents
      .filter(i => i.status === 'resolution_submitted' || i.status === 'awaiting_verification')
      .filter(i => {
        if (districtFilter !== 'all' && !i.district.toLowerCase().includes(districtFilter.toLowerCase())) return false;
        if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
        return true;
      });
  }, [allIncidents, districtFilter, categoryFilter]);

  // Tab 3: Recurring problems list
  const recurringMatches = useMemo(() => {
    return incidentService.getRecurringProblemsList();
  }, [storeVersion]);

  // Handle Quick Audit Actions
  const handleConfirmVerify = () => {
    if (!auditTarget) return;
    if (!auditNotes.trim() || auditNotes.trim().length < 3) {
      setAuditError('Verification inspection notes are mandatory.');
      return;
    }
    try {
      incidentService.verifyResolution({
        incidentId: auditTarget.id,
        verifiedBy: user.fullName || 'Zonal Municipal Auditor',
        actorRole: user.role,
        verificationNotes: auditNotes.trim()
      });
      setAuditTarget(null);
      setAuditMode(null);
      setAuditNotes('');
      setAuditError(null);
    } catch (err: unknown) {
      setAuditError(err instanceof Error ? err.message : 'Failed to verify resolution.');
    }
  };

  const handleConfirmRework = () => {
    if (!auditTarget) return;
    if (!auditNotes.trim() || auditNotes.trim().length < 5) {
      setAuditError('A specific reason for requesting further work (minimum 5 characters) is mandatory.');
      return;
    }
    try {
      incidentService.requestFurtherWork({
        incidentId: auditTarget.id,
        requestedBy: user.fullName || 'Supervisory Auditor',
        actorRole: user.role,
        reason: auditNotes.trim()
      });
      setAuditTarget(null);
      setAuditMode(null);
      setAuditNotes('');
      setAuditError(null);
    } catch (err: unknown) {
      setAuditError(err instanceof Error ? err.message : 'Failed to request further work.');
    }
  };

  return (
    <div className="resolution-tracking-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <PageHeader
        title="Resolution Tracking & Civic Audit Verification"
        subtitle="End-to-end audit accountability: review completed engineering repairs, before-and-after photographic evidence, and chronic hotspot recurrence."
        breadcrumbs={[
          { label: 'Portal', path: '#/overview' },
          { label: 'Resolution Tracking', isCurrent: true }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onNavigate('#/risk-map')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.55rem 1rem',
                backgroundColor: 'var(--bg-card, #ffffff)',
                color: 'var(--text-main, #1e293b)',
                border: '1px solid var(--border-color, #cbd5e1)',
                borderRadius: 'var(--radius-md, 6px)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <MapPin size={15} style={{ color: '#0d9488' }} />
              <span>Live Risk Map</span>
            </button>

            {user.role === 'authority' || user.role === 'administrator' ? (
              <button
                type="button"
                onClick={() => onNavigate('#/authority/incoming-reports')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.55rem 1rem',
                  backgroundColor: '#0d9488',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-md, 6px)',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <span>Triage Queue</span>
              </button>
            ) : null}
          </div>
        }
      />

      {/* Summary Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <SummaryCard
          title="Verified Resolved Incidents"
          value={resolvedIncidents.length.toString()}
          subtitle="Signed-Off & Sealed in Archive"
          iconName="CheckCheck"
          trend={{ value: 'Audited', direction: 'up', label: 'completed' }}
          accentColor="emerald"
        />

        <SummaryCard
          title="Awaiting Resolution Audit"
          value={auditQueueIncidents.length.toString()}
          subtitle="Repairs Completed Awaiting Verification"
          iconName="FileCheck"
          trend={{ value: 'Pending Sign-Off', direction: 'neutral' }}
          accentColor="amber"
        />

        <SummaryCard
          title="Potential Chronic Hotspots"
          value={recurringMatches.length.toString()}
          subtitle="Recurring Problem Pairs Detected"
          iconName="Repeat"
          trend={{ value: 'GIS Cluster Match', direction: 'neutral' }}
          accentColor="purple"
        />

        <SummaryCard
          title="Mean Audit Duration"
          value="4.2 hours"
          subtitle="Field Inspection to Final Sign-Off"
          iconName="Clock"
          trend={{ value: 'Fast SLA', direction: 'up', label: 'efficient' }}
          accentColor="blue"
        />
      </div>

      {/* Tabs Bar */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border-color, #cbd5e1)',
          padding: '0.75rem 1rem',
          boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))'
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              borderRadius: 'var(--radius-md, 6px)',
              border: activeTab === 'history' ? '1px solid #0d9488' : '1px solid var(--border-color, #e2e8f0)',
              backgroundColor: activeTab === 'history' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
              color: activeTab === 'history' ? '#0d9488' : 'var(--text-muted, #64748b)',
              fontWeight: activeTab === 'history' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
          >
            <CheckCheck size={16} />
            <span>Resolution History ({resolvedIncidents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              borderRadius: 'var(--radius-md, 6px)',
              border: activeTab === 'queue' ? '1px solid #0d9488' : '1px solid var(--border-color, #e2e8f0)',
              backgroundColor: activeTab === 'queue' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
              color: activeTab === 'queue' ? '#0d9488' : 'var(--text-muted, #64748b)',
              fontWeight: activeTab === 'queue' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
          >
            <FileCheck size={16} />
            <span>Awaiting Verification ({auditQueueIncidents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('recurring')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.5rem 0.875rem',
              borderRadius: 'var(--radius-md, 6px)',
              border: activeTab === 'recurring' ? '1px solid #0d9488' : '1px solid var(--border-color, #e2e8f0)',
              backgroundColor: activeTab === 'recurring' ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
              color: activeTab === 'recurring' ? '#0d9488' : 'var(--text-muted, #64748b)',
              fontWeight: activeTab === 'recurring' ? 700 : 500,
              fontSize: '0.8125rem',
              cursor: 'pointer'
            }}
          >
            <Repeat size={16} />
            <span>Recurring Problem Hotspots ({recurringMatches.length})</span>
          </button>
        </div>

        {/* Filters if in history tab */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              style={{ padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
            >
              <option value="all">All Districts</option>
              {KARNATAKA_DISTRICTS.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as IncidentCategory | 'all')}
              style={{ padding: '0.4rem 0.65rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
            >
              <option value="all">All Categories</option>
              {INCIDENT_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ==================================================== */}
      {/* TAB 1: RESOLUTION HISTORY (Section 8)               */}
      {/* ==================================================== */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {resolvedIncidents.length === 0 ? (
            <EmptyState
              title="No Resolved Incident Records Found"
              description="No historical incidents match your selected filters. When active civic reports are verified and closed, their audit records appear here."
              actionText="Reset Filters"
              onAction={() => {
                setDistrictFilter('all');
                setCategoryFilter('all');
                setSeverityFilter('all');
                setSearchQuery('');
              }}
            />
          ) : (
            resolvedIncidents.map(inc => {
              const catMeta = getCategoryMeta(inc.category);
              const durationStr = formatResolutionDuration(inc.reportedAt, inc.resolvedAt);
              const hasBeforePhoto = Boolean(inc.evidencePhotos && inc.evidencePhotos.length > 0);
              const hasAfterPhoto = Boolean(inc.resolutionEvidencePhotos && inc.resolutionEvidencePhotos.length > 0);

              return (
                <div
                  key={inc.id}
                  style={{
                    backgroundColor: 'var(--bg-card, #ffffff)',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1px solid #a7f3d0',
                    boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  {/* Top Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', color: '#0d9488' }}>
                        {inc.id}
                      </span>
                      <span 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: catMeta.bgColor,
                          color: catMeta.color,
                          border: `1px solid ${catMeta.borderColor}`,
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        <NavIcon name={catMeta.iconName} size={12} />
                        {catMeta.label}
                      </span>

                      <StatusBadge
                        label="RESOLVED"
                        variant="success"
                      />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#065f46', backgroundColor: '#f0fdf4', padding: '0.25rem 0.65rem', borderRadius: '4px' }}>
                      <Clock size={14} />
                      <span>Resolution Time: <strong>{durationStr}</strong></span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', margin: '0 0 0.35rem 0' }}>
                      {inc.title}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>
                      <MapPin size={14} style={{ color: '#0d9488' }} />
                      <span>{inc.area}, {inc.cityOrTown} ({inc.district})</span>
                      <span>•</span>
                      <span>Reported: {new Date(inc.reportedAt).toLocaleDateString('en-IN')}</span>
                      <span>•</span>
                      <span>Resolved: {new Date(inc.resolvedAt || inc.updatedAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Resolution Summary */}
                  {inc.resolutionSummary && (
                    <div style={{ padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.8125rem' }}>
                      <strong style={{ color: 'var(--text-main, #1e293b)' }}>Verified Resolution Summary: </strong>
                      <span style={{ color: 'var(--text-muted, #475569)' }}>{inc.resolutionSummary}</span>
                      {inc.resolutionAuditNotes && (
                        <div style={{ marginTop: '0.25rem', color: '#047857', fontSize: '0.75rem' }}>
                          Auditor Sign-off: {inc.resolutionAuditNotes} ({inc.resolutionVerifiedBy || 'BBMP Authority'})
                        </div>
                      )}
                    </div>
                  )}

                  {/* Before and After Evidence Photos Grid (Section 8) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {/* Before Photo */}
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                      <div style={{ padding: '0.35rem 0.65rem', backgroundColor: '#f1f5f9', fontSize: '0.6875rem', fontWeight: 700, color: '#475569' }}>
                        BEFORE (Reported Condition)
                      </div>
                      <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {hasBeforePhoto && inc.evidencePhotos ? (
                          <img src={inc.evidencePhotos[0].dataUrl} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            No evidence uploaded
                          </span>
                        )}
                      </div>
                    </div>

                    {/* After Photo */}
                    <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#f8fafc' }}>
                      <div style={{ padding: '0.35rem 0.65rem', backgroundColor: '#f1f5f9', fontSize: '0.6875rem', fontWeight: 700, color: '#065f46' }}>
                        AFTER (Verified Repair)
                      </div>
                      <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {hasAfterPhoto && inc.resolutionEvidencePhotos ? (
                          <img src={inc.resolutionEvidencePhotos[0].dataUrl} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>
                            No evidence uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => onNavigate(`#/incidents/${inc.id}`)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#0d9488',
                        fontWeight: 700,
                        fontSize: '0.8125rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer'
                      }}
                    >
                      View Complete Lifecycle History & Audit
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 2: RESOLUTION VERIFICATION QUEUE (Section 7)     */}
      {/* ==================================================== */}
      {activeTab === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {auditQueueIncidents.length === 0 ? (
            <EmptyState
              title="No Incidents Currently Awaiting Resolution Verification"
              description="All reported repairs have been audited, or no field crews have submitted resolutions pending supervisory inspection at this moment."
              actionText="View Resolution History"
              onAction={() => setActiveTab('history')}
            />
          ) : (
            auditQueueIncidents.map(inc => {
              const catMeta = getCategoryMeta(inc.category);

              return (
                <div
                  key={inc.id}
                  style={{
                    backgroundColor: 'var(--bg-card, #ffffff)',
                    borderRadius: 'var(--radius-md, 8px)',
                    border: '1.5px solid #0d9488',
                    boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
                    padding: '1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', color: '#0d9488' }}>
                        {inc.id}
                      </span>
                      <span 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.375rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: catMeta.bgColor,
                          color: catMeta.color,
                          border: `1px solid ${catMeta.borderColor}`,
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        <NavIcon name={catMeta.iconName} size={12} />
                        {catMeta.label}
                      </span>
                    </div>

                    <StatusBadge
                      label="Awaiting Resolution Verification"
                      variant="info"
                    />
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', margin: '0 0 0.25rem 0' }}>
                      {inc.title}
                    </h3>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>
                      Location: {inc.area}, {inc.cityOrTown} ({inc.district}) • Submitting Crew: <strong>{inc.resolutionSubmittedBy || inc.assignedTeam || 'Field Gang'}</strong>
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '6px' }}>
                    <div style={{ fontWeight: 700, color: '#166534', fontSize: '0.8125rem', marginBottom: '2px' }}>
                      Submitted Resolution Summary:
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#14532d' }}>
                      {inc.resolutionSummary || 'Repairs completed on site.'}
                    </div>
                    {inc.resolutionWorkCompletedAt && (
                      <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '4px' }}>
                        Completion Time: {inc.resolutionWorkCompletedAt}
                      </div>
                    )}
                  </div>

                  {/* After photo preview if present */}
                  {inc.resolutionEvidencePhotos && inc.resolutionEvidencePhotos.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img 
                        src={inc.resolutionEvidencePhotos[0].dataUrl} 
                        alt="After repair preview" 
                        style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      />
                      <span style={{ fontSize: '0.8125rem', color: '#0d9488', fontWeight: 600 }}>
                        ✓ After-service repair photograph submitted for audit inspection
                      </span>
                    </div>
                  )}

                  {/* Actions Bar for Authority */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => onNavigate(`#/incidents/${inc.id}`)}
                      style={{
                        padding: '0.45rem 0.875rem',
                        backgroundColor: 'transparent',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Open Full Audit Dossier
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuditTarget(inc);
                        setAuditMode('rework');
                        setAuditNotes('');
                        setAuditError(null);
                      }}
                      style={{
                        padding: '0.45rem 0.875rem',
                        backgroundColor: '#ffffff',
                        color: '#b45309',
                        border: '1px solid #fde68a',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Request Further Work
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuditTarget(inc);
                        setAuditMode('verify');
                        setAuditNotes('');
                        setAuditError(null);
                      }}
                      style={{
                        padding: '0.45rem 1.125rem',
                        backgroundColor: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Verify Resolution & Close Ticket
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ==================================================== */}
      {/* TAB 3: RECURRING PROBLEM HOTSPOTS (Section 9)       */}
      {/* ==================================================== */}
      {activeTab === 'recurring' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ padding: '0.875rem 1rem', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', fontSize: '0.8125rem', color: '#92400e' }}>
            <strong>Karnataka Telemetry Recurrence Model:</strong> Potential recurring problem pairs are flagged by spatial proximity (≤3.5km) and category similarity against resolved or recent incidents. These matches are prospective indicators to prompt engineering investigations, not automated conclusions.
          </div>

          {recurringMatches.length === 0 ? (
            <EmptyState
              title="No Recurring Problem Clusters Detected"
              description="No geographic vicinity or repeated hazard patterns were detected in the active telemetry dataset."
              actionText="Return to Resolution History"
              onAction={() => setActiveTab('history')}
            />
          ) : (
            recurringMatches.map((rec, rIdx) => (
              <div 
                key={`${rec.relatedIncidentId}-${rIdx}`}
                style={{
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: '1px solid #fde68a',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Repeat size={18} style={{ color: '#b45309' }} />
                    <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#92400e' }}>
                      Potential Recurring Problem Pair
                    </span>
                  </div>

                  <span style={{ padding: '2px 8px', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '0.75rem', fontWeight: 600 }}>
                    ~{rec.distanceKm} km proximity
                  </span>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-main, #1e293b)' }}>
                  <strong>Description:</strong> {rec.similarityReason}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.8125rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>Related Historical Ticket:</span>
                    <div style={{ fontWeight: 700, fontFamily: 'monospace', color: '#0d9488' }}>
                      {rec.relatedIncidentId}
                    </div>
                  </div>

                  <div>
                    <span style={{ color: 'var(--text-muted, #64748b)' }}>Previous Resolution Date:</span>
                    <div style={{ fontWeight: 600 }}>
                      {rec.previousResolutionDate ? new Date(rec.previousResolutionDate).toLocaleDateString('en-IN') : 'Earlier record'}
                    </div>
                  </div>

                  {rec.daysSinceResolution !== undefined && (
                    <div>
                      <span style={{ color: 'var(--text-muted, #64748b)' }}>Days Between Reports:</span>
                      <div style={{ fontWeight: 700, color: '#b45309' }}>
                        ~{rec.daysSinceResolution} days
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => onNavigate(`#/incidents/${rec.relatedIncidentId}`)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0d9488',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    Open Historical Incident #{rec.relatedIncidentId}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Quick Audit Action Modal in Resolution Queue */}
      {auditTarget && auditMode && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            zIndex: 1000,
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
              maxWidth: '480px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700 }}>
              {auditMode === 'verify' ? 'Verify Resolution & Sign-Off' : 'Request Further Remediation Work'}
            </h3>

            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>
              Ticket: <strong style={{ fontFamily: 'monospace' }}>{auditTarget.id}</strong> — {auditTarget.title}
            </div>

            {auditError && (
              <div style={{ padding: '0.5rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '4px', color: '#b91c1c', fontSize: '0.75rem' }}>
                {auditError}
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '4px' }}>
                {auditMode === 'verify' ? 'Verification Inspection Notes *' : 'Deficiency Explanation / Rework Notes *'}
              </label>
              <textarea
                rows={3}
                placeholder={
                  auditMode === 'verify'
                    ? 'Enter inspection audit notes confirming remediation is complete...'
                    : 'Explain specific repairs remaining unfulfilled...'
                }
                value={auditNotes}
                onChange={e => setAuditNotes(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.875rem' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  setAuditTarget(null);
                  setAuditMode(null);
                }}
                style={{ padding: '0.5rem 1rem', background: 'none', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Cancel
              </button>

              {auditMode === 'verify' ? (
                <button
                  type="button"
                  onClick={handleConfirmVerify}
                  style={{ padding: '0.5rem 1.25rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  Verify & Formally Close
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmRework}
                  style={{ padding: '0.5rem 1.25rem', backgroundColor: '#b45309', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  Return to Crew for Re-Work
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
