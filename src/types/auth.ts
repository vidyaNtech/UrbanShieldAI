/**
 * UrbanShield AI - Authentication Types & Models
 * Karnataka Urban Risk Intelligence and Citizen Response Platform
 */

export type UserRole = 
  | 'citizen'
  | 'authority'
  | 'administrator'
  | 'ai_operator';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  mobile?: string;
  role: UserRole;
  department?: string; // e.g. BBMP, KDMA, Karnataka Fire & Emergency, PWD
  district?: string;   // e.g. Bengaluru Urban, Mysuru, Hubballi-Dharwad
  badgeNumber?: string;
  isVerified: boolean;
  clearanceLevel?: 'L1' | 'L2' | 'L3' | 'Operator';
}

export interface AuthSession {
  user: UserProfile;
  token: string;
  expiresAt: string;
  isPrototypeSession: boolean;
}

export type AuthMode = 'login' | 'register' | 'forgot_password';

export interface LoginFormData {
  identifier: string; // Email or username
  password: string;
  rememberMe: boolean;
  selectedRoleForDemo?: UserRole;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
  requestedRole: UserRole;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface RoleDescriptor {
  role: UserRole;
  title: string;
  subtitle: string;
  accessRequirements: string;
  isRestricted: boolean;
  badgeColor: string;
}
