import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/database';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          req.cookies.set({
            name,
            value,
            ...options,
          });
          res.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: any) {
          req.cookies.set({
            name,
            value: '',
            ...options,
          });
          res.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  const { pathname } = req.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/unauthorized'];

  // Skip middleware for API routes (except auth routes), static files, and images
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp)$/)
  ) {
    return res;
  }

  // Check if the route is public
  if (publicRoutes.includes(pathname)) {
    return res;
  }

  try {
    // Get the current user and session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // If no user and trying to access protected route, redirect to login
    if (!user || userError) {
      console.log(
        `Middleware: No authenticated user, redirecting to login from ${pathname}`
      );
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      if (pathname !== '/') {
        redirectUrl.searchParams.set('redirectTo', pathname);
      }
      return NextResponse.redirect(redirectUrl);
    }

    // Get user role from user metadata or database
    let userRole = user.user_metadata?.role;

    // If role is not in metadata, try to get it from the database
    if (!userRole) {
      try {
        const { data: userProfile } = await supabase
          .from('users')
          .select('role')
          .eq('email', user.email)
          .single();

        userRole = userProfile?.role;
      } catch (error) {
        console.error(
          'Middleware: Error fetching user role from database:',
          error
        );
      }
    }

    if (!userRole) {
      console.log('Middleware: No user role found, redirecting to login');
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      return NextResponse.redirect(redirectUrl);
    }

    // Define route permissions
    const routePermissions = {
      '/admin': ['ADMIN'],
      '/dashboard': ['ADMIN', 'SETTLEMENT_USER'],
      '/mobile-report': ['ADMIN', 'DRIVER'],
    };

    // Check route-specific permissions
    for (const [route, allowedRoles] of Object.entries(routePermissions)) {
      if (pathname.startsWith(route)) {
        if (!allowedRoles.includes(userRole)) {
          console.log(
            `Middleware: Access denied - ${userRole} cannot access ${pathname}`
          );
          return NextResponse.redirect(new URL('/unauthorized', req.url));
        }
        break;
      }
    }

    // Redirect users to their appropriate dashboard from root
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

    console.log(
      `Middleware: Access granted - ${userRole} can access ${pathname}`
    );
    return res;
  } catch (error) {
    console.error('Middleware: Unexpected error:', error);
    // On error, redirect to login for safety
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    return NextResponse.redirect(redirectUrl);
  }
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
