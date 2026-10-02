'use client';

import { AuthErrorAlert } from '@/features/auth/components/AuthErrorAlert';
import { AuthLogoMark } from '@/features/auth/components/AuthLogoMark';
import { PasswordStrengthMeter } from '@/features/auth/components/PasswordStrengthMeter';
import { registerWithEmail } from '@/features/auth/services/auth.service';
import { UserRole } from '@/lib/constants';
import { logger } from '@/lib/logger';
import { ROLE_DASHBOARDS } from '@/config/routes.config';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore, type AuthUser } from '@/store/auth.store';
import { zodResolver } from '@hookform/resolvers/zod';
import confetti from 'canvas-confetti';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    ArrowRight,
    Calendar,
    Check,
    CheckCircle2,
    ChevronDown,
    Eye,
    EyeOff,
    Loader2,
    Lock,
    Mail,
    MapPin,
    RefreshCw,
    Shield,
    User,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

// =============================================================================
// ZOD SCHEMAS (inline — canonical schemas also live in features/auth/schemas/)
// =============================================================================

const step1Schema = z.object({
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
});

const step2Schema = z.object({
    gender: z.enum(['male', 'female', 'non-binary', 'prefer-not-to-say'] as const, {
        errorMap: () => ({ message: 'Please select your gender' }),
    }),
    dob: z.string().refine(
        (val) => {
            const date = new Date(val);
            if (isNaN(date.getTime())) return false;
            const today = new Date();
            if (date >= today) return false;
            let age = today.getFullYear() - date.getFullYear();
            const m = today.getMonth() - date.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
            return age >= 13;
        },
        'You must be at least 13 years old',
    ),
    country: z.string().min(2, 'Country is required'),
    city: z.string().min(2, 'City is required'),
    role: z.enum(['operator', 'supervisor', 'admin'] as const, {
        errorMap: () => ({ message: 'Please select a system role' }),
    }),
});

const step3Schema = z.object({
    password: z
        .string()
        .min(8, 'Minimum 8 characters required')
        .regex(/[A-Z]/, 'Must contain an uppercase letter')
        .regex(/[a-z]/, 'Must contain a lowercase letter')
        .regex(/[0-9]/, 'Must contain a number')
        .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((val) => val === true, {
        message: 'You must agree to the Terms of Service',
    }),
    notifications: z.boolean().optional(),
});

const registrationSchema = step1Schema
    .merge(step2Schema)
    .merge(step3Schema)
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords don't match",
        path: ['confirmPassword'],
    });

type RegistrationFormData = z.infer<typeof registrationSchema>;

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_STEPS = 4;

const STEPS = [
    { num: 1, label: 'Personal', icon: User },
    { num: 2, label: 'Profile', icon: MapPin },
    { num: 3, label: 'Security', icon: Shield },
    { num: 4, label: 'Verify', icon: CheckCircle2 },
];

// =============================================================================
// HELPERS
// =============================================================================

function toUserRole(role: string): UserRole {
    switch (role) {
        case 'admin': return UserRole.ADMIN;
        case 'supervisor': return UserRole.SUPERVISOR;
        case 'operator':
        default: return UserRole.OPERATOR;
    }
}

function fireConfetti() {
    const duration = 2800;
    const end = Date.now() + duration;
    const colors = ['#4ade80', '#34d399', '#22c55e', '#ffffff'];
    let frameId: number;
    (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.65 }, colors });
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.65 }, colors });
        if (Date.now() < end) frameId = requestAnimationFrame(frame);
    })();
    return () => cancelAnimationFrame(frameId);
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/** Reusable labelled input */
const Field = ({
    label,
    error,
    icon: Icon,
    children,
}: {
    label: string;
    error?: string;
    icon?: React.ElementType;
    children: React.ReactNode;
}) => (
    <div className="space-y-1.5">
        <label className="block text-[15px] font-semibold text-[var(--text-primary)]">{label}</label>
        <div className="relative group">
            {Icon && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--color-primary)] transition-colors pointer-events-none z-10">
                    <Icon size={20} aria-hidden="true" />
                </div>
            )}
            {children}
        </div>
        {error && (
            <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1 text-xs text-red-500 font-medium"
                role="alert"
                aria-live="assertive"
            >
                <AlertCircle size={11} aria-hidden="true" /> {error}
            </motion.p>
        )}
    </div>
);

