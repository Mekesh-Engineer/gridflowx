# 📈 GridFlowX RBAC Page Specification — Supervisor Module (L2)

## Software Requirements Specification (SRS) & System Design Document (SDD)

**Document ID:** `SDD-PAGES-03`
**Version:** 1.0
**Last Updated:** June 2026
**Classification:** SRS/SDD · RBAC Page Architecture · UI/UX Specification
**Maintained By:** Platform Architecture Team

---

# 1. Supervisor Dashboard

## 1.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Supervisor Dashboard |
| **Route Path** | `/dashboard/supervisor` |
| **Accessible Roles** | Supervisor (L2), Admin (L3), Superadmin (L4) |
| **Purpose** | Combined team KPIs, multi-site incident map, and aggregated alerts panel for fleet oversight |
| **Business Objective** | Enable supervisors to monitor team performance, approve overrides, and maintain fleet-wide situational awareness |
| **User Workflow** | Login → Supervisor dashboard auto-loads → Review team KPIs → Monitor multi-site map → Process approvals → Generate reports |

## 1.2 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER BAR                                                              │
│ [☰] [GridFlowX] [Supervisor Dashboard]           [🔔 5] [📤 2] [👤]     │
├────────┬────────────────────────────────────────────────────────────────┤
│SIDEBAR │  MAIN CONTENT                                                 │
│        │ ┌────────────────────────────────────────────────────────────┐ │
│ 📊 Dash│ │  SUPERVISOR KPI ROW (6 cards)                             │ │
│ 📈 Anly│ │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │ │
│ 🔋 Ctrl│ │  │Active│ │Team  │ │Fleet │ │Alerts│ │Avg   │ │Carbon│ │ │
│ 👥 Team│ │  │Sites │ │Online│ │Health│ │Today │ │Resp  │ │Saved │ │ │
│ 📄 Rpts│ │  │  12  │ │  8/9 │ │ 94%  │ │  23  │ │2.3min│ │142kg │ │ │
│ ✅ Aprv│ │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ │ │
│ 🔄 Work│ │ ┌───────────────────────┬──────────────────────────────┐   │ │
│ 📞 Supp│ │ │  MULTI-SITE MAP       │  PENDING APPROVALS           │   │ │
│        │ │ │                       │                              │   │ │
│        │ │ │  [Interactive Map]    │  🟡 Override Ext: Relay T3   │   │ │
│        │ │ │  • Site markers       │     Operator: J. Smith       │   │ │
│        │ │ │  • Color = health     │     Duration: 2 hours        │   │ │
│        │ │ │  • Click = drill down │     [Approve] [Deny]         │   │ │
│        │ │ │                       │                              │   │ │
│        │ │ │                       │  🟡 Threshold Override       │   │ │
│        │ │ │                       │     Reason: Calibration      │   │ │
│        │ │ │                       │     [Approve] [Deny]         │   │ │
│        │ │ ├───────────────────────┴──────────────────────────────┤   │ │
│        │ │ │  TEAM PERFORMANCE TABLE                              │   │ │
│        │ │ │  Name    | Role     | Status | Overrides | Avg Resp  │   │ │
│        │ │ │  J.Smith | Operator | Online | 3 today   | 1.8 min   │   │ │
│        │ │ │  A.Jones | Operator | Offline| 1 today   | 2.5 min   │   │ │
│        │ │ └──────────────────────────────────────────────────────┘   │ │
│        │ └────────────────────────────────────────────────────────────┘ │
└────────┴────────────────────────────────────────────────────────────────┘
```

## 1.3 Sections & Widgets

### Supervisor KPI Row

| KPI | Data Source | Color | Description |
| :--- | :--- | :--- | :--- |
| Active Sites | `fleet.activeSites` | Bus Cyan | Count of online microgrid sites |
| Team Online | `team.onlineCount / team.totalCount` | State Green | Active operators / total |
| Fleet Health | `fleet.avgHealthScore` | State Green / Amber / Red | Aggregate health percentage |
| Alerts Today | `alerts.todayCount` | Amber | Total alerts received today |
| Avg Response Time | `team.avgResponseTime` | Green / Amber | Mean override response time |
| Carbon Displaced | `analytics.carbonSaved` | Emerald | Estimated CO₂ reduction (kg) |

### Multi-Site Map

| Property | Value |
| :--- | :--- |
| **Purpose** | Geographic visualization of all managed microgrid sites |
| **Components** | Interactive map with site markers, color-coded by health (green/amber/red), cluster grouping at zoom levels |
| **Interactions** | Click marker → site detail popup → "View Site" navigation link |
| **Data Source** | `GET /api/v1/sites` with coordinates and health scores |
| **Update Frequency** | Every 30 seconds |

### Pending Approvals Panel

| Property | Value |
| :--- | :--- |
| **Purpose** | Queue of operator requests awaiting supervisor approval |
| **Components** | Card list with approve/deny buttons, request details, operator name |
| **Types** | Extended relay overrides (>30min), threshold override requests, maintenance approvals |
| **Real-Time** | Push notification when new approval request arrives |

### Team Performance Table

| Column | Description |
| :--- | :--- |
| Operator Name | Full name with avatar |
| Role | L1 Operator |
| Status | Online (green dot) / Offline (gray dot) / Busy (amber dot) |
| Active Site | Currently assigned microgrid |
| Overrides Today | Count of overrides performed |
| Avg Response | Mean alert response time |
| Actions | View Activity, Send Message |

## 1.4 Modal Windows

### Approval Decision Modal

| Property | Value |
| :--- | :--- |
| **Modal Name** | Override Approval Decision |
| **Trigger** | Click "Approve" or "Deny" on pending approval |
| **Purpose** | Review full request details and record decision |
| **Form Fields** | Decision (approve/deny, radio), Notes (textarea, required on deny, 10–500 chars) |
| **Validation** | Notes required when denying |
| **Success State** | Toast: "Override approved for 2 hours" or "Override request denied" |
| **Audit** | `OVERRIDE_APPROVED` or `OVERRIDE_DENIED` logged |

### Operator Detail Modal

| Property | Value |
| :--- | :--- |
| **Trigger** | Click operator name in team table |
| **Content** | Operator profile, shift schedule, recent actions timeline, performance metrics chart |
| **Actions** | "Assign Task", "Send Notification" |

## 1.5 Micro Animations

| Animation | Trigger | Duration | UX Purpose |
| :--- | :--- | :--- | :--- |
| Map marker pulse | New alert at site | 2s infinite | Draw attention to affected site |
| Approval card slide-in | New request arrives | 300ms | Notification of pending work |
| Team status dot transition | Online ↔ Offline | 200ms | Real-time presence feedback |
| KPI counter roll | Data refresh | 500ms | Smooth metric updates |
| Approval card dismiss | Approve/Deny completed | 300ms slide-out | Card removal feedback |

## 1.6 API Requirements

| Method | Route | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/dashboard/supervisor` | Aggregated supervisor KPIs | Supervisor+ |
| `GET` | `/api/v1/team/operators` | Team roster with status | Supervisor+ |
| `GET` | `/api/v1/approvals/pending` | Pending approval requests | Supervisor+ |
| `POST` | `/api/v1/approvals/:id/decide` | Approve or deny request | Supervisor+ |
| `GET` | `/api/v1/sites/map-data` | Site locations + health scores | Supervisor+ |
| `GET` | `/api/v1/analytics/carbon-displacement` | Carbon savings metrics | Supervisor+ |

