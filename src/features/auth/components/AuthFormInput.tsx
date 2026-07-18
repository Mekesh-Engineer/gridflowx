import { AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

interface AuthFormInputProps {
    id: string;
    label: string;
    type?: string;
    /** Lucide icon component or any React element type */
    icon: React.ElementType;
    value: string;
    /** Validation error message */
    error?: string | null;
    /** Whether the field has been touched/blurred */
    touched?: boolean;
    placeholder?: string;
    disabled?: boolean;
    autoComplete?: string;
    required?: boolean;
    /** Optional slot rendered on the right inside the input (e.g. show/hide password button) */
    rightSlot?: React.ReactNode;
    className?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
}

/**
 * Shared auth form input: label + left icon + input + right slot + animated error.
 * Replaces the ~22-line duplicated block used for every field across all auth pages.
 */
export function AuthFormInput({
    id,
    label,
    type = 'text',
    icon: Icon,
    value,
    error,
    touched,
    placeholder,
    disabled,
    autoComplete,
    required = false,
    rightSlot,
    className,
    onChange,
    onBlur,
}: AuthFormInputProps) {
    const hasError = !!(touched && error);
    const errorId = `${id}-error`;

    return (
        <div className={`space-y-2 ${className ?? ''}`}>
            <label className="block text-[15px] font-semibold text-[var(--text-primary)]" htmlFor={id}>
                {label}
            </label>
            <div className="relative">
                {/* Left icon */}
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--text-muted)]">
                    <Icon size={20} aria-hidden="true" />
                </div>
                <input
                    id={id}
                    name={id}
                    type={type}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete={autoComplete}
                    required={required}
                    aria-required={required}
                    aria-invalid={hasError}
                    aria-describedby={hasError ? errorId : undefined}
                    className={`w-full pl-12 ${rightSlot ? 'pr-12' : 'pr-4'} py-3.5 rounded-xl border bg-[var(--text-primary)]/[0.02] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]/50 transition-all text-base font-medium outline-none disabled:opacity-50 ${
                        hasError
                            ? 'border-red-500/50'
                            : 'border-[var(--border-primary)] hover:border-[var(--border-primary)]/80'
                    }`}
                />
                {/* Right slot (e.g. show/hide password toggle) */}
                {rightSlot && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                        {rightSlot}
                    </div>
                )}
            </div>
            {/* Animated inline error */}
            <AnimatePresence>
                {hasError && (
                    <motion.p
                        id={errorId}
                        className="mt-1.5 flex items-center gap-1 text-xs text-red-500 font-medium"
                        role="alert"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                    >
                        <AlertCircle className="size-3.5 shrink-0" aria-hidden="true" />
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
