import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { access_token, refresh_token } = body;

    const res = NextResponse.json({ success: true });

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            res.cookies.set({
              name,
              value,
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
            });
          },
          remove(name: string, options: any) {
            res.cookies.set({
              name,
              value: '',
              ...options,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 0,
            });
          },
        },
      }
    );

    // If we have tokens from the client, set the session
    if (access_token && refresh_token) {
      console.log('Session API: Setting session from provided tokens');

      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (error) {
        console.error('Session API: Error setting session:', error.message);
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 401 }
        );
      }

      console.log('Session API: Session set successfully');
      return res;
    }

    // If no tokens provided, treat as sign out (clear session)
    console.log('Session API: No tokens provided, clearing session');
    await supabase.auth.signOut();
    return res;
  } catch (error) {
    console.error('Session API: Unexpected error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set() {},
          remove() {},
        },
      }
    );

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      session: session
        ? {
            user: {
              id: session.user.id,
              email: session.user.email,
              role: session.user.user_metadata?.role,
            },
            expires_at: session.expires_at,
          }
        : null,
    });
  } catch (error) {
    console.error('Session API: Error getting session:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
