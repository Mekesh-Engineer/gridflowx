# 🔮 GridFlowX RBAC Page Specification — Superadmin Module (L4) & Utility Pages

## Software Requirements Specification (SRS) & System Design Document (SDD)

**Document ID:** `SDD-PAGES-05`
**Version:** 1.0
**Last Updated:** June 2026
**Classification:** SRS/SDD · RBAC Page Architecture · UI/UX Specification
**Maintained By:** Platform Architecture Team

---

# SUPERADMIN MODULE (L4)

# 1. System Dashboard

## 1.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | System Dashboard |
| **Route Path** | `/system` |
| **Accessible Roles** | Superadmin (L4) only |
| **Purpose** | Cross-tenant metrics, global API latency monitoring, server resource usage, and platform-wide health overview |
| **Business Objective** | Enable platform-level oversight for infrastructure capacity planning and SLA compliance |
| **User Workflow** | Login → System dashboard → Monitor global KPIs → Investigate tenant anomalies → Drill down to specific services |

## 1.2 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER BAR                                                              │
│ [☰] [GridFlowX PLATFORM] [System Overview]         [🔔 12] [👤 SA]       │
├────────┬────────────────────────────────────────────────────────────────┤
│SIDEBAR │  MAIN CONTENT                                                 │
│        │ ┌────────────────────────────────────────────────────────────┐ │
│ 💻 Sys │ │  GLOBAL KPI ROW (8 cards)                                 │ │
│ 🏢 Ten │ │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ...  │ │
│ 🛡️ Sec │ │  │Total│ │API  │ │WS   │ │AI   │ │DB   │ │Actv │      │ │
│ ⚖️ Comp│ │  │Tenant│ │p95  │ │Msgs │ │Infer│ │Quota│ │Users│      │ │
│ 📦 Infr│ │  │  28  │ │142ms│ │3.2K │ │22ms │ │ 42% │ │ 342 │      │ │
│ 📈 Mon │ │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘      │ │
│ 📋 Audt│ │ ┌──────────────────────────┬──────────────────────────┐   │ │
│ ⚙️ Glbl│ │ │  TENANT HEALTH GRID       │  SYSTEM RESOURCE GAUGES  │   │ │
│        │ │ │                          │                          │   │ │
│        │ │ │  [Tenant A] ● Healthy    │  CPU: [████████░░] 78%   │   │ │
│        │ │ │  [Tenant B] ● Warning    │  RAM: [██████░░░░] 62%   │   │ │
│        │ │ │  [Tenant C] ● Healthy    │  Disk:[████░░░░░░] 41%   │   │ │
│        │ │ │  [Tenant D] ● Critical   │  Net: [█████░░░░░] 55%   │   │ │
│        │ │ │                          │                          │   │ │
│        │ │ ├──────────────────────────┴──────────────────────────┤   │ │
│        │ │ │  API LATENCY TIMELINE (24-hour rolling)              │   │ │
│        │ │ │  [Time-series chart: p50, p95, p99 latency]          │   │ │
│        │ │ ├─────────────────────────────────────────────────────┤   │ │
│        │ │ │  GLOBAL ALERTS FEED                                  │   │ │
│        │ │ │  🚨 Tenant D: Firestore write limit exceeded - 2m ago  │   │ │
│        │ │ │  ⚠️ API p95 > 500ms for /telemetry/history - 5m       │   │ │
│        │ │ │  ℹ️ Tenant E: Feature flag 'v2_dashboard' enabled    │   │ │
│        │ │ └─────────────────────────────────────────────────────┘   │ │
└────────┴────────────────────────────────────────────────────────────────┘
```

## 1.3 Sections & Widgets

### Global KPI Row

| KPI | Source | Alert Threshold |
| :--- | :--- | :--- |
| Total Tenants | Firestore tenant count | N/A |
| API p95 Latency | Prometheus metrics | > 500ms → amber, > 2s → red |
| WebSocket Messages/min | Connection stats | < 1 → red (no data flow) |
| AI Inference p95 | FastAPI metrics | > 50ms → amber |
| DB Quota Usage | Firestore quota stats | > 85% → critical |
| Active Users (24h) | Session count | N/A |
| Error Rate (1h) | Prometheus counter | > 1% → red |
| Uptime (30d) | Computed | < 99.9% → amber |

### Tenant Health Grid

| Column | Description |
| :--- | :--- |
| Tenant Name | Organization name |
| Plan | Subscription tier badge |
| Nodes | Active / Allocated node count |
| Users | Active / Total user count |
| Health | Green (●) / Amber (●) / Red (●) computed score |
| Last Activity | Most recent API call timestamp |
| Actions | View Details, Suspend, Manage |

### System Resource Gauges

- CPU, RAM, Disk, Network utilization circular gauges
- Color gradient: Green (0-60%), Amber (60-80%), Red (80-100%)
- Sparkline history (last 1 hour)

### API Latency Timeline

- 24-hour rolling chart
- Three lines: p50, p95, p99
- Threshold overlay lines at warning/critical levels
- Click data point → drill into specific endpoint latencies

## 1.4 Modal Windows

### Tenant Quick Actions Modal

| Property | Value |
| :--- | :--- |
| **Trigger** | Click tenant row "Manage" |
| **Actions** | View tenant details, adjust resource limits, suspend tenant, send notification |
| **Confirmation** | Suspension requires typed confirmation |

## 1.5 API Requirements

| Method | Route | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/platform/dashboard` | Global KPIs and system metrics | Superadmin |
| `GET` | `/api/v1/platform/tenants/health` | Tenant health grid data | Superadmin |
| `GET` | `/api/v1/platform/metrics/latency` | API latency time-series | Superadmin |
| `GET` | `/api/v1/platform/resources` | Server resource utilization | Superadmin |
| `GET` | `/api/v1/platform/alerts/global` | Cross-tenant alert feed | Superadmin |

