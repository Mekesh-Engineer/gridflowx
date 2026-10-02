# 🔐 Authentication & Authorization (Supabase Auth)

## Supabase Auth, JWT Validation, Role Claims, and Server-Side Verification

**Document ID:** `DOC-10`  
**Version:** 3.2  
**Classification:** Security Design Document · Engineering Reference  
**Maintained By:** Security Engineering Team  

---

## 📋 Purpose

This document defines the authentication and authorization design for the GridFlowX platform. Identity management, registration, session persistence, and token verification are driven by **Supabase Auth** (`@supabase/supabase-js`, `@supabase/ssr`, and backend GoTrue JWT verification).

---

## 🔑 Authentication Flow

```mermaid
sequenceDiagram
    participant USER as Client Browser
    participant SB_AUTH as Supabase Auth (GoTrue)
    participant FASTAPI as FastAPI Server
    participant SUPABASE_PG as Supabase PostgreSQL

    Note over USER,SB_AUTH: 1. User Authentication (Client)
    USER->>SB_AUTH: Sign in with Email / Password or OAuth
    SB_AUTH-->>USER: Return Session Object & Access Token (JWT)

    Note over USER,FASTAPI: 2. API / WebSocket Request
    USER->>FASTAPI: Request with Bearer <JWT_TOKEN>
    FASTAPI->>FASTAPI: Decode token & inspect claims
    FASTAPI->>SB_AUTH: Validate token signature / user session
    SB_AUTH-->>FASTAPI: Authenticated User (ID, Email, Role)
    
    alt Token Valid
        FASTAPI->>SUPABASE_PG: Execute Authorized Query
        SUPABASE_PG-->>FASTAPI: Query Result
        FASTAPI-->>USER: HTTP 200 / WebSocket Frames
    else Token Invalid / Expired
        FASTAPI-->>USER: 401 Unauthorized
    end
```

---

## 👥 Role-Based Access Control (RBAC)

User privileges are enforced at two layers:
1. **Application Layer (FastAPI Dependencies):** `require_operator_or_above`, `require_supervisor_or_above`, `require_admin_only`.
2. **Database Layer (Supabase PostgreSQL RLS):** Policies validating `auth.uid()` and `(auth.jwt() ->> 'role')`.

| Role | Hierarchy Weight | Permissions |
| --- | --- | --- |
| **User** | 1 | Basic user view |
| **Auditor** | 2 | Read-only access to telemetry, logs, and compliance records |
| **Operator** | 3 | Real-time telemetry monitoring; Manual relay overrides and load shedding |
| **Supervisor** | 4 | Operator controls + Alert resolution, emergency recovery authorization |
| **Admin** | 5 | Full system configuration, hardware calibration, user management |
