import React from 'react';
import { AlertCircle } from 'lucide-react';

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon?: React.ReactNode;
  error?: string;
  helpText?: string;
  required?: boolean;
  trailingElement?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  icon,
  error,
  helpText,
  required = false,
  trailingElement,
  className = '',
  ...inputProps
}) => {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        <span>
          {label}
          {required && <span className="required-star" aria-hidden="true">*</span>}
        </span>
        {helpText && !error && (
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
            {helpText}
          </span>
        )}
      </label>

      <div className="form-input-wrapper">
        {icon && <span className="form-input-icon">{icon}</span>}
        
        <input
          id={id}
          className={`form-input ${!icon ? 'no-icon' : ''} ${trailingElement ? 'has-trailing' : ''} ${
            error ? 'is-invalid' : ''
          } ${className}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          required={required}
          {...inputProps}
        />

        {trailingElement}
      </div>

      {error && (
        <div id={`${id}-error`} className="field-error-msg" role="alert">
          <AlertCircle size={14} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
