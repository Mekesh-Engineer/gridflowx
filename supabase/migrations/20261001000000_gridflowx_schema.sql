-- ==============================================================================
-- GridFlowX Production PostgreSQL Database Schema (Supabase Migration v3.0.0)
-- Document ID: MIGRATION-20261001-SUPABASE
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. USER PROFILES & RBAC
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'supervisor', 'operator', 'auditor', 'viewer', 'public')),
    dob TEXT,
    gender TEXT,
    country TEXT,
    city TEXT,
    avatar_url TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    consents JSONB DEFAULT '{"terms": true, "marketing": false, "whatsapp": false, "liveLocation": false}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. EDGE MICROGRID DEVICES
CREATE TABLE IF NOT EXISTS public.devices (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'ESP32_MASTER',
    status TEXT NOT NULL DEFAULT 'ONLINE' CHECK (status IN ('ONLINE', 'OFFLINE', 'FAULT', 'STANDBY')),
    location TEXT,
    site_id TEXT DEFAULT 'SITE-KEC-CAMPUS-01',
    ip_address TEXT,
    mac_address TEXT,
    firmware_version TEXT DEFAULT 'v3.0.4-release',
    hardware_revision TEXT DEFAULT 'ESP32-WROOM-32D',
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    is_online BOOLEAN DEFAULT TRUE,
    ping_latency_ms FLOAT DEFAULT 15.0,
    calibration JSONB DEFAULT '{"voltageDividerRatio": 3.703, "currentSensorMvPerA": 185.0, "currentZeroOffsetMv": 2500.0, "pt1000TempOffsetC": 0.0}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HIGH-FREQUENCY CYBER-PHYSICAL TELEMETRY
CREATE TABLE IF NOT EXISTS public.telemetry (
    id BIGSERIAL PRIMARY KEY,
    device_id TEXT NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    solar_voltage_v FLOAT DEFAULT 0.0,
    solar_current_a FLOAT DEFAULT 0.0,
    solar_power_w FLOAT DEFAULT 0.0,
    solar_irradiance FLOAT DEFAULT 0.0,
    battery_voltage_v FLOAT DEFAULT 52.5,
    battery_current_a FLOAT DEFAULT 0.0,
    battery_power_w FLOAT DEFAULT 0.0,
    battery_soc FLOAT DEFAULT 82.4,
    battery_soh FLOAT DEFAULT 97.2,
    battery_temp_c FLOAT DEFAULT 34.6,
    grid_voltage_v FLOAT DEFAULT 230.7,
    grid_current_a FLOAT DEFAULT 0.0,
    grid_frequency_hz FLOAT DEFAULT 50.0,
    grid_power_w FLOAT DEFAULT 0.0,
    bus_voltage_v FLOAT DEFAULT 52.5,
    load_voltage_v FLOAT DEFAULT 230.1,
    load_current_a FLOAT DEFAULT 11.09,
    load_power_w FLOAT DEFAULT 2552.7,
    tier1_load_w FLOAT DEFAULT 450.0,
    tier2_load_w FLOAT DEFAULT 380.0,
    tier3_load_w FLOAT DEFAULT 620.0,
    tier4_load_w FLOAT DEFAULT 1100.0,
    relay_states JSONB NOT NULL DEFAULT '[true, true, true, true, false, false, false, false]'::jsonb,
    ambient_temp_c FLOAT DEFAULT 28.5,
    is_islanded BOOLEAN DEFAULT FALSE
);

-- 5. RELAY STATE & OVERRIDE AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.relay_audit (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    device_id TEXT DEFAULT 'GFX-ESP32-MASTER-01',
    relay_index INT NOT NULL CHECK (relay_index >= 0 AND relay_index < 8),
    previous_state BOOLEAN NOT NULL,
    new_state BOOLEAN NOT NULL,
    actor_uid TEXT NOT NULL DEFAULT 'SYSTEM_OPERATOR',
    actor_email TEXT DEFAULT 'operator@gridflowx.io',
    actor_role TEXT NOT NULL DEFAULT 'operator',
    reason TEXT,
    was_safety_overridden BOOLEAN DEFAULT FALSE
);

-- 6. SYSTEM ALERTS & THRESHOLD RULES
CREATE TABLE IF NOT EXISTS public.alerts (
    id TEXT PRIMARY KEY,
    device_id TEXT DEFAULT 'GFX-ESP32-MASTER-01',
    severity TEXT NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    category TEXT NOT NULL CHECK (category IN ('HARDWARE_FAILSAFE', 'BATTERY_SOC', 'SYSTEM', 'ANOMALY', 'THRESHOLD', 'FORECAST')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_acknowledged BOOLEAN DEFAULT FALSE,
    acknowledged_by_uid TEXT,
    acknowledged_at TIMESTAMPTZ,
    is_auto_resolved BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS public.alert_rules (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    threshold_value FLOAT NOT NULL,
    condition TEXT NOT NULL,
    severity TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. IMMUTABLE REGULATORY AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_uid TEXT NOT NULL,
    actor_email TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'INFO',
    status TEXT NOT NULL DEFAULT 'SUCCESS',
    resource TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    hash TEXT
);

-- 8. TENANT SYSTEM CONFIGURATIONS
CREATE TABLE IF NOT EXISTS public.system_configurations (
    id TEXT PRIMARY KEY,
    min_soc_threshold_pct FLOAT DEFAULT 20.0,
    max_cell_temperature_c FLOAT DEFAULT 45.0,
    critical_load_tier1_locked BOOLEAN DEFAULT TRUE,
    min_relay_dwell_time_sec FLOAT DEFAULT 3.0,
    auto_shedding_enabled BOOLEAN DEFAULT TRUE,
    peak_tariff_rate_usd FLOAT DEFAULT 0.38,
    grid_anti_islanding_threshold_v FLOAT DEFAULT 230.0,
    config_value JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT DEFAULT 'SYSTEM_ADMIN'
);

-- 9. SUPPORT TICKETS & ATTACHMENTS
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id TEXT PRIMARY KEY,
    ticket_id TEXT UNIQUE NOT NULL,
    user_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL,
    inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('telemetry', 'hardware', 'rbac', 'general')),
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'ai_triaged', 'assigned', 'resolved')),
    priority TEXT NOT NULL DEFAULT 'P3_NORMAL' CHECK (priority IN ('P1_CRITICAL', 'P2_HIGH', 'P3_NORMAL')),
    ai_triage_summary TEXT,
    attachment_urls TEXT[] DEFAULT '{}',
    telemetry_snapshot JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. DEVELOPER API KEYS & WEBHOOKS