## 1.6 Performance Requirements

| Metric | Target |
| :--- | :--- |
| Dashboard load | < 3s (aggregating across tenants) |
| Metrics refresh | Every 15 seconds |
| Alert feed | Real-time push via WebSocket |

---

# 2. Tenant Management

## 2.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Tenant Management |
| **Route Path** | `/tenants` |
| **Accessible Roles** | Superadmin (L4) only |
| **Purpose** | Multi-tenant lifecycle control — provisioning, configuration, suspension, and resource allocation |

## 2.2 Sections & Widgets

### Tenant List Table

| Column | Type | Actions |
| :--- | :--- | :--- |
| Tenant ID | UUID | Copy |
| Organization Name | Text | Click → Detail view |
| Plan | Badge | — |
| Status | Active / Suspended / Trial | — |
| Nodes (Active/Limit) | Progress bar | — |
| Users (Active/Limit) | Progress bar | — |
| Monthly Revenue | Currency | — |
| Created | Date | — |
| Actions | Buttons | Edit, Suspend, Delete, View Audit |

### Tenant Detail View (Side Panel)

| Section | Content |
| :--- | :--- |
| Overview | Name, plan, status, billing, created date |
| Resource Usage | Nodes, users, API calls, storage used |
| Configuration | Custom limits, feature flags enabled |
| Recent Activity | Last 20 audit log entries for this tenant |
| Billing | Revenue, payment status, next billing date |

## 2.3 Modal Windows

### Provision New Tenant Modal

| Field | Type | Validation |
| :--- | :--- | :--- |
| Organization Name | Text | 2–200 chars, unique |
| Admin Email | Email | Valid format |
| Plan | Select | Starter / Professional / Enterprise |
| Node Limit | Number | 1–1000 |
| User Limit | Number | 1–500 |
| Custom Domain | Text (optional) | Valid domain format |
| Notes | Textarea | Max 1000 chars |

### Suspend Tenant Modal

| Property | Value |
| :--- | :--- |
| **Confirmation** | Type tenant name to confirm |
| **Effects** | All tenant users logged out, API access revoked, data preserved |
| **Reversible** | Yes — "Reactivate" action available |
| **Audit** | `TENANT_SUSPENDED` logged with reason |

### Adjust Resource Limits Modal

