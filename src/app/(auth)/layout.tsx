'use client';

import { ReactNode } from "react";
import { Grid } from "lucide-react";
import { usePathname } from "next/navigation";

import { AuthPromoPanel } from "@/features/auth/components/AuthPromoPanel";
import { AuthThemeToggle } from "@/features/auth/components/AuthThemeToggle";
import { 
  LOGIN_PROMO, 
  REGISTER_PROMO, 
  FORGOT_PROMO, 
  RESET_PROMO, 
  VERIFY_EMAIL_PROMO 
} from "@/features/auth/constants";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "";

  let config = LOGIN_PROMO;
  if (pathname.includes("/register")) {
    config = REGISTER_PROMO;
  } else if (pathname.includes("/forgot-password")) {
    config = FORGOT_PROMO;
  } else if (pathname.includes("/reset-password")) {
    config = RESET_PROMO;
  } else if (pathname.includes("/verify-email")) {
    config = VERIFY_EMAIL_PROMO;
  }

  return (
    <div className="flex min-h-screen bg-[var(--bg-base)]">
      {/* Shared top-right theme toggle */}
      <AuthThemeToggle />

      {/* Left side - Dynamic Promo Panel */}
      <AuthPromoPanel config={config} />
      
      {/* Right side - Auth forms */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 lg:px-24">
        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2 mb-12">
          <Grid className="w-8 h-8 text-[var(--color-primary)]" />
          <span className="text-xl font-display font-semibold tracking-tight text-[var(--text-primary)]">
            GridFlowX
          </span>
        </div>
        
        <div className="w-full max-w-sm mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}