## 1.7 Security & RBAC

| Rule | Detail |
| :--- | :--- |
| **Allowed Roles** | Supervisor (L2), Admin (L3), Superadmin (L4) |
| **Operator access** | Operators are redirected to `/dashboard` (operator view) |
| **Approval authority** | Only Supervisor+ can approve/deny extended overrides |
| **Team data scope** | Supervisors see only operators within their assigned tenant |
| **Audit** | All approval decisions logged with supervisor ID, timestamp, notes |

---

# 2. Analytics Center

## 2.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Analytics Center |
| **Route Path** | `/analytics` |
| **Accessible Roles** | Supervisor (L2), Admin (L3), Superadmin (L4) |
| **Purpose** | Multi-site performance statistics, AI forecasting accuracy charts, and energy efficiency analysis |
| **Business Objective** | Data-driven decision making through historical trend analysis and forecast accuracy tracking |

## 2.2 Sections & Widgets

### Date Range & Filter Controls

| Control | Type | Options |
| :--- | :--- | :--- |
| Date Range Picker | Date range | Presets: Last 24h, 7d, 30d, 90d, Custom |
| Site Filter | Multi-select | All sites or specific sites |
| Metric Filter | Multi-select | Solar, Load, Battery, Temperature, Voltage |
| Resolution | Select | 1min, 5min, 15min, 1h, 1d |

