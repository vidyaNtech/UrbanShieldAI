/**
 * UrbanShield AI - Authentication Service Layer
 * Karnataka Urban Risk Intelligence and Citizen Response Platform
 * 
 * IMPORTANT ARCHITECTURE NOTE:
 * This service implements the boundary between the UI and future backend identity
 * services (e.g. OAuth2/OIDC, Karnataka e-Gov Single Sign-On, Firebase, or Custom JWT microservice).
 * 
 * As there is no backend server configured in this initial project step:
 * 1. Passwords are never stored in plaintext.
 * 2. It does not claim an actual server was reached when simulating authentication.
 * 3. Elevated roles (Authority, Admin, AI Operator) are explicitly flagged as requiring
 *    cryptographic backend authorization and departmental verification in production.
 */

import type { 
  LoginFormData, 
  RegisterFormData, 
  ForgotPasswordFormData, 
  UserProfile, 
  UserRole,
  RoleDescriptor 
} from '../types/auth';

export interface AuthResponse {
  success: boolean;
  user?: UserProfile;
  error?: string;
  message?: string;
  isPrototype: boolean;
  requiresMfa?: boolean;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleDescriptor> = {
  citizen: {
    role: 'citizen',
    title: 'Karnataka Citizen',
    subtitle: 'Public risk reports, live civic alerts, local safety index',
    accessRequirements: 'Open registration with verified email or mobile OTP',
    isRestricted: false,
    badgeColor: 'emerald'
  },
  authority: {
    role: 'authority',
    title: 'Civic Authority / Service Team',
    subtitle: 'BBMP, KDMA, PWD, Traffic Police, Emergency responders',
    accessRequirements: 'Restricted: Departmental SSO & biometric/2FA token verification',
    isRestricted: true,
    badgeColor: 'amber'
  },
  ai_operator: {
    role: 'ai_operator',
    title: 'AI Monitoring Centre Operator',
    subtitle: 'Sensor feeds, anomaly triage, automated dispatch triggers',
    accessRequirements: 'Restricted: Operations room credential & L2 clearance',
    isRestricted: true,
    badgeColor: 'blue'
  },
  administrator: {
    role: 'administrator',
    title: 'System Administrator',
    subtitle: 'Statewide governance, platform telemetry, RBAC policy',
    accessRequirements: 'Highly Restricted: Hardware security key & state nodal officer sign-off',
    isRestricted: true,
    badgeColor: 'purple'
  }
};

// Prototype demo accounts for evaluators to test role UI flow safely
export const DEMO_PRESETS: Array<{
  role: UserRole;
  label: string;
  email: string;
  department: string;
  district: string;
}> = [
  {
    role: 'citizen',
    label: 'Citizen (Bengaluru Urban)',
    email: 'citizen.karnataka@demo.local',
    department: 'General Public (Ward 150 - Bellandur)',
    district: 'Bengaluru Urban'
  },
  {
    role: 'authority',
    label: 'Civic Response Team (BBMP / KDMA)',
    email: 'officer.deshmukh@bbmp.gov.demo',
    department: 'Bruhat Bengaluru Mahanagara Palike (Stormwater & Disaster)',
    district: 'Bengaluru Urban'
  },
  {
    role: 'ai_operator',
    label: 'AI Centre Operator (UrbanShield NOC)',
    email: 'operator.telemetry@urbanshield.ai.demo',
    department: 'Karnataka Urban Risk Intelligence NOC',
    district: 'Karnataka Statewide'
  },
  {
    role: 'administrator',
    label: 'System Admin (State Nodal Officer)',
    email: 'admin.governance@karnataka.gov.demo',
    department: 'Karnataka State Disaster Management Authority (KDMA)',
    district: 'Karnataka Statewide'
  }
];

class AuthService {
  private apiEndpoint = import.meta.env.VITE_AUTH_API_URL || null;

  /**
   * Check if a live backend is configured
   */
  public hasLiveBackend(): boolean {
    return Boolean(this.apiEndpoint);
  }

