'use client';

import { useAuthStore } from '@/store/auth.store';
import { useAuthContext } from '@/components/providers/auth-provider';
import { logout as logoutService, resendVerificationEmailService } from '@/features/auth/services/auth.service';
import { useAuthStore as useStore } from '@/store/auth.store';
import { useCallback } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const { user, isAuthenticated, clearUser } = useAuthStore();
  const { isInitialized } = useAuthContext();
  const router = useRouter();

  const logout = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('gridflowx-dev-session');
      }
      await logoutService();
      clearUser();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [clearUser, router]);

  const resendVerification = useCallback(async () => {
    if (user?.email) {
      await resendVerificationEmailService(user.email);
    }
  }, [user?.email]);

  return {
    user,
    isAuthenticated,
    role: user?.role || null,
    isInitialized,
    logout,
    resendVerification,
  };
}
