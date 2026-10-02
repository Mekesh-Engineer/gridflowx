import { UserRole } from '@/types/roles';

// ============================================================================
// Permission Types
// ============================================================================

export type PermissionAction =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'approve'
  | 'reject'
  | 'override'
  | 'export'
  | 'execute'
  | 'import';

export type PermissionResource =
  | 'telemetry'
  | 'sensors'
  | 'relays'
  | 'devices'
  | 'gateways'
  | 'firmware'
  | 'diagnostics'
  | 'weather'
  | 'ai-models'
  | 'ai-recommendations'
  | 'agent-workflows'
  | 'agent-approvals'
  | 'digital-twin'
  | 'energy-bess'
  | 'energy-solar'
  | 'energy-grid'
  | 'energy-loads'
  | 'work-orders'
  | 'incidents'
  | 'checklists'
  | 'overrides'
  | 'analytics'
  | 'reports'
  | 'audit-logs'
  | 'compliance'
  | 'notifications'
  | 'alert-rules'
  | 'users'
  | 'roles'
  | 'billing'
  | 'api-keys'
  | 'integrations'
  | 'thresholds'
  | 'tenant-settings';

export type PermissionMatrix = Record<UserRole, Partial<Record<PermissionResource, PermissionAction[]>>>;

// ============================================================================
// RBAC Permission Matrix — Single Source of Truth
// ============================================================================