  /**
   * Authenticate user with credentials
   */
  public async login(data: LoginFormData): Promise<AuthResponse> {
    // 1. If backend configured, call real endpoint
    if (this.apiEndpoint) {
      try {
        const response = await fetch(`${this.apiEndpoint}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: data.identifier,
            password: data.password
          })
        });

        const result = await response.json();
        if (!response.ok) {
          return {
            success: false,
            error: result.message || 'Authentication failed on server.',
            isPrototype: false
          };
        }

        return {
          success: true,
          user: result.user,
          isPrototype: false
        };
      } catch (err) {
        return {
          success: false,
          error: 'Network error contacting authentication server. Please check connection.',
          isPrototype: false
        };
      }
    }

    // 2. Prototype simulation mode (explicitly declared)
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Basic client validation simulation
    const emailLower = data.identifier.toLowerCase().trim();

    // Check if input matches demo email or basic format
    if (!emailLower.includes('@') && emailLower.length < 3) {
      return {
        success: false,
        error: 'Please enter a valid email address or registered civic username.',
        isPrototype: true
      };
    }

    if (data.password.length < 6) {
      return {
        success: false,
        error: 'Invalid password. Password must be at least 6 characters.',
        isPrototype: true
      };
    }

    // Determine prototype role based on selection or demo email
    let resolvedRole: UserRole = data.selectedRoleForDemo || 'citizen';
    let department = 'Public Citizen Access';
    let district = 'Bengaluru Urban';

    const matchedDemo = DEMO_PRESETS.find(p => p.email.toLowerCase() === emailLower);
    if (matchedDemo) {
      resolvedRole = matchedDemo.role;
      department = matchedDemo.department;
      district = matchedDemo.district;
    } else if (emailLower.includes('bbmp') || emailLower.includes('gov') || resolvedRole === 'authority') {
      resolvedRole = 'authority';
      department = 'Karnataka Civic Service Team';
    } else if (emailLower.includes('admin') || resolvedRole === 'administrator') {
      resolvedRole = 'administrator';
      department = 'Urban Safety Administration';
    } else if (emailLower.includes('operator') || resolvedRole === 'ai_operator') {
      resolvedRole = 'ai_operator';
      department = 'AI Telemetry Operations';
    }

    const mockUser: UserProfile = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      fullName: matchedDemo ? matchedDemo.label.split('(')[0].trim() : (data.identifier.split('@')[0] || 'Civic User'),
      email: data.identifier,
      role: resolvedRole,
      department,
      district,
      isVerified: true,
      badgeNumber: resolvedRole !== 'citizen' ? `KA-${Math.floor(1000 + Math.random() * 9000)}` : undefined
    };

    return {
      success: true,
      user: mockUser,
      message: 'Simulated sign-in successful (Prototype Mode).',
      isPrototype: true
    };
  }

  /**
   * Register a new user account
   */
  public async register(data: RegisterFormData): Promise<AuthResponse> {
    if (this.apiEndpoint) {
      try {
        const response = await fetch(`${this.apiEndpoint}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const result = await response.json();
        if (!response.ok) {
          return {
            success: false,
            error: result.message || 'Registration failed.',
            isPrototype: false
          };
        }
        return {
          success: true,
          user: result.user,
          isPrototype: false
        };
      } catch (err) {
        return {
          success: false,
          error: 'Network error during registration.',
          isPrototype: false
        };
      }
    }

    // Prototype delay
    await new Promise((resolve) => setTimeout(resolve, 900));

    // Notice about protected roles:
    // If user requested authority or admin, clarify in prototype response
    const roleIsProtected = data.requestedRole !== 'citizen';

    const newUser: UserProfile = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      fullName: data.fullName,
      email: data.email,
      mobile: data.mobile,
      role: data.requestedRole,
      department: roleIsProtected ? 'Pending Verification by Nodal Officer' : 'Citizen Portal',
      district: 'Karnataka',
      isVerified: !roleIsProtected // Protected roles require manual verification in real lifecycle
    };

    return {
      success: true,
      user: newUser,
      message: roleIsProtected
        ? 'Account registered in provisional status. Departmental authorization required for elevated access.'
        : 'Citizen registration completed successfully.',
      isPrototype: true
    };
  }

  /**
   * Request password reset instructions
   * Strictly follows security requirement: neutral message that does not reveal if account exists.
   */
  public async requestPasswordReset(data: ForgotPasswordFormData): Promise<AuthResponse> {
    if (this.apiEndpoint) {
      try {
        await fetch(`${this.apiEndpoint}/auth/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.email })
        });
      } catch (err) {
        // Suppress network specifics to maintain neutral response
      }
    } else {
      // Prototype simulation delay
      await new Promise((resolve) => setTimeout(resolve, 750));
    }

    return {
      success: true,
      message: 'If an account matching this address exists in the UrbanShield AI directory, a secure recovery link has been dispatched. Please inspect your inbox and spam filters.',
      isPrototype: true
    };
  }
}

export const authService = new AuthService();
