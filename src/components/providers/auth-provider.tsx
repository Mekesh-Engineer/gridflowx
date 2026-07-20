'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore, AuthUser } from '@/store/zustand/stores';
import { UserRole } from '@/lib/constants';
import { initAuthPersistence, syncUserProfile } from '@/services/firebase';

interface AuthContextType {
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({ isInitialized: false });

export const useAuthContext = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, clearUser } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Ensure persistence is initialized on client boot
    initAuthPersistence().catch((err) => console.error('Persistence error:', err));

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          let profile: any;
          try {
            profile = await syncUserProfile(firebaseUser);
          } catch (profileError) {
            console.warn('Profile sync fallback:', profileError);
            profile = {
              displayName: firebaseUser.displayName || 'Operator User',
              firstName: firebaseUser.displayName?.split(' ')[0] || null,
              lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || null,
              role: UserRole.OPERATOR,
            };
          }

          const authUser: AuthUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: profile.displayName || firebaseUser.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
            firstName: profile.firstName || null,
            lastName: profile.lastName || null,
            photoURL: profile.avatarUrl || firebaseUser.photoURL,
            phoneNumber: firebaseUser.phoneNumber,
            role: (profile.role as UserRole) || UserRole.OPERATOR,
            emailVerified: firebaseUser.emailVerified,
            dob: profile.dob || null,
            gender: profile.gender || null,
            consents: profile.consents || null,
          };

          setUser(authUser);
        } else {
          clearUser();
        }
      } catch (error) {
        console.error('Error syncing auth state:', error);
        if (!firebaseUser) {
          clearUser();
        }
      } finally {
        setIsInitialized(true);
      }
    });

    return () => unsubscribe();
  }, [setUser, clearUser]);

  return (
    <AuthContext.Provider value={{ isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
}