export const PERMISSION_MATRIX: PermissionMatrix = {
  [UserRole.OPERATOR]: {
    telemetry:         ['read'],
    sensors:           ['read', 'update'],         // can calibrate sensors
    relays:            ['read', 'override'],        // 30-min override only
    devices:           ['read', 'update'],          // can update status
    gateways:          ['read'],
    firmware:          [],
    diagnostics:       ['read'],
    weather:           ['read'],
    'ai-models':       ['read'],
    'ai-recommendations': ['read'],
    'agent-workflows': ['read'],
    'agent-approvals': [],
    'digital-twin':    ['read'],
    'energy-bess':     ['read'],
    'energy-solar':    ['read'],
    'energy-grid':     ['read'],
    'energy-loads':    ['read'],
    'work-orders':     ['create', 'read', 'update'],
    incidents:         ['create', 'read', 'update'],
    checklists:        ['create', 'read', 'update'],
    overrides:         ['create', 'read'],
    analytics:         ['read'],
    reports:           ['read'],
    'audit-logs':      [],
    compliance:        [],
    notifications:     ['read'],
    'alert-rules':     [],
    users:             [],
    roles:             [],
    billing:           [],
    'api-keys':        [],
    integrations:      [],
    thresholds:        ['read'],
    'tenant-settings': ['read'],
  },

  [UserRole.SUPERVISOR]: {
    telemetry:         ['read', 'export'],
    sensors:           ['read', 'update', 'export'],
    relays:            ['read', 'override', 'approve'],
    devices:           ['read', 'update'],
    gateways:          ['read'],
    firmware:          ['read'],
    diagnostics:       ['read', 'execute'],
    weather:           ['read', 'export'],
    'ai-models':       ['read', 'execute', 'export'],
    'ai-recommendations': ['read', 'approve', 'reject'],
    'agent-workflows': ['read', 'approve', 'reject'],
    'agent-approvals': ['read', 'approve', 'reject'],
    'digital-twin':    ['read', 'execute', 'export'],
    'energy-bess':     ['read', 'export'],
    'energy-solar':    ['read', 'export'],
    'energy-grid':     ['read', 'export'],
    'energy-loads':    ['read', 'update'],
    'work-orders':     ['create', 'read', 'update', 'delete', 'approve'],
    incidents:         ['create', 'read', 'update', 'delete', 'approve'],
    checklists:        ['create', 'read', 'update', 'delete'],
    overrides:         ['create', 'read', 'approve', 'reject'],
    analytics:         ['read', 'export'],
    reports:           ['create', 'read', 'export'],
    'audit-logs':      ['read'],
    compliance:        ['read', 'export'],
    notifications:     ['read', 'update'],
    'alert-rules':     ['read', 'update'],
    users:             [],
    roles:             [],
    billing:           [],
    'api-keys':        [],
    integrations:      ['read'],
    thresholds:        ['read'],
    'tenant-settings': ['read'],
  },

  [UserRole.ADMIN]: {
    telemetry:         ['read', 'export'],
    sensors:           ['create', 'read', 'update', 'delete', 'export'],
    relays:            ['create', 'read', 'update', 'delete', 'override', 'approve'],
    devices:           ['create', 'read', 'update', 'delete'],
    gateways:          ['create', 'read', 'update', 'delete'],
    firmware:          ['create', 'read', 'update', 'delete', 'execute'],
    diagnostics:       ['read', 'execute'],
    weather:           ['read', 'update', 'export'],
    'ai-models':       ['create', 'read', 'update', 'delete', 'execute', 'export'],
    'ai-recommendations': ['read', 'approve', 'reject', 'export'],
    'agent-workflows': ['create', 'read', 'update', 'delete', 'approve', 'reject'],
    'agent-approvals': ['read', 'approve', 'reject'],
    'digital-twin':    ['read', 'execute', 'export'],
    'energy-bess':     ['read', 'update', 'export'],
    'energy-solar':    ['read', 'update', 'export'],
    'energy-grid':     ['read', 'update', 'export'],
    'energy-loads':    ['create', 'read', 'update', 'delete'],
    'work-orders':     ['create', 'read', 'update', 'delete', 'approve', 'export'],
    incidents:         ['create', 'read', 'update', 'delete', 'approve', 'export'],
    checklists:        ['create', 'read', 'update', 'delete'],
    overrides:         ['create', 'read', 'approve', 'reject', 'export'],
    analytics:         ['read', 'export'],
    reports:           ['create', 'read', 'update', 'delete', 'export'],
    'audit-logs':      ['read', 'export'],
    compliance:        ['read', 'export'],
    notifications:     ['create', 'read', 'update', 'delete'],
    'alert-rules':     ['create', 'read', 'update', 'delete'],
    users:             ['create', 'read', 'update', 'delete'],
    roles:             ['create', 'read', 'update', 'delete'],
    billing:           ['create', 'read', 'update', 'delete'],
    'api-keys':        ['create', 'read', 'update', 'delete'],
    integrations:      ['create', 'read', 'update', 'delete'],
    thresholds:        ['create', 'read', 'update', 'delete'],
    'tenant-settings': ['create', 'read', 'update', 'delete'],
  },

  [UserRole.AUDITOR]: {
    telemetry:         ['read', 'export'],
    sensors:           ['read', 'export'],
    relays:            ['read'],
    devices:           ['read'],
    gateways:          ['read'],
    firmware:          ['read'],
    diagnostics:       ['read'],
    weather:           ['read'],
    'ai-models':       ['read', 'export'],
    'ai-recommendations': ['read', 'export'],
    'agent-workflows': ['read', 'export'],
    'agent-approvals': ['read'],
    'digital-twin':    ['read'],
    'energy-bess':     ['read', 'export'],
    'energy-solar':    ['read', 'export'],
    'energy-grid':     ['read', 'export'],
    'energy-loads':    ['read'],
    'work-orders':     ['read', 'export'],
    incidents:         ['read', 'export'],
    checklists:        ['read', 'export'],
    overrides:         ['read', 'export'],
    analytics:         ['read', 'export'],
    reports:           ['read', 'export'],
    'audit-logs':      ['read', 'export'],
    compliance:        ['read', 'export'],
    notifications:     ['read'],
    'alert-rules':     ['read'],
    users:             [],
    roles:             ['read'],
    billing:           ['read', 'export'],
    'api-keys':        [],
    integrations:      ['read'],
    thresholds:        ['read'],
    'tenant-settings': ['read'],
  },
};

// ============================================================================
// Route Permission Map — which roles can access each dashboard route
// ============================================================================

