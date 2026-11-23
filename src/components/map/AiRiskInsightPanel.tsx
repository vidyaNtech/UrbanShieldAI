import React from 'react';
import { incidentService } from '../../services/incidentService';
import { StatusBadge } from '../common/StatusBadge';
import { 
  Sparkles, 
  MapPin, 
  ArrowRight
} from 'lucide-react';

interface AiRiskInsightPanelProps {
  onFocusLocation: (coordinates: [number, number], zoom: number, incidentId?: string) => void;
}

export const AiRiskInsightPanel: React.FC<AiRiskInsightPanelProps> = ({ onFocusLocation }) => {
  const insights = incidentService.getAiRiskInsights();

  return (
    <div className="ai-insight-panel-card">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <div
            style={{
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={16} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              AI Risk Insight
            </h4>
            <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
              Evidence-based anomaly triage
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.65rem',
            fontFamily: 'var(--font-mono)',
            backgroundColor: '#F1F5F9',
            color: '#475569',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 600
          }}
        >
          Telemetry Correlated
        </span>
      </div>

      {/* Insights List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {insights.map(item => (
          <div
            key={item.id}
            style={{
              padding: '0.85rem',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xs)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
              <div style={{ fontWeight: 700, fontSize: '0.8125rem', color: 'var(--text-primary)', lineHeight: 1.35 }}>
                {item.title}
              </div>
              <StatusBadge
                label={item.severity.toUpperCase()}
                variant={item.severity === 'critical' ? 'critical' : 'warning'}
                size="sm"
              />
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
              {item.explanation}
            </p>

            <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-canvas)', padding: '0.35rem 0.5rem', borderRadius: '4px' }}>
              <strong>Evidence: </strong>
              <span>{item.supportingEvidence}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.2rem' }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                <MapPin size={12} style={{ color: 'var(--brand-primary)' }} />
                <span>{item.location}</span>
              </span>

              <button
                type="button"
                onClick={() => onFocusLocation(item.coordinates, item.zoom, item.incidentId)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: 'var(--brand-primary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 4px'
                }}
              >
                <span>View on Map</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
