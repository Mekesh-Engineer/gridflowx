import { UserRole } from '@/lib/constants';

export const ROLE_DASHBOARDS: Record<UserRole, string> = {
    [UserRole.ADMIN]: '/dashboard/admin',
    [UserRole.SUPERVISOR]: '/dashboard/supervisor',
    [UserRole.OPERATOR]: '/dashboard',
    [UserRole.AUDITOR]: '/dashboard/audit',
};
