/**
 * ============================================================================
 * GridFlowX Authentication Service — Supabase Auth
 * ============================================================================
 * Handles user registration, login, logout, password reset, email verification,
 * and profile synchronization using Supabase Auth + Postgres users table.
 */

import { supabase } from '@/lib/supabase/client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface DecodedCustomClaims {
  role: 'admin' | 'supervisor' | 'operator' | 'auditor';
  tenantId?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
  firstName: string;
  lastName: string;
  role: string;
  dob?: string;
  gender?: string;
  country?: string;
  city?: string;
  terms: boolean;
  consents: {
    terms: boolean;
    marketing: boolean;
    whatsapp: boolean;
    liveLocation: boolean;
  };
}

export interface SupabaseUserProfile {
  uid: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  role: string;
  dob?: string | null;
  gender?: string | null;
  country?: string | null;
  city?: string | null;
  emailVerified: boolean;
  consents?: {
    terms: boolean;
    marketing: boolean;
    whatsapp: boolean;
    liveLocation: boolean;
  };
  avatarUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Sign in with email and password using Supabase Auth
 */
export async function loginWithEmail(
  email: string,
  password: string
): Promise<{ user: User; session: Session }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user || !data.session) {
    throw error || new Error('Login failed: no session returned');
  }
  return { user: data.user, session: data.session };
}

export const loginWithCredentials = loginWithEmail;

/**
 * Sign in with Google OAuth via Supabase
 */
export async function loginWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined,
    },
  });
  if (error) throw error;
}

/**
 * Sign out the current session
 */
export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export const logoutService = logout;

/**
 * Send a password reset email
 */
export async function sendPasswordResetService(email: string): Promise<void> {
  const redirectTo = typeof window !== 'undefined'
    ? `${window.location.origin}/login`
    : undefined;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw error;
}

/**
 * Send email verification (Supabase handles this on sign-up; this resends it)
 */
export async function resendVerificationEmailService(email: string): Promise<void> {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: typeof window !== 'undefined'
        ? `${window.location.origin}/login?verified=true`
        : undefined,
    },
  });
  if (error) throw error;
}

/**
 * Register a new user and create their profile in the `users` table
 */
export async function registerWithEmail(payload: RegisterPayload): Promise<User> {
  const {
    email, password, displayName, firstName, lastName,
    role, dob, gender, country, city, consents,
  } = payload;

  // 1. Create the Supabase Auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { displayName, firstName, lastName, role },
      emailRedirectTo: typeof window !== 'undefined'
        ? `${window.location.origin}/login?verified=true`
        : undefined,
    },
  });

  if (error || !data.user) {
    throw error || new Error('Registration failed');
  }

  const user = data.user;

  // 2. Insert profile into users table
  const { error: profileError } = await supabase.from('users').upsert({
    id: user.id,
    email,
    display_name: displayName,
    first_name: firstName,
    last_name: lastName,
    role,
    dob: dob ?? null,
    gender: gender ?? null,
    country: country ?? null,
    city: city ?? null,
    email_verified: false,
    consents,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (profileError) {
    console.warn('Profile insert failed (non-fatal):', profileError.message);
  }

  return user;
}

/**
 * Retrieve role from Supabase user metadata or users table
 */
export async function getUserCustomClaims(user: User): Promise<DecodedCustomClaims> {
  try {
    // First try user metadata
    const metaRole = user.user_metadata?.role;
    if (metaRole) {
      return { role: metaRole as DecodedCustomClaims['role'] };
    }

    // Fallback: fetch from users table
    const { data } = await supabase
      .from('users')
      .select('role, tenant_id')
      .eq('id', user.id)
      .single();

    if (data) {
      return {
        role: (data.role as DecodedCustomClaims['role']) || 'operator',
        tenantId: data.tenant_id,
      };
    }
  } catch (err) {
    console.error('Failed to retrieve custom claims:', err);
  }
  return { role: 'operator' };
}

/**
 * Initialize auth — no-op for Supabase (SSR sessions are handled by middleware)
 */
export async function initAuthPersistence(): Promise<void> {
  // Supabase SSR handles persistence automatically via cookies
}

/**
 * Sync the Supabase user profile to the `users` table (upsert)
 */
export async function syncUserProfile(user: User): Promise<SupabaseUserProfile> {
  const meta = user.user_metadata || {};
  const displayName = meta.displayName || meta.full_name || user.email?.split('@')[0] || 'Operator';
  const names = displayName.split(' ');

  const profile: SupabaseUserProfile = {
    uid: user.id,
    email: user.email || '',
    displayName,
    firstName: meta.firstName || names[0] || '',
    lastName: meta.lastName || names.slice(1).join(' ') || '',
    role: meta.role || 'operator',
    emailVerified: !!user.email_confirmed_at,
    avatarUrl: meta.avatar_url || null,
  };

  // Try reading from DB first
  const { data: existing } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  if (existing) {
    // Merge DB profile over meta
    return {
      uid: existing.id,
      email: existing.email,
      displayName: existing.display_name || profile.displayName,
      firstName: existing.first_name || profile.firstName,
      lastName: existing.last_name || profile.lastName,
      role: existing.role || profile.role,
      dob: existing.dob,
      gender: existing.gender,
      country: existing.country,
      city: existing.city,
      emailVerified: existing.email_verified ?? profile.emailVerified,
      consents: existing.consents,
      avatarUrl: existing.avatar_url || profile.avatarUrl,
      createdAt: existing.created_at,
      updatedAt: existing.updated_at,
    };
  }

  // Create if not found
  await supabase.from('users').upsert({
    id: user.id,
    email: profile.email,
    display_name: profile.displayName,
    first_name: profile.firstName,
    last_name: profile.lastName,
    role: profile.role,
    email_verified: profile.emailVerified,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  return profile;
}
