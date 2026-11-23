import React, { useState, useRef, useEffect } from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { NavIcon } from '../common/NavIcon';
import { NotificationDropdown } from './NotificationDropdown';
import { TOP_NAV_ITEMS } from '../../config/navigation';
import type { UserProfile, UserRole } from '../../types/auth';
import { 
  Menu, 
  X, 
  ChevronDown, 
  User, 
  LogOut, 
  Sparkles
} from 'lucide-react';

interface AppHeaderProps {
  user: UserProfile;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onToggleMobileMenu: () => void;
  isMobileMenuOpen: boolean;
  onOpenProfile: () => void;
  onSwitchRoleDemo?: (role: UserRole) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  currentPath,
  onNavigate,
  onLogout,
  onToggleMobileMenu,
  isMobileMenuOpen,
  onOpenProfile,
  onSwitchRoleDemo
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const roleSwitcherRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (roleSwitcherRef.current && !roleSwitcherRef.current.contains(e.target as Node)) {
        setIsRoleSwitcherOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'citizen': return 'Citizen';
      case 'authority': return 'Authority (BBMP/KDMA)';
      case 'ai_operator': return 'AI Operator (NOC)';
      case 'administrator': return 'System Admin';
    }
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'citizen': return 'emerald';
      case 'authority': return 'amber';
      case 'ai_operator': return 'blue';
      case 'administrator': return 'purple';
      default: return 'emerald';
    }
  };

  return (
    <header className="app-header">
      {/* LEFT SECTION: Brand Logo & Product Descriptor */}
      <div className="header-left">
        {/* Mobile menu trigger */}
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onToggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <a
          href="#/overview"
          onClick={e => {
            e.preventDefault();
            onNavigate('#/overview');
          }}
          style={{ textDecoration: 'none' }}
          title="UrbanShield AI Home"
        >
          <BrandLogo size="sm" variant="dark" showSubtitle={false} />
        </a>

        <div className="header-descriptor-divider" />
        <span className="header-descriptor-text">
          Karnataka Urban Risk Intelligence
        </span>
      </div>

      {/* CENTRE SECTION: Top Navigation Links */}
      <nav className="header-nav" aria-label="Main Navigation">
        {TOP_NAV_ITEMS.map(item => {
          const isActive = currentPath === item.path || (item.path === '#/overview' && currentPath.endsWith('/overview'));
          return (
            <a
              key={item.id}
              href={item.path}
              onClick={e => {
                e.preventDefault();
                onNavigate(item.path);
              }}
              className={`header-nav-link ${isActive ? 'active' : ''}`}
              title={item.description}
            >
              <NavIcon name={item.iconName} size={15} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`header-nav-badge ${item.badgeVariant || 'default'}`}>
                  {item.badge}
                </span>
              )}
            </a>
          );
        })}
      </nav>

      {/* RIGHT SECTION: Notifications, Role Preview Switcher, User Avatar & Menu */}
      <div className="header-right">
        {/* Prototype Role Switcher Quick Pill */}
        {onSwitchRoleDemo && (
          <div ref={roleSwitcherRef} className="role-switcher-container">
            <button
              type="button"
              onClick={() => setIsRoleSwitcherOpen(prev => !prev)}
              className="role-preview-btn"
              title="Switch role perspective for prototype evaluation"
              aria-expanded={isRoleSwitcherOpen}
            >
              <Sparkles size={13} style={{ color: 'var(--brand-primary)' }} />
              <span className="role-preview-label">Role: {getRoleDisplayName(user.role)}</span>
              <ChevronDown size={13} />
            </button>

            {isRoleSwitcherOpen && (
              <div className="role-switcher-dropdown">
                <div className="role-switcher-header">
                  <span>Prototype Role Simulator</span>
                  <p>Preview experience as different civic personas</p>
                </div>
                <div className="role-switcher-list">
                  {(['citizen', 'authority', 'ai_operator', 'administrator'] as UserRole[]).map(roleOption => (
                    <button
                      key={roleOption}
                      type="button"
                      className={`role-switcher-item ${user.role === roleOption ? 'active' : ''}`}
                      onClick={() => {
                        onSwitchRoleDemo(roleOption);
                        setIsRoleSwitcherOpen(false);
                      }}
                    >
                      <span className={`role-dot ${roleOption}`} />
                      <span>{getRoleDisplayName(roleOption)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* User Profile Menu */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsProfileOpen(prev => !prev)}
            className="user-profile-trigger"
            aria-expanded={isProfileOpen}
            aria-label="User account menu"
          >
            <div className="user-avatar-circle">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="user-info-text">
              <span className="user-name">{user.fullName}</span>
              <span className={`role-badge ${getRoleBadgeClass(user.role)}`} style={{ padding: '0.1rem 0.4rem', fontSize: '0.625rem' }}>
                {getRoleDisplayName(user.role)}
              </span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
          </button>

          {isProfileOpen && (
            <div className="user-dropdown-menu">
              {/* Profile Card Summary */}
              <div className="user-dropdown-header">
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                  {user.fullName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                  {user.email}
                </div>
                <div style={{ fontSize: '0.6875rem', color: '#059669', marginTop: '0.35rem', fontWeight: 600 }}>
                  {user.department || 'Karnataka Public Access'}
                </div>
              </div>

              {/* Menu items */}
              <div className="user-dropdown-body">
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onOpenProfile();
                  }}
                >
                  <User size={15} />
                  <span>Session Profile Details</span>
                </button>

                <div className="dropdown-divider" />

                <button
                  type="button"
                  className="dropdown-item text-danger"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
