import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Info } from 'lucide-react';
import type { NotificationItem } from '../../types/navigation';

interface NotificationDropdownProps {
  notifications?: NotificationItem[];
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications: initialNotifications = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications] = useState<NotificationItem[]>(initialNotifications);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="icon-btn"
        style={{
          position: 'relative',
          padding: '0.5rem',
          borderRadius: 'var(--radius-md)',
          color: isOpen ? 'var(--brand-primary)' : 'var(--text-secondary)',
          backgroundColor: isOpen ? 'var(--brand-primary-light)' : 'transparent',
          border: '1px solid',
          borderColor: isOpen ? 'var(--brand-primary-border)' : 'var(--border-subtle)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all var(--transition-fast)'
        }}
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '4px',
              right: '4px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#059669',
              border: '2px solid #FFFFFF'
            }}
          />
        )}
      </button>

      {isOpen && (
        <div
          className="notification-dropdown-panel"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '360px',
            maxWidth: '90vw',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.875rem 1rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--bg-canvas)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                Notifications & Broadcasts
              </span>
              <span
                style={{
                  fontSize: '0.6875rem',
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: '#E2E8F0',
                  color: '#334155',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  fontWeight: 600
                }}
              >
                {unreadCount} unread
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex'
              }}
              aria-label="Close notifications panel"
            >
              <X size={15} />
            </button>
          </div>

          {/* Body Content */}
          <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '1rem' }}>
            {notifications.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '1.5rem 0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    color: 'var(--text-tertiary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '0.75rem'
                  }}
                >
                  <Bell size={20} />
                </div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  No Active Broadcasts
                </h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45, maxWidth: '280px' }}>
                  Notification stream is in standby. In production, real-time alert broadcasts from KDMA, BBMP, and automated sensor anomalies will appear here.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {notifications.map(item => (
                  <div
                    key={item.id}
                    style={{
                      padding: '0.75rem',
                      borderRadius: '8px',
                      backgroundColor: item.read ? 'var(--bg-surface-subtle)' : '#ECFDF5',
                      border: '1px solid',
                      borderColor: item.read ? 'var(--border-subtle)' : '#A7F3D0',
                      fontSize: '0.78rem'
                    }}
                  >
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {item.title}
                    </div>
                    <div style={{ color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: '0.35rem' }}>
                      {item.message}
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                      {item.timestamp}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Notice */}
          <div
            style={{
              padding: '0.65rem 1rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderTop: '1px solid var(--border-subtle)',
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Info size={12} style={{ flexShrink: 0, color: 'var(--brand-primary)' }} />
            <span>Civic push notification protocol: Standby / Prototype Mode</span>
          </div>
        </div>
      )}
    </div>
  );
};
