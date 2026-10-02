import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="h-14 rounded-xl bg-zinc-900/60 border border-zinc-800/60 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-lg bg-zinc-800" />
          <div className="space-y-1.5">
            <Skeleton className="w-32 h-4 bg-zinc-800" />
            <Skeleton className="w-48 h-3 bg-zinc-800/60" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-24 h-7 rounded-full bg-zinc-800" />
          <Skeleton className="w-20 h-7 rounded-full bg-zinc-800" />
        </div>
      </div>

      {/* KPI Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="w-24 h-3.5 bg-zinc-800" />
              <Skeleton className="w-7 h-7 rounded-lg bg-zinc-800" />
            </div>
            <Skeleton className="w-32 h-7 bg-zinc-800" />
            <Skeleton className="w-20 h-3 bg-zinc-800/60" />
          </div>
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Main Visualizer Skeleton */}
          <div className="h-[320px] rounded-xl bg-zinc-900/60 border border-zinc-800/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-40 h-4 bg-zinc-800" />
              <Skeleton className="w-24 h-6 rounded-md bg-zinc-800" />
            </div>
            <div className="h-[220px] rounded-lg bg-zinc-950/40 border border-zinc-800/40 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-zinc-700 border-t-emerald-500 animate-spin" />
            </div>
          </div>

          {/* Sub Analytics Skeleton */}
          <div className="h-[220px] rounded-xl bg-zinc-900/60 border border-zinc-800/60 p-5 space-y-3">
            <Skeleton className="w-36 h-4 bg-zinc-800" />
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-28 rounded-lg bg-zinc-800/50" />
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Widget Skeleton */}
        <div className="space-y-6">
          <div className="h-[320px] rounded-xl bg-zinc-900/60 border border-zinc-800/60 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <Skeleton className="w-36 h-4 bg-zinc-800" />
              <Skeleton className="w-16 h-5 rounded-full bg-zinc-800" />
            </div>
            <div className="space-y-3 pt-2">
              {[...Array(5)].map((_, k) => (
                <div key={k} className="flex items-center justify-between py-1.5">
                  <div className="space-y-1">
                    <Skeleton className="w-28 h-3.5 bg-zinc-800" />
                    <Skeleton className="w-20 h-2.5 bg-zinc-800/60" />
                  </div>
                  <Skeleton className="w-10 h-5 rounded-full bg-zinc-800" />
                </div>
              ))}
            </div>
          </div>

          <div className="h-[220px] rounded-xl bg-zinc-900/60 border border-zinc-800/60 p-5 space-y-3">
            <Skeleton className="w-32 h-4 bg-zinc-800" />
            <Skeleton className="w-full h-32 rounded-lg bg-zinc-800/40" />
          </div>
        </div>
      </div>
    </div>
  );
}