| Property | Value |
| :--- | :--- |
| **Fields** | Node limit (number), user limit (number), API rate limit (requests/min), storage limit (GB) |
| **Validation** | Must be ≥ current usage |
| **Audit** | `TENANT_LIMITS_UPDATED` logged |

## 2.4 API Requirements

| Method | Route | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/platform/tenants` | List all tenants | Superadmin |
| `POST` | `/api/v1/platform/tenants` | Provision new tenant | Superadmin |
| `GET` | `/api/v1/platform/tenants/:id` | Tenant detail view | Superadmin |
| `PUT` | `/api/v1/platform/tenants/:id` | Update tenant config | Superadmin |
| `POST` | `/api/v1/platform/tenants/:id/suspend` | Suspend tenant | Superadmin |
| `POST` | `/api/v1/platform/tenants/:id/reactivate` | Reactivate tenant | Superadmin |
| `DELETE` | `/api/v1/platform/tenants/:id` | Permanently delete tenant | Superadmin |
| `PUT` | `/api/v1/platform/tenants/:id/limits` | Adjust resource limits | Superadmin |

## 2.5 Database Integration

| Store / Service | Usage |
| :--- | :--- |
| **Firebase Firestore** | `tenants` and `tenantConfigurations` collections. |

---

# 3. Security Center

| Property | Value |
| :--- | :--- |
| **Route** | `/security` |
| **Roles** | Admin (L3 — tenant-scoped), Superadmin (L4 — global) |
| **Purpose** | Global firewall rules, brute-force protection settings, encryption key management |
| **Sections** | Active threats dashboard, IP blacklist/whitelist management, brute-force attempt log, encryption key rotation schedule, CORS configuration |
| **API** | `GET /api/v1/platform/security/rules`, `PUT /api/v1/platform/security/rules`, `GET /api/v1/platform/security/threats` |
| **Audit** | All security configuration changes logged as `SECURITY_RULE_UPDATED` |

# 4. Compliance Center

| Property | Value |
| :--- | :--- |
| **Route** | `/compliance` |
| **Roles** | Admin (L3 — tenant compliance), Superadmin (L4 — global) |
| **Purpose** | GDPR, SOC2, ISO 27001 compliance verification tools |
| **Sections** | Compliance checklist dashboard, data retention policies, data subject request (DSR) manager, compliance report generator, evidence collection tracker |
| **API** | `GET /api/v1/platform/compliance/status`, `POST /api/v1/platform/compliance/reports` |

# 5. Feature Flag Management

| Property | Value |
| :--- | :--- |
| **Route** | `/feature-flags` |
| **Roles** | Superadmin (L4) only |
| **Purpose** | Dynamic feature flag console for canary releases and A/B testing |
| **Sections** | Feature flag list with toggle switches, per-tenant overrides, rollout percentage sliders, flag history log |
| **Components** | Flag card: Name, Description, Status (Active/Inactive), Rollout %, Target tenants |
| **API** | `GET /api/v1/platform/features`, `PUT /api/v1/platform/features/:id`, `POST /api/v1/platform/features` |

# 6. Infrastructure Control

| Property | Value |
| :--- | :--- |
| **Route** | `/infrastructure` |
| **Roles** | Superadmin (L4) only |
| **Purpose** | Server cluster health monitoring, database connection pools, container orchestration |
| **Sections** | Server node list with health metrics, Docker container status, Firebase Firestore metrics, WebSocket server connection stats |
| **Components** | Server card: Hostname, CPU gauge, Memory gauge, Disk gauge, Container count, Status |
| **API** | `GET /api/v1/platform/infrastructure/servers`, `GET /api/v1/platform/infrastructure/containers`, `POST /api/v1/platform/infrastructure/restart/:service` |

# 7. Observability Center

| Property | Value |
| :--- | :--- |
| **Route** | `/monitoring` |
| **Roles** | Superadmin (L4) only |
| **Purpose** | Prometheus/Grafana metric dashboards, error tracking, distributed traces |
| **Sections** | Metric explorer (PromQL query builder), pre-built dashboards (API latency, error rate, throughput), alert rule configuration, on-call schedule |
| **Components** | Embeddable Grafana iframe or custom chart panels |
| **API** | `GET /api/v1/platform/metrics/:query`, `GET /api/v1/platform/alerts/rules` |

# 8. Global Settings

| Property | Value |
| :--- | :--- |
| **Route** | `/platform-settings` |
| **Roles** | Superadmin (L4) only |
| **Purpose** | Global platform styling, support contact settings, legal URLs, default tenant configuration |
| **Sections** | Platform branding (logo, colors, favicon), support email/phone settings, legal page URLs (privacy, terms), default tenant onboarding configuration, maintenance mode toggle |
| **API** | `GET /api/v1/platform/settings`, `PUT /api/v1/platform/settings` |

# 9. Incident Response Center

| Property | Value |
| :--- | :--- |
| **Route** | `/incident-center` |
| **Roles** | Superadmin (L4) only |
| **Purpose** | Platform-wide incident management, downtime coordination, network logs |
| **Sections** | Active incidents timeline, incident creation form, status page update controls, post-mortem template, affected services selector |
| **API** | `POST /api/v1/platform/incidents`, `PUT /api/v1/platform/incidents/:id`, `GET /api/v1/platform/incidents` |

# 10. Backup & Disaster Recovery

| Property | Value |
| :--- | :--- |
| **Route** | `/backup-recovery` |
| **Roles** | Superadmin (L4) only |
| **Purpose** | Database backup schedules, storage backup verification, restoration triggers |
| **Sections** | Backup schedule calendar, recent backups table (with size, duration, status), restore wizard, backup verification results, retention policy editor |
| **API** | `GET /api/v1/platform/backups`, `POST /api/v1/platform/backups/trigger`, `POST /api/v1/platform/backups/:id/restore` |

# 11. Global Audit Logs

| Property | Value |
| :--- | :--- |
| **Route** | `/audit/global` |
| **Roles** | Superadmin (L4) only |
| **Purpose** | Cross-tenant audit log search with advanced filtering |
| **Sections** | Same as Admin audit logs but with tenant filter added |
| **Additional Filters** | Tenant select, platform-level actions only, severity filter |
| **API** | `GET /api/v1/platform/audit/global?tenant=*&action=TENANT_SUSPENDED` |

# 12. Health Monitoring

| Property | Value |
| :--- | :--- |
| **Route** | `/system-health` |
| **Roles** | Superadmin (L4) only |
| **Purpose** | Microservice health checks, container logs, dependency status |
| **Sections** | Service dependency graph (mermaid-style), health check results table, container log viewer (tail), dependency version matrix |
| **API** | `GET /api/v1/platform/health`, `GET /api/v1/platform/logs/:service` |

---

# ENTERPRISE UTILITY PAGES

# 13. Global Search

## 13.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Global Search |
| **Route Path** | `/search` |
| **Accessible Roles** | All Authenticated |
| **Purpose** | Platform-wide search across users, sites, documents, audit logs, and alerts |

## 13.2 Sections & Widgets

### Search Interface

| Component | Description |
| :--- | :--- |
| Search Bar | Full-width input with auto-complete, keyboard shortcut (`Ctrl+K`) |
| Category Tabs | All, Users, Sites, Documents, Alerts, Audit Logs |
| Result Cards | Type-specific cards with icon, title, excerpt, relevance score |
| Filters | Date range, category, author, severity |

### Search Results

| Result Type | Display | Click Action |
| :--- | :--- | :--- |
| User | Avatar, name, role, email | Navigate to user profile |
| Site | Name, location, health badge | Navigate to site detail |
| Document | Title, category, updated date | Open document viewer |
| Alert | Severity badge, message, timestamp | Open alert detail |
| Audit Log | Action, user, timestamp | Navigate to audit log with filter |

## 13.3 API Requirements

| Method | Route | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/search?q=keyword&type=all` | Global search query | All (scoped by role) |
| `GET` | `/api/v1/search/suggestions?q=partial` | Auto-complete suggestions | All |

