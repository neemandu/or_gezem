'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import {
  hasRole,
  hasAnyRole,
  hasMinimumRole,
  canAccess,
  getDefaultRedirectUrl,
} from '@/lib/auth-utils';
import type { UserRole } from '@/types/database';

/**
 * Hook for protected routes that require authentication
 */
export function useProtected(redirectTo?: string) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      const loginUrl = `/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`;
      router.replace(loginUrl);
    }
  }, [user, isLoading, redirectTo, router]);

  return { user, isLoading, isAuthenticated: !!user };
}

/**
 * Hook for routes that require specific role
 */
export function useRoleProtected(requiredRole: UserRole, redirectTo?: string) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        const loginUrl = `/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`;
        router.replace(loginUrl);
      } else if (!hasRole(user, requiredRole)) {
        router.replace('/unauthorized');
      }
    }
  }, [user, isLoading, requiredRole, redirectTo, router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasRequiredRole: user ? hasRole(user, requiredRole) : false,
  };
}

/**
 * Hook for routes that require any of the specified roles
 */
export function useAnyRoleProtected(
  requiredRoles: UserRole[],
  redirectTo?: string
) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        const loginUrl = `/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`;
        router.replace(loginUrl);
      } else if (!hasAnyRole(user, requiredRoles)) {
        router.replace('/unauthorized');
      }
    }
  }, [user, isLoading, requiredRoles, redirectTo, router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasAnyRequiredRole: user ? hasAnyRole(user, requiredRoles) : false,
  };
}

/**
 * Hook for routes that require minimum role level
 */
export function useMinimumRoleProtected(
  minRole: UserRole,
  redirectTo?: string
) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        const loginUrl = `/login${redirectTo ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}`;
        router.replace(loginUrl);
      } else if (!hasMinimumRole(user, minRole)) {
        router.replace('/unauthorized');
      }
    }
  }, [user, isLoading, minRole, redirectTo, router]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    hasMinimumRole: user ? hasMinimumRole(user, minRole) : false,
  };
}

/**
 * Hook to check permissions for specific resources
 */
export function usePermissions() {
  const { user } = useAuth();

  return {
    user,
    hasRole: (role: UserRole) => hasRole(user, role),
    hasAnyRole: (roles: UserRole[]) => hasAnyRole(user, roles),
    hasMinimumRole: (minRole: UserRole) => hasMinimumRole(user, minRole),
    canAccess: (resource: string) => canAccess(user, resource),
    isAdmin: () => hasRole(user, 'ADMIN'),
    isSettlementUser: () => hasRole(user, 'SETTLEMENT_USER'),
    isDriver: () => hasRole(user, 'DRIVER'),
  };
}

/**
 * Hook for admin-only routes
 */
export function useAdminProtected(redirectTo?: string) {
  return useRoleProtected('ADMIN', redirectTo);
}

/**
 * Hook for settlement user and admin routes
 */
export function useSettlementProtected(redirectTo?: string) {
  return useAnyRoleProtected(['ADMIN', 'SETTLEMENT_USER'], redirectTo);
}

/**
 * Hook for driver and admin routes
 */
export function useDriverProtected(redirectTo?: string) {
  return useAnyRoleProtected(['ADMIN', 'DRIVER'], redirectTo);
}

/**
 * Hook to redirect users to their default page based on role
 */
export function useRoleRedirect() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const redirectToDefaultPage = () => {
    if (user) {
      const defaultUrl = getDefaultRedirectUrl(user);
      router.push(defaultUrl);
    } else {
      router.push('/login');
    }
  };

  return { redirectToDefaultPage, user, isLoading };
}
