'use client';

import { useAuthStore } from '@/store/zustand/stores';
import { useAuthContext } from '@/components/providers/auth-provider';
import { signOut as fbSignOut, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const { isInitialized } = useAuthContext();
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await fbSignOut(auth);
      clearUser();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [clearUser, router]);

  const resendVerification = useCallback(async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser, {
        url: `${window.location.origin}/login?verified=true`,
        handleCodeInApp: false,
      });
    }
  }, []);

  return {
    user,
    isAuthenticated,
    role: user?.role || null,
    isInitialized,
    logout,
    resendVerification,
  };
}
