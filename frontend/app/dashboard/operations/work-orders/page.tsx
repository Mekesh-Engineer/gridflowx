'use client';

import React, { useState } from 'react';
import { ClipboardList, Plus, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { PermissionGuard } from '@/components/providers/PermissionGuard';

const ORDERS = [
  { id: 'WO-204', title: 'Replace ACS712 Sensor Sector 2', assignee: 'Operator Jane', status: 'IN_PROGRESS', priority: 'HIGH', due: 'Today' },
  { id: 'WO-203', title: 'Inspect BESS Cell Thermal Padding', assignee: 'Technician Bob', status: 'TODO', priority: 'MEDIUM', due: 'Tomorrow' },
  { id: 'WO-202', title: 'Clean Solar PV Panel Array Node A', assignee: 'Operator John', status: 'COMPLETED', priority: 'LOW', due: 'Yesterday' },
];

export default function WorkOrdersPage() {
  const [items, setItems] = useState(ORDERS);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-[1800px] mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Work Order Center</h1>
          <p className="text-xs text-[var(--text-muted)]">Dispatch maintenance tickets, assign tasks and track resolution status</p>
        </div>
        <PermissionGuard resource="work-orders" action="create">
          <button onClick={() => toast.info('New work order modal triggered')} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4" /> Create Work Order
          </button>
        </PermissionGuard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {items.map(wo => (
          <div key={wo.id} className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-primary)]/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[var(--color-primary)]">{wo.id}</span>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                wo.priority === 'HIGH' ? 'bg-red-500/15 text-red-400 border-red-500/30' : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              }`}>
                {wo.priority}
              </span>
            </div>

            <h3 className="text-sm font-bold text-[var(--text-primary)]">{wo.title}</h3>

            <div className="pt-2 border-t border-[var(--border-primary)]/20 flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Assigned: <strong className="text-[var(--text-primary)]">{wo.assignee}</strong></span>
              <span>Due: {wo.due}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
