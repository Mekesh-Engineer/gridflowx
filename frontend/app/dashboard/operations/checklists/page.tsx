'use client';

import React, { useState } from 'react';
import { ClipboardList, CheckSquare, Square, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Verify DC Bus voltage reading (12.0V - 12.5V)', done: true },
  { id: 2, title: 'Inspect battery terminal connections for corrosion', done: true },
  { id: 3, title: 'Verify ACS712 zero-point offset calibration', done: false },
  { id: 4, title: 'Test Emergency Relay Tripping Circuit', done: false },
];

export default function ChecklistsPage() {
  const [items, setItems] = useState(STEPS);

  const toggle = (id: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  };

  const completedCount = items.filter(i => i.done).length;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div>
        <h1 className="text-xl font-bold tracking-tight">SOP Maintenance Checklists</h1>
        <p className="text-xs text-[var(--text-muted)]">Digital Standard Operating Procedure checklists for field technicians</p>
      </div>

      <div className="p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-[var(--color-primary)]" /> Pre-Commissioning Checklist
          </h2>
          <span className="text-xs text-emerald-400 font-bold">{completedCount} / {items.length} Completed</span>
        </div>

        <div className="space-y-2">
          {items.map(step => (
            <div
              key={step.id}
              onClick={() => toggle(step.id)}
              className="flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-base)] border border-[var(--border-primary)]/30 cursor-pointer hover:border-[var(--color-primary)]/40 transition-all"
            >
              {step.done ? <CheckSquare className="w-4 h-4 text-emerald-400" /> : <Square className="w-4 h-4 text-[var(--text-muted)]" />}
              <span className={`text-xs font-medium ${step.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        {completedCount === items.length && (
          <button onClick={() => toast.success('Checklist submitted to audit ledger')} className="w-full py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold hover:opacity-90 transition-opacity">
            Submit Signed Checklist
          </button>
        )}
      </div>
    </div>
  );
}
