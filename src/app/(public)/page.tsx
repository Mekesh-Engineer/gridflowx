import { HeroSection } from "@/sections/landing/hero-section";
import { FeaturesSection } from "@/sections/landing/features-section";
import { HowItWorksSection } from "@/sections/landing/how-it-works-section";
import { InfrastructureSection } from "@/sections/landing/infrastructure-section";
import { MetricsSection } from "@/sections/landing/metrics-section";
import { IntegrationsSection } from "@/sections/landing/integrations-section";
import { SecuritySection } from "@/sections/landing/security-section";
import { DevelopersSection } from "@/sections/landing/developers-section";
import { TestimonialsSection } from "@/sections/landing/testimonials-section";
import { CtaSection } from "@/sections/landing/cta-section";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <InfrastructureSection />
      <MetricsSection />
      <IntegrationsSection />
      <SecuritySection />
      <DevelopersSection />
      <TestimonialsSection />
      <CtaSection />
    </main>
  );
}