const inputCls = (hasIcon: boolean, hasError: boolean) =>
    `w-full ${hasIcon ? 'pl-12' : 'pl-4'} pr-4 py-3.5 rounded-xl border text-base font-medium outline-none transition-all
     bg-[var(--text-primary)]/[0.02] text-[var(--text-primary)] placeholder-[var(--text-muted)]
     focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]/50
     disabled:opacity-50
     ${hasError ? 'border-red-500/50' : 'border-[var(--border-primary)] hover:border-[var(--border-primary)]/80'}`;

// =============================================================================
// INNER COMPONENT (needs useSearchParams — wrapped in Suspense below)
// =============================================================================

function RegisterForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setUser = useAuthStore((s) => s.setUser);

    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [registrationComplete, setRegistrationComplete] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [registeredRole, setRegisteredRole] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [cachedUser, setCachedUser] = useState<AuthUser | null>(null);

    const {
        register,
        handleSubmit,
        control,
        trigger,
        setValue,
        formState: { errors },
    } = useForm<RegistrationFormData>({
        resolver: zodResolver(registrationSchema),
        mode: 'onChange',
        defaultValues: {
            firstName: '', lastName: '', email: '',
            gender: undefined, dob: '', country: '', city: '', role: undefined,
            password: '', confirmPassword: '', terms: false, notifications: false,
        },
    });

    // Pre-fill email / role from query params
    useEffect(() => {
        const roleParam = searchParams.get('role');
        if (roleParam === 'operator' || roleParam === 'supervisor' || roleParam === 'admin') {
            setValue('role', roleParam as 'operator' | 'supervisor' | 'admin');
        }
    }, [searchParams, setValue]);

    const passwordValue = useWatch({ control, name: 'password' });

    // -------------------------------------------------------------------------
    // Step navigation
    // -------------------------------------------------------------------------
    const goNext = useCallback(async () => {
        setFormError(null);
        let valid = false;
        if (step === 1) valid = await trigger(['firstName', 'lastName', 'email']);
        if (step === 2) valid = await trigger(['gender', 'dob', 'country', 'city', 'role']);
        if (step === 3) valid = await trigger(['password', 'confirmPassword', 'terms']);
        if (valid) { setDirection(1); setStep((s) => Math.min(s + 1, MAX_STEPS)); }
    }, [step, trigger]);

    const goPrev = useCallback(() => {
        setFormError(null);
        setDirection(-1);
        setStep((s) => Math.max(s - 1, 1));
    }, []);

    const goToStep = useCallback((target: number) => {
        if (target < step) { setFormError(null); setDirection(-1); setStep(target); }
    }, [step]);

    // -------------------------------------------------------------------------
    // Submit
    // -------------------------------------------------------------------------
    const onSubmit = useCallback(async (data: RegistrationFormData) => {
        setIsLoading(true);
        setFormError(null);
        try {
            const displayName = `${data.firstName.trim()} ${data.lastName.trim()}`;
            const userRole = toUserRole(data.role);

            const supabaseUser = await registerWithEmail({
                email: data.email.trim(),
                password: data.password,
                displayName,
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                role: userRole,
                dob: data.dob || undefined,
                gender: data.gender || undefined,
                country: data.country || undefined,
                city: data.city || undefined,
                terms: data.terms,
                consents: { terms: data.terms, marketing: data.notifications ?? false, whatsapp: false, liveLocation: false },
            });

            logger.log('✅ Registration successful: ' + supabaseUser.id);

            const authUser: AuthUser = {
                uid: supabaseUser.id,
                email: data.email.trim(),
                displayName,
                firstName: data.firstName.trim(),
                lastName: data.lastName.trim(),
                photoURL: null,
                phoneNumber: null,
                role: userRole,
                emailVerified: false,
                dob: data.dob || null,
                gender: data.gender || null,
                consents: { terms: data.terms, marketing: data.notifications ?? false, whatsapp: false, liveLocation: false },
            };

            setCachedUser(authUser);
            setRegisteredEmail(data.email.trim());
            setRegisteredRole(data.role);
            setRegistrationComplete(true);
            setDirection(1);
            setStep(4);
            fireConfetti();
        } catch (error: unknown) {
            const err = error as { code?: string; message?: string };
            logger.error('❌ Registration failed: ' + (err.message || ''));
            setFormError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleResend = useCallback(async () => {
        if (!registeredEmail) return;
        setResendLoading(true);
        setResendSuccess(false);
        try {
            await supabase.auth.resend({
                type: 'signup',
                email: registeredEmail,
                options: {
                    emailRedirectTo: `${window.location.origin}/login?verified=true`,
                },
            });
            setResendSuccess(true);
        } catch (err) {
            logger.error('Failed to resend verification email');
        } finally {
            setResendLoading(false);
        }
    }, [registeredEmail]);

    const goToDashboard = useCallback(() => {
        if (cachedUser) setUser(cachedUser);
        const userRole = toUserRole(registeredRole);
        router.push(ROLE_DASHBOARDS[userRole] || '/dashboard');
    }, [registeredRole, cachedUser, setUser, router]);

    // Framer Motion slide variants
    const slideVariants = {
        enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
    };

    const isDisabled = isLoading || registrationComplete;

    return (
        <div className="flex flex-col gap-6 relative">




                    {/* Logo Mark */}
                    <AuthLogoMark iconSize="text-[32px]" containerSize="w-16 h-16" />

                    {/* Header */}
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
                            Create <span className="text-[var(--color-primary)]">Account</span>
                        </h1>
                        <p className="text-[var(--text-muted)] text-base leading-relaxed">
                            Create your GridFlowX workspace and start managing<br className="hidden sm:inline" /> intelligent energy systems.
                        </p>
                    </div>

                    {/* ── STEP PROGRESS INDICATOR ── */}
                    {!registrationComplete && (
                        <div className="space-y-3" aria-label={`Step ${step} of ${MAX_STEPS}`}>
                            {/* Step dots */}
                            <ol className="flex items-center gap-0">
                                {STEPS.map(({ num, label }, idx) => {
                                    const done = step > num || registrationComplete;
                                    const active = step === num;
                                    return (
                                        <React.Fragment key={num}>
                                            <li className="flex flex-col items-center gap-1 flex-shrink-0">
                                                {done ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => goToStep(num)}
                                                        className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-[var(--text-inverse)] flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[var(--color-primary)]/50 transition-all focus:outline-none"
                                                        aria-label={`Go back to step ${num}: ${label}`}
                                                    >
                                                        <Check size={14} aria-hidden="true" />
                                                    </button>
                                                ) : (
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${active ? 'bg-[var(--color-primary)] text-[var(--text-inverse)] shadow-md shadow-[var(--color-primary)]/30' : 'bg-[var(--border-primary)] text-[var(--text-muted)]'}`} aria-current={active ? 'step' : undefined}>
                                                        {num}
                                                    </div>
                                                )}
                                                <span className={`text-[10px] font-semibold hidden sm:block transition-colors ${active ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'}`}>{label}</span>
                                            </li>
                                            {idx < STEPS.length - 1 && (
                                                <div className={`flex-1 h-0.5 mx-1 rounded-full transition-all duration-500 ${step > num ? 'bg-[var(--color-primary)]' : 'bg-[var(--border-primary)]'}`} />
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </ol>
                            {/* Progress bar */}
                            <div className="h-1 rounded-full bg-[var(--border-primary)] overflow-hidden">
                                <motion.div
                                    className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-cyan-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${((step - 1) / (MAX_STEPS - 1)) * 100}%` }}
                                    transition={{ duration: 0.5, ease: 'circOut' }}
                                />
                            </div>
                        </div>
                    )}

                    {/* ── GLOBAL ERROR ── */}
                    <AuthErrorAlert message={formError} />

                    {/* ═══════════════════════════════════════════
                        STEP 4 — VERIFICATION SUCCESS SCREEN
                    ═══════════════════════════════════════════ */}
                    {registrationComplete ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="flex flex-col items-center text-center space-y-5 py-4"
                            role="status" aria-live="polite"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                                className="w-20 h-20 rounded-full bg-[var(--color-primary)]/15 border-2 border-[var(--color-primary)]/30 flex items-center justify-center text-[var(--color-primary)]"
                            >
                                <CheckCircle2 size={44} />
                            </motion.div>

                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-[var(--text-primary)]">Account Created!</h2>
                                <p className="text-[var(--text-muted)] text-sm max-w-xs leading-relaxed">
                                    Your{' '}
                                    <span className="font-semibold capitalize text-[var(--color-primary)]">{registeredRole}</span>
                                    {' '}account is ready. A verification email has been sent to{' '}
                                    <span className="font-semibold text-[var(--text-primary)]">{registeredEmail}</span>.
                                </p>
                            </div>

                            {/* Verification card */}
                            <div className="w-full rounded-2xl border border-[var(--border-primary)]/60 bg-[var(--text-primary)]/[0.02] p-4 flex gap-3 text-left">
                                <Mail size={18} className="shrink-0 mt-0.5 text-[var(--color-primary)]" aria-hidden="true" />
                                <div className="space-y-2 flex-1">
                                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                                        Check your inbox and click the verification link to activate your account. You can still access the dashboard now.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={resendLoading || resendSuccess}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none"
                                        aria-label="Resend verification email"
                                    >
                                        {resendLoading ? <><Loader2 size={11} className="animate-spin" /> Sending...</> :
                                         resendSuccess ? <><CheckCircle2 size={11} /> Email sent!</> :
                                         <><RefreshCw size={11} /> Resend verification email</>}
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 w-full">
                                <motion.button
                                    type="button"
                                    onClick={goToDashboard}
                                    whileHover={{ scale: 1.01, y: -1 }}
                                    whileTap={{ scale: 0.99 }}
                                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-focus)] text-[var(--text-inverse)] shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all cursor-pointer"
                                >
                                    Go to Dashboard
                                    <ArrowRight size={16} aria-hidden="true" />
                                </motion.button>
                                <Link href="/login" className="text-center text-sm text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors">
                                    Sign in instead
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        /* ═══════════════════════════════════════════
                            STEP 1–3 — FORM WIZARD
                        ═══════════════════════════════════════════ */
                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={step}
                                    custom={direction}
                                    variants={slideVariants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                    className="space-y-5"
                                >
                                    {/* ──────────────────────────────────────
                                        STEP 1: PERSONAL INFORMATION
                                    ────────────────────────────────────── */}
                                    {step === 1 && (
                                        <div className="space-y-5">
                                            <div>
                                                <h2 className="text-lg font-bold text-[var(--text-primary)]">Personal Information</h2>
                                                <p className="text-[var(--text-muted)] text-sm mt-0.5">Tell us your name and email address.</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <Field label="First Name" error={errors.firstName?.message} icon={User}>
                                                    <input
                                                        {...register('firstName')}
                                                        id="reg-firstName"
                                                        placeholder="John"
                                                        autoFocus
                                                        aria-required="true"
                                                        className={inputCls(true, !!errors.firstName)}
                                                    />
                                                </Field>
                                                <Field label="Last Name" error={errors.lastName?.message} icon={User}>
                                                    <input
                                                        {...register('lastName')}
                                                        id="reg-lastName"
                                                        placeholder="Doe"
                                                        aria-required="true"
                                                        className={inputCls(true, !!errors.lastName)}
                                                    />
                                                </Field>
                                            </div>

                                            <Field label="Email Address" error={errors.email?.message} icon={Mail}>
                                                <input
                                                    {...register('email')}
                                                    id="reg-email"
                                                    type="email"
                                                    placeholder="john@example.com"
                                                    autoComplete="email"
                                                    aria-required="true"
                                                    className={inputCls(true, !!errors.email)}
                                                />
                                            </Field>
                                        </div>
                                    )}

                                    {/* ──────────────────────────────────────
                                        STEP 2: PROFILE
                                    ────────────────────────────────────── */}
                                    {step === 2 && (
                                        <div className="space-y-5">
                                            <div>
                                                <h2 className="text-lg font-bold text-[var(--text-primary)]">Profile &amp; Role</h2>
                                                <p className="text-[var(--text-muted)] text-sm mt-0.5">Complete your profile and assign your system role.</p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Gender */}
                                                <Field label="Gender" error={errors.gender?.message}>
                                                    <div className="relative">
                                                        <select
                                                            {...register('gender')}
                                                            id="reg-gender"
                                                            aria-required="true"
                                                            className={`${inputCls(false, !!errors.gender)} appearance-none`}
                                                        >
                                                            <option value="">Select gender</option>
                                                            <option value="male">Male</option>
                                                            <option value="female">Female</option>
                                                            <option value="non-binary">Non-binary</option>
                                                            <option value="prefer-not-to-say">Prefer not to say</option>
                                                        </select>
                                                        <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" aria-hidden="true" />
                                                    </div>
                                                </Field>

                                                {/* DOB */}
                                                <Field label="Date of Birth" error={errors.dob?.message} icon={Calendar}>
                                                    <input
                                                        {...register('dob')}
                                                        id="reg-dob"
                                                        type="date"
                                                        aria-required="true"
                                                        className={inputCls(false, !!errors.dob)}
                                                    />
                                                </Field>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {/* Country */}
                                                <Field label="Country" error={errors.country?.message} icon={MapPin}>
                                                    <input
                                                        {...register('country')}
                                                        id="reg-country"
                                                        placeholder="United States"
                                                        aria-required="true"
                                                        className={inputCls(true, !!errors.country)}
                                                    />
                                                </Field>
                                                {/* City */}
                                                <Field label="City" error={errors.city?.message} icon={MapPin}>
                                                    <input
                                                        {...register('city')}
                                                        id="reg-city"
                                                        placeholder="New York"
                                                        aria-required="true"
                                                        className={inputCls(true, !!errors.city)}
                                                    />
                                                </Field>
                                            </div>

                                            {/* System Role */}
                                            <Field label="System Role" error={errors.role?.message}>
                                                <div className="relative">
                                                    <select
                                                        {...register('role')}
                                                        id="reg-role"
                                                        aria-required="true"
                                                        className={`${inputCls(false, !!errors.role)} appearance-none`}
                                                    >
                                                        <option value="">Select your role</option>
                                                        <option value="operator">Operator</option>
                                                        <option value="supervisor">Supervisor</option>
                                                        <option value="admin">Administrator</option>
                                                    </select>
                                                    <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]" aria-hidden="true" />
                                                </div>
                                            </Field>
                                        </div>
                                    )}

                                    {/* ──────────────────────────────────────
                                        STEP 3: SECURITY
                                    ────────────────────────────────────── */}
                                    {step === 3 && (
                                        <div className="space-y-5">
                                            <div>
                                                <h2 className="text-lg font-bold text-[var(--text-primary)]">Security</h2>
                                                <p className="text-[var(--text-muted)] text-sm mt-0.5">Set a strong password to protect your account.</p>
                                            </div>

                                            {/* Password */}
                                            <Field label="Password" error={errors.password?.message} icon={Lock}>
                                                <input
                                                    {...register('password')}
                                                    id="reg-password"
                                                    type={showPass ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    aria-required="true"
                                                    className={`${inputCls(true, !!errors.password)} pr-11`}
                                                />
                                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer focus:outline-none" aria-label={showPass ? 'Hide password' : 'Show password'}>
                                                    {showPass ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                                                </button>
                                            </Field>

                                            <PasswordStrengthMeter password={passwordValue || ''} />

                                            {/* Confirm password */}
                                            <Field label="Confirm Password" error={errors.confirmPassword?.message} icon={Lock}>
                                                <input
                                                    {...register('confirmPassword')}
                                                    id="reg-confirmPassword"
                                                    type={showConfirm ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    autoComplete="new-password"
                                                    aria-required="true"
                                                    className={`${inputCls(true, !!errors.confirmPassword)} pr-11`}
                                                />
                                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--color-primary)] transition-colors cursor-pointer focus:outline-none" aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}>
                                                    {showConfirm ? <EyeOff size={17} aria-hidden="true" /> : <Eye size={17} aria-hidden="true" />}
                                                </button>
                                            </Field>

                                            {/* Terms */}
                                            <div className="space-y-3 pt-1">
                                                <div className="flex items-start gap-3">
                                                    <input {...register('terms')} id="reg-terms" type="checkbox" aria-required="true" className="mt-0.5 h-4 w-4 rounded border-[var(--border-primary)] accent-[var(--color-primary)] cursor-pointer focus:ring-0" />
                                                    <label htmlFor="reg-terms" className="text-sm text-[var(--text-muted)] leading-snug cursor-pointer select-none">
                                                        I agree to the{' '}
                                                        <Link href="/terms" className="font-semibold text-[var(--color-primary)] hover:underline" target="_blank" rel="noopener noreferrer">Terms of Service</Link>
                                                        {' '}and{' '}
                                                        <Link href="/privacy" className="font-semibold text-[var(--color-primary)] hover:underline" target="_blank" rel="noopener noreferrer">Privacy Policy</Link>.
                                                    </label>
                                                </div>
                                                {errors.terms && <p className="text-red-500 text-xs flex items-center gap-1 pl-7" role="alert"><AlertCircle size={11} /> {errors.terms.message}</p>}

                                                <div className="flex items-start gap-3">
                                                    <input {...register('notifications')} id="reg-notifications" type="checkbox" className="mt-0.5 h-4 w-4 rounded border-[var(--border-primary)] accent-[var(--color-primary)] cursor-pointer focus:ring-0" />
                                                    <label htmlFor="reg-notifications" className="text-sm text-[var(--text-muted)] leading-snug cursor-pointer select-none">
                                                        I agree to receive security notifications and system alerts.
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* ── NAV BUTTONS ── */}
                            <div className={`flex mt-6 gap-3 ${step > 1 ? 'justify-between' : 'justify-end'}`}>
                                {step > 1 && (
                                    <motion.button
                                        type="button"
                                        onClick={goPrev}
                                        disabled={isDisabled}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.99 }}
                                        className="flex items-center gap-2 px-6 py-3.5 rounded-xl text-base font-semibold border border-[var(--border-primary)] text-[var(--text-primary)] hover:bg-[var(--text-primary)]/5 transition-all cursor-pointer disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/40"
                                    >
                                        <ArrowLeft size={18} aria-hidden="true" /> Back
                                    </motion.button>
                                )}

                                {step < 3 ? (
                                    <motion.button
                                        type="button"
                                        onClick={goNext}
                                        disabled={isDisabled}
                                        whileHover={{ scale: 1.01, y: -1 }}
                                        whileTap={{ scale: 0.99 }}
                                        className="flex-1 flex justify-center items-center gap-2 py-3.5 px-5 rounded-xl text-base font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-focus)] text-[var(--text-inverse)] shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        Continue <ArrowRight size={18} aria-hidden="true" />
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        type="submit"
                                        disabled={isDisabled}
                                        aria-busy={isLoading}
                                        whileHover={!isDisabled ? { scale: 1.01, y: -1 } : {}}
                                        whileTap={!isDisabled ? { scale: 0.99 } : {}}
                                        className="flex-1 flex justify-center items-center gap-2 py-3.5 px-5 rounded-xl text-base font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-focus)] text-[var(--text-inverse)] shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="size-5 animate-spin" aria-hidden="true" /> Creating Account...</>
                                        ) : (
                                            <><Activity className="size-5" aria-hidden="true" /> Create Account</>
                                        )}
                                    </motion.button>
                                )}
                            </div>
                        </form>
                    )}

                    {/* ── Sign-in link ── */}
                    {!registrationComplete && (
                        <p className="text-center text-[15px] text-[var(--text-muted)] pb-2">
                            Already have an account?{' '}
                            <Link href="/login" className="font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-focus)] hover:underline transition-all focus:outline-none">
                                Sign In
                            </Link>
                        </p>
                    )}
        </div>
    );
}


// =============================================================================
// PAGE EXPORT — wraps RegisterForm in Suspense for useSearchParams
// =============================================================================

export default function RegisterPage() {
    return (
        <Suspense fallback={null}>
            <RegisterForm />
        </Suspense>
    );
}
