import React, { useState } from 'react';
import { ROLE_SIDEBAR_NAV } from '../../config/navigation';
import { NavIcon } from '../common/NavIcon';
import type { UserProfile } from '../../types/auth';
import { 
  ChevronLeft, 
  ChevronRight, 
  Radio, 
  X
} from 'lucide-react';

interface AppSidebarProps {
  user: UserProfile;
  currentPath: string;
  onNavigate: (path: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  user,
  currentPath,
  onNavigate,
  isMobileOpen,
  onCloseMobile
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const roleNav = ROLE_SIDEBAR_NAV[user.role] || ROLE_SIDEBAR_NAV.citizen;

  const handleItemClick = (path: string) => {
    onNavigate(path);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`app-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}
        aria-label="Sidebar Navigation"
      >
        {/* Mobile Header (Close Button) */}
        <div className="sidebar-mobile-header">
          <span style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
            UrbanShield Navigation
          </span>
          <button
            type="button"
            onClick={onCloseMobile}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Section Title & Clearance Header */}
        <div className="sidebar-section-header">
          {!isCollapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span className="sidebar-section-title">
                {roleNav.sectionTitle}
              </span>
              <span className="sidebar-section-subtitle">
                {user.department || user.district || 'Karnataka State Grid'}
              </span>
            </div>
          ) : (
            <div style={{ textAlign: 'center', width: '100%' }}>
              <Radio size={16} style={{ color: 'var(--brand-primary)' }} />
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="sidebar-nav-list" aria-label="Role Navigation">
          {roleNav.items.map(item => {
            const isActive = currentPath === item.path;
            return (
              <a
                key={item.id}
                href={item.path}
                onClick={e => {
                  e.preventDefault();
                  handleItemClick(item.path);
                }}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                title={item.description || item.label}
              >
                <div className="sidebar-icon-wrap">
                  <NavIcon name={item.iconName} size={17} />
                </div>

                {!isCollapsed && (
                  <span className="sidebar-item-label">
                    {item.label}
                  </span>
                )}

                {!isCollapsed && item.badge && (
                  <span className={`sidebar-item-badge ${item.badgeVariant || 'default'}`}>
                    {item.badge}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Sidebar Footer with Status and Desktop Collapse Toggle */}
        <div className="sidebar-footer">
          {!isCollapsed && (
            <div className="sidebar-telemetry-badge">
              <span className="telemetry-dot" />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  31 Districts Live
                </span>
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                  GIS & Telemetry Online
                </span>
              </div>
            </div>
          )}

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setIsCollapsed(prev => !prev)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            {!isCollapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
