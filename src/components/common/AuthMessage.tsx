import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type AuthMessageType = 'error' | 'success' | 'warning' | 'info';

interface AuthMessageProps {
  type: AuthMessageType;
  title?: string;
  message: string;
  onDismiss?: () => void;
  className?: string;
}

export const AuthMessage: React.FC<AuthMessageProps> = ({
  type,
  title,
  message,
  onDismiss,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0 }} />;
      case 'warning':
        return <AlertTriangle size={18} style={{ color: '#D97706', flexShrink: 0 }} />;
      case 'error':
        return <AlertCircle size={18} style={{ color: '#DC2626', flexShrink: 0 }} />;
      case 'info':
      default:
        return <Info size={18} style={{ color: '#0284C7', flexShrink: 0 }} />;
    }
  };

  return (
    <div
      className={`auth-message-banner ${type} ${className}`}
      role={type === 'error' ? 'alert' : 'status'}
      aria-live="polite"
    >
      {getIcon()}
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{ fontWeight: 700, marginBottom: '0.15rem' }}>
            {title}
          </div>
        )}
        <div>{message}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            opacity: 0.6,
            padding: '2px',
            cursor: 'pointer',
            display: 'flex'
          }}
          aria-label="Dismiss message"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
