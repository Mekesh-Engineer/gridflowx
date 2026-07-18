'use client';

import { useState, useCallback } from 'react';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function useLogin() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const login = useCallback(async (email: string, password: string, role?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loginGoogle = useCallback(async (role?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { login, loginGoogle, isLoading, error };
}
