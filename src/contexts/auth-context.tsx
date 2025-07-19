'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { AuthUser, UserRole } from '@/types/database';

interface AuthContextType {
  user: AuthUser | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  error: string | null;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  canAccess: (resource: string) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile from custom users table
  const fetchUserProfile = async (
    supabaseUser: SupabaseUser
  ): Promise<AuthUser | null> => {
    try {
      const { data: userProfile, error } = await supabase
        .from('users')
        .select(
          `
          *,
          settlement:settlements(*)
        `
        )
        .eq('email', supabaseUser.email)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      if (!userProfile) {
        console.error('No user profile found for:', supabaseUser.email);
        return null;
      }

      return {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        settlement_id: userProfile.settlement_id,
        settlement: userProfile.settlement || null,
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          // If there's an error getting the user, they're not authenticated
          console.log('No authenticated user found:', error.message);
        } else if (user && mounted) {
          setSupabaseUser(user);
          const userProfile = await fetchUserProfile(user);
          setUser(userProfile);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setError('שגיאה בטעינת המערכת');
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setIsLoading(true);
      setError(null);

      if (session?.user) {
        setSupabaseUser(session.user);
        const userProfile = await fetchUserProfile(session.user);
        setUser(userProfile);
      } else {
        setSupabaseUser(null);
        setUser(null);
      }

      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const errorMessage = getHebrewErrorMessage(error.message);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (data.user) {
        const userProfile = await fetchUserProfile(data.user);
        if (!userProfile) {
          const errorMessage = 'לא נמצא פרופיל משתמש במערכת';
          setError(errorMessage);
          await supabase.auth.signOut();
          return { success: false, error: errorMessage };
        }

        setSupabaseUser(data.user);
        setUser(userProfile);
      }

      return { success: true };
    } catch (error) {
      const errorMessage = 'שגיאה בתהליך ההתחברות';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSupabaseUser(null);
      setError(null);
    } catch (error) {
      console.error('Error signing out:', error);
      setError('שגיאה ביציאה מהמערכת');
    } finally {
      setIsLoading(false);
    }
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;

    const rolesArray = Array.isArray(roles) ? roles : [roles];
    return rolesArray.includes(user.role);
  };

  const canAccess = (resource: string): boolean => {
    if (!user) return false;

    // Role-based access control
    switch (user.role) {
      case 'ADMIN':
        return true; // Full access

      case 'SETTLEMENT_USER':
        // Dashboard access only, restricted to own settlement
        return ['dashboard', 'reports-view', 'profile'].includes(resource);

      case 'DRIVER':
        // Mobile report submission only
        return ['mobile-report', 'profile'].includes(resource);

      default:
        return false;
    }
  };

  const refreshUser = async () => {
    if (!supabaseUser) return;

    setIsLoading(true);
    try {
      const userProfile = await fetchUserProfile(supabaseUser);
      setUser(userProfile);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setError('שגיאה ברענון פרטי המשתמש');
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    isLoading,
    error,
    signIn,
    signOut,
    hasRole,
    canAccess,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Helper function to translate auth errors to Hebrew
function getHebrewErrorMessage(errorMessage: string): string {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'שם משתמש או סיסמה שגויים',
    'Email not confirmed': 'נדרש אישור כתובת מייל',
    'Too many requests': 'יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר',
    'User not found': 'משתמש לא נמצא במערכת',
    'Invalid email': 'כתובת מייל לא תקינה',
    'Password should be at least 6 characters':
      'הסיסמה חייבת להכיל לפחות 6 תווים',
    'Network error': 'שגיאת רשת. בדוק את החיבור לאינטרנט',
  };

  // Try to find a matching error message
  for (const [englishError, hebrewError] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(englishError.toLowerCase())) {
      return hebrewError;
    }
  }

  // Default error message
  return 'שגיאה בהתחברות למערכת';
}
