import React from 'react';
import { INCIDENT_CATEGORIES } from '../../config/incidentCategories';
import { NavIcon } from '../common/NavIcon';
import type { IncidentCategory } from '../../types/incident';
import { Layers } from 'lucide-react';

interface CategoryFilterBarProps {
  selectedCategory: IncidentCategory | 'all';
  onSelectCategory: (category: IncidentCategory | 'all') => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
}

export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  totalCount
}) => {
  return (
    <div
      className="category-filter-strip"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        overflowX: 'auto',
        padding: '0.65rem 0.5rem',
        marginBottom: '1rem',
        scrollbarWidth: 'thin'
      }}
      role="toolbar"
      aria-label="Problem Category Filters"
    >
      {/* 'All Problems' Button */}
      <button
        type="button"
        onClick={() => onSelectCategory('all')}
        className={`category-pill-btn ${selectedCategory === 'all' ? 'active' : ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.8rem',
          borderRadius: 'var(--radius-pill)',
          fontSize: '0.78rem',
          fontWeight: selectedCategory === 'all' ? 700 : 500,
          backgroundColor: selectedCategory === 'all' ? 'var(--brand-primary)' : '#FFFFFF',
          color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--text-secondary)',
          border: selectedCategory === 'all' ? '1px solid var(--brand-primary)' : '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xs)',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all var(--transition-fast)'
        }}
        aria-pressed={selectedCategory === 'all'}
      >
        <Layers size={14} />
        <span>All Problems</span>
        <span
          style={{
            fontSize: '0.6875rem',
            padding: '1px 6px',
            borderRadius: '9999px',
            backgroundColor: selectedCategory === 'all' ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-surface-subtle)',
            color: selectedCategory === 'all' ? '#FFFFFF' : 'var(--text-muted)',
            fontWeight: 700
          }}
        >
          {totalCount}
        </span>
      </button>

      {/* 9 Specific Problem Category Buttons */}
      {INCIDENT_CATEGORIES.map(cat => {
        const isSelected = selectedCategory === cat.id;
        const count = categoryCounts[cat.id] || 0;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
            className={`category-pill-btn ${isSelected ? 'active' : ''}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.78rem',
              fontWeight: isSelected ? 700 : 500,
              backgroundColor: isSelected ? cat.bgColor : '#FFFFFF',
              color: isSelected ? cat.color : 'var(--text-secondary)',
              border: isSelected ? `1.5px solid ${cat.color}` : '1px solid var(--border-subtle)',
              boxShadow: isSelected ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all var(--transition-fast)'
            }}
            title={cat.description}
            aria-pressed={isSelected}
          >
            <NavIcon name={cat.iconName} size={14} style={{ color: isSelected ? cat.color : 'var(--text-tertiary)' }} />
            <span>{cat.label}</span>
            <span
              style={{
                fontSize: '0.6875rem',
                padding: '1px 6px',
                borderRadius: '9999px',
                backgroundColor: isSelected ? cat.color : 'var(--bg-surface-subtle)',
                color: isSelected ? '#FFFFFF' : 'var(--text-muted)',
                fontWeight: 700
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