## 13.4 Security

- Search results are **scoped by role** — Operators only see their assigned resources
- Search queries are logged for analytics (not audit)
- Rate limit: 30 searches per minute per user

---

# 14. Export Center

| Property | Value |
| :--- | :--- |
| **Route** | `/exports` |
| **Roles** | Supervisor+ |
| **Purpose** | Queue status for asynchronous report and data export jobs |
| **Sections** | Active exports (with progress bars), completed exports (download links, 72h retention), failed exports (with retry) |
| **Components** | Job card: Type, date range, format, status (Queued/Processing/Complete/Failed), progress %, file size, download button |
| **API** | `GET /api/v1/exports`, `GET /api/v1/exports/:id/download`, `POST /api/v1/exports/:id/retry` |

# 15. Import Center

| Property | Value |
| :--- | :--- |
| **Route** | `/imports` |
| **Roles** | Admin+ |
| **Purpose** | Bulk data import tool — CSV parsing for users, fleet inventory, site configurations |
| **Sections** | File upload zone (drag & drop), column mapping preview, validation results, import history |
| **Workflow** | Upload CSV → Auto-detect columns → Map to fields → Dry run validation → Review results → Execute import |
| **API** | `POST /api/v1/imports/upload`, `POST /api/v1/imports/:id/validate`, `POST /api/v1/imports/:id/execute` |

