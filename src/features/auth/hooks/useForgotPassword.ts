'use client';

import { useState, useCallback, useRef } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOLDOWN_SECONDS = 60;

export function useForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
    const [email, setEmail] = useState('');
    const [cooldown, setCooldown] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startCooldown = useCallback(() => {
        setCooldown(COOLDOWN_SECONDS);
        timerRef.current = setInterval(() => {
            setCooldown((c) => {
                if (c <= 1) {
                    clearInterval(timerRef.current!);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
    }, []);

    const validateEmail = useCallback((val: string): string | null => {
        if (!val.trim()) return 'Email address is required.';
        if (!EMAIL_REGEX.test(val)) return 'Please enter a valid email address.';
        return null;
    }, []);

    const touchEmail = useCallback(() => {
        setEmailError(validateEmail(email));
    }, [email, validateEmail]);

    const submit = useCallback(async () => {
        const emailErr = validateEmail(email);
        if (emailErr) { setEmailError(emailErr); return; }
        setEmailError(null);
        setIsLoading(true);
        setError(null);
        setStatus('idle');
        try {
            await sendPasswordResetEmail(auth, email.trim(), {
                url: `${window.location.origin}/login`,
                handleCodeInApp: false,
            });
            setIsSuccess(true);
            setStatus('success');
            startCooldown();
        } catch (err: any) {
            const msg = err.code === 'auth/user-not-found'
                ? 'No account found with this email address.'
                : err.message || 'Failed to send reset email. Please try again.';
            setError(msg);
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    }, [email, validateEmail, startCooldown]);

    const resend = useCallback(async () => {
        if (cooldown > 0 || isLoading) return;
        setIsLoading(true);
        setError(null);
        setStatus('idle');
        try {
            await sendPasswordResetEmail(auth, email.trim(), {
                url: `${window.location.origin}/login`,
                handleCodeInApp: false,
            });
            startCooldown();
        } catch (err: any) {
            setError(err.message || 'Failed to resend. Please try again.');
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    }, [email, cooldown, isLoading, startCooldown]);

    return {
        email,
        setEmail,
        emailError,
        touchEmail,
        submit,
        resend,
        isLoading,
        isSuccess,
        error,
        status,
        cooldown,
    };
}
