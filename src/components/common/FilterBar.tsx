import React from 'react';
import { SearchField } from './SearchField';
import { SlidersHorizontal } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

interface FilterBarProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  filters?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (filterId: string) => void;
  extraActions?: React.ReactNode;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  filters = [],
  activeFilter,
  onFilterChange,
  extraActions,
  className = ''
}) => {
  return (
    <div
      className={`filter-bar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        backgroundColor: '#FFFFFF',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xs)',
        marginBottom: '1.25rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 280px', maxWidth: '420px' }}>
        {onSearchChange && (
          <SearchField
            value={searchQuery || ''}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
        {filters.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginRight: '0.25rem' }}>
              <SlidersHorizontal size={13} />
              <span>Filter:</span>
            </span>
            {filters.map(filter => {
              const isActive = activeFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => onFilterChange && onFilterChange(filter.id)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.75rem',
                    fontWeight: isActive ? 700 : 500,
                    backgroundColor: isActive ? 'var(--brand-primary-light)' : 'var(--bg-surface-subtle)',
                    color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    border: isActive ? '1px solid var(--brand-primary-border)' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <span>{filter.label}</span>
                  {filter.count !== undefined && (
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        padding: '0.05rem 0.35rem',
                        borderRadius: '9999px',
                        backgroundColor: isActive ? 'var(--brand-primary)' : '#CBD5E1',
                        color: isActive ? '#FFFFFF' : '#334155',
                        fontWeight: 600
                      }}
                    >
                      {filter.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {extraActions}
      </div>
    </div>
  );
};