CREATE TABLE IF NOT EXISTS public.api_keys (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    prefix TEXT NOT NULL,
    full_key TEXT,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED')),
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MAINTENANCE WORK ORDERS
CREATE TABLE IF NOT EXISTS public.work_orders (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    assignee TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO', 'IN_PROGRESS', 'COMPLETED')),
    priority TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('HIGH', 'MEDIUM', 'LOW')),
    due TEXT NOT NULL,
    site_id TEXT DEFAULT 'SITE-KEC-CAMPUS-01',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. OPERATIONAL & REGULATORY REPORTS
CREATE TABLE IF NOT EXISTS public.operational_reports (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    period TEXT NOT NULL,
    total_solar_generated_kwh FLOAT DEFAULT 0.0,
    total_load_consumed_kwh FLOAT DEFAULT 0.0,
    battery_average_soc_pct FLOAT DEFAULT 0.0,
    battery_peak_temp_c FLOAT DEFAULT 0.0,
    grid_import_export_kwh FLOAT DEFAULT 0.0,
    total_financial_savings_usd FLOAT DEFAULT 0.0,
    co2_displaced_kg FLOAT DEFAULT 0.0,
    compliance_score_pct FLOAT DEFAULT 100.0,
    status TEXT NOT NULL DEFAULT 'FINALIZED' CHECK (status IN ('FINALIZED', 'GENERATING', 'ARCHIVED')),
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. AGENTIC AI CONVERSATIONS & MEMORY
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    role TEXT NOT NULL DEFAULT 'operator',
    title TEXT DEFAULT 'Microgrid AI Copilot Session',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system', 'tool')),
    content TEXT NOT NULL,
    tokens_used INT DEFAULT 0,
    model_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. AGENTIC AI GOAL DECOMPOSITION & HITL TASKS
CREATE TABLE IF NOT EXISTS public.agent_tasks (
    id TEXT PRIMARY KEY,
    goal TEXT NOT NULL,
    decomposed_plan JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTING', 'COMPLETED', 'FAILED')),
    actor_role TEXT NOT NULL,
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 15. PERFORMANCE INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_telemetry_device_timestamp ON public.telemetry (device_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_device_ack_ts ON public.alerts (device_id, is_acknowledged, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_relay_audit_ts ON public.relay_audit (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ts ON public.audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets (status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_work_orders_status ON public.work_orders (status, due);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON public.ai_messages (conversation_id, created_at ASC);

-- ==============================================================================
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relay_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operational_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

-- Read policies for public/operator/admin
DROP POLICY IF EXISTS "Public read for telemetry" ON public.telemetry;
CREATE POLICY "Public read for telemetry" ON public.telemetry FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for devices" ON public.devices;
CREATE POLICY "Public read for devices" ON public.devices FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for alerts" ON public.alerts;
CREATE POLICY "Public read for alerts" ON public.alerts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for system_configurations" ON public.system_configurations;
CREATE POLICY "Public read for system_configurations" ON public.system_configurations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for work_orders" ON public.work_orders;
CREATE POLICY "Public read for work_orders" ON public.work_orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read for operational_reports" ON public.operational_reports;
CREATE POLICY "Public read for operational_reports" ON public.operational_reports FOR SELECT USING (true);

-- Authenticated/Service Role write policies
DROP POLICY IF EXISTS "Service role full access on all tables" ON public.telemetry;
CREATE POLICY "Service role full access on all tables" ON public.telemetry FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on alerts" ON public.alerts;
CREATE POLICY "Service role full access on alerts" ON public.alerts FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on relay_audit" ON public.relay_audit;
CREATE POLICY "Service role full access on relay_audit" ON public.relay_audit FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on audit_logs" ON public.audit_logs;
CREATE POLICY "Service role full access on audit_logs" ON public.audit_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on support_tickets" ON public.support_tickets;
CREATE POLICY "Service role full access on support_tickets" ON public.support_tickets FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on user_profiles" ON public.user_profiles;
CREATE POLICY "Service role full access on user_profiles" ON public.user_profiles FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on ai_conversations" ON public.ai_conversations;
CREATE POLICY "Service role full access on ai_conversations" ON public.ai_conversations FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on ai_messages" ON public.ai_messages;
CREATE POLICY "Service role full access on ai_messages" ON public.ai_messages FOR ALL USING (true);

DROP POLICY IF EXISTS "Service role full access on agent_tasks" ON public.agent_tasks;
CREATE POLICY "Service role full access on agent_tasks" ON public.agent_tasks FOR ALL USING (true);

-- ==============================================================================
-- 17. SUPABASE REALTIME PUBLICATION
-- ==============================================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.telemetry;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.relay_audit;
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.work_orders;
