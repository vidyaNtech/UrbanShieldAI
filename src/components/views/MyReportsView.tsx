import React, { useState, useMemo, useEffect } from 'react';
import { PageHeader } from '../common/PageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { NavIcon } from '../common/NavIcon';
import { EmptyState } from '../common/EmptyState';
import { incidentService, getStatusDisplayName, getStatusBadgeVariant } from '../../services/incidentService';
import { getCategoryMeta } from '../../config/incidentCategories';
import type { UserProfile } from '../../types/auth';
import { 
  PlusCircle, 
  Search, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Camera,
  Clock,
  Briefcase,
  AlertTriangle,
  Repeat,
  CheckCircle2
} from 'lucide-react';

interface MyReportsViewProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
}

type MyReportsFilter = 'all' | 'awaiting' | 'verified' | 'in_progress' | 'resolution_submitted' | 'resolved' | 'rejected';

export const MyReportsView: React.FC<MyReportsViewProps> = ({ user, onNavigate }) => {
  const [activeFilter, setActiveFilter] = useState<MyReportsFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [storeVersion, setStoreVersion] = useState(0);

  // Subscribe to real-time incident store changes
  useEffect(() => {
    return incidentService.subscribe(() => {
      setStoreVersion(v => v + 1);
    });
  }, []);

  // Fetch reports for this citizen
  const userReports = useMemo(() => {
    return incidentService.getMyReports(user.id);
  }, [user.id, storeVersion]);

  // Filtered reports
  const filteredReports = useMemo(() => {
    return userReports.filter(report => {
      // 1. Status Filter
      if (activeFilter === 'awaiting') {
        if (report.status !== 'under_verification' && report.status !== 'reported' && report.status !== 'submitted') {
          return false;
        }
      } else if (activeFilter === 'verified') {
        if (report.status !== 'verified') return false;
      } else if (activeFilter === 'in_progress') {
        if (
          report.status !== 'in_progress' && 
          report.status !== 'under_service' && 
          report.status !== 'prioritized' && 
          report.status !== 'assigned'
        ) {
          return false;
        }
      } else if (activeFilter === 'resolution_submitted') {
        if (report.status !== 'resolution_submitted' && report.status !== 'awaiting_verification') {
          return false;
        }
      } else if (activeFilter === 'resolved') {
        if (report.status !== 'resolved') return false;
      } else if (activeFilter === 'rejected') {
        if (report.status !== 'rejected') return false;
      }

      // 2. Search Query (Tracking ID, title, category, location)
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matches = 
          report.id.toLowerCase().includes(q) ||
          report.title.toLowerCase().includes(q) ||
          report.area.toLowerCase().includes(q) ||
          report.cityOrTown.toLowerCase().includes(q) ||
          report.district.toLowerCase().includes(q) ||
          report.category.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [userReports, activeFilter, searchQuery]);

  // Calculate status counts
  const counts = useMemo(() => {
    const awaiting = userReports.filter(r => r.status === 'under_verification' || r.status === 'reported' || r.status === 'submitted').length;
    const verified = userReports.filter(r => r.status === 'verified').length;
    const inProgress = userReports.filter(r => r.status === 'in_progress' || r.status === 'under_service' || r.status === 'prioritized' || r.status === 'assigned').length;
    const resolutionSubmitted = userReports.filter(r => r.status === 'resolution_submitted' || r.status === 'awaiting_verification').length;
    const resolved = userReports.filter(r => r.status === 'resolved').length;
    const rejected = userReports.filter(r => r.status === 'rejected').length;

    return {
      all: userReports.length,
      awaiting,
      verified,
      inProgress,
      resolutionSubmitted,
      resolved,
      rejected
    };
  }, [userReports]);

  return (
    <div className="my-reports-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <PageHeader
        title="My Submitted Reports & Resolution Tracking"
        subtitle="Track end-to-end municipal verification, assigned engineering crews, work progress, and verified repair audits."
        breadcrumbs={[
          { label: 'Citizen Portal', path: '#/citizen/overview' },
          { label: 'My Reports', isCurrent: true }
        ]}
        actions={
          <button
            type="button"
            onClick={() => onNavigate('#/citizen/report-problem')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.625rem 1.125rem',
              backgroundColor: '#0d9488',
              color: '#ffffff',
              border: 'none',
              borderRadius: 'var(--radius-md, 6px)',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.1))'
            }}
          >
            <PlusCircle size={16} />
            Report a Problem
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div 
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          backgroundColor: 'var(--bg-card, #ffffff)',
          borderRadius: 'var(--radius-md, 8px)',
          border: '1px solid var(--border-color, #cbd5e1)',
          padding: '0.75rem 1rem',
          boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))'
        }}
      >
        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
          {[
            { id: 'all', label: 'All Reports', count: counts.all },
            { id: 'awaiting', label: 'Awaiting Verification', count: counts.awaiting },
            { id: 'verified', label: 'Verified', count: counts.verified },
            { id: 'in_progress', label: 'In Progress', count: counts.inProgress },
            { id: 'resolution_submitted', label: 'Awaiting Audit', count: counts.resolutionSubmitted },
            { id: 'resolved', label: 'Resolved', count: counts.resolved },
            { id: 'rejected', label: 'Rejected', count: counts.rejected }
          ].map(tab => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as MyReportsFilter)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  padding: '0.4rem 0.65rem',
                  borderRadius: 'var(--radius-md, 6px)',
                  border: isActive ? '1px solid #0d9488' : '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: isActive ? 'rgba(13, 148, 136, 0.1)' : 'transparent',
                  color: isActive ? '#0d9488' : 'var(--text-muted, #64748b)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.8125rem',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
                <span 
                  style={{
                    padding: '1px 6px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? '#0d9488' : '#e2e8f0',
                    color: isActive ? '#ffffff' : '#64748b',
                    fontSize: '0.6875rem',
                    fontWeight: 700
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 auto', maxWidth: '360px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted, #94a3b8)' }} />
          <input
            type="text"
            placeholder="Search by tracking ID, title, or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.25rem',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #cbd5e1)',
              borderRadius: 'var(--radius-md, 6px)',
              fontSize: '0.8125rem',
              color: 'var(--text-main, #1e293b)'
            }}
          />
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <EmptyState
          title={userReports.length === 0 ? "You Haven't Submitted Any Reports Yet" : "No Reports Found Matching Filter"}
          description={
            userReports.length === 0
              ? "When you notice potholes, waterlogging, or damaged civic assets in Karnataka, report them here to alert local authorities."
              : "Try switching filter tabs or clearing your search query to see other submitted reports."
          }
          actionText="Report a New Problem"
          onAction={() => onNavigate('#/citizen/report-problem')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredReports.map(report => {
            const catMeta = getCategoryMeta(report.category);
            const statusLabel = getStatusDisplayName(report.status);
            const statusVariant = getStatusBadgeVariant(report.status);
            const hasPhoto = Boolean(report.imageUrls && report.imageUrls.length > 0);
            const isRejected = report.status === 'rejected';
            const isResolved = report.status === 'resolved';

            return (
              <div
                key={report.id}
                onClick={() => onNavigate(`#/incidents/${report.id}`)}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'stretch',
                  backgroundColor: 'var(--bg-card, #ffffff)',
                  borderRadius: 'var(--radius-md, 8px)',
                  border: isRejected 
                    ? '1px solid #fecaca' 
                    : isResolved 
                      ? '1px solid #a7f3d0' 
                      : '1px solid var(--border-color, #cbd5e1)',
                  boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#0d9488';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md, 0 4px 6px -1px rgba(0,0,0,0.1))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isRejected 
                    ? '#fecaca' 
                    : isResolved 
                      ? '#a7f3d0' 
                      : 'var(--border-color, #cbd5e1)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,0.05))';
                }}
              >
                {/* Photo Thumbnail Column */}
                <div 
                  style={{
                    width: '150px',
                    minWidth: '150px',
                    backgroundColor: '#f1f5f9',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden'
                  }}
                >
                  {hasPhoto && report.imageUrls ? (
                    <img
                      src={report.imageUrls[0]}
                      alt={report.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '1rem', color: catMeta.color }}>
                      <NavIcon name={catMeta.iconName} size={32} />
                      <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--text-muted, #64748b)', marginTop: '0.25rem' }}>
                        No Photo
                      </div>
                    </div>
                  )}

                  {hasPhoto && report.imageUrls && report.imageUrls.length > 1 && (
                    <span 
                      style={{
                        position: 'absolute',
                        bottom: '6px',
                        right: '6px',
                        padding: '2px 6px',
                        backgroundColor: 'rgba(15, 23, 42, 0.8)',
                        color: '#ffffff',
                        fontSize: '0.6875rem',
                        borderRadius: '4px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}
                    >
                      <Camera size={10} /> +{report.imageUrls.length - 1}
                    </span>
                  )}
                </div>

                {/* Content Section */}
                <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {/* Top Meta Line: Tracking ID, Category, Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '0.875rem', color: '#0d9488' }}>
                        {report.id}
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

                      {report.potentialRecurringMatch && (
                        <span 
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: '#fffbeb',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                            fontSize: '0.6875rem',
                            fontWeight: 600
                          }}
                        >
                          <Repeat size={10} /> Potential Recurring Problem
                        </span>
                      )}
                    </div>

                    <StatusBadge
                      label={statusLabel}
                      variant={statusVariant}
                    />
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                    {report.title}
                  </h3>

                  {/* Location and Timestamps */}
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted, #64748b)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={14} style={{ color: '#0d9488' }} />
                      {report.area}, {report.cityOrTown} ({report.district})
                    </span>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar size={14} />
                      Reported: {new Date(report.reportedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>

                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={14} />
                      Updated: {new Date(report.updatedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Dynamic Workflow Details Banner */}
                  {report.assignedTeam && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-main, #1e293b)', backgroundColor: '#f8fafc', padding: '0.35rem 0.65rem', borderRadius: '4px' }}>
                      <Briefcase size={12} style={{ color: '#0d9488' }} />
                      <span>Assigned Crew: <strong>{report.assignedTeam}</strong></span>
                      {report.estimatedCompletionDate && (
                        <>
                          <span style={{ color: '#cbd5e1' }}>•</span>
                          <span>Target SLA: <strong>{report.estimatedCompletionDate}</strong></span>
                        </>
                      )}
                    </div>
                  )}

                  {report.resolutionSummary && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.75rem', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.4rem 0.65rem', borderRadius: '4px', color: '#166534' }}>
                      <CheckCircle2 size={13} style={{ color: '#16a34a', marginTop: '1px', flexShrink: 0 }} />
                      <div>
                        <strong>Resolution Summary:</strong> {report.resolutionSummary}
                      </div>
                    </div>
                  )}

                  {report.rejectionReason && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.75rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '0.4rem 0.65rem', borderRadius: '4px', color: '#991b1b' }}>
                      <AlertTriangle size={13} style={{ color: '#dc2626', marginTop: '1px', flexShrink: 0 }} />
                      <div>
                        <strong>Rejection Reason:</strong> {report.rejectionReason}
                      </div>
                    </div>
                  )}

                  {/* Bottom Line: Severity and View Details */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                      Observed Severity: <strong style={{ textTransform: 'capitalize', color: 'var(--text-main, #1e293b)' }}>{report.citizenReportedSeverity || report.severity}</strong>
                    </div>

                    <span 
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        color: '#0d9488'
                      }}
                    >
                      View Resolution Progress
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
