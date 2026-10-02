'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for client diagnostics
    console.error('[Dashboard Error Boundary]', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full p-6 rounded-2xl bg-zinc-900 border border-zinc-800 text-center space-y-5 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-zinc-100">Telemetry Stream Error</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            The operational dashboard encountered an unexpected rendering error while processing system telemetry or relay states.
          </p>
          {error?.digest && (
            <p className="text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800/80 inline-block">
              Fault Digest: {error.digest}
            </p>
          )}
        </div>

        <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-left text-xs text-zinc-300 font-mono overflow-x-auto max-h-24">
          {error?.message || 'Unknown runtime exception occurred.'}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => reset()}
            variant="default"
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 h-9 px-4"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry Connection
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-zinc-700 hover:bg-zinc-800 text-zinc-300 gap-1.5 h-9 px-4"
          >
            <Link href="/dashboard">
              <Home className="w-3.5 h-3.5" />
              Overview
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