### Energy Performance Charts

| Chart | Type | Data Source | Purpose |
| :--- | :--- | :--- | :--- |
| Solar Generation vs Load | Dual-axis area chart | Firestore telemetry collection | Compare generation and consumption patterns |
| Battery SoC History | Area chart with threshold lines | Firestore telemetry collection | Track SoC trends and shedding thresholds |
| Energy Balance | Stacked bar chart | Computed from telemetry | Solar vs Grid vs Battery contribution breakdown |
| Self-Sufficiency Trend | Line chart with percentage | Computed metric | Track grid independence over time |

### Forecast Accuracy Panel

| Chart | Type | Metrics |
| :--- | :--- | :--- |
| Solar Forecast vs Actual | Overlay line chart (solid=actual, dashed=forecast) | MAE, MAPE per period |
| Load Forecast vs Actual | Overlay line chart | MAE, MAPE per period |
| Accuracy Trend | Line chart (30-day rolling) | MAE% over time, regression detection |
| Confidence Band | Shaded area around forecast | 95% prediction interval |

### AI Model Performance Dashboard

| Widget | Description |
| :--- | :--- |
| Model Version | Current deployed model ID and date |
| Solar Forecast MAE | Rolling 30-day mean absolute error (target: ≤12%) |
| Load Forecast MAPE | Rolling 30-day mean absolute percentage error (target: ≤8%) |
| Anomaly Detection F1 | Monthly F1 score (target: ≥0.85) |
| RL Cumulative Reward | Comparison vs baseline static policy |
| Inference Latency p95 | 95th percentile inference time (target: <50ms) |

## 2.3 Modal Windows

### Export Configuration Modal

| Property | Value |
| :--- | :--- |
| **Trigger** | Click "Export" button |
| **Purpose** | Configure data export parameters |
| **Fields** | Format (CSV/PDF/JSON), Date range, Metrics to include, Include charts (PDF only) |
| **Validation** | At least one metric selected; date range ≤ 90 days per export |

### Chart Annotation Modal

| Property | Value |
| :--- | :--- |
| **Trigger** | Right-click on chart data point |
| **Purpose** | Add contextual annotations to charts (e.g., "Maintenance window", "Storm event") |
| **Fields** | Annotation text, color, display duration |
| **Role** | Supervisor+ |

## 2.4 Functional Requirements

| Function | Description |
| :--- | :--- |
| **Historical Query** | Query Firestore with configurable date range and resolution |
| **Forecast Overlay** | Toggle predicted vs actual overlay on any telemetry chart |
| **Cross-Site Comparison** | Side-by-side performance comparison of multiple sites |
| **Anomaly Highlighting** | Automatically highlight periods where anomaly scores exceeded thresholds |
| **Data Export** | Export to CSV, PDF, and JSON formats |
| **Chart Annotations** | Add notes to specific time points for context |
| **Drill Down** | Click chart data point → zoom to 15-minute resolution around that time |

## 2.5 API Requirements

