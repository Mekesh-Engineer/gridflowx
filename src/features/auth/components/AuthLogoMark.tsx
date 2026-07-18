import React from 'react';

interface AuthLogoMarkProps {
    /** Icon size in Tailwind (e.g. 'text-[36px]'). Defaults to 36px. */
    iconSize?: string;
    /** Container size in Tailwind (e.g. 'w-18 h-18'). Defaults to w-18 h-18. */
    containerSize?: string;
    className?: string;
}

/**
 * Centered GridFlowX logo mark used at the top of every auth right panel.
 * Includes a glow ring behind the icon.
 */
export function AuthLogoMark({
    iconSize = 'text-[36px]',
    containerSize = 'w-18 h-18',
    className,
}: AuthLogoMarkProps) {
    return (
        <div className={`flex justify-center mb-2 ${className ?? ''}`}>
            <div className="relative">
                {/* Glow ring */}
                <div className="absolute -inset-3 bg-[var(--color-primary)]/10 rounded-2xl blur-xl" />
                {/* Icon container */}
                <div
                    className={`relative ${containerSize} rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-focus)] flex items-center justify-center shadow-xl shadow-[var(--color-primary)]/20`}
                >
                    <span
                        className={`material-symbols-outlined ${iconSize} text-[var(--text-inverse)] font-semibold material-symbols-filled`}
                    >
                        energy_savings_leaf
                    </span>
                </div>
            </div>
        </div>
    );
}
