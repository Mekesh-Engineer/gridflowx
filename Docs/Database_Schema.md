# 💾 Database Schema (Supabase PostgreSQL)

## Supabase PostgreSQL Relational Schema, Tables, Indexes, and Security Boundaries

**Document ID:** `DOC-DATABASE`  
**Version:** 3.2  
**Classification:** Data Engineering Document · Schema Reference  
**Maintained By:** Platform Architecture & Data Engineering Team  

---

## 📋 Purpose

This document defines the complete relational database schema for the GridFlowX platform on **Supabase PostgreSQL**. The legacy NoSQL Firestore architecture and Redis caches have been superseded by Supabase PostgreSQL with version-controlled SQL migrations, Row Level Security (RLS), and Supabase Realtime subscriptions.

---

## 🐘 Supabase PostgreSQL Table Overview

```
public/
├── user_profiles (1:1 with auth.users)
├── devices (Microgrid Edge Controller Gateways)
├── telemetry (1Hz High-Frequency Sensor Stream)
├── relay_audit (Relay Actuation & Failsafe History)
├── alerts & alert_rules (System Diagnostics & Threshold Rules)
├── audit_logs (Tamper-evident Security Trail)
├── system_configurations (Thresholds & Calibrations)
├── support_tickets (Level-2 Engineering Dispatch)
├── api_keys (M2M Programmatic Access Tokens)
├── work_orders & reports (Maintenance Schedules & KPI Reports)
├── ai_conversations & ai_messages (Agentic AI Chat History)
└── agent_tasks, agent_task_queue & ai_memory (AI Orchestration Persistence)
```

---

## 📋 1. Table: `user_profiles`
Keyed by the user's Supabase Auth Unique Identifier (`id` UUID).

```sql
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'operator' CHECK (role IN ('admin', 'supervisor', 'operator', 'auditor', 'user')),
    display_name TEXT,
    first_name TEXT,
    last_name TEXT,
    phone_number TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 📈 2. Table: `telemetry`
High-volume sensor time-series data.

```sql
CREATE TABLE IF NOT EXISTS public.telemetry (
    id BIGSERIAL PRIMARY KEY,
    device_id TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    solar_power_w DOUBLE PRECISION DEFAULT 0.0,
    solar_voltage_v DOUBLE PRECISION DEFAULT 0.0,
    solar_current_a DOUBLE PRECISION DEFAULT 0.0,
    load_power_w DOUBLE PRECISION DEFAULT 0.0,
    grid_power_w DOUBLE PRECISION DEFAULT 0.0,
    grid_voltage_v DOUBLE PRECISION DEFAULT 230.0,
    grid_frequency_hz DOUBLE PRECISION DEFAULT 50.0,
    battery_soc_pct DOUBLE PRECISION DEFAULT 74.5,
    battery_voltage_v DOUBLE PRECISION DEFAULT 12.8,
    battery_current_a DOUBLE PRECISION DEFAULT 0.0,
    battery_temp_c DOUBLE PRECISION DEFAULT 31.5,
    battery_soh_pct DOUBLE PRECISION DEFAULT 98.2,
    relay_states BOOLEAN[] DEFAULT '{true,true,false,true,false,true,false,true}',
    core0_failsafe_active BOOLEAN DEFAULT false,
    metrics JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_telemetry_device_time ON public.telemetry (device_id, timestamp DESC);
```

---

## 📝 3. Table: `audit_logs`
Immutable security and operational event trail.

```sql
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_uid TEXT NOT NULL,
    actor_email TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'INFO',
    status TEXT NOT NULL DEFAULT 'SUCCESS',
    resource TEXT NOT NULL DEFAULT 'system',
    details JSONB DEFAULT '{}'::jsonb,
    hash TEXT
);
```

---

## 🤖 4. Agentic AI Persistence Tables

```sql
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'agent', 'system')),
    content TEXT NOT NULL,
    model_used TEXT,
    telemetry_snippet JSONB,
    tools_used TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```