# 16. Webhooks Configuration

| Property | Value |
| :--- | :--- |
| **Route** | `/webhooks` |
| **Roles** | Admin+ |
| **Purpose** | Event subscription builder for external integrations |
| **Sections** | Webhook list, create webhook form, event type selector, delivery logs, test webhook button |
| **Event Types** | `alert.created`, `override.activated`, `user.created`, `config.updated`, `incident.reported` |
| **API** | `POST /api/v1/webhooks`, `GET /api/v1/webhooks`, `PUT /api/v1/webhooks/:id`, `DELETE /api/v1/webhooks/:id`, `POST /api/v1/webhooks/:id/test` |

# 17. Activity Logs

| Property | Value |
| :--- | :--- |
| **Route** | `/logs` |
| **Roles** | Admin+ |
| **Purpose** | Live system event debugging stream |
| **Sections** | Real-time log viewer (tailing), log level filter (DEBUG/INFO/WARN/ERROR), service filter, search within logs |
| **API** | WebSocket stream: `system_logs` room |

# 18. Feedback Portal

| Property | Value |
| :--- | :--- |
| **Route** | `/feedback` |
| **Roles** | All Authenticated |
| **Purpose** | User feedback collection, feature requests, bug reports, satisfaction ratings |
| **Sections** | Submit feedback form, my feedback history, trending feature requests (Admin view) |
| **Form Fields** | Type (Bug/Feature/Improvement/General), Subject, Description, Priority, Screenshots (upload) |
| **API** | `POST /api/v1/feedback`, `GET /api/v1/feedback` |

# 19. Release Notes

| Property | Value |
| :--- | :--- |
| **Route** | `/release-notes` |
| **Roles** | All Authenticated |
| **Purpose** | Dynamic markdown feed of platform updates, new features, and bug fixes |
| **Sections** | Chronological release list, version badges, change category tags (New/Improved/Fixed/Breaking) |
| **API** | `GET /api/v1/release-notes` |

---

# CROSS-CUTTING SPECIFICATIONS

## Error Handling Strategy (All Pages)

| Error Category | User Experience | Recovery Mechanism |
| :--- | :--- | :--- |
| **Validation Errors** | Inline field errors with red border + message below field | Fix field and resubmit |
| **Network Failures** | Banner: "Connection lost. Retrying..." with countdown | Auto-retry with exponential backoff |
| **Authentication Expired** | Modal: "Session expired. Please sign in again." | Redirect to `/login` with return URL |
| **Authorization Denied** | Toast: "You don't have permission for this action." | No recovery — escalate to admin |
| **WebSocket Disconnect** | Banner + stale data warning | Auto-reconnect with backoff |
| **AI Service Down** | Badge: "AI Offline" + graceful degradation | System operates on last-known state |
| **Rate Limit Hit** | Toast: "Too many requests. Please wait X seconds." | Cooldown timer |
| **Server Error (500)** | Toast: "Something went wrong. Please try again." | Retry button |

