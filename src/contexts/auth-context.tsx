'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { type UserRole } from '@/lib/supabase/types';

interface Settlement {
  id: string;
  name: string;
  contact_phone?: string;
  contact_person?: string;
}

interface UserDetails {
  id: string;
  email: string;
  role: UserRole;
  first_name?: string;
  last_name?: string;
  phone?: string;
  settlement_id?: string;
  settlement?: Settlement;
}

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
  refreshUserDetails: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  const fetchUserDetails = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(
          `
          id,
          email,
          role,
          first_name,
          last_name,
          phone,
          settlement_id,
          settlements (
            id,
            name,
            contact_phone,
            contact_person
          )
        `
        )
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user details:', error);
        return null;
      }

      return data as UserDetails;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const refreshUserDetails = async () => {
    if (user?.id) {
      const details = await fetchUserDetails(user.id);
      setUserDetails(details);
    }
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setUserRole(session?.user?.user_metadata?.role ?? null);

      if (session?.user?.id) {
        const details = await fetchUserDetails(session.user.id);
        setUserDetails(details);
      }

      setIsLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setUserRole(session?.user?.user_metadata?.role ?? null);

      if (session?.user?.id) {
        const details = await fetchUserDetails(session.user.id);
        setUserDetails(details);
      } else {
        setUserDetails(null);
      }

      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!userRole) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(userRole);
  };

  const value: AuthContextType = {
    user,
    userRole,
    userDetails,
    isLoading,
    signIn,
    signOut,
    hasRole,
    refreshUserDetails,
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
