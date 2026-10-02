export enum UserRole {
    ADMIN = 'admin',
    SUPERVISOR = 'supervisor',
    OPERATOR = 'operator',
    AUDITOR = 'auditor',
}

export const CLIENT_ROLES = {
    ADMIN: 'admin',
    SUPERVISOR: 'supervisor',
    OPERATOR: 'operator',
    AUDITOR: 'auditor',
} as const;
