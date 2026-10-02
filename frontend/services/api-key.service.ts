/**
 * ============================================================================
 * GridFlowX API Key Management Service — Supabase PostgreSQL
 * ============================================================================
 * Generates, revokes, and queries developer API keys and webhooks via
 * Supabase `api_keys` table.
 */

import { supabase } from '@/lib/supabase/client';

export interface ApiKeyItem {
  id: string;
  name: string;
  prefix: string;
  fullKey?: string;
  created: string;
  status: 'ACTIVE' | 'REVOKED';
  permissions: string[];
}

export const INITIAL_API_KEYS: ApiKeyItem[] = [
  {
    id: 'KEY-01',
    name: 'FastAPI Service Key',
    prefix: 'gfx_live_99a8...',
    created: '2026-06-01',
    status: 'ACTIVE',
    permissions: ['telemetry:read', 'relays:write', 'ai:forecast'],
  },
  {
    id: 'KEY-02',
    name: 'Grafana Telemetry Key',
    prefix: 'gfx_live_33f1...',
    created: '2026-07-10',
    status: 'ACTIVE',
    permissions: ['telemetry:read'],
  },
];

export async function fetchAllApiKeys(): Promise<ApiKeyItem[]> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      // Seed initial keys if empty
      if (!data || data.length === 0) {
        for (const k of INITIAL_API_KEYS) {
          await supabase.from('api_keys').upsert({
            id: k.id,
            name: k.name,
            prefix: k.prefix,
            status: k.status,
            permissions: k.permissions,
            created_at: new Date(k.created).toISOString(),
          });
        }
      }
      return INITIAL_API_KEYS;
    }

    return data.map((row: any) => ({
      id: row.id,
      name: row.name,
      prefix: row.prefix,
      fullKey: row.full_key,
      created: (row.created_at || '').slice(0, 10) || '2026-06-01',
      status: (row.status as 'ACTIVE' | 'REVOKED') || 'ACTIVE',
      permissions: Array.isArray(row.permissions) ? row.permissions : ['telemetry:read'],
    }));
  } catch (err) {
    console.warn('Failed to fetch API keys from Supabase, using defaults:', err);
    return INITIAL_API_KEYS;
  }
}

export async function generateNewApiKey(name: string, permissions: string[]): Promise<ApiKeyItem> {
  const randomSuffix = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  const fullKey = `gfx_live_${randomSuffix}`;
  const prefix = `gfx_live_${randomSuffix.substring(0, 4)}...`;
  const keyId = `KEY-${Math.floor(10 + Math.random() * 90)}`;

  const newKey: ApiKeyItem = {
    id: keyId,
    name: name.trim() || 'Custom Integration Key',
    prefix,
    fullKey,
    created: new Date().toISOString().slice(0, 10),
    status: 'ACTIVE',
    permissions: permissions.length > 0 ? permissions : ['telemetry:read'],
  };

  try {
    await supabase.from('api_keys').insert({
      id: newKey.id,
      name: newKey.name,
      prefix: newKey.prefix,
      full_key: newKey.fullKey,
      status: newKey.status,
      permissions: newKey.permissions,
      created_at: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('Failed to insert API key to Supabase:', err);
  }

  return newKey;
}

export async function revokeApiKey(keyId: string): Promise<void> {
  try {
    await supabase
      .from('api_keys')
      .update({ status: 'REVOKED', updated_at: new Date().toISOString() })
      .eq('id', keyId);
  } catch (err) {
    console.warn('Failed to revoke API key in Supabase:', err);
  }
}