| Method | Route | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/telemetry/historical` | Query historical telemetry | Supervisor+ |
| `GET` | `/api/v1/analytics/performance` | Aggregated performance KPIs | Supervisor+ |
| `GET` | `/api/v1/analytics/forecast-accuracy` | AI forecast accuracy metrics | Supervisor+ |
| `GET` | `/api/v1/analytics/energy-balance` | Energy source breakdown | Supervisor+ |
| `GET` | `/api/v1/analytics/carbon-displacement` | Carbon displacement calculation | Supervisor+ |
| `POST` | `/api/v1/exports/generate` | Queue export job | Supervisor+ |
| `GET` | `/api/v1/exports/:id/status` | Check export job status | Supervisor+ |
| `GET` | `/api/v1/exports/:id/download` | Download completed export | Supervisor+ |

## 2.6 Database Integration

| Store | Usage |
| :--- | :--- |
| **Firebase Firestore** | `telemetry` collection queries for analytics charts, and `alerts` collection for audit logs. |

## 2.7 Performance Requirements

| Metric | Target |
| :--- | :--- |
| Historical query (7d @ 15min) | < 2000ms |
| Historical query (30d @ 1h) | < 3000ms |
| Chart render (1000 data points) | < 100ms |
| Export generation (7d CSV) | < 10s |
| Export generation (30d PDF) | < 30s |

---

# 3. Microgrid Array Control

## 3.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Microgrid Array Control |
| **Route Path** | `/fleet/control` |
| **Accessible Roles** | Supervisor (L2), Admin (L3), Superadmin (L4) |
| **Purpose** | Advanced fleet asset management with thermal limits control and health monitoring |

## 3.2 Sections & Widgets

### Fleet Overview Grid

| Property | Value |
| :--- | :--- |
| **Components** | Node cards organized by type (Solar, Battery, Inverter, Relay) |
| **Display** | Health score gauge, current metrics, last heartbeat, alerts count |
| **Actions** | Select multiple nodes for bulk operations |

### Thermal Limits Control

| Property | Value |
| :--- | :--- |
| **Purpose** | Monitor and configure temperature thresholds per asset |
| **Components** | Temperature gauge per asset, warning/shutdown threshold indicators, historical temp chart |
| **Editable** | Warning threshold (Supervisor+), shutdown threshold (Admin+ only) |

### Asset Health Timeline

| Property | Value |
| :--- | :--- |
| **Purpose** | Historical health score trend per asset |
| **Components** | Sparkline charts per node, annotated with maintenance events |

## 3.3 API Requirements

| Method | Route | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/fleet/control/overview` | Fleet control summary | Supervisor+ |
| `PUT` | `/api/v1/fleet/nodes/:id/thermal-limits` | Update thermal thresholds | Supervisor+ |
| `POST` | `/api/v1/fleet/nodes/bulk-action` | Bulk operations on selected nodes | Supervisor+ |

---

# 4. Approval Center

## 4.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Approval Center |
| **Route Path** | `/approvals` |
| **Accessible Roles** | Supervisor (L2), Admin (L3), Superadmin (L4) |
| **Purpose** | Central queue for processing override extension requests and threshold overrides |

## 4.2 Sections & Widgets

### Pending Approvals Queue

| Column | Description |
| :--- | :--- |
| Request ID | Auto-generated identifier |
| Type | Override Extension / Threshold Override / Maintenance Approval |
| Requester | Operator name + avatar |
| Description | Request details and reason |
| Priority | Low / Medium / High (color-coded) |
| Submitted | Relative timestamp |
| Actions | Approve / Deny / Request Info |

### Approval History Tab

| Column | Description |
| :--- | :--- |
| Request ID | Identifier |
| Type | Request type |
| Requester | Operator name |
| Decision | Approved (green) / Denied (red) |
| Decided By | Supervisor name |
| Decision Date | Timestamp |
| Notes | Approval/denial notes |

## 4.3 Modal Windows

### Request Detail & Decision Modal

| Property | Value |
| :--- | :--- |
| **Trigger** | Click request row |
| **Content** | Full request details, operator's override history, site current state, risk assessment |
| **Fields** | Decision (Approve/Deny), Duration adjustment (if approving), Notes (required for deny) |
| **Audit** | Every decision creates audit log entry |

## 4.4 API Requirements

