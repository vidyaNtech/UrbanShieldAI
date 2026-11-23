import React from 'react';
import { 
  X, 
  MapPin, 
  Users, 
  ExternalLink,
  Building
} from 'lucide-react';
import { getCategoryMeta } from '../../config/incidentCategories';
import { StatusBadge } from '../common/StatusBadge';
import { NavIcon } from '../common/NavIcon';
import type { UrbanIncident, IncidentSeverity } from '../../types/incident';

interface IncidentDrawerProps {
  incident: UrbanIncident | null;
  onClose: () => void;
  onViewDetails: (incidentId: string) => void;
}

export const IncidentDrawer: React.FC<IncidentDrawerProps> = ({
  incident,
  onClose,
  onViewDetails
}) => {
  if (!incident) return null;

  const catMeta = getCategoryMeta(incident.category);

  const getSeverityBadge = (severity: IncidentSeverity) => {
    switch (severity) {
      case 'critical':
        return <StatusBadge label="CRITICAL DANGER" variant="critical" />;
      case 'high':
        return <StatusBadge label="HIGH SEVERITY" variant="high_risk" />;
      case 'moderate':
        return <StatusBadge label="MODERATE RISK" variant="warning" />;
      case 'low':
        return <StatusBadge label="LOW RISK" variant="success" />;
    }
  };

  const formattedDate = new Date(incident.reportedAt).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="incident-drawer-container" role="dialog" aria-labelledby="drawer-incident-title">
      {/* Header */}
      <div className="drawer-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="drawer-id-pill">{incident.id}</span>
          {getSeverityBadge(incident.severity)}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="drawer-close-btn"
          aria-label="Close incident details"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body Content */}
      <div className="drawer-body">
        {/* Category & Title */}
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: catMeta.color, fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem' }}>
            <NavIcon name={catMeta.iconName} size={15} />
            <span>{catMeta.label.toUpperCase()}</span>
          </div>
          <h3 id="drawer-incident-title" style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.35 }}>
            {incident.title}
          </h3>
        </div>

        {/* Location details card */}
        <div className="drawer-info-card">
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <MapPin size={16} style={{ color: 'var(--brand-primary)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.84rem' }}>
                {incident.area}, {incident.cityOrTown}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {incident.district} • {incident.landmark || 'Identified GPS Zone'}
              </div>
              <div style={{ fontSize: '0.6875rem', fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', marginTop: '0.15rem' }}>
                GPS: {incident.latitude.toFixed(4)}° N, {incident.longitude.toFixed(4)}° E
              </div>
            </div>
          </div>
        </div>

        {/* Incident Narrative / Description */}
        <div style={{ margin: '1rem 0' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Hazard Assessment & Description
          </span>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '0.3rem' }}>
            {incident.description}
          </p>
        </div>

        {/* Key Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div className="drawer-metric-box">
            <span className="box-label">Lifecycle Status</span>
            <span className="box-val status-val">{incident.status.replace(/_/g, ' ')}</span>
          </div>

          <div className="drawer-metric-box">
            <span className="box-label">Citizen Reports</span>
            <span className="box-val" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Users size={13} style={{ color: 'var(--brand-primary)' }} />
              <span>{incident.reportCount} related</span>
            </span>
          </div>

          <div className="drawer-metric-box">
            <span className="box-label">Reported Timestamp</span>
            <span className="box-val text-mono">{formattedDate}</span>
          </div>

          <div className="drawer-metric-box">
            <span className="box-label">Telemetry Ingestion</span>
            <span className="box-val" style={{ fontSize: '0.72rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {incident.dataSource}
            </span>
          </div>
        </div>

        {/* Assigned Unit if available */}
        {incident.assignedUnit && (
          <div
            style={{
              padding: '0.65rem 0.85rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              marginBottom: '1.25rem'
            }}
          >
            <Building size={15} style={{ color: '#059669', flexShrink: 0 }} />
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Team: </span>
              <strong style={{ color: 'var(--text-primary)' }}>{incident.assignedUnit}</strong>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Action */}
      <div className="drawer-footer">
        <button
          type="button"
          onClick={() => onViewDetails(incident.id)}
          className="primary-btn"
          style={{ width: '100%', padding: '0.75rem 1rem' }}
        >
          <span>View Full Incident Lifecycle</span>
          <ExternalLink size={15} />
        </button>
      </div>
    </div>
  );
};
