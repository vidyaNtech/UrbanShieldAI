import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Lock, User, Radio, KeyRound, AlertCircle } from 'lucide-react';
import { ROLE_DEFINITIONS } from '../../services/authService';
import type { UserRole } from '../../types/auth';

interface RoleAccessGuideProps {
  onSelectRolePreset?: (role: UserRole) => void;
}

export const RoleAccessGuide: React.FC<RoleAccessGuideProps> = ({ onSelectRolePreset }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'citizen':
        return <User size={15} />;
      case 'authority':
        return <ShieldCheck size={15} />;
      case 'ai_operator':
        return <Radio size={15} />;
      case 'administrator':
        return <KeyRound size={15} />;
    }
  };

  return (
    <div className="role-guidance-card">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left'
        }}
        aria-expanded={isOpen}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={14} style={{ color: 'var(--brand-primary)' }} />
          <span>Karnataka Civic Role & Security Tier Guide</span>
        </div>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isOpen && (
        <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)' }}>
          {/* Strict Security Architecture Notice */}
          <div
            style={{
              padding: '0.6rem 0.75rem',
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '6px',
              color: '#92400E',
              fontSize: '0.72rem',
              lineHeight: 1.45,
              marginBottom: '0.75rem',
              display: 'flex',
              gap: '0.5rem',
              alignItems: 'flex-start'
            }}
          >
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <strong>Security Architecture:</strong> Elevated roles (Authority, AI Operator, Admin) cannot be self-assigned. In production, access is enforced via cryptographic tokens, departmental identity providers (KDMA/BBMP SSO), and manual officer verification.
            </div>
          </div>

          {/* Role selector tabs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {(Object.keys(ROLE_DEFINITIONS) as UserRole[]).map(roleKey => {
              const info = ROLE_DEFINITIONS[roleKey];
              const isSelected = selectedRole === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => {
                    setSelectedRole(roleKey);
                    if (onSelectRolePreset) onSelectRolePreset(roleKey);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: isSelected ? 700 : 500,
                    backgroundColor: isSelected ? 'var(--bg-surface)' : 'transparent',
                    border: isSelected ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
                    color: isSelected ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    textAlign: 'left',
                    boxShadow: isSelected ? 'var(--shadow-xs)' : 'none'
                  }}
                >
                  {getRoleIcon(roleKey)}
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {info.title.split('/')[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Details for active selected role */}
          {ROLE_DEFINITIONS[selectedRole] && (
            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {ROLE_DEFINITIONS[selectedRole].title}
                </span>
                <span className={`role-badge ${ROLE_DEFINITIONS[selectedRole].badgeColor}`}>
                  {ROLE_DEFINITIONS[selectedRole].isRestricted ? 'Restricted Access' : 'Open Civic Access'}
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '0.45rem', lineHeight: 1.4 }}>
                {ROLE_DEFINITIONS[selectedRole].subtitle}
              </p>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                <strong>Verification protocol:</strong> {ROLE_DEFINITIONS[selectedRole].accessRequirements}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
