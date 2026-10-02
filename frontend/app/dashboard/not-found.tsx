import React from 'react';
import Link from 'next/link';
import { Compass, Home, Zap, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-8 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <Compass className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            404 — ROUTE NOT FOUND
          </span>
          <h2 className="text-xl font-bold text-zinc-100 pt-1">Microgrid Subsystem Unmapped</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The telemetry path or operational console you requested does not exist or has been relocated to another subsystem.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Button
            asChild
            variant="default"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 h-9"
          >
            <Link href="/dashboard">
              <Home className="w-3.5 h-3.5" />
              Main Overview
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 gap-1.5 h-9"
          >
            <Link href="/dashboard/energy/bess">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Battery BESS
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
