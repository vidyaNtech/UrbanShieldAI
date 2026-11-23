import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'light',
  showSubtitle = true
}) => {
  const iconSizes = {
    sm: 30,
    md: 40,
    lg: 52
  };

  const titleSizes = {
    sm: '1.125rem',
    md: '1.375rem',
    lg: '1.75rem'
  };

  const isLight = variant === 'light';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {/* Custom Shield & Geo-Beacon SVG */}
      <svg
        width={iconSizes[size]}
        height={iconSizes[size]}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="logoShieldGrad" x1="6" y1="4" x2="42" y2="44" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="logoEmeraldGrad" x1="16" y1="12" x2="32" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
        
        {/* Shield contour */}
        <path
          d="M24 4L8 10.2V22.2C8 32.8 14.8 42.5 24 45.3C33.2 42.5 40 32.8 40 22.2V10.2L24 4Z"
          fill="url(#logoShieldGrad)"
          stroke="#10B981"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Location Beacon Marker */}
        <path
          d="M24 13C20.7 13 18 15.7 18 19C18 23.6 24 29.2 24 29.2C24 29.2 30 23.6 30 19C30 15.7 27.3 13 24 13Z"
          fill="url(#logoEmeraldGrad)"
        />
        <circle cx="24" cy="19" r="2.5" fill="#FFFFFF" />

        {/* Civic Grid Telemetry Waves */}
        <path
          d="M14 34.5C16.8 37 20.2 38.3 24 38.3C27.8 38.3 31.2 37 34 34.5"
          stroke="#34D399"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeDasharray="2 3"
        />
      </svg>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <span
            style={{
              fontSize: titleSizes[size],
              fontWeight: 800,
              letterSpacing: '-0.025em',
              color: isLight ? '#FFFFFF' : '#0F172A',
              lineHeight: 1.15
            }}
          >
            UrbanShield <span style={{ color: '#10B981' }}>AI</span>
          </span>
        </div>
        {showSubtitle && (
          <span
            style={{
              fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
              color: isLight ? '#94A3B8' : '#64748B',
              fontWeight: 500,
              letterSpacing: '0.02em'
            }}
          >
            Karnataka Urban Risk Intelligence
          </span>
        )}
      </div>
    </div>
  );
};
