'use client';

import { useAuthStore } from '@/store/zustand/stores';
import { useAuthContext } from '@/components/providers/auth-provider';
import { logoutService, resendVerificationEmailService } from '@/services/firebase';
import { auth } from '@/lib/firebase';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const { isInitialized } = useAuthContext();
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      await logoutService();
      clearUser();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [clearUser, router]);

  const resendVerification = useCallback(async () => {
    if (auth.currentUser) {
      await resendVerificationEmailService(auth.currentUser);
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
