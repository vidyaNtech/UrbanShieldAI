import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { NavIcon } from './NavIcon';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  iconName?: string;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  accentColor?: 'emerald' | 'amber' | 'blue' | 'purple' | 'red';
  className?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  subtitle,
  iconName,
  trend,
  accentColor = 'emerald',
  className = ''
}) => {
  const getAccentStyles = () => {
    switch (accentColor) {
      case 'amber':
        return { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' };
      case 'blue':
        return { bg: '#F0F9FF', color: '#0284C7', border: '#BAE6FD' };
      case 'purple':
        return { bg: '#FAF5FF', color: '#7E22CE', border: '#E9D5FF' };
      case 'red':
        return { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' };
      case 'emerald':
      default:
        return { bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' };
    }
  };

  const accent = getAccentStyles();

  return (
    <div
      className={`summary-card ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          {title}
        </span>
        {iconName && (
          <div
            style={{
              padding: '0.45rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: accent.bg,
              color: accent.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <NavIcon name={iconName} size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.35rem' }}>
        <span
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '-0.02em',
            lineHeight: 1.1
          }}
        >
          {value}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '0.75rem' }}>
        {subtitle && (
          <span style={{ color: 'var(--text-muted)' }}>
            {subtitle}
          </span>
        )}

        {trend && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              fontWeight: 600,
              color: trend.direction === 'up' ? '#059669' : trend.direction === 'down' ? '#DC2626' : '#64748B'
            }}
          >
            {trend.direction === 'up' && <TrendingUp size={13} />}
            {trend.direction === 'down' && <TrendingDown size={13} />}
            {trend.direction === 'neutral' && <Minus size={13} />}
            <span>{trend.value}</span>
            {trend.label && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>{trend.label}</span>}
          </div>
        )}
      </div>
    </div>
  );
};
