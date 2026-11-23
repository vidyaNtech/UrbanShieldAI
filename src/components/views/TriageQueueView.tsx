import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { NavIcon } from '../common/NavIcon';
import { EmptyState } from '../common/EmptyState';
import { SummaryCard } from '../common/SummaryCard';
import { incidentService, getStatusDisplayName, getStatusBadgeVariant } from '../../services/incidentService';
import { INCIDENT_CATEGORIES, getCategoryMeta } from '../../config/incidentCategories';
import { KARNATAKA_DISTRICTS } from '../../data/karnatakaDistricts';
import type { IncidentCategory, IncidentSeverity } from '../../types/incident';
import type { UserProfile } from '../../types/auth';
import { 
  Search, 
  MapPin, 
  ArrowRight, 
  Repeat, 
  Clock, 
  CheckCircle2
} from 'lucide-react';

interface TriageQueueViewProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
}

export const TriageQueueView: React.FC<TriageQueueViewProps> = ({ user, onNavigate }) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<IncidentSeverity | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<IncidentCategory | 'all'>('all');
  const [districtFilter, setDistrictFilter] = useState<string>(user.district || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [storeVersion, setStoreVersion] = useState(0);

  // Subscribe to real-time incident store changes
  useEffect(() => {
    return incidentService.subscribe(() => {
      setStoreVersion(v => v + 1);
    });
  }, []);

  const allIncidents = useMemo(() => {
    return incidentService.getAllIncidents();
  }, [storeVersion]);

  // Operational metrics
  const stats = useMemo(() => {
    const pendingTriage = allIncidents.filter(i => i.status === 'submitted' || i.status === 'under_verification' || i.status === 'reported').length;
    const criticalActive = allIncidents.filter(i => i.severity === 'critical' && i.status !== 'resolved' && i.status !== 'rejected').length;
    const workUnderway = allIncidents.filter(i => i.status === 'in_progress' || i.status === 'under_service' || i.status === 'assigned').length;
    const awaitingAudit = allIncidents.filter(i => i.status === 'resolution_submitted' || i.status === 'awaiting_verification').length;

    return {
      pendingTriage,
      criticalActive,
      workUnderway,
      awaitingAudit
    };
  }, [allIncidents]);

  // Filtered queue
  const queueIncidents = useMemo(() => {
    return allIncidents.filter(inc => {
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'pending_triage') {
          if (inc.status !== 'submitted' && inc.status !== 'under_verification' && inc.status !== 'reported') return false;
        } else if (statusFilter === 'verified') {
          if (inc.status !== 'verified') return false;
        } else if (statusFilter === 'assigned') {
          if (inc.status !== 'assigned') return false;
        } else if (statusFilter === 'in_progress') {
          if (inc.status !== 'in_progress' && inc.status !== 'under_service') return false;
        } else if (statusFilter === 'resolution_submitted') {
          if (inc.status !== 'resolution_submitted' && inc.status !== 'awaiting_verification') return false;
        } else if (statusFilter === 'resolved') {
          if (inc.status !== 'resolved') return false;
        } else if (statusFilter === 'rejected') {
          if (inc.status !== 'rejected') return false;
        }
      }

      // Severity filter
      if (severityFilter !== 'all') {
        if (inc.severity !== severityFilter) return false;
      }

      // Category filter
      if (categoryFilter !== 'all') {
        if (inc.category !== categoryFilter) return false;
      }

      // District filter
      if (districtFilter !== 'all') {
        if (!inc.district.toLowerCase().includes(districtFilter.toLowerCase())) return false;
      }

      // Search query
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          inc.id.toLowerCase().includes(q) ||
          inc.title.toLowerCase().includes(q) ||
          inc.area.toLowerCase().includes(q) ||
          inc.cityOrTown.toLowerCase().includes(q) ||
          inc.district.toLowerCase().includes(q) ||
          inc.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [allIncidents, statusFilter, severityFilter, categoryFilter, districtFilter, searchQuery]);

  return (
    <div className="triage-queue-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <PageHeader
        title="Incoming Reports & Municipal Triage Queue"
        subtitle={`Official BBMP & KDMA incident intake, operational prioritization, and dispatch control for ${districtFilter !== 'all' ? districtFilter : 'All Karnataka Districts'}.`}
        breadcrumbs={[
          { label: 'Authority Operations', path: '#/authority/overview' },
          { label: 'Incoming Reports & Triage', isCurrent: true }
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

            <button
              type="button"
              onClick={() => onNavigate('#/resolution-tracking')}
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
              <CheckCircle2 size={15} />
              <span>Resolution Verification Queue</span>
            </button>
          </div>
        }
      />

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <SummaryCard
          title="Awaiting Triage Verification"
          value={stats.pendingTriage.toString()}
          subtitle="Newly Ingested Citizen Submissions"
          iconName="Inbox"
          trend={{ value: 'Active Intake', direction: 'neutral' }}
          accentColor="emerald"
        />

        <SummaryCard
          title="Critical Active Risks"
          value={stats.criticalActive.toString()}
          subtitle="Immediate Danger / Evacuation Required"
          iconName="AlertTriangle"
          trend={{ value: 'Urgent SLA', direction: 'down', label: 'escalated' }}
          accentColor="amber"
        />

        <SummaryCard
          title="Remediation in Progress"
          value={stats.workUnderway.toString()}
          subtitle="Dispatched Crews On-Site"
          iconName="Briefcase"
          trend={{ value: 'Under Service', direction: 'up', label: 'active work' }}
          accentColor="blue"
        />

        <SummaryCard
          title="Awaiting Resolution Audit"
          value={stats.awaitingAudit.toString()}
          subtitle="Repairs Completed Awaiting Verification"
          iconName="CheckCheck"
          trend={{ value: 'Audit Ready', direction: 'neutral' }}
          accentColor="purple"
        />
      </div>

      {/* Filters and Search Matrix */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border-color, #cbd5e1)',
          padding: '1rem',
          boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))'
        }}
      >
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {[
            { id: 'all', label: 'All Incidents' },
            { id: 'pending_triage', label: 'Awaiting Triage' },
            { id: 'verified', label: 'Verified' },
            { id: 'assigned', label: 'Assigned' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolution_submitted', label: 'Resolution Submitted' },
            { id: 'resolved', label: 'Resolved (Archive)' },
            { id: 'rejected', label: 'Rejected' }
          ].map(tab => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-md, 6px)',
                  border: isActive ? '1px solid #0d9488' : '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: isActive ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
                  color: isActive ? '#0d9488' : 'var(--text-muted, #64748b)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Multi-Dimensional Dropdowns Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {/* District Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', marginBottom: '3px' }}>
              Karnataka District
            </label>
            <select
              value={districtFilter}
              onChange={e => setDistrictFilter(e.target.value)}
              style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
            >
              <option value="all">All Karnataka Districts (31)</option>
              {KARNATAKA_DISTRICTS.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Severity Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', marginBottom: '3px' }}>
              Severity Level
            </label>
            <select
              value={severityFilter}
              onChange={e => setSeverityFilter(e.target.value as IncidentSeverity | 'all')}
              style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="moderate">Moderate</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Category Dropdown */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', marginBottom: '3px' }}>
              Problem Category
            </label>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as IncidentCategory | 'all')}
              style={{ width: '100%', padding: '0.45rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
            >
              <option value="all">All Categories</option>
              {INCIDENT_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', marginBottom: '3px' }}>
              Search Filter
            </label>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input
                type="text"
                placeholder="Tracking ID, title, street..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '0.45rem 0.5rem 0.45rem 1.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.8125rem' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Triage Incidents Queue List */}
      {queueIncidents.length === 0 ? (
        <EmptyState
          title="No Incident Reports Found in Triage Queue"
          description="There are currently no civic incident records matching your status and district filter criteria."
          actionText="Reset All Filters"
          onAction={() => {
            setStatusFilter('all');
            setSeverityFilter('all');
            setCategoryFilter('all');
            setDistrictFilter('all');
            setSearchQuery('');
          }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {queueIncidents.map(inc => {
            const catMeta = getCategoryMeta(inc.category);
            const statusLabel = getStatusDisplayName(inc.status);
            const statusVariant = getStatusBadgeVariant(inc.status);
            const hasPhoto = Boolean(inc.imageUrls && inc.imageUrls.length > 0);

            return (
              <div
                key={inc.id}
                onClick={() => onNavigate(`#/incidents/${inc.id}`)}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'stretch',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: inc.severity === 'critical' && inc.status !== 'resolved'
                    ? '1.5px solid #ef4444' 
                    : '1px solid var(--border-color, #cbd5e1)',
                  boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#0d9488';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = inc.severity === 'critical' && inc.status !== 'resolved'
                    ? '#ef4444' 
                    : 'var(--border-color, #cbd5e1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))';
                }}
              >
                {/* Photo Thumbnail */}
                <div 
                  style={{
                    width: '130px',
                    minWidth: '130px',
                    backgroundColor: '#f1f5f9',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {hasPhoto && inc.imageUrls ? (
                    <img
                      src={inc.imageUrls[0]}
                      alt={inc.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem', color: catMeta.color }}>
                      <NavIcon name={catMeta.iconName} size={28} />
                      <div style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', marginTop: '2px' }}>
                        No Photo
                      </div>
                    </div>
                  )}

                  {hasPhoto && inc.imageUrls && inc.imageUrls.length > 1 && (
                    <span 
                      style={{
                        position: 'absolute',
                        bottom: '4px',
                        right: '4px',
                        padding: '1px 5px',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        color: '#ffffff',
                        fontSize: '0.625rem',
                        borderRadius: '3px',
                        fontWeight: 600
                      }}
                    >
                      +{inc.imageUrls.length - 1}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {/* Top Meta Line: ID, Category, Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.8125rem', color: '#0d9488' }}>
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

                      {inc.potentialRecurringMatch && (
                        <span 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            backgroundColor: '#fffbeb',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                            fontSize: '0.6875rem',
                            fontWeight: 600
                          }}
                        >
                          <Repeat size={10} /> Potential Recurring
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <StatusBadge
                        label={inc.severity.toUpperCase()}
                        variant={inc.severity === 'critical' ? 'critical' : inc.severity === 'high' ? 'high_risk' : 'warning'}
                      />
                      <StatusBadge
                        label={statusLabel}
                        variant={statusVariant}
                      />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                    {inc.title}
                  </h3>

                  {/* Location & Timestamps */}
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={13} style={{ color: '#0d9488' }} />
                      {inc.area}, {inc.cityOrTown} ({inc.district})
                    </span>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={13} />
                      {new Date(inc.reportedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>

                    {inc.assignedTeam && (
                      <span style={{ color: '#0d9488', fontWeight: 600 }}>
                        Assigned: {inc.assignedTeam}
                      </span>
                    )}
                  </div>

                  {/* Bottom Line: Triage & Action Shortcut */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                      Source: <strong>{inc.dataSource}</strong>
                    </span>

                    <span 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        color: '#0d9488'
                      }}
                    >
                      Open Operational Triage Cockpit
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
