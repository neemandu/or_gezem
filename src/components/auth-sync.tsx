'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export function AuthSync() {
  const router = useRouter();
  const hasInitialized = useRef(false);
  const isProcessing = useRef(false);

  const callSessionAPI = async (session?: any) => {
    // Prevent concurrent calls
    if (isProcessing.current) {
      console.log('AuthSync: Session API call already in progress, skipping');
      return false;
    }

    isProcessing.current = true;

    try {
      const body = session
        ? {
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }
        : {};

      const response = await fetch('/api/auth/session', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        console.log('AuthSync: Session API call successful');
        return true;
      } else {
        console.error('AuthSync: Session API call failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('AuthSync: Error calling session API:', error);
      return false;
    } finally {
      isProcessing.current = false;
    }
  };

  useEffect(() => {
    // Only sync on the first mount
    if (!hasInitialized.current) {
      hasInitialized.current = true;

      const syncInitialSession = async () => {
        try {
          console.log('AuthSync: Initial session sync...');

          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error('AuthSync: Error getting initial session:', error);
            return;
          }

          if (session) {
            console.log(
              'AuthSync: Initial session found, syncing with server...'
            );
            await callSessionAPI(session);
          } else {
            console.log('AuthSync: No initial session found');
          }
        } catch (error) {
          console.error('AuthSync: Error in initial session sync:', error);
        }
      };

      // Small delay to ensure auth context has initialized
      setTimeout(syncInitialSession, 100);
    }

    // Listen for auth state changes and sync when needed
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthSync: Auth state changed:', event);

      // Handle specific events that require server sync
      if (event === 'SIGNED_IN' && session) {
        console.log('AuthSync: User signed in, syncing with server...');

        // Delay to ensure session is fully established
        setTimeout(async () => {
          try {
            const success = await callSessionAPI(session);
            if (success) {
              console.log(
                'AuthSync: Server session synchronized after sign in'
              );
              // Don't refresh immediately after sign in - let the login page handle navigation
              // router.refresh();
            }
          } catch (error) {
            console.error('AuthSync: Error in post-signin sync:', error);
          }
        }, 200);
      } else if (event === 'TOKEN_REFRESHED' && session) {
        console.log('AuthSync: Token refreshed, syncing with server...');

        // Sync with server when token is refreshed
        const success = await callSessionAPI(session);
        // Don't refresh on token refresh - it's not necessary and can interfere with navigation
      } else if (event === 'SIGNED_OUT') {
        console.log('AuthSync: User signed out, clearing server session...');

        // Clear server session
        await callSessionAPI();
        router.refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null; // This component doesn't render anything
}
