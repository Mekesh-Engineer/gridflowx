"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("Public Route Error:", error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[var(--bg-base)] px-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-6">
        <AlertCircle className="h-8 w-8 text-red-500" />
      </div>
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
        Something went wrong!
      </h2>
      <p className="mb-8 max-w-md text-[var(--text-muted)]">
        We encountered an unexpected error while loading this page. Please try again.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-focus)] text-[var(--bg-base)]">
          Try again
        </Button>
        <Button variant="outline" onClick={() => window.location.href = '/'}>
          Return Home
        </Button>
      </div>
    </div>
  );
}
