import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, Eye, Database, Server, UserCheck, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy | GridFlowX Microgrid Management',
  description: 'GridFlowX privacy and data protection policy detailing how user account information and microgrid telemetry data are handled securely.'
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        <div className="border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">Privacy Policy</h1>
              <p className="text-sm text-slate-400 mt-1">Last Updated: October 2026 | Effective for GridFlowX Platform</p>
            </div>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-6 text-slate-300 leading-relaxed text-sm sm:text-base">
          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" /> 1. Information We Collect
            </h2>
            <p>
              GridFlowX collects information strictly necessary to provide intelligent microgrid management, renewable energy optimization, and cyber-physical security monitoring.
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li><strong className="text-slate-200">Account & Identity Information:</strong> When you sign in via Google OAuth or email authentication, we receive your name, email address, and profile picture avatar for authentication via Supabase Auth.</li>
              <li><strong className="text-slate-200">Microgrid Telemetry & Sensor Data:</strong> Operational voltages, currents, power factors, battery state of charge (SoC), solar PV generation, and load metrics collected through IoT edge controllers (ESP32).</li>
              <li><strong className="text-slate-200">System Logs & Audit Records:</strong> Relay switching commands, operator overrides, alarm acknowledgments, and AI agent dispatch decisions for safety and audit compliance.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" /> 2. How We Use Your Data
            </h2>
            <p>We use your information exclusively to:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li>Authenticate your identity and enforce strict Role-Based Access Control (RBAC).</li>
              <li>Execute predictive energy dispatch, battery health management, and load-shedding automation.</li>
              <li>Send real-time alerts, safety notifications, and fault diagnostics.</li>
              <li>Maintain immutable compliance and security audit logs in PostgreSQL.</li>
            </ul>
            <p className="text-amber-400 text-sm font-medium">
              We never sell, rent, or monetize your personal information or microgrid operational data to third parties.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" /> 3. Data Protection & Security
            </h2>
            <p>
              GridFlowX employs end-to-end encryption in transit (TLS 1.3 / HTTPS / WSS) and encryption at rest (AES-256 via Supabase PostgreSQL). All database access is governed by granular Row-Level Security (RLS) policies.
            </p>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-cyan-400" /> 4. Third-Party Service Providers
            </h2>
            <p>We partner only with enterprise infrastructure providers:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-400">
              <li><strong className="text-slate-200">Supabase (PostgreSQL & Auth):</strong> Hosted database and secure session management.</li>
              <li><strong className="text-slate-200">Google Cloud Platform:</strong> Secure OAuth 2.0 single sign-on authentication.</li>
              <li><strong className="text-slate-200">Vercel:</strong> Global edge delivery and frontend hosting.</li>
            </ul>
          </section>

          <section className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-cyan-400" /> 5. Your Rights and Contact
            </h2>
            <p>
              You may request export, correction, or deletion of your profile and telemetry data at any time by contacting our system administrator at <a href="mailto:mekesh.engineer@gmail.com" className="text-cyan-400 underline">mekesh.engineer@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
