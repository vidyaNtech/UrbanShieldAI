import React, { useState, useRef, useEffect } from 'react';
import { incidentService } from '../../services/incidentService';
import type { SearchResultItem } from '../../services/incidentService';
import { Search, X, MapPin, AlertCircle, Building } from 'lucide-react';

interface MapSearchBoxProps {
  onSelectResult: (result: SearchResultItem) => void;
  onClear: () => void;
}

export const MapSearchBox: React.FC<MapSearchBoxProps> = ({ onSelectResult, onClear }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length >= 2) {
      const matches = incidentService.searchLocations(query);
      setResults(matches);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: SearchResultItem) => {
    setQuery(item.title);
    setIsOpen(false);
    onSelectResult(item);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    onClear();
  };

  const getItemIcon = (type: SearchResultItem['type']) => {
    switch (type) {
      case 'district':
        return <Building size={14} style={{ color: 'var(--brand-primary)' }} />;
      case 'incident':
        return <AlertCircle size={14} style={{ color: '#DC2626' }} />;
      default:
        return <MapPin size={14} style={{ color: '#0284C7' }} />;
    }
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '0.85rem',
            color: 'var(--text-tertiary)',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <Search size={16} />
        </span>

        <input
          type="search"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder="Search Karnataka districts, areas, or Incident ID (e.g. BLR, Mangaluru, KA-BLR-2026-0101)..."
          className="form-input"
          style={{
            width: '100%',
            paddingLeft: '2.5rem',
            paddingRight: query ? '2.2rem' : '0.85rem',
            paddingTop: '0.65rem',
            paddingBottom: '0.65rem',
            fontSize: '0.84rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-xs)',
            backgroundColor: '#FFFFFF'
          }}
          aria-label="Search locations or incident IDs across Karnataka"
          aria-autocomplete="list"
        />

        {query && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: '0.75rem',
              background: 'none',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex'
            }}
            aria-label="Clear search query"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            overflow: 'hidden',
            maxHeight: '320px',
            overflowY: 'auto',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {results.length > 0 ? (
            <div style={{ padding: '0.35rem' }}>
              <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.4rem 0.6rem' }}>
                Search Suggestions ({results.length})
              </div>
              {results.map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    width: '100%',
                    padding: '0.55rem 0.65rem',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background-color var(--transition-fast)'
                  }}
                  className="search-result-item"
                >
                  <div
                    style={{
                      padding: '0.35rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-surface-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    {getItemIcon(item.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim().length >= 2 ? (
            <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
              No districts, areas, or incident IDs match <q><b>{query}</b></q>.
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
