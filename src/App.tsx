import { useState, useEffect } from 'react';
import { AuthLayout } from './components/auth/AuthLayout';
import { LoginForm } from './components/auth/LoginForm';
import { RegistrationForm } from './components/auth/RegistrationForm';
import { ForgotPasswordForm } from './components/auth/ForgotPasswordForm';
import { AppShell } from './components/layout/AppShell';
import { OverviewDashboardView } from './components/views/OverviewDashboardView';
import { LiveRiskMapView } from './components/views/LiveRiskMapView';
import { IncidentDetailView } from './components/views/IncidentDetailView';
import { ReportProblemView } from './components/views/ReportProblemView';
import { MyReportsView } from './components/views/MyReportsView';
import { TriageQueueView } from './components/views/TriageQueueView';
import { ResolutionTrackingView } from './components/views/ResolutionTrackingView';
import { EnvironmentalIntelligenceView } from './components/views/EnvironmentalIntelligenceView';
import { PlaceholderPage } from './components/common/PlaceholderPage';
import { NotFoundPage } from './components/common/NotFoundPage';
import { findNavItemByPath } from './config/navigation';
import type { AuthMode, UserProfile, UserRole } from './types/auth';

export const App: React.FC = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [authenticatedUser, setAuthenticatedUser] = useState<UserProfile | null>(null);
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.hash || '#/overview');

  // Synchronize hash routing with state
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || '#/overview';
      setCurrentPath(hash);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setAuthenticatedUser(user);
    const initialRoute = '#/overview';
    window.location.hash = initialRoute;
    setCurrentPath(initialRoute);
  };

  const handleSignOut = () => {
    setAuthenticatedUser(null);
    setAuthMode('login');
    window.location.hash = '';
  };

  const handleSwitchRoleDemo = (role: UserRole) => {
    if (!authenticatedUser) return;
    
    let department = 'Karnataka General Public';
    let district = authenticatedUser.district || 'Bengaluru Urban';
    let badgeNumber = authenticatedUser.badgeNumber;

    if (role === 'authority') {
      department = 'Bruhat Bengaluru Mahanagara Palike (Disaster Mgmt)';
      badgeNumber = badgeNumber || 'KA-BBMP-8402';
    } else if (role === 'ai_operator') {
      department = 'UrbanShield AI State Operations Centre (NOC)';
      badgeNumber = badgeNumber || 'KA-NOC-1092';
    } else if (role === 'administrator') {
      department = 'Karnataka State Disaster Management Authority (KDMA)';
      badgeNumber = badgeNumber || 'KA-KDMA-001';
    }

    setAuthenticatedUser({
      ...authenticatedUser,
      role,
      department,
      district,
      badgeNumber
    });
  };

  // Render Authenticated Shell Experience
  if (authenticatedUser) {
    // 1. Overview Route
    const isOverviewRoute = 
      currentPath === '#/' ||
      currentPath === '#/overview' ||
      currentPath === '#/citizen/overview' ||
      currentPath === '#/authority/overview' ||
      currentPath === '#/admin/overview' ||
      currentPath === '#/ai-monitoring/overview';

    // 2. Live Risk Map Route
    const isRiskMapRoute = 
      currentPath === '#/risk-map' || 
      currentPath === '#/ai-monitoring/live-risk-map';

    // 3. Citizen Report Problem Route
    const isReportProblemRoute = 
      currentPath === '#/citizen/report-problem' || 
      currentPath === '#/report-problem' || 
      currentPath === '#/report';

    // 4. Citizen My Reports Route
    const isMyReportsRoute = 
      currentPath === '#/citizen/my-reports' || 
      currentPath === '#/my-reports' || 
      currentPath === '#/community-reports';

    // 5. Authority Triage & Incoming Reports Route
    const isTriageRoute = 
      currentPath === '#/authority/incoming-reports' ||
      currentPath === '#/authority/triage' ||
      currentPath === '#/triage' ||
      currentPath === '#/authority/active-incidents' ||
      currentPath === '#/authority/assigned-work';

    // 6. Resolution Tracking & History Route
    const isResolutionTrackingRoute = 
      currentPath === '#/resolution-tracking' ||
      currentPath === '#/authority/resolution-verification' ||
      currentPath === '#/authority/recurring-problems';

    const resolutionInitialTab = 
      currentPath === '#/authority/resolution-verification' 
        ? 'queue' 
        : currentPath === '#/authority/recurring-problems' 
          ? 'recurring' 
          : 'history';

    // 7. Incident Lifecycle Detail Route
    const isIncidentDetailRoute = currentPath.startsWith('#/incidents/');
    const activeIncidentId = isIncidentDetailRoute ? currentPath.replace('#/incidents/', '').trim() : '';

    // 8. Environmental Intelligence & Automatic Risk Monitoring Route (Task 06)
    const isEnvironmentalRoute =
      currentPath === '#/environmental' ||
      currentPath === '#/risk-analytics' ||
      currentPath === '#/ai-monitoring/environmental' ||
      currentPath === '#/ai-monitoring/flood-risk' ||
      currentPath === '#/ai-monitoring/urban-heat' ||
      currentPath === '#/ai-monitoring/drainage-intelligence' ||
      currentPath.startsWith('#/environmental');

    let envDistrictId: string | undefined = undefined;
    if (currentPath.includes('district=')) {
      envDistrictId = currentPath.split('district=')[1]?.split('&')[0];
    }

    // 9. Find matching registered NavItem for placeholders
    const matchingNavItem = findNavItemByPath(currentPath, authenticatedUser.role);

    return (
      <AppShell
        user={authenticatedUser}
        currentPath={currentPath}
        onNavigate={handleNavigate}
        onLogout={handleSignOut}
        onSwitchRoleDemo={handleSwitchRoleDemo}
      >
        {isOverviewRoute ? (
          <OverviewDashboardView
            user={authenticatedUser}
            onNavigate={handleNavigate}
          />
        ) : isRiskMapRoute ? (
          <LiveRiskMapView
            onNavigate={handleNavigate}
          />
        ) : isReportProblemRoute ? (
          <ReportProblemView
            user={authenticatedUser}
            onNavigate={handleNavigate}
          />
        ) : isMyReportsRoute ? (
          <MyReportsView
            user={authenticatedUser}
            onNavigate={handleNavigate}
          />
        ) : isTriageRoute ? (
          <TriageQueueView
            user={authenticatedUser}
            onNavigate={handleNavigate}
          />
        ) : isResolutionTrackingRoute ? (
          <ResolutionTrackingView
            user={authenticatedUser}
            initialTab={resolutionInitialTab}
            onNavigate={handleNavigate}
          />
        ) : isIncidentDetailRoute ? (
          <IncidentDetailView
            incidentId={activeIncidentId}
            user={authenticatedUser}
            onNavigateBack={() => handleNavigate(authenticatedUser.role === 'citizen' ? '#/citizen/my-reports' : '#/authority/incoming-reports')}
            onFocusOnMap={() => handleNavigate('#/risk-map')}
            onNavigateToIncident={(id) => handleNavigate('#/incidents/' + id)}
          />
        ) : isEnvironmentalRoute ? (
          <EnvironmentalIntelligenceView
            user={authenticatedUser}
            initialDistrictId={envDistrictId}
            onNavigate={handleNavigate}
          />
        ) : matchingNavItem ? (
          <PlaceholderPage
            navItem={matchingNavItem}
            user={authenticatedUser}
            onNavigate={handleNavigate}
          />
        ) : (
          <NotFoundPage
            currentPath={currentPath}
            onNavigateHome={() => handleNavigate('#/overview')}
          />
        )}
      </AppShell>
    );
  }

  // Render Unauthenticated Experience (Login, Register, Forgot Password)
  return (
    <AuthLayout
      authMode={authMode}
      onModeChange={setAuthMode}
    >
      {authMode === 'login' && (
        <LoginForm
          onSuccess={handleAuthSuccess}
          onNavigateToRegister={() => setAuthMode('register')}
          onNavigateToForgot={() => setAuthMode('forgot_password')}
        />
      )}

      {authMode === 'register' && (
        <RegistrationForm
          onSuccess={handleAuthSuccess}
          onNavigateToLogin={() => setAuthMode('login')}
        />
      )}

      {authMode === 'forgot_password' && (
        <ForgotPasswordForm
          onNavigateToLogin={() => setAuthMode('login')}
        />
      )}
    </AuthLayout>
  );
};

export default App;
