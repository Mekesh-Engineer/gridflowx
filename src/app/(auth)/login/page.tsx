'use client';

import { AuthErrorAlert } from '@/features/auth/components/AuthErrorAlert';
import { AuthFormInput } from '@/features/auth/components/AuthFormInput';
import { AuthLogoMark } from '@/features/auth/components/AuthLogoMark';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { mapFirebaseError } from '@/features/auth/types/auth.types';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ArrowRight, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState, Suspense } from 'react';
import { useAuthStore } from '@/store/zustand/stores';
import { ROLE_DASHBOARDS, UserRole } from '@/routes/routes.config';

// =============================================================================
// VALIDATION
// =============================================================================

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

interface FormErrors {
    email?: string;
    password?: string;
    general?: string;
}

function validateForm(email: string, password: string): FormErrors {
    const errors: FormErrors = {};
    if (!email.trim()) errors.email = 'Email address is required.';
    else if (!EMAIL_REGEX.test(email)) errors.email = 'Please enter a valid email address.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < MIN_PASSWORD_LENGTH)
        errors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    return errors;
}

// =============================================================================
// LOGIN FORM COMPONENT
// =============================================================================

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, loginGoogle, isLoading: hookLoading, error: hookError } = useLogin();
    const { user } = useAuthStore();

    const confettiFrameRef = useRef<number | null>(null);

    const [email, setEmail] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('gridflowx_remembered_email') || '';
        }
        return '';
    });
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('gridflowx_remember') === 'true';
        }
        return false;
    });
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [loginSuccess, setLoginSuccess] = useState(false);

    // Sync Firebase hook errors
    useEffect(() => {
        if (hookError) {
            setErrors({ general: mapFirebaseError(hookError.code || hookError, hookError.message || hookError) });
            setLoginSuccess(false);
        }
    }, [hookError]);

    // Cleanup animation frames
    useEffect(() => {
        return () => {
            if (confettiFrameRef.current !== null) {
                cancelAnimationFrame(confettiFrameRef.current);
            }
        };
    }, []);

    // Redirect on success
    useEffect(() => {
        if (loginSuccess) {
            let redirectUrl = searchParams.get('redirectTo') || '';
            if (!redirectUrl || redirectUrl === '/dashboard') {
                const targetDashboard = (user?.role && ROLE_DASHBOARDS[user.role as UserRole]) || '/dashboard';
                redirectUrl = targetDashboard;
            }
            const timer = setTimeout(() => {
                router.push(redirectUrl);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [loginSuccess, router, searchParams, user?.role]);

    // Confetti stream
    const executeSafeConfettiStream = useCallback(() => {
        const duration = 2500;
        const end = Date.now() + duration;
        const colors = ['#4ade80', '#34d399', '#007AA3', '#ffffff'];
        const renderFrame = () => {
            confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
            confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
            if (Date.now() < end) {
                confettiFrameRef.current = requestAnimationFrame(renderFrame);
            }
        };
        renderFrame();
    }, []);

    const handleBlur = useCallback((field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        const validationErrors = validateForm(email, password);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            setTouched({ email: true, password: true });
            return;
        }
        try {
            if (rememberMe) {
                localStorage.setItem('gridflowx_remember', 'true');
                localStorage.setItem('gridflowx_remembered_email', email.trim());
            } else {
                localStorage.removeItem('gridflowx_remember');
                localStorage.removeItem('gridflowx_remembered_email');
            }
            await login(email.trim(), password);
            setLoginSuccess(true);
            executeSafeConfettiStream();
        } catch (err: any) {
            setErrors({ general: mapFirebaseError(err.code, err.message || 'Login failed.') });
            setLoginSuccess(false);
        }
    }, [email, password, rememberMe, login, executeSafeConfettiStream]);

    const handleGoogleLogin = useCallback(async () => {
        setSocialLoading('google');
        setErrors({});
        try {
            await loginGoogle();
            setLoginSuccess(true);
            executeSafeConfettiStream();
        } catch (err: any) {
            setErrors({ general: mapFirebaseError(err.code, err.message || 'Google login failed.') });
            setLoginSuccess(false);
        } finally {
            setSocialLoading(null);
        }
    }, [loginGoogle, executeSafeConfettiStream]);

    const isDisabled = hookLoading || socialLoading !== null || loginSuccess;

    return (
        <div className="flex flex-col space-y-6">
            {/* Success toast */}
            <AnimatePresence>
                {loginSuccess && (
                    <motion.div
                        initial={{ opacity: 0, y: -40, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        role="status"
                        aria-live="polite"
                        className="fixed top-6 left-1/2 z-[9999] flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white text-emerald-600 border border-emerald-500 shadow-2xl backdrop-blur-md font-semibold text-[15px] whitespace-nowrap transform -translate-x-1/2"
                    >
                        <Activity className="size-4 shrink-0 animate-pulse" aria-hidden="true" />
                        <span>Success! Redirecting...</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Logo */}
            <AuthLogoMark />

            {/* Heading */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                    Welcome <span className="text-[var(--color-primary)]">Back</span>
                </h1>
                <p className="text-[var(--text-muted)] text-base leading-relaxed">
                    Sign in to your account to monitor and
                    <br className="hidden sm:inline" /> optimize your microgrid.
                </p>
            </div>

            {/* General error */}
            <AuthErrorAlert message={errors.general} show={!!errors.general && !loginSuccess} />

            {/* Login Form */}
            <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                {/* Email */}
                <AuthFormInput
                    id="login-email"
                    label="Email Address"
                    type="email"
                    icon={Mail}
                    value={email}
                    error={errors.email}
                    touched={touched.email}
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    disabled={isDisabled}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    onBlur={() => handleBlur('email')}
                />

                {/* Password */}
                <AuthFormInput
                    id="login-password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    icon={Lock}
                    value={password}
                    error={errors.password}
                    touched={touched.password}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    disabled={isDisabled}
                    onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    onBlur={() => handleBlur('password')}
                    rightSlot={
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            className="text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                        >
                            {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                        </button>
                    }
                />

                {/* Remember me + Forgot password */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <input
                            id="remember-me"
                            name="rememberMe"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4.5 w-4.5 rounded border-[var(--border-primary)] bg-[var(--text-primary)]/[0.02] cursor-pointer accent-[var(--color-primary)] focus:ring-0"
                        />
                        <label className="text-[15px] text-[var(--text-muted)] cursor-pointer select-none" htmlFor="remember-me">
                            Remember me
                        </label>
                    </div>
                    <Link
                        href="/forgot-password"
                        className="text-[15px] font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-focus)] hover:underline focus:outline-none transition-colors"
                    >
                        Forgot password?
                    </Link>
                </div>

                {/* Sign In button */}
                <motion.button
                    type="submit"
                    disabled={isDisabled}
                    aria-busy={hookLoading}
                    whileHover={!isDisabled ? { scale: 1.01, y: -1 } : {}}
                    whileTap={!isDisabled ? { scale: 0.99 } : {}}
                    className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-base font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-focus)] text-[var(--text-inverse)] shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-base)] focus:ring-[var(--color-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                    <span className="flex items-center gap-2">
                        {hookLoading ? (
                            <><Loader2 className="size-5 animate-spin" aria-hidden="true" /> Signing in...</>
                        ) : loginSuccess ? (
                            <><Activity className="size-5" aria-hidden="true" /> Success</>
                        ) : (
                            <>Sign In <ArrowRight size={18} aria-hidden="true" /></>
                        )}
                    </span>
                </motion.button>
            </form>

            {/* Divider */}
            <div className="relative" aria-hidden="true">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[var(--border-primary)]/60" />
                </div>
                <div className="relative flex justify-center text-[15px]">
                    <span className="px-4 bg-[var(--bg-surface)] text-[var(--text-muted)] font-medium">Or sign in with</span>
                </div>
            </div>

            {/* Google OAuth */}
            <motion.button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isDisabled}
                aria-label="Sign in with Google"
                whileHover={!isDisabled ? { scale: 1.01, y: -1 } : {}}
                whileTap={!isDisabled ? { scale: 0.99 } : {}}
                className="flex items-center justify-center w-full px-4 py-3.5 border border-[var(--border-primary)] rounded-xl bg-[var(--text-primary)]/[0.02] text-base font-bold text-[var(--text-primary)] hover:bg-[var(--text-primary)]/[0.05] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
                {socialLoading === 'google' ? (
                    <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                )}
                Continue with Google
            </motion.button>

            {/* Sign Up Link */}
            <p className="text-center text-[15px] text-[var(--text-muted)]">
                Don't have an account?{' '}
                <Link href="/register" className="font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-focus)] hover:underline focus:outline-none transition-all">
                    Sign Up
                </Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={null}>
            <LoginForm />
        </Suspense>
    );
}
