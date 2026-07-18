import { Check } from 'lucide-react';

export const PasswordStrengthMeter = ({ password }: { password: string }) => {
    const checks = [
        { re: /.{8,}/, label: 'Minimum 8 characters' },
        { re: /[A-Z]/, label: 'Uppercase letter' },
        { re: /[a-z]/, label: 'Lowercase letter' },
        { re: /[0-9]/, label: 'Number' },
        { re: /[^A-Za-z0-9]/, label: 'Special character' },
    ];
    const passed = checks.filter((c) => c.re.test(password)).length;

    const barColor =
        passed <= 1 ? 'bg-red-500' :
        passed === 2 ? 'bg-orange-500' :
        passed === 3 ? 'bg-amber-400' :
        passed === 4 ? 'bg-lime-400' : 'bg-[var(--color-primary)]';

    const label = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passed] || '';

    return (
        <div className="space-y-3 pt-1">
            {/* Bar */}
            <div className="flex gap-1 h-1.5" role="progressbar" aria-valuenow={passed} aria-valuemax={5} aria-label={`Password strength: ${label}`}>
                {[1, 2, 3, 4, 5].map((level) => (
                    <div key={level} className={`flex-1 rounded-full transition-all duration-300 ${passed >= level ? barColor : 'bg-[var(--border-primary)]'}`} />
                ))}
            </div>
            {password && (
                <p className={`text-xs font-semibold text-right transition-colors ${barColor.replace('bg-', 'text-')}`} aria-live="polite">{label}</p>
            )}
            {/* Checklist */}
            <ul className="grid grid-cols-2 gap-1.5">
                {checks.map((c) => {
                    const ok = c.re.test(password);
                    return (
                        <li key={c.label} className={`flex items-center gap-1.5 text-[11px] font-medium transition-colors ${ok ? 'text-[var(--color-primary)]' : 'text-[var(--text-muted)]'}`}>
                            <Check size={11} className={ok ? 'opacity-100' : 'opacity-30'} aria-hidden="true" />
                            {c.label}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
