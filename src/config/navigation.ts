/**
 * UrbanShield AI - Navigation Configuration
 * Karnataka Urban Risk Intelligence and Citizen Response Platform
 */

import type { NavItem } from '../types/navigation';
import type { UserRole } from '../types/auth';

/**
 * Top Header Navigation items common across civic portal experiences
 */
export const TOP_NAV_ITEMS: NavItem[] = [
  {
    id: 'top-overview',
    label: 'Overview',
    path: '#/overview',
    iconName: 'LayoutDashboard',
    description: 'Executive summary & statewide risk status'
  },
  {
    id: 'top-map',
    label: 'Live Risk Map',
    path: '#/risk-map',
    iconName: 'Map',
    badge: 'GIS Live',
    badgeVariant: 'success',
    description: 'Karnataka geospatial hazard & incident telemetry'
  },
  {
    id: 'top-reports',
    label: 'Community Reports',
    path: '#/community-reports',
    iconName: 'FileText',
    description: 'Citizen incident reporting & verification pipeline'
  },
  {
    id: 'top-analytics',
    label: 'Risk Analytics',
    path: '#/risk-analytics',
    iconName: 'BarChart3',
    badge: 'Live Met',
    badgeVariant: 'info',
    description: 'Environmental intelligence, rainfall & urban heat telemetry'
  },
  {
    id: 'top-tracking',
    label: 'Resolution Tracking',
    path: '#/resolution-tracking',
    iconName: 'CheckSquare',
    description: 'Field response verification & SLA monitoring'
  }
];

/**
 * Role-Aware Sidebar Navigation Configurations
 */
