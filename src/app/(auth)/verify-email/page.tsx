"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MailCheck, Loader2 } from "lucide-react";
import { AuthLogoMark } from "@/features/auth/components/AuthLogoMark";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function VerifyEmailPage() {
  const { resendVerification } = useAuth();
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    document.title = "Verify Email | GridFlowX";
  }, []);

  const handleResendEmail = async () => {
    setResendLoading(true);
    try {
      await resendVerification();
      toast.success("Verification email resent successfully. Please check your inbox.");
    } catch (error: any) {
      toast.error(error.message || "Failed to resend verification email. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 relative">
      {/* Logo Mark */}
      <AuthLogoMark iconSize="text-[32px]" containerSize="w-16 h-16" />

      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-2">
          <MailCheck className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Check your email
        </h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-sm">
          We have sent a verification link to your email address. Please check your inbox and click the link to activate your account.
        </p>
      </div>
      
      <div className="flex flex-col gap-4 w-full">
        <Link 
          href="/login" 
          className="w-full flex justify-center items-center py-3 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-focus)] text-[var(--text-inverse)] shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-[var(--color-primary)]/30 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all text-center"
        >
          Back to login
        </Link>
      </div>
      
      <p className="text-center text-sm text-[var(--text-muted)] mt-2">
        Didn't receive the email?{" "}
        <button
          type="button"
          onClick={handleResendEmail}
          disabled={resendLoading}
          className="font-bold text-[var(--color-primary)] hover:text-[var(--color-primary-focus)] hover:underline transition-all focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5 align-middle"
        >
          {resendLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Resend email
        </button>
      </p>
    </div>
  );
}
