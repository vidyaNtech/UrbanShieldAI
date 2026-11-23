import React, { useState } from 'react';
import { Mail, ArrowRight, UserCheck, Sparkles } from 'lucide-react';
import { FormField } from '../common/FormField';
import { PasswordField } from '../common/PasswordField';
import { PrimaryButton } from '../common/PrimaryButton';
import { AuthMessage } from '../common/AuthMessage';
import type { LoginFormData, FormErrors, UserProfile } from '../../types/auth';
import { authService, DEMO_PRESETS } from '../../services/authService';

interface LoginFormProps {
  onSuccess: (user: UserProfile) => void;
  onNavigateToRegister: () => void;
  onNavigateToForgot: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onNavigateToRegister,
  onNavigateToForgot
}) => {
  const [formData, setFormData] = useState<LoginFormData>({
    identifier: '',
    password: '',
    rememberMe: false
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Field validation logic
  const validateField = (name: keyof LoginFormData, value: string): string | undefined => {
    switch (name) {
      case 'identifier':
        if (!value.trim()) return 'Civic email or registered username is required.';
        if (value.includes('@')) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value.trim())) {
            return 'Please enter a valid email format (e.g. name@domain.com).';
          }
        }
        return undefined;

      case 'password':
        if (!value) return 'Password is required to authenticate.';
        if (value.length < 6) return 'Password must be at least 6 characters.';
        return undefined;

      default:
        return undefined;
    }
  };

  const handleChange = (field: keyof LoginFormData, value: any) => {
    setFormData((prev: LoginFormData) => ({ ...prev, [field]: value }));
    // Clear field-level error on change
    if (errors[field]) {
      setErrors((prev: FormErrors) => ({ ...prev, [field]: undefined }));
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const handleBlur = (field: keyof LoginFormData) => {
    const errorMsg = validateField(field, String(formData[field] || ''));
    if (errorMsg) {
      setErrors((prev: FormErrors) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const idError = validateField('identifier', formData.identifier);
    const passError = validateField('password', formData.password);

    if (idError || passError) {
      setErrors({
        identifier: idError,
        password: passError
      });
      return;
    }

    setIsLoading(true);
    setGeneralError(null);

    try {
      const response = await authService.login(formData);

      if (response.success && response.user) {
        onSuccess(response.user);
      } else {
        setGeneralError(response.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err) {
      setGeneralError('An unexpected client error occurred while initiating authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick preset loader for tester convenience
  const handleApplyPreset = (preset: typeof DEMO_PRESETS[0]) => {
    setFormData({
      identifier: preset.email,
      password: 'CivicSecurePass2026!',
      rememberMe: true,
      selectedRoleForDemo: preset.role
    });
    setErrors({});
    setGeneralError(null);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="form-stack">
      {/* General Authentication Alert */}
      {generalError && (
        <AuthMessage
          type="error"
          title="Sign-In Error"
          message={generalError}
          onDismiss={() => setGeneralError(null)}
        />
      )}

      {/* Identifier / Email Field */}
      <FormField
        id="login-identifier"
        name="identifier"
        type="email"
        label="Civic Email or Username"
        icon={<Mail size={16} />}
        placeholder="e.g. officer.deshmukh@bbmp.gov.in"
        autoComplete="username"
        value={formData.identifier}
        onChange={e => handleChange('identifier', e.target.value)}
        onBlur={() => handleBlur('identifier')}
        error={errors.identifier}
        required
      />

      {/* Password Field with visibility toggle */}
      <PasswordField
        id="login-password"
        name="password"
        label="Password"
        autoComplete="current-password"
        placeholder="Enter your security password"
        value={formData.password}
        onChange={e => handleChange('password', e.target.value)}
        onBlur={() => handleBlur('password')}
        error={errors.password}
        required
      />

      {/* Sublinks Row: Remember Me & Forgot Password */}
      <div className="auth-sublinks-row">
        <label htmlFor="remember-me" className="checkbox-label">
          <input
            id="remember-me"
            type="checkbox"
            className="checkbox-input"
            checked={formData.rememberMe}
            onChange={e => handleChange('rememberMe', e.target.checked)}
          />
          <span>Remember this workstation</span>
        </label>

        <button
          type="button"
          onClick={onNavigateToForgot}
          style={{
            fontSize: '0.8125rem',
            color: 'var(--brand-primary)',
            fontWeight: 600,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0
          }}
        >
          Forgot password?
        </button>
      </div>

      {/* Primary Sign In Button */}
      <PrimaryButton
        type="submit"
        isLoading={isLoading}
        loadingText="Verifying Civic Credentials..."
        icon={<ArrowRight size={17} />}
      >
        Sign In to UrbanShield
      </PrimaryButton>

      {/* Switch to Registration Mode */}
      <div style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        New to UrbanShield AI?{' '}
        <button
          type="button"
          onClick={onNavigateToRegister}
          style={{
            color: 'var(--brand-primary)',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px'
          }}
        >
          Register for Citizen Access
        </button>
      </div>

      {/* Prototype Testing Sandbox Helper */}
      <div
        style={{
          marginTop: '1.25rem',
          padding: '0.85rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          borderRadius: '8px',
          border: '1px dashed var(--border-medium)',
          fontSize: '0.75rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            fontWeight: 700,
            color: 'var(--text-secondary)',
            marginBottom: '0.5rem'
          }}
        >
          <Sparkles size={14} style={{ color: 'var(--brand-primary)' }} />
          <span>Prototype Role Presets (Click to autofill):</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.4rem' }}>
          {DEMO_PRESETS.map(preset => (
            <button
              key={preset.role}
              type="button"
              onClick={() => handleApplyPreset(preset)}
              style={{
                fontSize: '0.7rem',
                padding: '0.4rem 0.5rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
              title={`Load ${preset.label} (${preset.email})`}
            >
              <UserCheck size={12} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{preset.label.split('(')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </form>
  );
};
