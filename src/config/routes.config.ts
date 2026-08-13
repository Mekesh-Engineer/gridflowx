import { UserRole } from '@/types/roles';
import { ROUTE_PERMISSIONS, roleCanAccessRoute } from '@/config/permissions.config';

export { UserRole };
export { ROUTE_PERMISSIONS, roleCanAccessRoute };

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
  [UserRole.ADMIN]:      '/dashboard/admin',
  [UserRole.SUPERVISOR]: '/dashboard/supervisor',
  [UserRole.OPERATOR]:   '/dashboard',
  [UserRole.AUDITOR]:    '/dashboard/audit',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]:      'Administrator',
  [UserRole.SUPERVISOR]: 'Supervisor',
  [UserRole.OPERATOR]:   'Operator',
  [UserRole.AUDITOR]:    'Auditor',
};