| Method | Route | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/approvals` | List all approvals (filterable by status) | Supervisor+ |
| `GET` | `/api/v1/approvals/:id` | Get approval details | Supervisor+ |
| `POST` | `/api/v1/approvals/:id/decide` | Submit approval decision | Supervisor+ |
| `POST` | `/api/v1/approvals/:id/request-info` | Request additional info from operator | Supervisor+ |

---

# 5. Operational Reports

## 5.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Operational Reports |
| **Route Path** | `/reports` |
| **Accessible Roles** | Supervisor (L2), Admin (L3), Superadmin (L4) |
| **Purpose** | Interactive report builder with multi-format export capabilities |

## 5.2 Sections & Widgets

### Report Builder

| Property | Value |
| :--- | :--- |
| **Purpose** | Visual query builder for custom report generation |
| **Components** | Date range picker, metric selector, grouping (by site/day/week), chart type selector |
| **Output** | Interactive preview with chart and data table |

### Predefined Report Templates

| Template | Description | Data Source |
| :--- | :--- | :--- |
| Daily Operations Summary | KPIs, alerts, overrides for the day | Telemetry + Alerts |
| Weekly Energy Report | Generation, consumption, efficiency trends | Firestore telemetry documents |
| Monthly Performance Review | Full performance metrics with AI accuracy | All data sources |
| Carbon Displacement Report | Environmental impact metrics | Computed from telemetry |
| Team Performance Report | Operator metrics and response times | Audit logs + telemetry |

### Export Center

| Format | Description | Features |
| :--- | :--- | :--- |
| CSV | Raw data export | Column selection, encoding options |
| PDF | Formatted report with charts | Company branding, executive summary |
| Excel (XLSX) | Spreadsheet with multiple tabs | Pivot table ready, formulas preserved |

## 5.3 API Requirements

| Method | Route | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/reports/generate` | Generate report from query | Supervisor+ |
| `GET` | `/api/v1/reports/templates` | List report templates | Supervisor+ |
| `POST` | `/api/v1/reports/export` | Export report in specified format | Supervisor+ |
| `GET` | `/api/v1/reports/history` | Previously generated reports | Supervisor+ |

---

# 6. Team Operations (`/team/operations`)

## 6.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Team Operations |
| **Route Path** | `/team/operations` |
| **Accessible Roles** | Supervisor (L2), Admin (L3), Superadmin (L4) |
| **Purpose** | Active operator roster, task allocation dashboard, and shift management |

## 6.2 Sections & Widgets

### Active Roster

- Operator cards with online status, current task, assigned site
- Drag-and-drop task assignment
- Shift indicator (current shift highlighted)

### Task Allocation Dashboard

- Kanban board: Unassigned → Assigned → In Progress → Complete
- Drag tasks between operators
- Auto-assignment suggestions based on proximity and availability

### Shift Calendar

- Weekly/monthly shift calendar view
- Color-coded by operator
- Conflict detection for overlapping shifts

## 6.3 API Requirements

| Method | Route | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/team/operators` | List operators with status | Supervisor+ |
| `POST` | `/api/v1/team/tasks/assign` | Assign task to operator | Supervisor+ |
| `GET` | `/api/v1/team/shifts` | Get shift schedule | Supervisor+ |
| `PUT` | `/api/v1/team/shifts/:id` | Update shift assignment | Supervisor+ |

---

# 7. Performance Reports (`/performance`)

| Property | Value |
| :--- | :--- |
| **Route** | `/performance` |
| **Roles** | Supervisor+  |
| **Purpose** | Carbon displacement metrics, overall energy efficiency tracking, cost savings |
| **Sections** | Energy efficiency dashboard, carbon savings trend, cost analysis, comparison benchmarks |

---

# 8. Workflow Tracking (`/workflows`)

| Property | Value |
| :--- | :--- |
| **Route** | `/workflows` |
| **Roles** | Supervisor+ |
| **Purpose** | Track AI model retraining progress and automated load shedding sequences |
| **Sections** | Active workflow list, workflow detail timeline, automation trigger history |
| **Components** | Step-by-step progress indicator, log viewer, outcome metrics |

---

## 📐 Architecture Notes

- Supervisor pages aggregate data across multiple operator scopes using tenant-level queries
- The approval system uses a pub/sub pattern — new requests push notifications to all online supervisors
- Report generation is an async BullMQ job — status is polled via the export queue
- Map visualizations use a lightweight SVG-based map (not Google Maps) to avoid external API costs

## 🗺️ Related Documents

| Document | Purpose |
| :--- | :--- |
| [02_Features_and_Functionality.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/02_Features_and_Functionality.md) | Feature requirements |
| [08_Agent_Workflows.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/08_Agent_Workflows.md) | AI workflow definitions |
| [18_Performance_Benchmarking.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/18_Performance_Benchmarking.md) | Performance targets |
