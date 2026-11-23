import React from 'react';

export type StatusVariant = 
  | 'normal' 
  | 'success' 
  | 'warning' 
  | 'high_risk' 
  | 'critical' 
  | 'info';

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  showDot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'normal',
  showDot = true,
  size = 'md',
  className = ''
}) => {
  const getVariantStyles = (): { bg: string; text: string; border: string; dot: string } => {
    switch (variant) {
      case 'success':
        return {
          bg: '#ECFDF5',
          text: '#065F46',
          border: '#A7F3D0',
          dot: '#059669'
        };
      case 'warning':
        return {
          bg: '#FFFBEB',
          text: '#92400E',
          border: '#FDE68A',
          dot: '#D97706'
        };
      case 'high_risk':
        return {
          bg: '#FFF7ED',
          text: '#C2410C',
          border: '#FED7AA',
          dot: '#EA580C'
        };
      case 'critical':
        return {
          bg: '#FEF2F2',
          text: '#991B1B',
          border: '#FECACA',
          dot: '#DC2626'
        };
      case 'info':
        return {
          bg: '#F0F9FF',
          text: '#075985',
          border: '#BAE6FD',
          dot: '#0284C7'
        };
      case 'normal':
      default:
        return {
          bg: '#F1F5F9',
          text: '#334155',
          border: '#CBD5E1',
          dot: '#64748B'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <span
      className={`status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: size === 'sm' ? '0.15rem 0.45rem' : '0.25rem 0.65rem',
        fontSize: size === 'sm' ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        borderRadius: '9999px',
        backgroundColor: styles.bg,
        color: styles.text,
        border: `1px solid ${styles.border}`,
        lineHeight: 1.2
      }}
    >
      {showDot && (
        <span
          style={{
            width: size === 'sm' ? '5px' : '6px',
            height: size === 'sm' ? '5px' : '6px',
            borderRadius: '50%',
            backgroundColor: styles.dot
          }}
        />
      )}
      <span>{label}</span>
    </span>
  );
};
