/**
 * ============================================================================
 * GridFlowX Support Ticket Service — Supabase PostgreSQL
 * ============================================================================
 * Manages support ticket dispatch, triage, and status lifecycle in Supabase
 * `support_tickets` table. Real-time subscription uses Supabase Realtime.
 */

import { supabase } from '@/lib/supabase/client';
import { UserRole } from '@/lib/constants';

export interface SupportTicketPayload {
  name: string;
  email: string;
  role: UserRole;
  inquiryType: 'telemetry' | 'hardware' | 'rbac' | 'general';
  subject: string;
  message: string;
  attachDiagnostics?: boolean;
  telemetrySnapshot?: {
    batterySoC: number;
    dcBusVoltage: number;
    core0FailsafeActive: boolean;
    gatewayLatencyMs: number;
    timestamp: string;
  } | null;
  attachmentUrls?: string[];
}

export interface SupportTicketDocument extends Omit<SupportTicketPayload, 'attachmentUrls'> {
  id: string;
  ticketId: string;
  status: 'received' | 'ai_triaged' | 'assigned' | 'resolved';
  priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_NORMAL';
  aiTriageSummary?: string;
  attachmentUrls: string[];
  createdAt: any;
  updatedAt: any;
}

/**
 * Generates a memorable ticket reference ID like GFX-8921
 */
export function generateTicketId(): string {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `GFX-${randomNum}`;
}

/**
 * Submits a new support ticket to Supabase `support_tickets` table
 */
export async function submitSupportTicket(payload: SupportTicketPayload): Promise<SupportTicketDocument> {
  const ticketId = generateTicketId();

  let priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_NORMAL' = 'P3_NORMAL';
  if (payload.inquiryType === 'hardware' || payload.telemetrySnapshot?.core0FailsafeActive) {
    priority = 'P1_CRITICAL';
  } else if (payload.inquiryType === 'telemetry' || payload.inquiryType === 'rbac') {
    priority = 'P2_HIGH';
  }

  let aiTriageSummary = 'Standard routing queue. Engineering dispatch pending.';
  const lowerMsg = payload.message.toLowerCase();
  if (lowerMsg.includes('relay') || lowerMsg.includes('overcurrent') || lowerMsg.includes('failsafe')) {
    aiTriageSummary = 'Potential high-current failsafe condition identified on Core 0. Recommended check: Inspect physical relay contacts & verify FreeRTOS watchdog register.';
  } else if (lowerMsg.includes('websocket') || lowerMsg.includes('disconnect') || lowerMsg.includes('delay')) {
    aiTriageSummary = 'Telemetry sync jitter detected. Recommended check: Verify TLS buffer allocation on edge gateway and inspect 1Hz heartbeat timeout.';
  } else if (lowerMsg.includes('permission') || lowerMsg.includes('jwt') || lowerMsg.includes('claim')) {
    aiTriageSummary = 'Authorization token mismatch. Recommended check: Force token refresh via Auth service or inspect custom claims in Supabase user profile.';
  }

  const now = new Date().toISOString();
  const row = {
    ticket_id: ticketId,
    name: payload.name,
    email: payload.email,
    role: payload.role,
    inquiry_type: payload.inquiryType,
    subject: payload.subject,
    message: payload.message,
    attach_diagnostics: payload.attachDiagnostics ?? false,
    telemetry_snapshot: payload.telemetrySnapshot ?? null,
    status: 'ai_triaged' as const,
    priority,
    ai_triage_summary: aiTriageSummary,
    attachment_urls: payload.attachmentUrls || [],
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from('support_tickets')
    .insert(row)
    .select()
    .single();

  if (error) throw error;

  const finalDoc = mapDbTicket(data);

  // Notify backend (email dispatch)
  try {
    await fetch('/api/support/ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalDoc),
    });
  } catch (dispatchErr) {
    console.warn('Email dispatch notification trigger failed:', dispatchErr);
  }

  return finalDoc;
}

/**
 * Subscribes to real-time status updates of a specific support ticket
 */
