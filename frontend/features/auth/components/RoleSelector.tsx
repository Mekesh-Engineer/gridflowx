import { Eye, Terminal } from 'lucide-react';
import React from 'react';
import { SignupRole } from '../types/registration.types';

interface RoleSelectorProps {
  value: SignupRole;
  onChange: (role: SignupRole) => void;
  disabled?: boolean;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ value, onChange, disabled }) => {
  const roles: { id: SignupRole; label: string; desc: string; icon: any }[] = [
    {
      id: 'operator',
      label: 'Operator',
      desc: 'Control active system nodes',
      icon: Terminal,
    },
    {
      id: 'supervisor',
      label: 'Supervisor',
      desc: 'Oversee and override configurations',
      icon: Eye,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      {roles.map((role) => {
        const Icon = role.icon;
        const isSelected = value === role.id;
        return (
          <button
            key={role.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(role.id)}
            className={`flex items-start text-left gap-3 p-3 rounded-xl border transition-all duration-300 ${isSelected
              ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)]/10 text-[var(--text-primary)]'
              : 'bg-[var(--text-primary)]/5 border-[var(--border-primary)] text-[var(--text-muted)] hover:bg-[var(--text-primary)]/10 hover:border-[var(--text-primary)]/10'
              } disabled:opacity-50 disabled:pointer-events-none`}
          >
            <div className={`p-2 rounded-lg border ${isSelected ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/20 text-[var(--color-primary)]' : 'bg-[var(--text-primary)]/5 border-[var(--border-primary)] text-[var(--text-muted)]'
              }`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="text-xs font-bold font-mono tracking-wide text-[var(--text-primary)]">{role.label}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5 leading-normal">{role.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default RoleSelector;