## Global State Management Summary

| Store | Used By | Persistence | Key State |
| :--- | :--- | :--- | :--- |
| `auth.store` | All pages | localStorage (refresh token + theme) | user, tokens, role, isAuthenticated |
| `telemetry.store` | Dashboard, Operations | None (volatile) | metrics, relays, alerts, connection status |
| `agent.store` | Dashboard | None (volatile) | lastDecision, forecasts, anomalyScores |
| `config.store` | Settings page | None | thresholds, calibration, save status |
| `ui.store` | All pages | localStorage | sidebar collapsed, theme, notification preferences |

## Global Testing Strategy

### Unit Test Coverage Targets
- Components: 80%
- Hooks: 90%
- Store actions: 95%
- Utility functions: 100%

### Integration Test Coverage
- All API endpoints with valid and invalid payloads
- WebSocket connection lifecycle (connect, reconnect, disconnect)
- RBAC enforcement for every protected endpoint

### E2E Test Scenarios

| Scenario | Description | Roles Tested |
| :--- | :--- | :--- |
| Full Login Flow | Credentials → Dashboard → Verify role-appropriate content | All 4 roles |
| Operator Override | Login → Dashboard → Toggle relay → Confirm → See countdown | Operator |
| Emergency Shutdown | Login → Dashboard → Emergency stop → Confirm → Locked state | Operator |
| Supervisor Approval | Login → Approvals → Review request → Approve → Operator notified | Supervisor |
| Admin User CRUD | Login → Users → Create → Edit role → Deactivate → Verify audit | Admin |
| Config Management | Login → Settings → Edit threshold → Save → Verify audit | Admin |
| Tenant Provisioning | Login → Tenants → Create → Verify provisioned → Assign limits | Superadmin |
| RBAC Enforcement | Attempt unauthorized route → Verify redirect/403 | All 4 roles |
| Offline Recovery | Disconnect network → Verify banner → Reconnect → Data resumes | All |

## Global Performance Budget

| Page Category | FCP Target | LCP Target | TTI Target | API p95 |
| :--- | :--- | :--- | :--- | :--- |
| Public pages | < 1.5s | < 2.5s | < 3.5s | < 500ms |
| Auth pages | < 1.0s | < 1.5s | < 2.0s | < 500ms |
| Dashboard | < 2.0s | < 3.0s | < 4.0s | < 100ms (cached) |
| Analytics | < 2.5s | < 4.0s | < 5.0s | < 2000ms (query) |
| Admin pages | < 1.5s | < 2.5s | < 3.0s | < 500ms |
| Superadmin | < 3.0s | < 4.0s | < 5.0s | < 1000ms (aggregation) |

---

## 📐 Architecture Notes

- Superadmin pages query across all tenant configurations in Firestore
- Feature flags are evaluated at the middleware level and verified against custom claims
- The backup system uses Firestore export operations and scheduled functions
- Global search uses Firestore querying and client-side filtering
- Rate limiting for search is implemented per-user (not per-IP) to prevent abuse

## 🗺️ Related Documents

| Document | Purpose |
| :--- | :--- |
| [Pages.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/Pages/Pages.md) | Original page definitions and RBAC matrix |
| [01_Public_Pages_Spec.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/Pages/01_Public_Pages_Spec.md) | Public & auth page specifications |
| [02_Operator_Pages_Spec.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/Pages/02_Operator_Pages_Spec.md) | Operator module specifications |
| [03_Supervisor_Pages_Spec.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/Pages/03_Supervisor_Pages_Spec.md) | Supervisor module specifications |
| [04_Admin_Pages_Spec.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/Pages/04_Admin_Pages_Spec.md) | Admin module specifications |
| [04_System_Architecture.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/04_System_Architecture.md) | System architecture overview |
| [12_Access_Control.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/12_Access_Control.md) | RBAC permission matrix |
| [18_Performance_Benchmarking.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/18_Performance_Benchmarking.md) | Performance targets and methodology |