export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/dashboard':                         [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN],
  '/dashboard/supervisor':              [UserRole.SUPERVISOR, UserRole.ADMIN],
  '/dashboard/admin':                   [UserRole.ADMIN],
  '/dashboard/audit':                   [UserRole.AUDITOR, UserRole.ADMIN, UserRole.SUPERVISOR],

  // IoT & Gateway
  '/dashboard/iot/devices':             [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN],
  '/dashboard/iot/gateways':            [UserRole.SUPERVISOR, UserRole.ADMIN],
  '/dashboard/iot/firmware':            [UserRole.ADMIN],
  '/dashboard/iot/diagnostics':         [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN],

  // Sensor & Telemetry
  '/dashboard/sensors/live':            [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],
  '/dashboard/sensors/history':         [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],
  '/dashboard/sensors/calibration':     [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN],

  // Weather
  '/dashboard/weather/live':            [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],
  '/dashboard/weather/forecast':        [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN],
  '/dashboard/weather/accuracy':        [UserRole.SUPERVISOR, UserRole.ADMIN],

  // AI
  '/dashboard/ai/overview':             [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],
  '/dashboard/ai/recommendations':      [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN],
  '/dashboard/ai/models':               [UserRole.SUPERVISOR, UserRole.ADMIN],

  // Agentic AI
  '/dashboard/agentic-ai/overview':     [UserRole.SUPERVISOR, UserRole.ADMIN],
  '/dashboard/agentic-ai/queue':        [UserRole.SUPERVISOR, UserRole.ADMIN],
  '/dashboard/agentic-ai/timeline':     [UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],

  // Digital Twin
  '/dashboard/digital-twin/visualizer': [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],
  '/dashboard/digital-twin/energy-flow':[UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],
  '/dashboard/digital-twin/simulation': [UserRole.SUPERVISOR, UserRole.ADMIN],

  // Energy Management
  '/dashboard/energy/bess':             [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],
  '/dashboard/energy/solar':            [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],
  '/dashboard/energy/grid':             [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],
  '/dashboard/energy/loads':            [UserRole.SUPERVISOR, UserRole.ADMIN],

  // Operations
  '/dashboard/operations/work-orders':  [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN],
  '/dashboard/operations/incidents':    [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN],
  '/dashboard/operations/checklists':   [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN],
  '/dashboard/operations/overrides':    [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],

  // Analytics
  '/dashboard/analytics/business':      [UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],
  '/dashboard/analytics/carbon':        [UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],

  // Reports
  '/dashboard/reports/generator':       [UserRole.SUPERVISOR, UserRole.ADMIN],
  '/dashboard/reports/archive':         [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],

  // Audit
  '/dashboard/audit/logs':              [UserRole.AUDITOR, UserRole.ADMIN],
  '/dashboard/audit/compliance':        [UserRole.AUDITOR, UserRole.ADMIN],

  // Notifications
  '/dashboard/notifications/center':    [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],
  '/dashboard/notifications/rules':     [UserRole.SUPERVISOR, UserRole.ADMIN],

  // Users & Roles
  '/dashboard/users':                   [UserRole.ADMIN],
  '/dashboard/roles':                   [UserRole.ADMIN],

  // Administration
  '/dashboard/admin/settings':          [UserRole.ADMIN],
  '/dashboard/admin/integrations':      [UserRole.ADMIN],
  '/dashboard/admin/api-keys':          [UserRole.ADMIN],
  '/dashboard/admin/billing':           [UserRole.ADMIN],

  // Shared pages
  '/profile':                           [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],
  '/settings':                          [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],
  '/my-tickets':                        [UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN, UserRole.AUDITOR],
};

// ============================================================================
// Helper: Check if a role can access a route
// ============================================================================

export function roleCanAccessRoute(role: UserRole, pathname: string): boolean {
  // Find the most specific matching route
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
    .filter(route => pathname === route || pathname.startsWith(route + '/'))
    .sort((a, b) => b.length - a.length)[0];

  if (!matchedRoute) return true; // No permission mapping = public or uncontrolled
  return ROUTE_PERMISSIONS[matchedRoute].includes(role);
}

// ============================================================================
// Helper: Check if a role has a specific permission on a resource
// ============================================================================

export function hasPermission(
  role: UserRole,
  resource: PermissionResource,
  action: PermissionAction
): boolean {
  const actions = PERMISSION_MATRIX[role]?.[resource] ?? [];
  return actions.includes(action);
}
