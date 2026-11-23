import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import type { BreadcrumbItem } from '../../types/navigation';

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  onNavigate?: (path: string) => void;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, onNavigate }) => {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: '0.75rem' }}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.35rem',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: '0.75rem',
          color: 'var(--text-muted)'
        }}
      >
        <li style={{ display: 'inline-flex', alignItems: 'center' }}>
          <a
            href="#/overview"
            onClick={e => {
              if (onNavigate) {
                e.preventDefault();
                onNavigate('#/overview');
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'var(--text-muted)',
              textDecoration: 'none'
            }}
            title="UrbanShield Portal Home"
          >
            <Home size={13} />
            <span>Portal</span>
          </a>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <ChevronRight size={12} style={{ color: 'var(--text-tertiary)' }} />
              {isLast || !item.path ? (
                <span
                  style={{
                    color: isLast ? 'var(--text-primary)' : 'var(--text-muted)',
                    fontWeight: isLast ? 600 : 400
                  }}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.path}
                  onClick={e => {
                    if (onNavigate && item.path) {
                      e.preventDefault();
                      onNavigate(item.path);
                    }
                  }}
                  style={{
                    color: 'var(--text-muted)',
                    textDecoration: 'none'
                  }}
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
