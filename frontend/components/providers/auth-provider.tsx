'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore, AuthUser } from '@/store/auth.store';
import { UserRole } from '@/lib/constants';
import { syncUserProfile } from '@/features/auth/services/auth.service';

interface AuthContextType {
  isInitialized: boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType>({ isInitialized: false, session: null });

export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // 1. Load the initial session from Supabase (SSR cookie or localStorage)
    supabase.auth.getSession().then(async ({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession?.user) {
        await hydrateUser(initialSession.user);
      } else {
        applyDevSessionFallback();
      }
      setIsInitialized(true);
    });

    // 2. Subscribe to future auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        try {
          if (newSession?.user) {
            await hydrateUser(newSession.user);
          } else {
            applyDevSessionFallback();
          }
        } catch (err) {
          console.error('Error syncing auth state:', err);
          if (!newSession?.user) applyDevSessionFallback();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [setUser, clearUser]);

  async function hydrateUser(supabaseUser: User) {
    let profile: any;
    try {
      profile = await syncUserProfile(supabaseUser);
    } catch (profileError) {
      console.warn('Profile sync fallback:', profileError);
      const meta = supabaseUser.user_metadata || {};
      profile = {
        displayName: meta.displayName || meta.full_name || 'Operator User',
        firstName: null,
        lastName: null,
        role: UserRole.OPERATOR,
      };
    }

    const authUser: AuthUser = {
      uid: supabaseUser.id,
      email: supabaseUser.email ?? null,
      displayName:
        profile.displayName ||
        `${profile.firstName || ''} ${profile.lastName || ''}`.trim() ||
        'Operator User',
      firstName: profile.firstName || null,
      lastName: profile.lastName || null,
      photoURL: profile.avatarUrl || supabaseUser.user_metadata?.avatar_url || null,
      phoneNumber: supabaseUser.phone || null,
      role: (profile.role as UserRole) || UserRole.OPERATOR,
      emailVerified: !!supabaseUser.email_confirmed_at,
      dob: profile.dob || null,
      gender: profile.gender || null,
      consents: profile.consents || null,
    };

    setUser(authUser);
  }

  function applyDevSessionFallback() {
    const isLocalhost =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const devSession =
      typeof window !== 'undefined' ? localStorage.getItem('gridflowx-dev-session') : null;

    if (process.env.NODE_ENV === 'development' && isLocalhost && devSession) {
      try {
        const parsed = JSON.parse(devSession);
        setUser(parsed);
      } catch {
        clearUser();
      }
    } else {
      clearUser();
    }
  }

  return (
    <AuthContext.Provider value={{ isInitialized, session }}>
      {children}
    </AuthContext.Provider>
  );
}
