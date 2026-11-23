/**
 * UrbanShield AI - Navigation Types
 * Karnataka Urban Risk Intelligence and Citizen Response Platform
 */

import type { UserRole } from './auth';

export interface NavItem {
  id: string;
  label: string;
  path: string;
  iconName: string;
  badge?: string;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  description?: string;
  category?: string;
  allowedRoles?: UserRole[];
}

export interface NavCategory {
  id: string;
  label: string;
  items: NavItem[];
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  isCurrent?: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  read: boolean;
  category?: string;
}
