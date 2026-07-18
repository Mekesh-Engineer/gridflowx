import { AlertCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

interface AuthErrorAlertProps {
    /** The error message to display. When null/undefined the alert is not shown. */
    message?: string | null;
    /** Optionally override visibility independent of message */
    show?: boolean;
}

/**
 * Animated error alert banner for auth forms.
 * Replaces the duplicated AnimatePresence/motion error div across all pages.
 */
export function AuthErrorAlert({ message, show }: AuthErrorAlertProps) {
    const visible = show !== undefined ? (show && !!message) : !!message;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-[15px] text-red-500"
                    role="alert"
                    aria-live="assertive"
                >
                    <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{message}</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
