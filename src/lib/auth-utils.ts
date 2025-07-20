import type { UserRole } from '@/lib/supabase/types';

/**
 * Get redirect URL based on user role
 */
export function getDefaultRedirectUrl(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/admin';
    case 'SETTLEMENT_USER':
      return '/dashboard';
    case 'DRIVER':
      return '/mobile-report';
    default:
      return '/dashboard';
  }
}

/**
 * Check if user has required role
 */
export function hasRole(
  userRole: UserRole | null,
  requiredRoles: UserRole | UserRole[]
): boolean {
  if (!userRole) return false;
  const roleArray = Array.isArray(requiredRoles)
    ? requiredRoles
    : [requiredRoles];
  return roleArray.includes(userRole);
}

/**
 * Get role display name in Hebrew
 */
export function getRoleDisplayName(role: UserRole): string {
  const roleNames: Record<UserRole, string> = {
    ADMIN: 'מנהל מערכת',
    SETTLEMENT_USER: 'משתמש יישוב',
    DRIVER: 'נהג',
  };
  return roleNames[role] || role;
}
