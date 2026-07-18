'use client';

import { useState, useCallback, useEffect } from 'react';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useSearchParams } from 'next/navigation';

interface StrengthResult {
    score: number;
    color: string;
    label: string;
}

function calcStrength(password: string): StrengthResult {
    const checks = [/.{8,}/, /[A-Z]/, /[a-z]/, /[0-9]/, /[^A-Za-z0-9]/];
    const score = checks.filter((re) => re.test(password)).length;
    const colors = ['bg-red-500', 'bg-red-500', 'bg-orange-500', 'bg-amber-400', 'bg-lime-400', 'bg-emerald-500'];
    const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return { score, color: colors[score], label: labels[score] };
}

const MIN_PASSWORD_LENGTH = 8;

export function useResetPassword() {
    const searchParams = useSearchParams();
    const oobCode = searchParams.get('oobCode') ?? '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [confirmError, setConfirmError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<'idle' | 'error' | 'success'>('idle');
    const [codeError, setCodeError] = useState<string | null>(null);

    // Verify the oobCode on mount
    useEffect(() => {
        if (!oobCode) {
            setCodeError('Invalid or missing password reset link. Please request a new one.');
            return;
        }
        verifyPasswordResetCode(auth, oobCode).catch(() => {
            setCodeError('This reset link is invalid or has expired. Please request a new one.');
        });
    }, [oobCode]);

    const strength = calcStrength(password);

    const validatePassword = useCallback((val: string): string | null => {
        if (!val) return 'Password is required.';
        if (val.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
        return null;
    }, []);

    const validateConfirm = useCallback((val: string): string | null => {
        if (!val) return 'Please confirm your password.';
        if (val !== password) return "Passwords don't match.";
        return null;
    }, [password]);

    const touch = useCallback((field: 'password' | 'confirm') => {
        if (field === 'password') setPasswordError(validatePassword(password));
        if (field === 'confirm') setConfirmError(validateConfirm(confirmPassword));
    }, [password, confirmPassword, validatePassword, validateConfirm]);

    const toggleShowPassword = useCallback(() => setShowPassword((p) => !p), []);
    const toggleShowConfirm = useCallback(() => setShowConfirm((p) => !p), []);

    const submit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const passErr = validatePassword(password);
        const confirmErr = validateConfirm(confirmPassword);
        setPasswordError(passErr);
        setConfirmError(confirmErr);
        if (passErr || confirmErr) return;

        if (!oobCode) {
            setError('Invalid reset link. Please request a new one.');
            setStatus('error');
            return;
        }

        setIsLoading(true);
        setError(null);
        setStatus('idle');
        try {
            await confirmPasswordReset(auth, oobCode, password);
            setIsSuccess(true);
            setStatus('success');
        } catch (err: any) {
            const msg = err.code === 'auth/invalid-action-code'
                ? 'This reset link is invalid or has already been used.'
                : err.code === 'auth/expired-action-code'
                ? 'This reset link has expired. Please request a new one.'
                : err.message || 'Failed to reset password. Please try again.';
            setError(msg);
            setStatus('error');
        } finally {
            setIsLoading(false);
        }
    }, [oobCode, password, confirmPassword, validatePassword, validateConfirm]);

    return {
        password,
        setPassword,
        confirmPassword,
        setConfirmPassword,
        showPassword,
        showConfirm,
        toggleShowPassword,
        toggleShowConfirm,
        passwordError,
        confirmError,
        touch,
        strength,
        isLoading,
        isSuccess,
        error,
        status,
        codeError,
        submit,
    };
}
