import React, { useState } from 'react';
import { PageHeader } from '../common/PageHeader';
import { SummaryCard } from '../common/SummaryCard';
import { StatusBadge } from '../common/StatusBadge';
import { FilterBar } from '../common/FilterBar';
import { NavIcon } from '../common/NavIcon';
import type { UserProfile, UserRole } from '../../types/auth';
import { 
  ArrowRight, 
  Sparkles
} from 'lucide-react';

interface OverviewDashboardViewProps {
  user: UserProfile;
  onNavigate: (path: string) => void;
}

export const OverviewDashboardView: React.FC<OverviewDashboardViewProps> = ({
  user,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'citizen': return 'Citizen Response Console';
      case 'authority': return 'Civic Authority Operations Console';
      case 'ai_operator': return 'AI Monitoring Centre Console';
      case 'administrator': return 'State Administration & Governance';
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'citizen': return 'success';
      case 'authority': return 'warning';
      case 'ai_operator': return 'info';
      case 'administrator': return 'critical';
    }
  };

  return (
    <div className="overview-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <PageHeader
        title={getRoleDisplayName(user.role)}
        subtitle={`Real-time urban risk telemetry, hazard coordination, and citizen reporting for ${user.district || 'Karnataka'}.`}
        badge={
          <StatusBadge
            label={`Session: ${user.role.toUpperCase()}`}
            variant={getRoleBadgeVariant(user.role)}
          />
        }
        breadcrumbs={[
          { label: 'Portal', path: '#/overview' },
          { label: 'Overview', isCurrent: true }
        ]}
        actions={
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => onNavigate('#/citizen/report-problem')}
              className="primary-btn"
              style={{ width: 'auto', padding: '0.55rem 1rem', fontSize: '0.8125rem', backgroundColor: '#0d9488' }}
            >
              <NavIcon name="PlusCircle" size={15} />
              <span>Report a Problem</span>
            </button>
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
              <NavIcon name="Map" size={15} />
              <span>Live Risk Map</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('#/risk-analytics')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.55rem 1rem',
                backgroundColor: 'var(--brand-primary-light, #ecfdf5)',
                color: 'var(--brand-primary, #059669)',
                border: '1px solid var(--brand-primary-border, #a7f3d0)',
                borderRadius: 'var(--radius-md, 6px)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <NavIcon name="BarChart3" size={15} />
              <span>Environmental Intelligence</span>
            </button>
          </div>
        }
      />

      {/* Development Context Notice for Task 02 */}
      <div
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start'
        }}
      >
        <div
          style={{
            padding: '0.5rem',
            backgroundColor: '#ECFDF5',
            color: '#059669',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Sparkles size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              Shared Application Shell & Design System Active (Task 02)
            </span>
            <span className="role-badge emerald" style={{ fontSize: '0.65rem' }}>
              Milestone Verified
            </span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            This shell provides the foundation for UrbanShield AI. The header, role-aware sidebar,
            reusable building blocks (PageHeader, SummaryCard, StatusBadge, FilterBar), and responsive navigation
            are fully operational. Sub-pages are mapped to structured placeholders ready for subsequent development phases.
          </p>
        </div>
      </div>

      {/* Metrics Row using SummaryCard component */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <SummaryCard
          title="Monitored Districts"
          value="31"
          subtitle="Karnataka Statewide Grid"
          iconName="Map"
          trend={{ value: '100%', direction: 'up', label: 'coverage' }}
          accentColor="emerald"
        />

        <SummaryCard
          title="Active Telemetry Nodes"
          value="2,480"
          subtitle="Drainage, CCTV & Weather"
          iconName="Activity"
          trend={{ value: '+42', direction: 'up', label: 'this week' }}
          accentColor="blue"
        />

        <SummaryCard
          title="Incident Triage Latency"
          value="12.4m"
          subtitle="BBMP & KDMA SLA"
          iconName="CheckSquare"
          trend={{ value: '-3.1m', direction: 'up', label: 'faster' }}
          accentColor="purple"
        />

        <SummaryCard
          title="Hazard Alert Status"
          value="Level 1"
          subtitle="Normal Monsoon Readiness"
          iconName="AlertTriangle"
          trend={{ value: 'Stable', direction: 'neutral' }}
          accentColor="amber"
        />
      </div>

      {/* FilterBar Example */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter risk categories, wards, or tickets..."
        filters={[
          { id: 'all', label: 'All Telemetry', count: 184 },
          { id: 'waterlogging', label: 'Waterlogging & Flood', count: 28 },
          { id: 'structural', label: 'Pothole & Roads', count: 64 },
          { id: 'drainage', label: 'SWD Blockages', count: 41 },
          { id: 'alerts', label: 'Emergency Broadcasts', count: 5 }
        ]}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Quick Access Matrix to Planned Features */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Core Navigation Routes Registered
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              Select any destination to test the shared application container and placeholder routing:
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '0.85rem' }}>
          {[
            { label: 'Report a Problem', path: '#/citizen/report-problem', icon: 'PlusCircle', desc: 'Report potholes, flooding, or damaged civic assets' },
            { label: 'My Submitted Reports', path: '#/citizen/my-reports', icon: 'ListChecks', desc: 'Track municipal verification and resolution' },
            { label: 'Live Risk Map', path: '#/risk-map', icon: 'Map', desc: 'Geospatial risk contours & district sensors' },
            { label: 'Risk Analytics', path: '#/risk-analytics', icon: 'BarChart3', desc: 'Predictive precipitation & runoff analysis' },
            { label: 'Resolution Tracking', path: '#/resolution-tracking', icon: 'CheckSquare', desc: 'Verified civic response audits' }
          ].map(route => (
            <button
              key={route.path}
              type="button"
              onClick={() => onNavigate(route.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                padding: '1rem',
                backgroundColor: 'var(--bg-canvas)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              className="quick-route-card"
            >
              <div
                style={{
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--brand-primary-light)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <NavIcon name={route.icon} size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {route.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {route.desc}
                </div>
              </div>
              <ArrowRight size={15} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
