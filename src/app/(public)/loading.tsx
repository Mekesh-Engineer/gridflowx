import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[var(--bg-base)]">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--color-primary)]" />
        <p className="text-sm text-[var(--text-muted)] animate-pulse">Loading GridFlowX...</p>
      </div>
    </div>
  );
}
