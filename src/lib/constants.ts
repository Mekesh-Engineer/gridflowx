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

export const TELEMETRY_LIMITS = {
    MIN_SOC: 20.0,
    MAX_SOC: 90.0,
    CRITICAL_SOC: 5.0,
    MAX_TEMP: 90.0,
    MIN_VOLTAGE: 10.5,
    MAX_VOLTAGE: 14.8,
};

export const API_ROUTES = {
    OVERRIDE: '/api/v1/relays/override',
    RECOVERY: '/api/v1/relays/recovery',
    THRESHOLD_CONFIG: '/api/v1/config/thresholds',
    FORECASTS: '/api/v1/forecast/solar-load',
    AUDIT_LOGS: '/api/v1/audit/logs',
};
