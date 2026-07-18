'use client';

import { AuthErrorAlert } from '@/features/auth/components/AuthErrorAlert';
import { AuthFormInput } from '@/features/auth/components/AuthFormInput';
import { AuthLogoMark } from '@/features/auth/components/AuthLogoMark';
import { useForgotPassword } from '@/features/auth/hooks/useForgotPassword';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    Mail,
    RefreshCw,
    Shield,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function ForgotPasswordPage() {
    const fp = useForgotPassword();

    return (
        <div className="flex flex-col space-y-6">

            {/* Logo */}
            <AuthLogoMark />

            {/* Heading */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                    Forgot <span className="text-[var(--color-primary)]">Password?</span>
                </h1>
                <p className="text-[var(--text-muted)] text-base leading-relaxed">
                    No worries — enter your email and we'll send
                    <br className="hidden sm:inline" /> you a secure reset link instantly.
                </p>
            </div>

            {/* ── SUCCESS STATE ─────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {fp.isSuccess ? (
                    <motion.div
                        key="success-panel"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="space-y-6"
                    >
                        {/* Success card */}
                        <div className="rounded-2xl border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/[0.05] px-6 py-6 flex flex-col items-center gap-4 text-center">
                            <motion.div
                                initial={{ scale: 0, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                                className="w-16 h-16 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/10"
                            >
                                <CheckCircle2 className="text-[var(--color-primary)]" size={34} />
                            </motion.div>
                            <div className="space-y-1">
                                <p className="text-[var(--text-primary)] font-bold text-[17px]">Reset link sent!</p>
                                <p className="text-[var(--text-muted)] text-[14px] leading-relaxed">
                                    We sent a reset link to{' '}
                                    <span className="font-semibold text-[var(--color-primary)]">{fp.email}</span>.
                                    <br />Check your inbox (and spam folder).
                                </p>
                            </div>
                            <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
                                className="p-3 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20"
                            >
                                <Mail className="text-[var(--color-primary)]" size={22} />
                            </motion.div>
                        </div>

                        {/* Steps guide */}
                        <div className="rounded-xl border border-[var(--border-primary)]/40 bg-[var(--text-primary)]/[0.02] px-5 py-4 space-y-3">
                            <p className="text-[13px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Next Steps</p>
                            {[
                                { step: '1', text: 'Open the reset email from GridFlowX' },
                                { step: '2', text: 'Click the secure reset link (valid 1 hour)' },
                                { step: '3', text: 'Choose a strong new password' },
                                { step: '4', text: 'Sign in to your microgrid dashboard' },
                            ].map(({ step, text }) => (
                                <div key={step} className="flex items-center gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 flex items-center justify-center shrink-0">
                                        <span className="text-[11px] font-bold text-[var(--color-primary)]">{step}</span>
                                    </div>
                                    <p className="text-[14px] text-[var(--text-muted)]">{text}</p>
                                </div>
                            ))}
                        </div>

                        {/* Error during resend */}
                        <AuthErrorAlert message={fp.error} show={fp.status === 'error'} />

                        {/* Resend button */}
                        <motion.button
                            type="button"
                            onClick={fp.resend}
                            disabled={fp.cooldown > 0 || fp.isLoading}
                            whileHover={fp.cooldown === 0 && !fp.isLoading ? { scale: 1.01, y: -1 } : {}}
                            whileTap={fp.cooldown === 0 && !fp.isLoading ? { scale: 0.99 } : {}}
                            className="w-full flex justify-center items-center gap-2.5 py-3.5 px-4 rounded-xl text-base font-bold border border-[var(--color-primary)]/40 text-[var(--color-primary)] bg-[var(--color-primary)]/[0.06] hover:bg-[var(--color-primary)]/[0.1] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                        >
                            {fp.isLoading ? (
                                <><Loader2 className="size-5 animate-spin" />Resending…</>
                            ) : fp.cooldown > 0 ? (
                                <><Activity className="size-5 opacity-60" />Resend in {fp.cooldown}s</>
                            ) : (
                                <><RefreshCw size={18} />Resend Reset Email</>
                            )}
                        </motion.button>

                        {/* Back to login */}
                        <Link href="/login" className="flex items-center justify-center gap-2 text-[15px] font-semibold text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">
                            <ArrowLeft size={16} />Back to Sign In
                        </Link>
                    </motion.div>

                ) : (

                    /* ── FORM STATE ──────────────────────────────────────────── */
                    <motion.div
                        key="form-panel"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* General API error (not inline field error) */}
                        <AuthErrorAlert message={fp.error} show={fp.status === 'error' && !fp.emailError} />

                        <form
                            className="space-y-6"
                            onSubmit={(e) => { e.preventDefault(); fp.submit(); }}
                            noValidate
                        >
                            <AuthFormInput
                                id="forgot-email"
                                label="Email Address"
                                type="email"
                                icon={Mail}
                                value={fp.email}
                                error={fp.emailError ?? undefined}
                                touched={!!fp.emailError}
                                placeholder="name@example.com"
                                autoComplete="email"
                                required
                                disabled={fp.isLoading}
                                onChange={(e) => fp.setEmail(e.target.value)}
                                onBlur={fp.touchEmail}
                            />

                            {/* Security tip */}
                            <div className="flex items-start gap-2.5 rounded-xl border border-[var(--border-primary)]/30 bg-[var(--text-primary)]/[0.02] px-4 py-3">
                                <Shield size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" aria-hidden="true" />
                                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
                                    For security, reset links expire after{' '}
                                    <strong className="text-[var(--text-primary)]">1 hour</strong> and can only be used once.
                                </p>
                            </div>

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={fp.isLoading}
                                aria-busy={fp.isLoading}
                                whileHover={!fp.isLoading ? { scale: 1.01, y: -1 } : {}}
                                whileTap={!fp.isLoading ? { scale: 0.99 } : {}}
                                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-base font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-focus)] text-[var(--text-inverse)] shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-base)] focus:ring-[var(--color-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    {fp.isLoading ? (
                                        <><Loader2 className="size-5 animate-spin" aria-hidden="true" />Sending reset link…</>
                                    ) : (
                                        <><Mail size={18} aria-hidden="true" />Send Reset Link</>
                                    )}
                                </span>
                            </motion.button>
                        </form>

                        {/* Divider */}
                        <div className="relative" aria-hidden="true">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-[var(--border-primary)]/60" />
                            </div>
                            <div className="relative flex justify-center text-[13px]">
                                <span className="px-4 bg-[var(--bg-surface)] text-[var(--text-muted)] font-medium">
                                    Remember your password?
                                </span>
                            </div>
                        </div>

                        {/* Back to login */}
                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl border border-[var(--border-primary)] text-base font-bold text-[var(--text-primary)] bg-[var(--text-primary)]/[0.02] hover:bg-[var(--text-primary)]/[0.05] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40 transition-all"
                            aria-label="Back to login page"
                        >
                            <ArrowLeft size={18} aria-hidden="true" /> Back to Sign In
                        </Link>

                        <p className="text-center text-[15px] text-[var(--text-muted)]">
                            Don't have an account?{' '}
                            <Link href="/register" className="font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-focus)] hover:underline focus:outline-none transition-all">
                                Sign Up
                            </Link>
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
