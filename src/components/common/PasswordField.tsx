import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  label: string;
  error?: string;
  showStrengthMeter?: boolean;
  required?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  error,
  showStrengthMeter = false,
  required = false,
  value = '',
  onChange,
  ...inputProps
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const calculateStrength = (pass: string): { score: number; label: string; color: string } => {
    if (!pass) return { score: 0, label: '', color: '#CBD5E1' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: '#DC2626' };
      case 2:
        return { score: 2, label: 'Fair', color: '#D97706' };
      case 3:
        return { score: 3, label: 'Good', color: '#0284C7' };
      case 4:
        return { score: 4, label: 'Strong (Civic Standard)', color: '#059669' };
      default:
        return { score: 0, label: 'Very Weak', color: '#DC2626' };
    }
  };

  const strength = calculateStrength(String(value));

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        <span>
          {label}
          {required && <span className="required-star" aria-hidden="true">*</span>}
        </span>
      </label>

      <div className="form-input-wrapper">
        <span className="form-input-icon">
          <Lock size={16} />
        </span>

        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          className={`form-input has-trailing ${error ? 'is-invalid' : ''}`}
          value={value}
          onChange={onChange}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          required={required}
          {...inputProps}
        />

        <button
          type="button"
          className="trailing-toggle-btn"
          onClick={() => setShowPassword(prev => !prev)}
          title={showPassword ? 'Hide password' : 'Show password'}
          aria-label={showPassword ? `Hide password for ${label}` : `Show password for ${label}`}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {showStrengthMeter && value && String(value).length > 0 && (
        <div style={{ marginTop: '0.35rem' }}>
          <div className="password-strength-bar">
            {[1, 2, 3, 4].map(idx => (
              <div
                key={idx}
                className="strength-segment"
                style={{
                  backgroundColor: idx <= strength.score ? strength.color : undefined
                }}
              />
            ))}
          </div>
          <div className="strength-label">
            <span>Security Strength</span>
            <span style={{ fontWeight: 600, color: strength.color }}>{strength.label}</span>
          </div>
        </div>
      )}

      {error && (
        <div id={`${id}-error`} className="field-error-msg" role="alert">
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
