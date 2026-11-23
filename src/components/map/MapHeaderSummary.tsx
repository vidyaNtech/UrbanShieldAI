import React from 'react';
import { PageHeader } from '../common/PageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { 
  AlertOctagon, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw
} from 'lucide-react';
import type { IncidentFilterState } from '../../types/incident';
import type { IncidentSummaryStats } from '../../services/incidentService';

interface MapHeaderSummaryProps {
  stats: IncidentSummaryStats;
  currentFilter: IncidentFilterState['quickFilter'];
  onSelectQuickFilter: (filter: IncidentFilterState['quickFilter']) => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const MapHeaderSummary: React.FC<MapHeaderSummaryProps> = ({
  stats,
  currentFilter = 'all',
  onSelectQuickFilter,
  onResetFilters,
  hasActiveFilters
}) => {
  const filterCards = [
    {
      id: 'critical' as const,
      label: 'Critical Incidents',
      count: stats.critical,
      icon: AlertOctagon,
      color: '#DC2626',
      bgColor: '#FEF2F2',
      borderColor: '#FECACA',
      subtitle: 'Immediate danger / hazard'
    },
    {
      id: 'high' as const,
      label: 'High-Risk Incidents',
      count: stats.high,
      icon: AlertTriangle,
      color: '#EA580C',
      bgColor: '#FFF7ED',
      borderColor: '#FED7AA',
      subtitle: 'Severe disruption'
    },
    {
      id: 'moderate' as const,
      label: 'Moderate Risk',
      count: stats.moderate,
      icon: Clock,
      color: '#D97706',
      bgColor: '#FFFBEB',
      borderColor: '#FDE68A',
      subtitle: 'Active triage queue'
    },
    {
      id: 'today' as const,
      label: 'Reported Today',
      count: stats.todayCount,
      icon: Calendar,
      color: '#0284C7',
      bgColor: '#F0F9FF',
      borderColor: '#BAE6FD',
      subtitle: 'Last 24h intake'
    },
    {
      id: 'unresolved' as const,
      label: 'Unresolved Incidents',
      count: stats.unresolved,
      icon: AlertCircle,
      color: '#7C3AED',
      bgColor: '#F5F3FF',
      borderColor: '#DDD6FE',
      subtitle: 'Pending verification / action'
    },
    {
      id: 'resolved' as const,
      label: 'Recently Resolved',
      count: stats.resolved,
      icon: CheckCircle2,
      color: '#059669',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
      subtitle: 'Audited & cleared'
    }
  ];

  return (
    <div style={{ marginBottom: '1.25rem' }}>
      {/* Page Header */}
      <PageHeader
        title="Live Risk Map"
        subtitle="Karnataka-wide urban risk intelligence and incident monitoring across 31 districts."
        badge={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <StatusBadge
              label="Simulated Demonstration Dataset"
              variant="warning"
              showDot
            />
            <span
              style={{
                fontSize: '0.6875rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
                backgroundColor: 'var(--bg-surface-subtle)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              Sync: Periodic Telemetry Stream
            </span>
          </div>
        }
        breadcrumbs={[
          { label: 'Portal', path: '#/overview' },
          { label: 'Live Risk Map', isCurrent: true }
        ]}
        actions={
          hasActiveFilters ? (
            <button
              type="button"
              onClick={onResetFilters}
              className="primary-btn"
              style={{
                width: 'auto',
                padding: '0.45rem 0.85rem',
                fontSize: '0.78rem',
                backgroundColor: '#FFFFFF',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-medium)',
                boxShadow: 'var(--shadow-xs)'
              }}
            >
              <RotateCcw size={13} />
              <span>Clear All Filters</span>
            </button>
          ) : undefined
        }
      />

      {/* 6 Summary Strip Cards */}
      <div
        className="map-summary-strip"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
          gap: '0.75rem',
          marginTop: '0.5rem'
        }}
      >
        {filterCards.map(card => {
          const isSelected = currentFilter === card.id;
          const IconComp = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSelectQuickFilter(isSelected ? 'all' : card.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: isSelected ? card.bgColor : '#FFFFFF',
                border: isSelected ? `2px solid ${card.color}` : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-xs)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                transform: isSelected ? 'translateY(-2px)' : 'none'
              }}
              title={`Click to filter by ${card.label}`}
              aria-pressed={isSelected}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {card.label}
                </span>
                <div
                  style={{
                    padding: '0.35rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: card.bgColor,
                    color: card.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconComp size={15} />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
                <span
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    fontFamily: 'var(--font-mono)',
                    color: isSelected ? card.color : 'var(--text-primary)',
                    lineHeight: 1
                  }}
                >
                  {card.count}
                </span>
              </div>

              <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                {card.subtitle}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
