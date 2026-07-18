import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '@/lib/constants';
import { useTheme } from 'next-themes';

/**
 * Thin wrapper around next-themes so components can import `useThemeStore`
 * without touching the ThemeProvider directly.
 */
export function useThemeStore() {
    const { resolvedTheme, setTheme } = useTheme();
    const isDarkMode = resolvedTheme === 'dark';
    const toggleTheme = () => setTheme(isDarkMode ? 'light' : 'dark');
    return { isDarkMode, toggleTheme };
}


export interface AuthUser {
    uid: string;
    email: string | null;
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
    photoURL: string | null;
    phoneNumber: string | null;
    role: UserRole;
    emailVerified: boolean;
    dob?: string | null;
    gender?: string | null;
    consents?: {
        terms: boolean;
        marketing: boolean;
        whatsapp: boolean;
        liveLocation: boolean;
    };
}

interface AuthStoreState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    setUser: (user: AuthUser | null) => void;
    clearUser: () => void;
}

export const useAuthStore = create<AuthStoreState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            clearUser: () => set({ user: null, isAuthenticated: false }),
        }),
        {
            name: 'gridflowx-auth',
        }
    )
);
