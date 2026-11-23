import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, ShieldQuestion } from 'lucide-react';
import { FormField } from '../common/FormField';
import { PrimaryButton } from '../common/PrimaryButton';
import { AuthMessage } from '../common/AuthMessage';
import type { ForgotPasswordFormData, FormErrors } from '../../types/auth';
import { authService } from '../../services/authService';

interface ForgotPasswordFormProps {
  onNavigateToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onNavigateToLogin }) => {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({ email: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const validate = (): boolean => {
    if (!formData.email.trim()) {
      setErrors({ email: 'Registered email address is required.' });
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrors({ email: 'Please enter a valid email format.' });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setSubmittedMessage(null);

    try {
      const response = await authService.requestPasswordReset(formData);
      setSubmittedMessage(
        response.message ||
        'If an account matching this address exists in the UrbanShield AI directory, password recovery instructions have been dispatched.'
      );
    } catch (err) {
      // Keep message neutral even on network error for security
      setSubmittedMessage('If an account matching this address exists, a recovery dispatch has been initiated.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-stack">
      {/* Informative Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
        <ShieldQuestion size={18} style={{ color: 'var(--brand-primary)' }} />
        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Account Recovery Dispatch</span>
      </div>

      <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        Enter the verified email address associated with your UrbanShield account. We will dispatch cryptographic reset instructions.
      </p>

      {/* Confirmation Banner */}
      {submittedMessage ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
          <AuthMessage
            type="info"
            title="Recovery Dispatched"
            message={submittedMessage}
          />

          <div
            style={{
              padding: '0.75rem',
              backgroundColor: '#F8FAFC',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}
          >
            <strong>Security Notice:</strong> In adherence to civic cybersecurity guidelines, UrbanShield AI never indicates whether an email is registered in our directory.
          </div>

          <button
            type="button"
            onClick={onNavigateToLogin}
            className="primary-btn"
            style={{ marginTop: '0.5rem' }}
          >
            <ArrowLeft size={16} />
            <span>Return to Sign In</span>
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="form-stack" style={{ marginTop: '0.5rem' }}>
          <FormField
            id="forgot-email"
            type="email"
            label="Verified Account Email"
            icon={<Mail size={16} />}
            placeholder="e.g. officer.deshmukh@bbmp.gov.in"
            autoComplete="email"
            value={formData.email}
            onChange={e => {
              setFormData({ email: e.target.value });
              if (errors.email) setErrors({});
            }}
            error={errors.email}
            required
          />

          <PrimaryButton
            type="submit"
            isLoading={isLoading}
            loadingText="Dispatching Recovery Token..."
            icon={<Send size={16} />}
          >
            Send Recovery Link
          </PrimaryButton>

          <button
            type="button"
            onClick={onNavigateToLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              fontSize: '0.8125rem',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0.5rem'
            }}
          >
            <ArrowLeft size={15} />
            <span>Back to Sign In</span>
          </button>
        </form>
      )}
    </div>
  );
};
