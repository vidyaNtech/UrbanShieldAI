import React from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { KarnatakaGeoVisual } from './KarnatakaGeoVisual';
import { RoleAccessGuide } from './RoleAccessGuide';
import type { AuthMode, UserRole } from '../../types/auth';
import { Shield, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  authMode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  children: React.ReactNode;
  onSelectRolePreset?: (role: UserRole) => void;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  authMode,
  onModeChange,
  children,
  onSelectRolePreset
}) => {
  return (
    <div className="auth-page-container">
      <main className="auth-shell">
        {/* =========================================================================
            LEFT PANEL: Civic Intelligence Branding & Karnataka Geospatial Visual
            ========================================================================= */}
        <section className="hero-panel" aria-label="UrbanShield AI Overview">
          {/* Header Block */}
          <div className="hero-header">
            <div className="hero-brand-row">
              <BrandLogo size="lg" variant="light" />
              <span className="badge-state">KA • STATEWIDE</span>
            </div>

            <div className="hero-tagline">
              <Sparkles size={18} style={{ color: '#34D399', flexShrink: 0 }} />
              <span>Smarter Cities. Safer Communities.</span>
            </div>

            <p className="hero-description">
              UrbanShield AI is Karnataka's unified urban risk intelligence and citizen response platform.
              It enables civic communities, emergency services, and municipal authorities to predict,
              monitor, and rapidly resolve urban hazards across 31 districts.
            </p>
          </div>

          {/* Center Visual: Dynamic Karnataka Geospatial Grid */}
          <div className="hero-visual-wrapper">
            <KarnatakaGeoVisual />
          </div>

          {/* Bottom Illustrative Telemetry Stats & Clarification */}
          <div>
            <div className="hero-stats-grid">
              <div className="stat-card">
                <span className="stat-value">31</span>
                <span className="stat-label">Districts Monitored</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">99.4%</span>
                <span className="stat-label">Telemetry Uptime</span>
              </div>
              <div className="stat-card">
                <span className="stat-value">&lt; 14m</span>
                <span className="stat-label">Response Dispatch</span>
              </div>
            </div>

            <div className="hero-disclaimer">
              <Shield size={12} style={{ color: '#64748B' }} />
              <span>Demonstration Environment • Metrics shown are illustrative prototype simulation parameters.</span>
            </div>
          </div>
        </section>

        {/* =========================================================================
            RIGHT PANEL: Authentication Card & Action Portal
            ========================================================================= */}
        <section className="auth-panel" aria-label="User Authentication">
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-heading">
              {authMode === 'login' && 'Sign In to Portal'}
              {authMode === 'register' && 'Register Civic Account'}
              {authMode === 'forgot_password' && 'Password Recovery'}
            </h1>
            <p className="auth-subheading">
              {authMode === 'login' && 'Access Karnataka real-time risk intelligence, hazard alerts, and dispatch networks.'}
              {authMode === 'register' && 'Join the Karnataka citizen reporting network or register as an authorized field unit.'}
              {authMode === 'forgot_password' && 'Verify your account email to receive cryptographic password reset credentials.'}
            </p>
          </div>

          {/* Mode Switcher Tabs (Only visible when not on forgot password) */}
          {authMode !== 'forgot_password' ? (
            <div className="auth-tabs" role="tablist" aria-label="Authentication Options">
              <button
                type="button"
                role="tab"
                id="tab-login"
                aria-selected={authMode === 'login'}
                aria-controls="panel-auth-form"
                className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
                onClick={() => onModeChange('login')}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                id="tab-register"
                aria-selected={authMode === 'register'}
                aria-controls="panel-auth-form"
                className={`auth-tab-btn ${authMode === 'register' ? 'active' : ''}`}
                onClick={() => onModeChange('register')}
              >
                Register
              </button>
            </div>
          ) : null}

          {/* Active Form */}
          <div id="panel-auth-form" role="tabpanel">
            {children}
          </div>

          {/* Role Access Guidance Accordion */}
          <RoleAccessGuide onSelectRolePreset={onSelectRolePreset} />
        </section>
      </main>
    </div>
  );
};
