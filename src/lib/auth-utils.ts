import { redirect } from 'next/navigation';
import type { UserRole, AuthUser } from '@/types/database';

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<UserRole, number> = {
  DRIVER: 1,
  SETTLEMENT_USER: 2,
  ADMIN: 3,
};

// Resource permissions mapping
const PERMISSIONS: Record<string, UserRole[]> = {
  // Admin only
  'admin.dashboard': ['ADMIN'],
  'admin.users': ['ADMIN'],
  'admin.settlements': ['ADMIN'],
  'admin.system': ['ADMIN'],

  // Settlement user permissions
  'dashboard.view': ['ADMIN', 'SETTLEMENT_USER'],
  'reports.view': ['ADMIN', 'SETTLEMENT_USER'],
  'profile.view': ['ADMIN', 'SETTLEMENT_USER', 'DRIVER'],
  'profile.edit': ['ADMIN', 'SETTLEMENT_USER', 'DRIVER'],

  // Driver permissions
  'mobile.report': ['ADMIN', 'DRIVER'],
  'mobile.view': ['ADMIN', 'DRIVER'],
};

/**
 * Check if user has a specific role
 */
export function hasRole(user: AuthUser | null, role: UserRole): boolean {
  if (!user) return false;
  return user.role === role;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: AuthUser | null, roles: UserRole[]): boolean {
  if (!user) return false;
  return roles.includes(user.role);
}

/**
 * Check if user has at least the minimum required role level
 */
export function hasMinimumRole(
  user: AuthUser | null,
  minRole: UserRole
): boolean {
  if (!user) return false;
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minRole];
}

/**
 * Check if user can access a specific resource
 */
export function canAccess(user: AuthUser | null, resource: string): boolean {
  if (!user) return false;

  const allowedRoles = PERMISSIONS[resource];
  if (!allowedRoles) return false;

  return allowedRoles.includes(user.role);
}

/**
 * Check if user can access their own settlement data only
 */
export function canAccessSettlement(
  user: AuthUser | null,
  settlementId: string
): boolean {
  if (!user) return false;

  // Admin can access all settlements
  if (user.role === 'ADMIN') return true;

  // Settlement users can only access their own settlement
  if (user.role === 'SETTLEMENT_USER') {
    return user.settlement_id === settlementId;
  }

  // Drivers can report to any settlement
  if (user.role === 'DRIVER') return true;

  return false;
}

/**
 * Get redirect URL based on user role
 */
export function getDefaultRedirectUrl(user: AuthUser | null): string {
  if (!user) return '/login';

  switch (user.role) {
    case 'ADMIN':
      return '/admin';
    case 'SETTLEMENT_USER':
      return '/dashboard';
    case 'DRIVER':
      return '/mobile-report';
    default:
      return '/login';
  }
}

/**
 * Get user role display name in Hebrew
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    ADMIN: 'מנהל מערכת',
    SETTLEMENT_USER: 'משתמש יישוב',
    DRIVER: 'נהג',
  };

  return roleNames[role] || role;
}

/**
 * Validate if user can perform an action on a resource
 */
export function validatePermission(
  user: AuthUser | null,
  action: string,
  resource?: string,
  resourceOwnerId?: string
): { allowed: boolean; reason?: string } {
  if (!user) {
    return { allowed: false, reason: 'לא מחובר למערכת' };
  }

  // Check if action requires specific permission
  const permission = resource ? `${resource}.${action}` : action;
  if (!canAccess(user, permission)) {
    return { allowed: false, reason: 'אין הרשאה לביצוע פעולה זו' };
  }

  // Check resource ownership for settlement users
  if (user.role === 'SETTLEMENT_USER' && resourceOwnerId) {
    if (user.settlement_id !== resourceOwnerId) {
      return { allowed: false, reason: 'ניתן לגשת רק למידע של היישוב שלך' };
    }
  }

  return { allowed: true };
}

/**
 * Require authentication and redirect if not logged in
 */
export function requireAuth(user: AuthUser | null, redirectTo?: string): void {
  if (!user) {
    redirect(
      `/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`
    );
  }
}

/**
 * Require specific role and redirect if unauthorized
 */
export function requireRole(
  user: AuthUser | null,
  requiredRole: UserRole,
  redirectTo?: string
): void {
  requireAuth(user, redirectTo);

  if (!hasRole(user, requiredRole)) {
    redirect('/unauthorized');
  }
}

/**
 * Require any of the specified roles
 */
export function requireAnyRole(
  user: AuthUser | null,
  requiredRoles: UserRole[],
  redirectTo?: string
): void {
  requireAuth(user, redirectTo);

  if (!hasAnyRole(user, requiredRoles)) {
    redirect('/unauthorized');
  }
}

/**
 * Require minimum role level
 */
export function requireMinimumRole(
  user: AuthUser | null,
  minRole: UserRole,
  redirectTo?: string
): void {
  requireAuth(user, redirectTo);

  if (!hasMinimumRole(user, minRole)) {
    redirect('/unauthorized');
  }
}

/**
 * Get filtered menu items based on user permissions
 */
export function getAuthorizedMenuItems(user: AuthUser | null) {
  if (!user) return [];

  const menuItems = [
    {
      id: 'dashboard',
      label: 'לוח בקרה',
      href: '/dashboard',
      roles: ['ADMIN', 'SETTLEMENT_USER'] as UserRole[],
    },
    {
      id: 'mobile-report',
      label: 'דיווח נייד',
      href: '/mobile-report',
      roles: ['ADMIN', 'DRIVER'] as UserRole[],
    },
    {
      id: 'admin',
      label: 'ניהול מערכת',
      href: '/admin',
      roles: ['ADMIN'] as UserRole[],
    },
    {
      id: 'profile',
      label: 'פרופיל אישי',
      href: '/profile',
      roles: ['ADMIN', 'SETTLEMENT_USER', 'DRIVER'] as UserRole[],
    },
  ];

  return menuItems.filter((item) => hasAnyRole(user, item.roles));
}

/**
 * Format user display name
 */
export function getUserDisplayName(user: AuthUser): string {
  const roleName = getRoleDisplayName(user.role);
  let name = user.email;

  if (user.settlement?.name) {
    name += ` (${user.settlement.name})`;
  }

  return `${name} - ${roleName}`;
}

/**
 * Check if user session is still valid (not expired)
 */
export function isSessionValid(user: AuthUser | null): boolean {
  if (!user) return false;

  // Add any additional session validation logic here
  // For now, just check if user exists
  return true;
}

/**
 * Get unauthorized access message in Hebrew
 */
export function getUnauthorizedMessage(action?: string): string {
  if (action) {
    return `אין לך הרשאה לבצע את הפעולה: ${action}`;
  }

  return 'אין לך הרשאה לגשת לעמוד זה';
}
