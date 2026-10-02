import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole } from '@/lib/constants';

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
    } | null;
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
