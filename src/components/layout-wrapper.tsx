'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/loading';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

interface RouteConfig {
  path: string;
  allowedRoles: Array<'ADMIN' | 'SETTLEMENT_USER' | 'DRIVER'>;
  isPublic?: boolean;
}

const routeConfigs: RouteConfig[] = [
  {
    path: '/login',
    allowedRoles: [],
    isPublic: true,
  },
  {
    path: '/unauthorized',
    allowedRoles: [],
    isPublic: true,
  },
  {
    path: '/data',
    allowedRoles: ['ADMIN', 'SETTLEMENT_USER'],
  },
  {
    path: '/dashboard',
    allowedRoles: ['ADMIN', 'SETTLEMENT_USER'],
  },
  {
    path: '/report',
    allowedRoles: ['DRIVER'],
  },
  {
    path: '/mobile-report',
    allowedRoles: ['DRIVER'],
  },
  {
    path: '/settings',
    allowedRoles: ['ADMIN'],
  },
  {
    path: '/admin',
    allowedRoles: ['ADMIN'],
  },
];

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const { user, isLoading, hasRole } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only log when state actually changes to reduce noise
    if (!isLoading) {
      console.log('LayoutWrapper: Auth resolved -', {
        hasUser: !!user,
        userRole: user?.role,
        pathname,
      });
    }

    if (isLoading || !pathname) return;

    // Find matching route config
    const routeConfig = routeConfigs.find((config) =>
      pathname.startsWith(config.path)
    );

    // If no route config found, allow access (for dynamic routes)
    if (!routeConfig) return;

    // Allow access to public routes
    if (routeConfig.isPublic) return;

    // Redirect to login if user is not authenticated
    if (!user) {
      console.log('LayoutWrapper: No user, redirecting to login');
      router.push('/login');
      return;
    }

    // Check if user has required role
    const hasAccess = routeConfig.allowedRoles.some((role) => hasRole(role));

    if (!hasAccess) {
      console.log(
        'LayoutWrapper: User lacks required role, redirecting to unauthorized'
      );
      router.push('/unauthorized');
      return;
    }

    // Role-based home page redirects
    if (pathname === '/') {
      console.log(
        'LayoutWrapper: Redirecting home page based on role:',
        user.role
      );
      switch (user.role) {
        case 'ADMIN':
          router.push('/data');
          break;
        case 'SETTLEMENT_USER':
          router.push('/data');
          break;
        case 'DRIVER':
          router.push('/report');
          break;
        default:
          router.push('/unauthorized');
      }
    }
  }, [user, isLoading, pathname, router, hasRole]);

  // Show loading screen
  if (isLoading) {
    return <Loading fullScreen />;
  }

  // Show login/public pages without header
  const isPublicPage =
    pathname &&
    routeConfigs.some(
      (config) => config.isPublic && pathname.startsWith(config.path)
    );

  if (isPublicPage || !user) {
    return (
      <div className="min-h-screen bg-background font-hebrew" dir="rtl">
        <main className="text-right">{children}</main>
      </div>
    );
  }

  // Show unauthorized page
  if (pathname === '/unauthorized') {
    return (
      <div className="min-h-screen bg-background font-hebrew" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8 text-right">
          <div className="max-w-md mx-auto text-center space-y-6">
            <div className="space-y-3">
              <h1 className="text-2xl font-bold text-text-primary">
                אין הרשאה לגישה
              </h1>
              <p className="text-text-secondary">
                אין לך הרשאה לגשת לדף זה. אנא פנה למנהל המערכת.
              </p>
            </div>
            <Button
              onClick={() => {
                switch (user?.role) {
                  case 'ADMIN':
                    router.push('/data');
                    break;
                  case 'SETTLEMENT_USER':
                    router.push('/data');
                    break;
                  case 'DRIVER':
                    router.push('/report');
                    break;
                  default:
                    router.push('/login');
                }
              }}
              className="w-full"
            >
              חזור לדף הבית
            </Button>
          </div>
        </main>
      </div>
    );
  }

  // Main layout with header
  return (
    <div className="min-h-screen bg-background font-hebrew" dir="rtl">
      <Header />
      <main className="text-right">
        <div className="container mx-auto px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
