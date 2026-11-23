import React, { useState } from 'react';
import { User, Mail, Phone, UserPlus, AlertCircle, ShieldAlert } from 'lucide-react';
import { FormField } from '../common/FormField';
import { PasswordField } from '../common/PasswordField';
import { PrimaryButton } from '../common/PrimaryButton';
import { AuthMessage } from '../common/AuthMessage';
import type { RegisterFormData, FormErrors, UserProfile, UserRole } from '../../types/auth';
import { authService } from '../../services/authService';

interface RegistrationFormProps {
  onSuccess: (user: UserProfile) => void;
  onNavigateToLogin: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({
  onSuccess,
  onNavigateToLogin
}) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    requestedRole: 'citizen'
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const validateField = (name: keyof RegisterFormData, value: any): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!String(value).trim()) return 'Full legal name is required.';
        if (String(value).trim().length < 3) return 'Name must be at least 3 characters.';
        return undefined;

      case 'email':
        if (!String(value).trim()) return 'Email address is required.';
        {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value).trim())) {
            return 'Please enter a valid email address (e.g. name@karnataka.gov or name@domain.com).';
          }
        }
        return undefined;

      case 'mobile':
        if (!String(value).trim()) return 'Mobile number is required for OTP emergency broadcasts.';
        {
          const cleanMobile = String(value).replace(/[\s-]/g, '');
          const mobileRegex = /^(\+91|91)?[6-9]\d{9}$/;
          if (!mobileRegex.test(cleanMobile)) {
            return 'Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
          }
        }
        return undefined;

      case 'password':
        if (!value) return 'Password is required.';
        if (String(value).length < 8) return 'Password must be at least 8 characters.';
        if (!/[A-Z]/.test(String(value))) return 'Password must include at least one uppercase letter.';
        if (!/[0-9]/.test(String(value))) return 'Password must include at least one number.';
        return undefined;

      case 'confirmPassword':
        if (!value) return 'Please confirm your password.';
        if (value !== formData.password) return 'Passwords do not match.';
        return undefined;

      case 'agreeTerms':
        if (!value) return 'You must agree to the Terms of Service and Karnataka Civic Privacy Policy.';
        return undefined;

      default:
        return undefined;
    }
  };

  const handleChange = (field: keyof RegisterFormData, value: any) => {
    setFormData((prev: RegisterFormData) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev: FormErrors) => ({ ...prev, [field]: undefined }));
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  const handleBlur = (field: keyof RegisterFormData) => {
    const errorMsg = validateField(field, formData[field]);
    if (errorMsg) {
      setErrors((prev: FormErrors) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};
    const fieldsToValidate: (keyof RegisterFormData)[] = [
      'fullName',
      'email',
      'mobile',
      'password',
      'confirmPassword',
      'agreeTerms'
    ];

    fieldsToValidate.forEach(field => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setGeneralError(null);

    try {
      const response = await authService.register(formData);

      if (response.success && response.user) {
        onSuccess(response.user);
      } else {
        setGeneralError(response.error || 'Registration failed.');
      }
    } catch (err) {
      setGeneralError('An unexpected network error occurred while submitting registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="form-stack">
      {generalError && (
        <AuthMessage
          type="error"
          title="Registration Error"
          message={generalError}
          onDismiss={() => setGeneralError(null)}
        />
      )}

      {/* Full Name */}
      <FormField
        id="reg-fullname"
        name="fullName"
        type="text"
        label="Full Name"
        icon={<User size={16} />}
        placeholder="e.g. Ramesh Kumar"
        autoComplete="name"
        value={formData.fullName}
        onChange={e => handleChange('fullName', e.target.value)}
        onBlur={() => handleBlur('fullName')}
        error={errors.fullName}
        required
      />

      {/* Email */}
      <FormField
        id="reg-email"
        name="email"
        type="email"
        label="Civic / Personal Email"
        icon={<Mail size={16} />}
        placeholder="e.g. ramesh.kumar@example.com"
        autoComplete="email"
        value={formData.email}
        onChange={e => handleChange('email', e.target.value)}
        onBlur={() => handleBlur('email')}
        error={errors.email}
        required
      />

      {/* Mobile Number */}
      <FormField
        id="reg-mobile"
        name="mobile"
        type="tel"
        label="Mobile Number (India)"
        icon={<Phone size={16} />}
        placeholder="10-digit mobile number"
        helpText="Required for emergency disaster broadcasts"
        autoComplete="tel"
        value={formData.mobile}
        onChange={e => handleChange('mobile', e.target.value)}
        onBlur={() => handleBlur('mobile')}
        error={errors.mobile}
        required
      />

      {/* Account Type / Requested Role */}
      <div className="form-group">
        <label htmlFor="reg-role" className="form-label">
          <span>Account Category</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Role assignment policy</span>
        </label>
        <select
          id="reg-role"
          value={formData.requestedRole}
          onChange={e => handleChange('requestedRole', e.target.value as UserRole)}
          className="form-input no-icon"
          style={{ cursor: 'pointer' }}
        >
          <option value="citizen">Karnataka Citizen (Public Risk Reports & Safety Feed)</option>
          <option value="authority">Civic Authority / Service Team (BBMP, KDMA, PWD, EMS)</option>
          <option value="ai_operator">AI Monitoring Centre Operator (Restricted Ops)</option>
        </select>

        {formData.requestedRole !== 'citizen' && (
          <div
            style={{
              padding: '0.5rem 0.65rem',
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: '6px',
              color: '#92400E',
              fontSize: '0.72rem',
              marginTop: '0.35rem',
              display: 'flex',
              gap: '0.4rem',
              alignItems: 'center'
            }}
          >
            <ShieldAlert size={14} style={{ flexShrink: 0 }} />
            <span>
              <strong>Notice:</strong> Protected accounts will be provisioned in provisional status until departmental badge verification by a State Nodal Officer.
            </span>
          </div>
        )}
      </div>

      {/* Password with strength meter */}
      <PasswordField
        id="reg-password"
        name="password"
        label="Password"
        autoComplete="new-password"
        placeholder="Min. 8 characters with uppercase and number"
        value={formData.password}
        onChange={e => handleChange('password', e.target.value)}
        onBlur={() => handleBlur('password')}
        error={errors.password}
        showStrengthMeter
        required
      />

      {/* Confirm Password */}
      <PasswordField
        id="reg-confirm-password"
        name="confirmPassword"
        label="Confirm Password"
        autoComplete="new-password"
        placeholder="Re-enter your password"
        value={formData.confirmPassword}
        onChange={e => handleChange('confirmPassword', e.target.value)}
        onBlur={() => handleBlur('confirmPassword')}
        error={errors.confirmPassword}
        required
      />

      {/* Terms & Privacy Checkbox */}
      <div style={{ marginTop: '0.25rem' }}>
        <label htmlFor="reg-terms" className="checkbox-label" style={{ alignItems: 'flex-start' }}>
          <input
            id="reg-terms"
            type="checkbox"
            className="checkbox-input"
            checked={formData.agreeTerms}
            onChange={e => handleChange('agreeTerms', e.target.checked)}
            style={{ marginTop: '2px' }}
          />
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            I agree to the <a href="#terms" onClick={e => e.preventDefault()}>Terms of Civic Service</a> and acknowledge the{' '}
            <a href="#privacy" onClick={e => e.preventDefault()}>Urban Data Privacy Framework</a> for Karnataka incident reporting.
          </span>
        </label>
        {errors.agreeTerms && (
          <div className="field-error-msg" style={{ marginTop: '0.25rem' }}>
            <AlertCircle size={14} style={{ flexShrink: 0 }} />
            <span>{errors.agreeTerms}</span>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <PrimaryButton
        type="submit"
        isLoading={isLoading}
        loadingText="Registering Civic Account..."
        icon={<UserPlus size={17} />}
      >
        Create UrbanShield Account
      </PrimaryButton>

      {/* Link back to login */}
      <div style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
        Already registered?{' '}
        <button
          type="button"
          onClick={onNavigateToLogin}
          style={{
            color: 'var(--brand-primary)',
            fontWeight: 700,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px'
          }}
        >
          Sign In Here
        </button>
      </div>
    </form>
  );
};
