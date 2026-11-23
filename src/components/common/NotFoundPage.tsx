import React from 'react';
import { Compass, Home } from 'lucide-react';

interface NotFoundPageProps {
  currentPath: string;
  onNavigateHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ currentPath, onNavigateHome }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '4rem 1.5rem',
        maxWidth: '540px',
        margin: '0 auto'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: '#F1F5F9',
          color: '#64748B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem'
        }}
      >
        <Compass size={32} />
      </div>

      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8125rem',
          fontWeight: 700,
          color: '#059669',
          backgroundColor: '#ECFDF5',
          padding: '2px 8px',
          borderRadius: '4px',
          marginBottom: '0.75rem'
        }}
      >
        HTTP 404 • UNRESOLVED CIVIC ROUTE
      </span>

      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Route Destination Not Found
      </h1>

      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
        The requested path <code style={{ fontFamily: 'var(--font-mono)', backgroundColor: '#E2E8F0', padding: '2px 5px', borderRadius: '4px' }}>{currentPath}</code> does not match any registered navigation terminal in the UrbanShield AI portal.
      </p>

      <button
        type="button"
        onClick={onNavigateHome}
        className="primary-btn"
        style={{ width: 'auto', padding: '0.6rem 1.25rem', fontSize: '0.875rem' }}
      >
        <Home size={16} />
        <span>Return to Platform Overview</span>
      </button>
    </div>
  );
};
