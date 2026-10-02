"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Navigation } from "@/components/layout/navigation";
import { CompactFooter } from "@/components/layout/footer";
import { FooterSection } from "@/sections/common/footer-section";
import { FloatingAiCopilot } from "@/components/ai/FloatingAiCopilot";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <div className="relative min-h-screen flex flex-col noise-overlay">
      <Navigation />
      <div className="flex-grow">
        {children}
      </div>
      {isLandingPage ? <FooterSection /> : <CompactFooter />}
      <FloatingAiCopilot />
    </div>
  );
}