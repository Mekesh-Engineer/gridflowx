import React from 'react';
import Link from 'next/link';
import { FileText, CheckCircle2, ShieldAlert, Cpu, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service | GridFlowX Microgrid Management',
  description: 'Terms of service and acceptable use agreement for the GridFlowX cyber-physical microgrid platform.'
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <FileText className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Terms of Service</h1>
              <p className="text-sm text-slate-400 mt-1">Last Updated: October 2026 | GridFlowX Platform Agreement</p>
            </div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-slate-300 leading-relaxed text-sm sm:text-base">
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-cyan-400" /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the GridFlowX platform, web dashboard, API gateways, or edge IoT controllers, you agree to be bound by these Terms of Service and all applicable electrical safety and data protection regulations.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" /> 2. Cyber-Physical Safety & Operational Interlocks
            </h2>
            <p>
              GridFlowX provides automated AI dispatch for microgrids (solar, battery storage, critical loads, and grid tie). Users must comply with standard hardware interlocks and safety envelopes. Manual relay overrides must be performed solely by authorized personnel (Engineers, Supervisors, Admins).
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" /> 3. User Accounts & Security
            </h2>
            <p>
              You are responsible for maintaining the confidentiality of your credentials (Google OAuth or email login). Any suspicious activity should immediately be reported to the platform administrator.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
