import { Cpu, Shield, RefreshCw, BarChart3, Zap } from 'lucide-react';
import type { PromoPanelConfig } from './types/auth.types';

export const LOGIN_PROMO: PromoPanelConfig = {
    badge: 'Security Protocol Active',
    headlineLine1: 'Advanced Modular',
    headlineLine2: 'Monitoring System',
    subtitle: 'Synchronize core parameters to initialize automated microgrid tracking channels and relay control.',
    cards: [
        { icon: Cpu, title: 'Smart Edge Connectivity', description: 'Telemetry pipelines built directly for ESP32 systems.' },
        { icon: Shield, title: 'Handshake Authenticity', description: 'Granular access validation secured by Supabase Auth JWTs.' },
        { icon: RefreshCw, title: 'Instant Telemetry Pipeline', description: 'Under 1s reactive WebSockets sync loops and relay overrides.' },
        { icon: BarChart3, title: 'Real-time Insights', description: 'Visualize, analyze and optimize microgrid performance live.' },
    ],
};

export const REGISTER_PROMO: PromoPanelConfig = {
    badge: 'New Account Onboarding',
    headlineLine1: 'Join the Future of',
    headlineLine2: 'Smart Energy',
    subtitle: 'Create your GridFlowX account to securely monitor, manage, and optimize intelligent microgrid operations.',
    cards: [
        { icon: Zap, title: 'Join the Future of Smart Energy', description: 'Create your account and start managing intelligent microgrid systems instantly.' },
        { icon: Shield, title: 'Enterprise-Grade Security', description: 'Supabase Auth + PostgreSQL with row-level security (RLS).' },
        { icon: RefreshCw, title: 'Real-time Telemetry', description: 'Sub-second WebSocket data pipelines for live ESP32 relay monitoring.' },
        { icon: BarChart3, title: 'AI-Powered Insights', description: 'Predictive analytics and automated alerts across your grid nodes.' },
    ],
};

export const FORGOT_PROMO: PromoPanelConfig = {
    badge: 'Account Recovery Protocol',
    headlineLine1: 'Regain Access',
    headlineLine2: 'Instantly & Securely',
    subtitle: 'Enter your registered email and we\'ll dispatch a secure, time-limited password reset link directly to your inbox.',
    cards: [
        { icon: Shield, title: 'Secure Reset Link', description: 'Time-limited, one-use tokens sent directly to your inbox.' },
        { icon: Cpu, title: 'Identity Verification', description: 'Supabase-backed ownership validation before any change.' },
        { icon: RefreshCw, title: 'Instant Delivery', description: 'Reset emails dispatched in under a second via Supabase.' },
        { icon: BarChart3, title: 'Access Recovery', description: 'Regain full control of your microgrid dashboard securely.' },
    ],
};

export const RESET_PROMO: PromoPanelConfig = {
    badge: 'Password Reset Protocol',
    headlineLine1: 'Set a New',
    headlineLine2: 'Secure Password',
    subtitle: 'Choose a strong, unique password to protect your GridFlowX account and microgrid infrastructure.',
    cards: [
        { icon: Shield, title: 'One-Use Token', description: 'Each link is cryptographically unique and expires after 1 hour.' },
        { icon: Cpu, title: 'Identity Verified', description: 'Supabase confirms ownership before processing your reset.' },
        { icon: RefreshCw, title: 'Instant Activation', description: 'Your new password is active immediately after confirmation.' },
        { icon: BarChart3, title: 'Full Access Restored', description: 'Return to your microgrid dashboard with zero downtime.' },
    ],
};

export const VERIFY_EMAIL_PROMO: PromoPanelConfig = {
    badge: 'Account Verification Protocol',
    headlineLine1: 'Secure Your',
    headlineLine2: 'Identity & Access',
    subtitle: 'Verify your email address to validate ownership and initialize security channels for your energy nodes.',
    cards: [
        { icon: Shield, title: 'Ownership Validation', description: 'Guarantees only verified engineers access critical grid infrastructure.' },
        { icon: Cpu, title: 'Automated Token Generation', description: 'Cryptographically signed single-use verification links.' },
        { icon: RefreshCw, title: 'Live Synchronization', description: 'Instant account activation across edge gateways upon verification.' },
        { icon: BarChart3, title: 'Access Unlocked', description: 'Gain full access to autonomous dispatch, telemetry, and agent copilot.' },
    ],
};
