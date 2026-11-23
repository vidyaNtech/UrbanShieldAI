import React from 'react';
import { FolderSearch, AlertTriangle, RefreshCw } from 'lucide-react';
import { NavIcon } from './NavIcon';

interface EmptyStateProps {
  title: string;
  description: string;
  iconName?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  iconName,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div
      className={`empty-state-card ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 2rem',
        backgroundColor: '#FFFFFF',
        border: '1px dashed var(--border-medium)',
        borderRadius: 'var(--radius-xl)',
        margin: '1.5rem 0'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-surface-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          marginBottom: '1rem'
        }}
      >
        {iconName ? <NavIcon name={iconName} size={28} /> : <FolderSearch size={28} />}
      </div>

      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.35rem'
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.84rem',
          color: 'var(--text-muted)',
          maxWidth: '440px',
          lineHeight: 1.5,
          marginBottom: actionText ? '1.25rem' : '0'
        }}
      >
        {description}
      </p>

      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="primary-btn"
          style={{ width: 'auto', padding: '0.5rem 1.25rem', fontSize: '0.8125rem' }}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading civic telemetry...' }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-xl)',
        gap: '1rem'
      }}
    >
      <div className="btn-spinner" style={{ width: '2rem', height: '2rem', borderColor: 'rgba(5, 150, 105, 0.2)', borderTopColor: '#059669' }} />
      <span style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 500 }}>
        {message}
      </span>
    </div>
  );
};

export const ErrorState: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
}> = ({
  title = 'Unable to Load Data',
  message = 'A connection error occurred while communicating with the civic data service.',
  onRetry
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 2rem',
        backgroundColor: '#FEF2F2',
        border: '1px solid #FECACA',
        borderRadius: 'var(--radius-xl)'
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#FEE2E2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#DC2626',
          marginBottom: '0.75rem'
        }}
      >
        <AlertTriangle size={24} />
      </div>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#991B1B', marginBottom: '0.25rem' }}>
        {title}
      </h3>

      <p style={{ fontSize: '0.8125rem', color: '#B91C1C', maxWidth: '420px', lineHeight: 1.45, marginBottom: '1.25rem' }}>
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="primary-btn"
          style={{ width: 'auto', backgroundColor: '#DC2626', padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
        >
          <RefreshCw size={14} />
          <span>Retry Request</span>
        </button>
      )}
    </div>
  );
};