export function subscribeToTicketStatus(
  docId: string,
  onUpdate: (ticket: SupportTicketDocument | null) => void,
  onError?: (err: Error) => void
): () => void {
  // Initial load
  supabase
    .from('support_tickets')
    .select('*')
    .eq('id', docId)
    .single()
    .then(({ data }) => onUpdate(data ? mapDbTicket(data) : null));

  const channel = supabase
    .channel(`ticket-${docId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'support_tickets', filter: `id=eq.${docId}` },
      (payload) => {
        onUpdate(payload.new ? mapDbTicket(payload.new) : null);
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function uploadDiagnosticFile(
  _docId: string,
  _file: File,
  onProgress?: (progressPercent: number) => void
): Promise<string> {
  console.warn('Storage functionality has been disabled. Attachments are not uploaded.');
  if (onProgress) onProgress(100);
  return '';
}

export const INITIAL_SUPPORT_TICKETS: SupportTicketDocument[] = [
  {
    id: 'ticket-init-1',
    ticketId: 'GFX-8041',
    name: 'Operator Jane',
    email: 'operator.jane@gridflowx.io',
    role: UserRole.OPERATOR,
    inquiryType: 'hardware',
    subject: 'Sector 4 Substation Inverter Fan Speed Degraded',
    message: 'RPM feedback is 40% below setpoint under peak solar production.',
    status: 'ai_triaged',
    priority: 'P1_CRITICAL',
    aiTriageSummary: 'Potential thermal cutoff hazard on inverter bay. Recommended check: Inspect cooling fan tachometer wire and heat sink ventilation.',
    attachmentUrls: [],
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ticket-init-2',
    ticketId: 'GFX-8032',
    name: 'Operator Bob',
    email: 'operator.bob@gridflowx.io',
    role: UserRole.OPERATOR,
    inquiryType: 'hardware',
    subject: 'Battery Cell Balance Calibration Required',
    message: 'Cell 3 delta V exceeding 35mV during absorption charge cycle.',
    status: 'assigned',
    priority: 'P2_HIGH',
    aiTriageSummary: 'Cell imbalance detected. Recommended check: Passive bleed resistor engagement during balancing phase.',
    attachmentUrls: [],
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'ticket-init-3',
    ticketId: 'GFX-8023',
    name: 'Field Technician Alex',
    email: 'alex.tech@gridflowx.io',
    role: UserRole.OPERATOR,
    inquiryType: 'telemetry',
    subject: 'Feeder Breaker 02 Telemetry Packet Loss',
    message: 'Intermittent 1Hz heartbeat drops during peak inductive motor start.',
    status: 'resolved',
    priority: 'P3_NORMAL',
    aiTriageSummary: 'Resolved via shielded twisted pair re-grounding and RS-485 termination resistor adjustment.',
    attachmentUrls: [],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

/**
 * Fetches all support tickets, returning initial seeds if empty
 */
export async function fetchAllSupportTickets(): Promise<SupportTicketDocument[]> {
  try {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    if (!data || data.length === 0) return INITIAL_SUPPORT_TICKETS;
    return data.map(mapDbTicket);
  } catch (err) {
    console.warn('Failed to fetch support tickets from Supabase, falling back:', err);
    return INITIAL_SUPPORT_TICKETS;
  }
}

/**
 * Subscribes to real-time updates of all support tickets
 */
export function subscribeToSupportTickets(
  onUpdate: (tickets: SupportTicketDocument[]) => void,
  onError?: (err: Error) => void
): () => void {
  fetchAllSupportTickets().then(onUpdate).catch((err) => onError?.(err));

  const channel = supabase
    .channel('support-tickets-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'support_tickets' },
      () => {
        fetchAllSupportTickets().then(onUpdate).catch((err) => onError?.(new Error(String(err))));
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/**
 * Updates status of a support ticket
 */
export async function updateSupportTicketStatus(
  ticketId: string,
  newStatus: SupportTicketDocument['status']
): Promise<void> {
  const { error } = await supabase
    .from('support_tickets')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', ticketId);
  if (error) throw error;
}

function mapDbTicket(row: any): SupportTicketDocument {
  return {
    id: row.id,
    ticketId: row.ticket_id,
    name: row.name,
    email: row.email,
    role: row.role,
    inquiryType: row.inquiry_type,
    subject: row.subject,
    message: row.message,
    attachDiagnostics: row.attach_diagnostics,
    telemetrySnapshot: row.telemetry_snapshot,
    status: row.status,
    priority: row.priority,
    aiTriageSummary: row.ai_triage_summary,
    attachmentUrls: row.attachment_urls || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
