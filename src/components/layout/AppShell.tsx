import React, { useState } from 'react';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { UserProfileModal } from './UserProfileModal';
import type { UserProfile, UserRole } from '../../types/auth';

interface AppShellProps {
  user: UserProfile;
  currentPath: string;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  onSwitchRoleDemo?: (role: UserRole) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  user,
  currentPath,
  onNavigate,
  onLogout,
  onSwitchRoleDemo,
  children
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <div className="app-shell-root">
      {/* 1. Shared Header */}
      <AppHeader
        user={user}
        currentPath={currentPath}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onToggleMobileMenu={() => setIsMobileMenuOpen(prev => !prev)}
        isMobileMenuOpen={isMobileMenuOpen}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onSwitchRoleDemo={onSwitchRoleDemo}
      />

      {/* 2. Main Workspace Layout (Sidebar + Content Container) */}
      <div className="app-workspace-layout">
        {/* Role-Aware Sidebar */}
        <AppSidebar
          user={user}
          currentPath={currentPath}
          onNavigate={onNavigate}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Dynamic Main Content Container */}
        <main className="app-main-content" id="main-content">
          <div className="app-content-container">
            {children}
          </div>
        </main>
      </div>

      {/* 3. Session User Profile Modal */}
      <UserProfileModal
        user={user}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onLogout={onLogout}
      />
    </div>
  );
};