export const ROLE_SIDEBAR_NAV: Record<UserRole, { sectionTitle: string; items: NavItem[] }> = {
  citizen: {
    sectionTitle: 'Citizen Services',
    items: [
      {
        id: 'cit-overview',
        label: 'Overview',
        path: '#/citizen/overview',
        iconName: 'Home',
        description: 'Personal citizen dashboard and local ward summary'
      },
      {
        id: 'cit-community-issues',
        label: 'Community Issues',
        path: '#/citizen/community-issues',
        iconName: 'Users',
        badge: 'Ward Feed',
        badgeVariant: 'info',
        description: 'Issues and hazards reported by neighboring citizens'
      },
      {
        id: 'cit-report',
        label: 'Report a Problem',
        path: '#/citizen/report-problem',
        iconName: 'PlusCircle',
        badge: 'New',
        badgeVariant: 'success',
        description: 'Submit an urban hazard, drainage overflow, or road defect'
      },
      {
        id: 'cit-my-reports',
        label: 'My Reports',
        path: '#/citizen/my-reports',
        iconName: 'ListChecks',
        description: 'Track progress and response status of your submitted tickets'
      },
      {
        id: 'cit-alerts',
        label: 'Alerts',
        path: '#/citizen/alerts',
        iconName: 'Bell',
        description: 'Severe weather, traffic advisories, and disaster broadcasts'
      },
      {
        id: 'cit-my-impact',
        label: 'My Impact',
        path: '#/citizen/my-impact',
        iconName: 'Award',
        description: 'Civic contributions, verified resolutions, and neighborhood safety score'
      },
      {
        id: 'cit-ask-ai',
        label: 'Ask UrbanShield',
        path: '#/citizen/ask-urbanshield',
        iconName: 'Bot',
        badge: 'AI Assistant',
        badgeVariant: 'default',
        description: 'AI chatbot for civic guidelines, municipal procedures, and emergency info'
      }
    ]
  },

  authority: {
    sectionTitle: 'Authority Operations (BBMP / KDMA)',
    items: [
      {
        id: 'auth-overview',
        label: 'Overview',
        path: '#/authority/overview',
        iconName: 'ShieldAlert',
        description: 'Emergency response command and ward priority index'
      },
      {
        id: 'auth-incoming',
        label: 'Incoming Reports',
        path: '#/authority/incoming-reports',
        iconName: 'Inbox',
        badge: 'Triage Queue',
        badgeVariant: 'warning',
        description: 'Incoming citizen incident reports awaiting triage'
      },
      {
        id: 'auth-active',
        label: 'Active Incidents',
        path: '#/authority/active-incidents',
        iconName: 'AlertTriangle',
        description: 'High-severity urban risks under field action'
      },
      {
        id: 'auth-work',
        label: 'Assigned Work',
        path: '#/authority/assigned-work',
        iconName: 'Briefcase',
        description: 'Field crew tasks, municipal contracts, and heavy machinery dispatches'
      },
      {
        id: 'auth-verification',
        label: 'Resolution Verification',
        path: '#/authority/resolution-verification',
        iconName: 'CheckCheck',
        description: 'Audit photos, citizen confirmations, and supervisor sign-offs'
      },
      {
        id: 'auth-recurring',
        label: 'Recurring Problems',
        path: '#/authority/recurring-problems',
        iconName: 'Repeat',
        description: 'Chronic hotspots for waterlogging, road cave-ins, and garbage piles'
      },
      {
        id: 'auth-analytics',
        label: 'Reports and Analytics',
        path: '#/authority/reports-analytics',
        iconName: 'TrendingUp',
        description: 'Departmental SLA compliance, response latency, and ward performance'
      }
    ]
  },

  administrator: {
    sectionTitle: 'System Administration & Governance',
    items: [
      {
        id: 'adm-overview',
        label: 'Overview',
        path: '#/admin/overview',
        iconName: 'Sliders',
        description: 'Statewide platform telemetry and governance console'
      },
      {
        id: 'adm-users',
        label: 'User Management',
        path: '#/admin/user-management',
        iconName: 'UserCog',
        description: 'Nodal officers, departmental accounts, and citizen registry'
      },
      {
        id: 'adm-roles',
        label: 'Role and Access Management',
        path: '#/admin/access-management',
        iconName: 'Key',
        badge: 'RBAC',
        badgeVariant: 'danger',
        description: 'Cryptographic permissions, SSO policies, and biometric 2FA rules'
      },
      {
        id: 'adm-categories',
        label: 'Incident Categories',
        path: '#/admin/incident-categories',
        iconName: 'FolderTree',
        description: 'Taxonomy of urban hazards, urgency tiers, and routing rules'
      },
      {
        id: 'adm-activity',
        label: 'Platform Activity',
        path: '#/admin/platform-activity',
        iconName: 'Activity',
        description: 'Audit trails, operator session logs, and system integrity metrics'
      },
      {
        id: 'adm-sources',
        label: 'Data Sources',
        path: '#/admin/data-sources',
        iconName: 'Database',
        description: 'IoT drainage sensors, weather radar, CCTV computer vision feeds'
      },
      {
        id: 'adm-settings',
        label: 'System Settings',
        path: '#/admin/system-settings',
        iconName: 'Settings',
        description: 'State portal parameters, backup schedules, and API integrations'
      }
    ]
  },

  ai_operator: {
    sectionTitle: 'AI Risk Monitoring Centre (NOC)',
    items: [
      {
        id: 'ai-overview',
        label: 'Operational Overview',
        path: '#/ai-monitoring/overview',
        iconName: 'Cpu',
        description: 'Real-time multi-district sensor telemetry & neural anomaly engine'
      },
      {
        id: 'ai-map',
        label: 'Live Risk Map',
        path: '#/ai-monitoring/live-risk-map',
        iconName: 'Navigation',
        badge: 'Live Stream',
        badgeVariant: 'success',
        description: 'Geospatial radar layers with GIS risk contours across Karnataka'
      },
      {
        id: 'ai-flood',
        label: 'Flood Risk and Predictive Analytics',
        path: '#/ai-monitoring/flood-risk',
        iconName: 'CloudRain',
        badge: 'Active Model',
        badgeVariant: 'info',
        description: 'Monsoon rainfall simulation, catchment run-off, and inundation modeling'
      },
      {
        id: 'ai-drainage',
        label: 'Drainage Intelligence and Hotspots',
        path: '#/ai-monitoring/drainage-intelligence',
        iconName: 'Waves',
        description: 'Telemetry on stormwater drain capacity, silt buildup, and blockage points'
      },
      {
        id: 'ai-heat',
        label: 'Urban Heat and Water Stress',
        path: '#/ai-monitoring/urban-heat',
        iconName: 'Sun',
        badge: 'Heat Index',
        badgeVariant: 'warning',
        description: 'Thermal satellite feeds, heat vulnerability, and groundwater depletion'
      },
      {
        id: 'ai-cv',
        label: 'Computer Vision Diagnostics',
        path: '#/ai-monitoring/cv-diagnostics',
        iconName: 'Eye',
        description: 'Automated pothole detection, waterlogging classification, and crowd surge'
      },
      {
        id: 'ai-env',
        label: 'Environmental Monitoring',
        path: '#/ai-monitoring/environmental',
        iconName: 'Wind',
        badge: 'Multi-Hazard',
        badgeVariant: 'success',
        description: 'Air quality (AQI), industrial runoff, and hazardous waste anomalies'
      },
      {
        id: 'ai-fusion',
        label: 'AI Fusion Architecture',
        path: '#/ai-monitoring/fusion-architecture',
        iconName: 'Network',
        badge: 'Neural Core',
        badgeVariant: 'default',
        description: 'Model weights, multi-modal ingestion pipelines, and inference health'
      },
      {
        id: 'ai-sop',
        label: 'Response SOP Dispatch',
        path: '#/ai-monitoring/sop-dispatch',
        iconName: 'Zap',
        description: 'Automated Standard Operating Procedure triggers and early warnings'
      },
      {
        id: 'ai-history',
        label: 'Historical Analytics',
        path: '#/ai-monitoring/historical-analytics',
        iconName: 'History',
        description: 'Decadal monsoon patterns, hazard frequency, and climate resilience'
      }
    ]
  }
};

/**
 * Helper to find NavItem by current path
 */
export function findNavItemByPath(path: string, role: UserRole): NavItem | undefined {
  // Check top nav
  const topMatch = TOP_NAV_ITEMS.find(item => item.path === path);
  if (topMatch) return topMatch;

  // Check role sidebar items
  const sidebarMatch = ROLE_SIDEBAR_NAV[role]?.items.find(item => item.path === path);
  if (sidebarMatch) return sidebarMatch;

  // Check other role sidebar items as fallback (for previewing)
  for (const roleKey of Object.keys(ROLE_SIDEBAR_NAV) as UserRole[]) {
    const match = ROLE_SIDEBAR_NAV[roleKey].items.find(item => item.path === path);
    if (match) return match;
  }

  return undefined;
}
