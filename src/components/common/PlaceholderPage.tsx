import React from 'react';
import { PageHeader } from './PageHeader';
import { StatusBadge } from './StatusBadge';
import { NavIcon } from './NavIcon';
import { ArrowLeft, Clock, Shield, CheckCircle2 } from 'lucide-react';
import type { NavItem } from '../../types/navigation';
import type { UserProfile } from '../../types/auth';

interface PlaceholderPageProps {
  navItem: NavItem;
  user: UserProfile;
  onNavigate: (path: string) => void;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  navItem,
  user,
  onNavigate
}) => {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      <PageHeader
        title={navItem.label}
        subtitle={navItem.description || `Karnataka Urban Risk Intelligence — ${navItem.label}`}
        badge={<StatusBadge label="Roadmap Feature • In Preparation" variant="info" />}
        breadcrumbs={[
          { label: 'Portal', path: '#/overview' },
          { label: navItem.label, isCurrent: true }
        ]}
        actions={
          <button
            type="button"
            onClick={() => onNavigate('#/overview')}
            className="primary-btn"
            style={{
              width: 'auto',
              padding: '0.5rem 1rem',
              fontSize: '0.8125rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'none'
            }}
          >
            <ArrowLeft size={14} />
            <span>Back to Overview</span>
          </button>
        }
      />

      {/* Main Roadmap & Architecture Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: '2rem',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}
      >
        {/* Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: '#F0F9FF',
            border: '1px solid #BAE6FD',
            borderRadius: 'var(--radius-lg)'
          }}
        >
          <div
            style={{
              padding: '0.65rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: '#E0F2FE',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <NavIcon name={navItem.iconName} size={24} />
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0369A1' }}>
                {navItem.label} Destination Ready
              </h2>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.6875rem',
                  backgroundColor: '#BAE6FD',
                  color: '#075985',
                  padding: '2px 6px',
                  borderRadius: '4px'
                }}
              >
                {navItem.path}
              </span>
            </div>
            <p style={{ fontSize: '0.8125rem', color: '#0C4A6E', lineHeight: 1.5 }}>
              This route has been registered in the UrbanShield AI shared application shell. In accordance with
              development rules, the navigation container is fully configured and ready for the dedicated domain
              view to be implemented in its designated development milestone.
            </p>
          </div>
        </div>

        {/* Feature Plan Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <Clock size={16} style={{ color: 'var(--brand-primary)' }} />
              <span>Target Role Context</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.45, marginBottom: '0.5rem' }}>
              Accessible in active session:
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              <Shield size={14} style={{ color: '#059669' }} />
              <span>{user.fullName} ({user.role})</span>
            </div>
          </div>

          <div
            style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <CheckCircle2 size={16} style={{ color: 'var(--brand-primary)' }} />
              <span>Architecture Standards</span>
            </div>
            <ul style={{ paddingLeft: '1.1rem', margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              <li>Shared header and role sidebar integrated</li>
              <li>Responsive mobile navigation support</li>
              <li>Statewide telemetry pipeline ready</li>
            </ul>
          </div>
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            onClick={() => onNavigate('#/overview')}
            className="primary-btn"
            style={{ width: 'auto', padding: '0.55rem 1.25rem', fontSize: '0.84rem' }}
          >
            <span>Return to Overview Console</span>
          </button>
        </div>
      </div>
    </div>
  );
};
