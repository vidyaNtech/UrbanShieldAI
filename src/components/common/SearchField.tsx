import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: string;
  className?: string;
}

export const SearchField: React.FC<SearchFieldProps> = ({
  id = 'global-search',
  value,
  onChange,
  placeholder = 'Search incidents, wards, sensor IDs...',
  width = '100%',
  className = ''
}) => {
  return (
    <div
      className={`search-field-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        width
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: '0.75rem',
          color: 'var(--text-tertiary)',
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Search size={15} />
      </span>

      <input
        id={id}
        type="search"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="form-input"
        style={{
          width: '100%',
          paddingLeft: '2.3rem',
          paddingRight: value ? '2.2rem' : '0.75rem',
          paddingTop: '0.5rem',
          paddingBottom: '0.5rem',
          fontSize: '0.8125rem',
          borderRadius: 'var(--radius-md)'
        }}
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          style={{
            position: 'absolute',
            right: '0.65rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex'
          }}
          aria-label="Clear search"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
