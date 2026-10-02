-- ==============================================================================
-- GridFlowX Schema Supplement — Migration 002
-- Adds missing tables and columns needed by migrated Supabase services
-- ==============================================================================

-- 1. PUBLIC USERS TABLE (mirrors auth.users, used by services)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL DEFAULT 'Operator User',
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
    tenant_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Service role full access on users" ON public.users;
CREATE POLICY "Service role full access on users" ON public.users FOR ALL USING (true);

-- 2. SYSTEM CONFIGURATIONS (key/value JSON store)
-- Add config_key column if not already present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='system_configurations' AND column_name='config_key'
    ) THEN
        ALTER TABLE public.system_configurations ADD COLUMN config_key TEXT UNIQUE;
    END IF;
END $$;

-- 3. REPORTS TABLE (used by report.service.ts)
CREATE TABLE IF NOT EXISTS public.reports (
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

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read for reports" ON public.reports;
CREATE POLICY "Public read for reports" ON public.reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role full access on reports" ON public.reports;
CREATE POLICY "Service role full access on reports" ON public.reports FOR ALL USING (true);

-- 4. API KEYS TABLE — supplement with hash column
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='api_keys' AND column_name='full_key_hash'
    ) THEN
        ALTER TABLE public.api_keys ADD COLUMN full_key_hash TEXT;
        ALTER TABLE public.api_keys ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

DROP POLICY IF EXISTS "Service role full access on api_keys" ON public.api_keys;
CREATE POLICY "Service role full access on api_keys" ON public.api_keys FOR ALL USING (true);

-- 5. AGENT TASK QUEUE (for Agentic AI HITL)
CREATE TABLE IF NOT EXISTS public.agent_task_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    user_role TEXT NOT NULL DEFAULT 'operator',
    goal TEXT NOT NULL,
    decomposed_plan JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'EXECUTING', 'COMPLETED', 'FAILED')),
    priority TEXT DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agent_task_queue ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on agent_task_queue" ON public.agent_task_queue;
CREATE POLICY "Service role full access on agent_task_queue" ON public.agent_task_queue FOR ALL USING (true);

DROP POLICY IF EXISTS "Authenticated read agent_task_queue" ON public.agent_task_queue;
CREATE POLICY "Authenticated read agent_task_queue" ON public.agent_task_queue FOR SELECT USING (auth.role() = 'authenticated');

-- 6. AI MEMORY TABLE
CREATE TABLE IF NOT EXISTS public.ai_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    memory_type TEXT NOT NULL DEFAULT 'context' CHECK (memory_type IN ('context', 'preference', 'fact', 'device', 'energy')),
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ai_memory ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access on ai_memory" ON public.ai_memory;
CREATE POLICY "Service role full access on ai_memory" ON public.ai_memory FOR ALL USING (true);

-- 7. REALTIME PUBLICATIONS for new tables
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_conversations;
    EXCEPTION WHEN others THEN NULL; END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.ai_messages;
    EXCEPTION WHEN others THEN NULL; END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_task_queue;
    EXCEPTION WHEN others THEN NULL; END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;
    EXCEPTION WHEN others THEN NULL; END;
END $$;

-- 8. Additional indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users (role);
CREATE INDEX IF NOT EXISTS idx_reports_generated_at ON public.reports (generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_memory_user_type ON public.ai_memory (user_id, memory_type);
CREATE INDEX IF NOT EXISTS idx_agent_task_queue_status ON public.agent_task_queue (status, created_at DESC);
