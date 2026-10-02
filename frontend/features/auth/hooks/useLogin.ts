'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export function useLogin() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const login = useCallback(async (email: string, password: string, _role?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) throw signInError;
        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loginGoogle = useCallback(async (_role?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: typeof window !== 'undefined'
                        ? `${window.location.origin}/auth/callback`
                        : undefined,
                },
            });
            if (oauthError) throw oauthError;
        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return { login, loginGoogle, isLoading, error };
}
