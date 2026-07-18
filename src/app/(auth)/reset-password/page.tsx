'use client';

import { AuthErrorAlert } from '@/features/auth/components/AuthErrorAlert';
import { AuthFormInput } from '@/features/auth/components/AuthFormInput';
import { AuthLogoMark } from '@/features/auth/components/AuthLogoMark';
import { useResetPassword } from '@/features/auth/hooks/useResetPassword';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft,
    CheckCircle2,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Shield,
} from 'lucide-react';
import Link from 'next/link';
import React, { Suspense } from 'react';

// useResetPassword uses useSearchParams which requires Suspense
function ResetPasswordForm() {
    const rp = useResetPassword();

    // Invalid / expired link
    if (rp.codeError) {
        return (
            <div className="flex flex-col items-center text-center space-y-6 py-8">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                    <Lock size={28} className="text-red-500" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-xl font-bold text-[var(--text-primary)]">Invalid Reset Link</h2>
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed max-w-xs">{rp.codeError}</p>
                </div>
                <Link
                    href="/forgot-password"
                    className="flex items-center gap-2 py-3 px-6 rounded-xl text-sm font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-focus)] text-[var(--text-inverse)] shadow-lg transition-all"
                >
                    Request New Link
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col space-y-6">

            {/* Logo */}
            <AuthLogoMark />

            {/* Heading */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                    Reset <span className="text-[var(--color-primary)]">Password</span>
                </h1>
                <p className="text-[var(--text-muted)] text-base leading-relaxed">
                    Choose a strong new password to secure
                    <br className="hidden sm:inline" /> your GridFlowX account.
                </p>
            </div>

            {/* ── SUCCESS STATE ─────────────────────────────────────────────── */}
            <AnimatePresence mode="wait">
                {rp.isSuccess ? (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="space-y-6"
                    >
                        <div className="rounded-2xl border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/[0.05] px-6 py-8 flex flex-col items-center gap-5 text-center">
                            <motion.div
                                initial={{ scale: 0, rotate: -30 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                                className="w-16 h-16 rounded-full bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/30 flex items-center justify-center shadow-lg shadow-[var(--color-primary)]/10"
                            >
                                <CheckCircle2 className="text-[var(--color-primary)]" size={34} />
                            </motion.div>
                            <div className="space-y-1">
                                <p className="text-[var(--text-primary)] font-bold text-[17px]">Password updated!</p>
                                <p className="text-[var(--text-muted)] text-[14px] leading-relaxed">
                                    Your password has been reset successfully.
                                    <br />You can now sign in with your new password.
                                </p>
                            </div>
                        </div>

                        <motion.div whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}>
                            <Link
                                href="/login"
                                className="flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl text-base font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-focus)] text-[var(--text-inverse)] shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30 transition-all"
                            >
                                <Lock size={18} aria-hidden="true" /> Sign In Now
                            </Link>
                        </motion.div>
                    </motion.div>

                ) : (

                    /* ── FORM STATE ──────────────────────────────────────────── */
                    <motion.div
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <AuthErrorAlert message={rp.error} show={rp.status === 'error'} />

                        <form className="space-y-6" onSubmit={rp.submit} noValidate>

                            {/* New Password */}
                            <div className="space-y-0">
                                <AuthFormInput
                                    id="reset-password"
                                    label="New Password"
                                    type={rp.showPassword ? 'text' : 'password'}
                                    icon={Lock}
                                    value={rp.password}
                                    error={rp.passwordError ?? undefined}
                                    touched={!!rp.passwordError}
                                    placeholder="Min. 8 characters"
                                    autoComplete="new-password"
                                    required
                                    disabled={rp.isLoading}
                                    onChange={(e) => rp.setPassword(e.target.value)}
                                    onBlur={() => rp.touch('password')}
                                    rightSlot={
                                        <button
                                            type="button"
                                            onClick={rp.toggleShowPassword}
                                            aria-label={rp.showPassword ? 'Hide password' : 'Show password'}
                                            className="text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                                        >
                                            {rp.showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    }
                                />

                                {/* Password strength bar */}
                                {rp.password.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="space-y-1.5 pt-2"
                                    >
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= rp.strength.score ? rp.strength.color : 'bg-[var(--border-primary)]/40'}`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-[12px] text-[var(--text-muted)] font-medium">
                                            Password strength:{' '}
                                            <span className="font-bold text-[var(--text-primary)]">{rp.strength.label}</span>
                                        </p>
                                    </motion.div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <AuthFormInput
                                id="reset-confirm"
                                label="Confirm Password"
                                type={rp.showConfirm ? 'text' : 'password'}
                                icon={Lock}
                                value={rp.confirmPassword}
                                error={rp.confirmError ?? undefined}
                                touched={!!rp.confirmError}
                                placeholder="Re-enter your password"
                                autoComplete="new-password"
                                required
                                disabled={rp.isLoading}
                                onChange={(e) => rp.setConfirmPassword(e.target.value)}
                                onBlur={() => rp.touch('confirm')}
                                rightSlot={
                                    <button
                                        type="button"
                                        onClick={rp.toggleShowConfirm}
                                        aria-label={rp.showConfirm ? 'Hide confirm password' : 'Show confirm password'}
                                        className="text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                                    >
                                        {rp.showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                }
                            />

                            {/* Security tip */}
                            <div className="flex items-start gap-2.5 rounded-xl border border-[var(--border-primary)]/30 bg-[var(--text-primary)]/[0.02] px-4 py-3">
                                <Shield size={16} className="text-[var(--color-primary)] shrink-0 mt-0.5" />
                                <p className="text-[13px] text-[var(--text-muted)] leading-relaxed">
                                    Use at least <strong className="text-[var(--text-primary)]">8 characters</strong> with a mix of uppercase, numbers, and symbols for a stronger password.
                                </p>
                            </div>

                            {/* Submit */}
                            <motion.button
                                type="submit"
                                disabled={rp.isLoading}
                                aria-busy={rp.isLoading}
                                whileHover={!rp.isLoading ? { scale: 1.01, y: -1 } : {}}
                                whileTap={!rp.isLoading ? { scale: 0.99 } : {}}
                                className="w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-base font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-focus)] text-[var(--text-inverse)] shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--bg-base)] focus:ring-[var(--color-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <span className="flex items-center gap-2">
                                    {rp.isLoading ? (
                                        <><Loader2 className="size-5 animate-spin" aria-hidden="true" />Updating password…</>
                                    ) : (
                                        <><Lock size={18} aria-hidden="true" />Reset Password</>
                                    )}
                                </span>
                            </motion.button>
                        </form>

                        <Link
                            href="/login"
                            className="flex items-center justify-center gap-2 text-[15px] font-semibold text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors"
                        >
                            <ArrowLeft size={16} /> Back to Sign In
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-12">
                <Loader2 className="size-8 animate-spin text-[var(--color-primary)]" />
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
