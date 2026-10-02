'use client';

import React, { useState } from 'react';
import { AuthLogoMark } from '@/features/auth/components/AuthLogoMark';
import {
  Ticket,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface TicketItem {
  id: string;
  title: string;
  sector: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  priority: 'High' | 'Medium' | 'Low';
  createdAt: string;
}

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([
    {
      id: 'TICK-804',
      title: 'Sector 4 Substation Inverter Fan Speed Degraded',
      sector: 'Sector 4',
      status: 'Open',
      priority: 'High',
      createdAt: '2026-07-18',
    },
    {
      id: 'TICK-803',
      title: 'Battery Cell Balance Calibration Required',
      sector: 'Sector 2',
      status: 'In Progress',
      priority: 'Medium',
      createdAt: '2026-07-17',
    },
    {
      id: 'TICK-802',
      title: 'Feeder Breaker 02 Telemetry Packet Loss',
      sector: 'Sector 1',
      status: 'Resolved',
      priority: 'Low',
      createdAt: '2026-07-15',
    },
  ]);

  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSector, setNewSector] = useState('Sector 1');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTicket: TicketItem = {
      id: `TICK-${Math.floor(805 + Math.random() * 100)}`,
      title: newTitle,
      sector: newSector,
      status: 'Open',
      priority: newPriority,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setTickets([newTicket, ...tickets]);
    setNewTitle('');
    setShowModal(false);
    toast.success(`Support ticket ${newTicket.id} created and routed to engineering maintenance.`);
  };

  const filteredTickets = tickets.filter(
    (t) =>
      (statusFilter === 'All' || t.status === statusFilter) &&
      (t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-primary)]/40 pb-6 gap-4">
          <div className="flex items-center gap-4">
            <AuthLogoMark iconSize="text-[26px]" containerSize="w-12 h-12" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                My Maintenance & Support Tickets
              </h1>
              <p className="text-sm text-[var(--text-muted)]">
                Track anomaly reports, hardware service requests, and engineering resolutions across your sectors.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-focus)] text-[var(--text-inverse)] text-sm font-bold shadow-md hover:opacity-95 transition-all cursor-pointer"
            >
              <Plus size={16} /> Create New Ticket
            </button>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-surface)] text-sm font-semibold hover:border-[var(--color-primary)] transition-all"
            >
              <ArrowLeft size={16} /> Dashboard
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[var(--border-primary)]/50 bg-[var(--bg-surface)] p-4 shadow-sm">
          <div className="flex gap-2">
            {['All', 'Open', 'In Progress', 'Resolved'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[var(--color-primary)] text-[var(--text-inverse)] shadow-sm'
                    : 'bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-primary)]/40'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by ticket ID or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-[var(--bg-base)] border border-[var(--border-primary)]/60 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            >
            </input>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border-primary)]/60 bg-[var(--bg-surface)]/50 p-12 text-center text-[var(--text-muted)]">
              No tickets matching your filter criteria were found.
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="rounded-2xl border border-[var(--border-primary)]/50 bg-[var(--bg-surface)] p-5 md:p-6 transition-all hover:border-[var(--color-primary)]/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-extrabold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded">
                      {ticket.id}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider bg-[var(--bg-base)] text-[var(--text-primary)] border border-[var(--border-primary)]/60">
                      {ticket.sector}
                    </span>
                    <span
                      className={`text-xs font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                        ticket.priority === 'High'
                          ? 'bg-red-500/10 text-red-500 border border-red-500/20'
                          : ticket.priority === 'Medium'
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                      }`}
                    >
                      {ticket.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text-primary)]">{ticket.title}</h3>
                  <div className="text-xs text-[var(--text-muted)]">Submitted on {ticket.createdAt}</div>
                </div>

                <div className="flex items-center gap-3 self-start md:self-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                      ticket.status === 'Resolved'
                        ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                        : ticket.status === 'In Progress'
                        ? 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                        : 'bg-blue-500/15 text-blue-500 border border-blue-500/30'
                    }`}
                  >
                    {ticket.status === 'Resolved' && <CheckCircle2 size={14} />}
                    {ticket.status === 'In Progress' && <Clock size={14} />}
                    {ticket.status === 'Open' && <AlertCircle size={14} />}
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-surface)] p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-primary)]/40 pb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Open New Maintenance Ticket</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Issue Summary</label>
                <input
                  type="text"
                  placeholder="e.g. Inverter Phase 3 cooling fan warning..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm bg-[var(--bg-base)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Sector</label>
                  <select
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--bg-base)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
                  >
                    <option value="Sector 1">Sector 1 (Inverter Array)</option>
                    <option value="Sector 2">Sector 2 (Battery Bank B)</option>
                    <option value="Sector 3">Sector 3 (Solar Grid East)</option>
                    <option value="Sector 4">Sector 4 (North Substation)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--bg-base)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
                  >
                    <option value="Low">Low Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="High">High Priority</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[var(--border-primary)]/40">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[var(--bg-base)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-[var(--color-primary)] text-[var(--text-inverse)] hover:opacity-90 transition-opacity cursor-pointer shadow-md"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
