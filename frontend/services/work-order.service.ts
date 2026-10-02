/**
 * ============================================================================
 * GridFlowX Work Order & Maintenance Service — Supabase PostgreSQL
 * ============================================================================
 * Manages dispatch, assignment, and status lifecycle of maintenance work orders
 * in Supabase `work_orders` table. Real-time subscription uses Supabase Realtime.
 */

import { supabase } from '@/lib/supabase/client';

export interface WorkOrder {
  id: string;
  title: string;
  assignee: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  due: string;
  siteId?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO-204',
    title: 'Replace ACS712 Sensor Sector 2',
    assignee: 'Operator Jane',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    due: 'Today',
    siteId: 'SITE-KEC-CAMPUS-01',
    description: 'Zero-point drift observed during high thermal ambient periods.',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'WO-203',
    title: 'Inspect BESS Cell Thermal Padding',
    assignee: 'Technician Bob',
    status: 'TODO',
    priority: 'MEDIUM',
    due: 'Tomorrow',
    siteId: 'SITE-KEC-CAMPUS-01',
    description: 'Ensure compression brackets maintain equal tension across 4S cells.',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  },
  {
    id: 'WO-202',
    title: 'Clean Solar PV Panel Array Node A',
    assignee: 'Operator John',
    status: 'COMPLETED',
    priority: 'LOW',
    due: 'Yesterday',
    siteId: 'SITE-KEC-CAMPUS-01',
    description: 'Dust accumulation reduced measured GHI yield by 4.2%.',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
];

/**
 * Fetches all work orders from Supabase, seeding defaults if the table is empty
 */
export async function fetchAllWorkOrders(): Promise<WorkOrder[]> {
  try {
    const { data, error } = await supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) {
      await seedDefaultWorkOrders();
      return INITIAL_WORK_ORDERS;
    }

    return data.map(mapDbWorkOrder);
  } catch (err) {
    console.warn('Failed to fetch work orders from Supabase, returning defaults:', err);
    return INITIAL_WORK_ORDERS;
  }
}

async function seedDefaultWorkOrders(): Promise<void> {
  const rows = INITIAL_WORK_ORDERS.map((wo) => ({
    id: wo.id,
    title: wo.title,
    assignee: wo.assignee,
    status: wo.status,
    priority: wo.priority,
    due: wo.due,
    site_id: wo.siteId,
    description: wo.description,
    created_at: wo.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  await supabase.from('work_orders').upsert(rows, { onConflict: 'id' });
}

/**
 * Subscribes to real-time work order updates via Supabase Realtime
 */
export function subscribeToWorkOrders(
  onUpdate: (orders: WorkOrder[]) => void,
  onError?: (err: Error) => void
): () => void {
  fetchAllWorkOrders().then(onUpdate).catch((err) => onError?.(err));

  const channel = supabase
    .channel('work-orders-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'work_orders' },
      () => {
        fetchAllWorkOrders().then(onUpdate).catch((err) => onError?.(new Error(String(err))));
      }
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

/**
 * Creates a new work order in Supabase
 */
export async function createWorkOrder(
  data: Omit<WorkOrder, 'id' | 'createdAt'>
): Promise<WorkOrder> {
  const newId = `WO-${Math.floor(205 + Math.random() * 800)}`;
  const now = new Date().toISOString();
  const row = {
    id: newId,
    title: data.title,
    assignee: data.assignee,
    status: data.status,
    priority: data.priority,
    due: data.due,
    site_id: data.siteId,
    description: data.description,
    created_at: now,
    updated_at: now,
  };

  const { data: inserted, error } = await supabase
    .from('work_orders')
    .insert(row)
    .select()
    .single();

  if (error) throw error;
  return mapDbWorkOrder(inserted);
}

/**
 * Updates the status of a work order
 */
export async function updateWorkOrderStatus(
  orderId: string,
  newStatus: WorkOrder['status']
): Promise<void> {
  const { error } = await supabase
    .from('work_orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId);
  if (error) throw error;
}

function mapDbWorkOrder(row: any): WorkOrder {
  return {
    id: row.id,
    title: row.title,
    assignee: row.assignee,
    status: row.status,
    priority: row.priority,
    due: row.due,
    siteId: row.site_id,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
