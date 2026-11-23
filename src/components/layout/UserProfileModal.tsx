import React, { useEffect } from 'react';
import { X, Building, MapPin, BadgeCheck, Terminal, Shield, LogOut } from 'lucide-react';
import type { UserProfile, UserRole } from '../../types/auth';

interface UserProfileModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  isOpen,
  onClose,
  onLogout
}) => {
  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'citizen': return 'Karnataka Citizen';
      case 'authority': return 'Civic Authority / Service Team';
      case 'ai_operator': return 'AI Telemetry Operator';
      case 'administrator': return 'System Administrator';
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'citizen': return 'emerald';
      case 'authority': return 'amber';
      case 'ai_operator': return 'blue';
      case 'administrator': return 'purple';
      default: return 'emerald';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        zIndex: 2000,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-canvas)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--brand-primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9375rem'
              }}
            >
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 id="profile-modal-title" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {user.fullName}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user.email}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              borderRadius: 'var(--radius-xs)'
            }}
            aria-label="Close profile modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Role Status Tag */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Assigned Role & Authorization
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.1rem' }}>
                {getRoleDisplayName(user.role)}
              </div>
            </div>
            <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
              <BadgeCheck size={13} />
              {user.isVerified ? 'Verified Profile' : 'Pending Verification'}
            </span>
          </div>

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <Building size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Department</div>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {user.department || 'Karnataka General Citizenry'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <MapPin size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>District / Zone</div>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {user.district || 'Karnataka Statewide'}
                </div>
              </div>
            </div>

            {user.badgeNumber && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <Terminal size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Officer Badge ID</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
                    {user.badgeNumber}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }}>
              <Shield size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>Security Clearance</div>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {user.clearanceLevel || (user.role === 'citizen' ? 'L1 Public' : 'L2 Authorized')}
                </div>
              </div>
            </div>
          </div>

          {/* Prototype Boundary Disclaimer */}
          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.72rem',
              color: '#92400E',
              lineHeight: 1.45
            }}
          >
            <strong>Prototype Session Notice:</strong> In production, user credentials and elevated role authorizations are cryptographically validated by the Karnataka State e-Governance SSO service.
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-canvas)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <button
            type="button"
            onClick={onLogout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: '#DC2626',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              cursor: 'pointer'
            }}
          >
            <LogOut size={14} />
            <span>Sign Out Session</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="primary-btn"
            style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}
          >
            <span>Close Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};
