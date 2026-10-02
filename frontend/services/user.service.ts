/**
 * ============================================================================
 * GridFlowX User Profile Service — Supabase PostgreSQL
 * ============================================================================
 * Manages user profile data in Supabase `users` table.
 */

import { supabase } from '@/lib/supabase/client';
import { UserRole } from '@/lib/constants';

export interface UserConsents {
  terms: boolean;
  marketing: boolean;
  whatsapp: boolean;
  liveLocation: boolean;
}

export interface UserProfileDocument {
  uid: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  role: UserRole | string;
  dob?: string | null;
  gender?: string | null;
  country?: string | null;
  city?: string | null;
  emailVerified: boolean;
  consents?: UserConsents;
  avatarUrl?: string | null;
  createdAt?: any;
  updatedAt?: any;
}

export async function getUserProfile(uid: string): Promise<UserProfileDocument | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();
    if (error || !data) return null;
    return mapDbUser(data);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function syncUserProfile(uid: string, meta: Record<string, any>): Promise<UserProfileDocument> {
  const displayName = meta.displayName || meta.full_name || 'Operator User';
  const names = displayName.split(' ');

  const fallback: UserProfileDocument = {
    uid,
    email: meta.email || '',
    displayName,
    firstName: meta.firstName || names[0] || 'Operator',
    lastName: meta.lastName || names.slice(1).join(' ') || '',
    role: UserRole.OPERATOR,
    emailVerified: !!meta.email_confirmed_at,
    consents: { terms: true, marketing: false, whatsapp: false, liveLocation: false },
    avatarUrl: meta.avatar_url || null,
  };

  try {
    const { data: existing } = await supabase
      .from('users')
      .select('*')
      .eq('id', uid)
      .single();

    if (existing) {
      return mapDbUser(existing);
    }

    // Create a new profile
    await supabase.from('users').upsert({
      id: uid,
      email: fallback.email,
      display_name: fallback.displayName,
      first_name: fallback.firstName,
      last_name: fallback.lastName,
      role: fallback.role,
      email_verified: fallback.emailVerified,
      consents: fallback.consents,
      avatar_url: fallback.avatarUrl,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return fallback;
  } catch (error) {
    console.warn('Supabase user profile sync failed. Using fallback profile:', error);
    return fallback;
  }
}

export async function updateUserProfileData(
  uid: string,
  data: Partial<Omit<UserProfileDocument, 'uid' | 'role' | 'emailVerified' | 'createdAt'>>
): Promise<void> {
  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  if (data.displayName !== undefined) updatePayload.display_name = data.displayName;
  if (data.firstName !== undefined) updatePayload.first_name = data.firstName;
  if (data.lastName !== undefined) updatePayload.last_name = data.lastName;
  if (data.dob !== undefined) updatePayload.dob = data.dob;
  if (data.gender !== undefined) updatePayload.gender = data.gender;
  if (data.country !== undefined) updatePayload.country = data.country;
  if (data.city !== undefined) updatePayload.city = data.city;
  if (data.avatarUrl !== undefined) updatePayload.avatar_url = data.avatarUrl;
  if (data.consents !== undefined) updatePayload.consents = data.consents;

  const { error } = await supabase.from('users').update(updatePayload).eq('id', uid);
  if (error) throw error;
}

export async function fetchAllUsers(): Promise<UserProfileDocument[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(mapDbUser);
  } catch (error) {
    console.error('Error fetching all users:', error);
    return [];
  }
}

export async function updateUserRole(targetUid: string, newRole: UserRole | string): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq('id', targetUid);
  if (error) throw error;
}

function mapDbUser(row: any): UserProfileDocument {
  return {
    uid: row.id,
    email: row.email,
    displayName: row.display_name,
    firstName: row.first_name,
    lastName: row.last_name,
    role: row.role,
    dob: row.dob,
    gender: row.gender,
    country: row.country,
    city: row.city,
    emailVerified: row.email_verified,
    consents: row.consents,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
