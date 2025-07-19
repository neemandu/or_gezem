import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: any) {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/'];

  // Admin-only routes
  const adminRoutes = ['/admin'];

  // Settlement user routes
  const settlementRoutes = ['/dashboard'];

  // Driver routes
  const driverRoutes = ['/mobile-report'];

  // Check if the route is public
  if (publicRoutes.includes(pathname) || pathname.startsWith('/api/')) {
    return res;
  }

  // If no user or auth error and trying to access protected route, redirect to login
  if (!user || error) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Get user role from user metadata
  const userRole = user.user_metadata?.role;

  if (!userRole) {
    // User role not found in metadata, sign out and redirect to login
    await supabase.auth.signOut();
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }

  // Role-based route protection
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    if (userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  if (settlementRoutes.some((route) => pathname.startsWith(route))) {
    if (!['ADMIN', 'SETTLEMENT_USER'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  if (driverRoutes.some((route) => pathname.startsWith(route))) {
    if (!['ADMIN', 'DRIVER'].includes(userRole)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  // Redirect users to their appropriate dashboard after login
  if (pathname === '/') {
    const redirectUrl = req.nextUrl.clone();

    switch (userRole) {
      case 'ADMIN':
        redirectUrl.pathname = '/admin';
        break;
      case 'SETTLEMENT_USER':
        redirectUrl.pathname = '/dashboard';
        break;
      case 'DRIVER':
        redirectUrl.pathname = '/mobile-report';
        break;
      default:
        redirectUrl.pathname = '/login';
        break;
    }

    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
