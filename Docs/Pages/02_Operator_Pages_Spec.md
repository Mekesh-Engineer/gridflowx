# 🔧 GridFlowX RBAC Page Specification — Operator Module (L1) & Shared Pages

## Software Requirements Specification (SRS) & System Design Document (SDD)

**Document ID:** `SDD-PAGES-02`
**Version:** 1.0
**Last Updated:** June 2026
**Classification:** SRS/SDD · RBAC Page Architecture · UI/UX Specification
**Maintained By:** Platform Architecture Team

---

# 1. Operations Dashboard

## 1.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Dashboard (Operator View) |
| **Route Path** | `/dashboard` |
| **Accessible Roles** | Operator (L1), Supervisor (L2), Admin (L3), Superadmin (L4) |
| **Purpose** | Real-time operational monitoring hub — live telemetry, power flow visualization, battery SoC, active alerts, and manual relay override controls |
| **Business Objective** | Enable operators to maintain situational awareness of microgrid health and respond to anomalies within seconds |
| **User Workflow** | Login → Dashboard auto-loads → WebSocket connects → Live telemetry streams → Monitor KPIs → Respond to alerts → Toggle overrides if needed |

## 1.2 Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│ HEADER BAR                                                              │
│ [☰ Menu] [GridFlowX Logo] [Breadcrumb: Dashboard]    [🔔 3] [👤 Profile] │
├────────┬────────────────────────────────────────────────────────────────┤
│ SIDEBAR│  MAIN CONTENT AREA                                            │
│        │ ┌────────────────────────────────────────────────────────────┐ │
│ 📊 Dash│ │  CONNECTION STATUS BAR                                    │ │
│ ⚙️ Ops │ │  [● Connected] [Last Update: 2s ago] [WS: ●] [AI: ●]     │ │
│ 🔋 Fleet│ ├────────────────────────────────────────────────────────────┤ │
│ 📍 Sites│ │  KPI WIDGET ROW (4 cards)                                 │ │
│ 📝 Tasks│ │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │ │
│ ⚠️ Incid│ │  │Solar Gen│ │Load Use │ │Batt SoC │ │Bus Volt │       │ │
│ 🔧 Maint│ │  │ 342.5 W │ │ 48.2 W  │ │ 72.3 %  │ │ 12.15 V │       │ │
│ 📞 Supp│ │  │ ▲ +5.2% │ │ ▼ -1.8% │ │ ▲ +2.3% │ │ ● Normal│       │ │
│        │ │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │ │
│        │ ├─────────────────────────┬──────────────────────────────────┤ │
│        │ │  SANKEY POWER FLOW      │  RELAY CONTROL PANEL            │ │
│        │ │                         │                                  │ │
│        │ │  [Solar] ──▶ [Bus] ──▶  │  Tier 1 (Critical)   [● ON ]   │ │
│        │ │  [Grid]  ──▶ [Load]     │  Tier 2 (Important)  [● ON ]   │ │
│        │ │  [Batt]  ◀──▶ [MPPT]   │  Tier 3 (Flexible)   [○ OFF]   │ │
│        │ │                         │  MPPT Enable          [● ON ]   │ │
│        │ │  Animated flow lines    │  Grid Fallback        [○ OFF]   │ │
│        │ │                         │                                  │ │
│        │ │                         │  [⚠ EMERGENCY STOP]             │ │
│        │ ├─────────────────────────┴──────────────────────────────────┤ │
│        │ │  BOTTOM ROW                                                │ │
│        │ │  ┌─────────────────────┐  ┌─────────────────────────────┐ │ │
│        │ │  │ AI DECISION PANEL   │  │ ALERTS PANEL                │ │ │
│        │ │  │ 🧠 "Discharging     │  │ ⚠ SoC below 40% - 2m ago  │ │ │
│        │ │  │ battery at 3.2A"    │  │ ℹ Model retrained - 15m    │ │ │
│        │ │  │ Confidence: 82%     │  │ 🚨 Temp warning - 1h ago   │ │ │
│        │ │  │ Latency: 22.8ms     │  │                             │ │ │
│        │ │  └─────────────────────┘  └─────────────────────────────┘ │ │
│        │ └────────────────────────────────────────────────────────────┘ │
└────────┴────────────────────────────────────────────────────────────────┘
```

### Responsive Behavior

| Breakpoint | Layout |
| :--- | :--- |
| **≥1536px (Control Room)** | 4-column KPI row, Sankey + Relay side-by-side, AI + Alerts side-by-side |
| **1280–1535px (Desktop)** | Same as above, slightly compressed |
| **1024–1279px (Laptop)** | Sidebar collapses to icons, 2-column KPI row |
| **768–1023px (Tablet)** | Sidebar hidden (hamburger), stacked sections |
| **<768px (Mobile)** | Single column, compact KPI cards, simplified Sankey |

## 1.3 Sections & Widgets

### Section: Connection Status Bar

| Property | Value |
| :--- | :--- |
| **Purpose** | Show real-time system connectivity health |
| **Display Conditions** | Always visible at top of main content |
| **Role Visibility** | All authenticated roles |
| **Components** | WebSocket status indicator (green/amber/red dot), last telemetry timestamp, FastAPI service status, AI service status |
| **Data Source** | `telemetryStore.isConnected`, `telemetryStore.lastUpdateTimestamp` |
| **Update Frequency** | Real-time (1Hz) |

### Section: KPI Widget Row

| Property | Value |
| :--- | :--- |
| **Purpose** | At-a-glance microgrid health metrics |
| **Display Conditions** | Always visible |
| **Role Visibility** | All authenticated roles |

**KPI Cards:**

| Widget | Data Field | Unit | Trend Source | Color |
| :--- | :--- | :--- | :--- | :--- |
| Solar Generation | `metrics.solar_power_w` | W | 1-hour delta | Irradiance Amber (#FBBF24) |
| Load Consumption | `metrics.load_power_w` | W | 1-hour delta | Utility Crimson (#EF4444) |
| Battery SoC | `metrics.battery_soc_percent` | % | 1-hour delta | State Green (#10B981) |
| Bus Voltage | `metrics.bus_voltage_v` | V | Normal/Warning/Critical | Bus Cyan (#06B6D4) |

**Additional KPI Cards (visible on ≥1536px):**

| Widget | Data Field | Unit |
| :--- | :--- | :--- |
| Heatsink Temperature | `metrics.heatsink_temp_c` | °C |
| Voltage Ripple | `metrics.voltage_ripple_v` | V |
| Grid Power | `metrics.grid_power_w` | W |
| Self-Sufficiency | Computed | % |

### Section: Sankey Power Flow Diagram

| Property | Value |
| :--- | :--- |
| **Purpose** | Visual representation of energy generation, storage, and consumption pathways |
| **Display Conditions** | Always visible |
| **Role Visibility** | All authenticated roles |
| **Components** | SVG-based Sankey diagram with animated flow lines |
| **Data Source** | `telemetry.store.metrics` (solar, load, battery, grid, bus) |
| **Update Frequency** | 1Hz (real-time WebSocket) |
| **Interactions** | Hover on flow path → tooltip with exact Watt value; Click node → detail panel |

**Flow Nodes:**
- Solar PV (source) → DC Bus (hub) → Load circuits (sinks)
- Battery (bidirectional) ↔ DC Bus
- Grid (fallback source) → DC Bus

**Visual Rules:**
- Line thickness proportional to power flow (W)
- Animated dashed stroke flowing in direction of energy transfer
- Color-coded per source (Solar=amber, Grid=red, Battery=green, Bus=cyan)
- Inactive paths rendered at 20% opacity

### Section: Relay Control Panel

| Property | Value |
| :--- | :--- |
| **Purpose** | Manual relay state viewing and override toggles |
| **Display Conditions** | Always visible |
| **Role Visibility** | All authenticated, but toggle controls restricted by role |

**Relay Toggles:**

| Relay | Description | Operator Override | Supervisor Override | Admin Override |
| :--- | :--- | :--- | :--- | :--- |
| Tier 1 (Critical) | Life-safety loads (lighting, security) | ❌ Never | ❌ Never | ❌ Never |
| Tier 2 (Important) | Essential ops (refrigeration, pumps) | ✅ 30-min max | ✅ Extended | ✅ Unlimited |
| Tier 3 (Flexible) | Deferrable loads (workshop, fans) | ✅ 30-min max | ✅ Extended | ✅ Unlimited |
| MPPT Enable | Solar charge controller | ✅ 30-min max | ✅ Extended | ✅ Unlimited |
| Grid Fallback | Utility grid tie | ✅ 30-min max | ✅ Extended | ✅ Unlimited |

**Override Timer Display:**
- Countdown timer when override is active (circular progress ring)
- Time remaining in minutes:seconds format
- "Release Override" button

### Section: AI Decision Panel

| Property | Value |
| :--- | :--- |
| **Purpose** | Display latest UAEO agent decision with human-readable explanation |
| **Display Conditions** | Visible when AI auto-mode is enabled |
| **Role Visibility** | All authenticated roles |
| **Components** | Decision text, confidence bar, latency metric, model version, "Details" expandable |
| **Data Source** | `agent.store.lastDecision`, `agent.store.confidence` |
| **Update Frequency** | Event-driven (on `agent_decision` WebSocket event) |

### Section: Alerts Panel

| Property | Value |
| :--- | :--- |
| **Purpose** | Real-time alert feed with acknowledge capability |
| **Display Conditions** | Always visible |
| **Role Visibility** | All authenticated roles |
| **Components** | Scrollable alert list, severity badges, timestamp, acknowledge button |
| **Data Source** | `telemetry.store.alerts` |
| **Update Frequency** | Real-time (push via WebSocket) |

**Alert Types:**

| Type | Severity | Color | Example |
| :--- | :--- | :--- | :--- |
| ANOMALY | CRITICAL | #DC2626 | Component failure probability > 80% |
| THRESHOLD | WARNING | #D97706 | Battery SoC below 40% |
| FORECAST | INFO | #0EA5E9 | Solar forecast predicts cloud cover |
| SYSTEM | INFO | #0EA5E9 | Model retrained successfully |

## 1.4 Modal Windows

### Relay Override Confirmation Modal

| Property | Value |
| :--- | :--- |
| **Modal Name** | Relay Override Confirmation |
| **Trigger** | Click relay toggle switch |
| **Purpose** | Confirm intentional override with reason logging |
| **Form Fields** | Relay name (read-only), New state (read-only), Reason (textarea, required, 10–500 chars), Duration (select: 15min, 30min — Operator; 1h, 2h, 4h — Supervisor; Indefinite — Admin) |
| **Validation** | Reason required (min 10 chars); Duration required |
| **Success State** | Toast: "Override active — Tier 3 OFF for 30 minutes" |
| **Error State** | Toast: "Override failed — try again" |
| **Confirmation** | Single confirm button with override summary |
| **Role Restrictions** | Operator: 30min max; Supervisor: extended durations; Admin: indefinite; Tier 1: all roles blocked |

### Emergency Shutdown Modal

| Property | Value |
| :--- | :--- |
| **Modal Name** | Emergency Shutdown Confirmation |
| **Trigger** | Click "EMERGENCY STOP" button |
| **Purpose** | Double-confirmation for all-relay de-energization |
| **Form Fields** | Typed confirmation: "SHUTDOWN" (must match exactly) |
| **Validation** | Text must exactly match "SHUTDOWN" |
| **Success State** | Full-screen red overlay: "Emergency Shutdown Activated — All relays de-energized. Contact Admin for recovery." |
| **Error State** | "Shutdown command failed — contact supervisor immediately" |
| **Confirmation** | Type "SHUTDOWN" → confirm button turns red → click to execute |
| **Role Restrictions** | Operator (L1+) — recovery requires Admin (L3+) |

### Alert Detail Modal

| Property | Value |
| :--- | :--- |
| **Modal Name** | Alert Details |
| **Trigger** | Click alert item in alerts panel |
| **Purpose** | Full alert details with acknowledge flow |
| **Content** | Alert type, severity, timestamp, message, technical details (JSON), historical trend chart, recommended action |
| **Form Fields** | Acknowledgment notes (textarea, optional, max 500 chars) |
| **Actions** | "Acknowledge" button, "Escalate to Supervisor" button (Operator only) |
| **Role Restrictions** | All authenticated roles can view; only assigned role or higher can acknowledge |

## 1.5 Micro Animations & UX Enhancements

### Entry Animations

| Animation | Trigger | Duration | Easing | UX Purpose |
| :--- | :--- | :--- | :--- | :--- |
| KPI cards stagger fade-in | Page mount | 300ms per card, 80ms stagger | `cubic-bezier(0.16, 1, 0.3, 1)` | Progressive data reveal |
| Sankey diagram draw-in | Page mount + data received | 1200ms | `ease-out` | Dramatic power flow reveal |
| Skeleton loaders | Before first WebSocket data | Until data arrives | `pulse 2s infinite` | Indicate loading state |
| Connection status pulse | WebSocket connected | 500ms | `ease-in-out` | Confirm live data feed |

### Real-Time Animations

| Animation | Trigger | Duration | Easing | UX Purpose |
| :--- | :--- | :--- | :--- | :--- |
| KPI value counter transition | `telemetry_update` event (1Hz) | 500ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Smooth number rolling |
| Sankey flow line animation | Continuous (proportional to watts) | 1500ms loop | `linear` | Energy flow direction |
| Sankey line thickness morph | `telemetry_update` event | 300ms | `ease-out` | Power magnitude change |
| Alert pulse ring | New CRITICAL alert | 2000ms infinite | `ease-in-out` | Urgent attention demand |
| Relay toggle state change | Override activated/released | 300ms | `ease` | State confirmation |
| Override countdown tick | Every second during override | 1000ms | `linear` | Time awareness |
| Trend arrow direction change | Delta sign change | 200ms | `ease` | Trend reversal awareness |
| Battery SoC level fill | SoC value change | 500ms | `ease-out` | Visual level feedback |

### Interactive Animations

| Animation | Trigger | Duration | Easing | UX Purpose |
| :--- | :--- | :--- | :--- | :--- |
| Glass card hover lift | Mouse enter KPI card | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | Interactive affordance |
| Relay toggle glow | Hover on relay switch | 200ms | `ease` | Clickable indication |
| Emergency button pulse | Idle (continuous) | 3000ms | `ease-in-out` | Critical action visibility |
| Sankey node tooltip | Hover on flow node | 150ms fade-in | `ease` | Data detail on demand |
| Alert row highlight | Hover on alert item | 150ms | `ease` | Row selection indication |

### Feedback Animations

| Animation | Trigger | Duration | Easing | UX Purpose |
| :--- | :--- | :--- | :--- | :--- |
| Override success toast | Override confirmed | 300ms slide-in, 3s display | `cubic-bezier(0.4, 0, 0.2, 1)` | Action confirmation |
| Alert acknowledge checkmark | Alert acknowledged | 400ms | `ease-out` | Completion signal |
| Connection lost warning | WebSocket disconnect | 200ms slide-down | `ease` | Connectivity awareness |
| Connection restored | WebSocket reconnect | 200ms slide-up | `ease` | Recovery confirmation |

## 1.6 Functional Requirements

| Function | Description | Roles |
| :--- | :--- | :--- |
| **Live Telemetry Monitoring** | Real-time 1Hz sensor data display | All |
| **Power Flow Visualization** | Animated Sankey diagram of energy pathways | All |
| **Relay Override** | Manual toggle of relay states with reason and countdown | Operator+ |
| **Emergency Shutdown** | All-relay de-energization with double confirmation | Operator+ |
| **Alert Monitoring** | Real-time alert feed with badge counter | All |
| **Alert Acknowledgment** | Mark alerts as reviewed with optional notes | All |
| **Alert Escalation** | Escalate critical alerts to supervisor | Operator |
| **AI Decision View** | Display latest AI agent decision and confidence | All |
| **Forecast Preview** | View 1-hour solar and load predictions | All |
| **Override Timer** | Visual countdown of active override durations | All |
| **Connection Monitoring** | Display WebSocket, FastAPI, AI service health | All |

## 1.7 Forms & Validation

### Override Form (within modal)

| Field | Type | Required | Validation |
| :--- | :--- | :--- | :--- |
| `relay` | `hidden` | ✅ | Valid relay name |
| `state` | `hidden` | ✅ | Boolean |
| `reason` | `textarea` | ✅ | 10–500 chars, no HTML |
| `duration` | `select` | ✅ | Role-dependent options |

**Zod Schema:**
```typescript
const overrideSchema = z.object({
  relay: z.enum(['tier2_relay', 'tier3_relay', 'mppt_enable', 'grid_fallback']),
  state: z.boolean(),
  reason: z.string().min(10).max(500),
  duration: z.number().min(15).max(480),  // minutes
});
```

### Alert Acknowledgment Form

| Field | Type | Required | Validation |
| :--- | :--- | :--- | :--- |
| `alertId` | `hidden` | ✅ | Valid alert ID |
| `notes` | `textarea` | ❌ | Max 500 chars |

## 1.8 API Requirements

| Method | Route | Request | Response | Role |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/telemetry/live` | — | `{ timestamp, metrics, relays }` | All Authenticated |
| `GET` | `/api/v1/telemetry/kpi` | — | `{ period, kpis }` | All Authenticated |
| `POST` | `/api/v1/relays/override` | `{ relay, state, reason }` | `{ status, expires_at, audit_log_id }` | Operator+ |
| `DELETE` | `/api/v1/relays/override/:relay` | — | `{ status: "released" }` | Operator+ |
| `POST` | `/api/v1/relays/emergency-stop` | `{ confirmation: "SHUTDOWN" }` | `{ status, timestamp }` | Operator+ |
| `PUT` | `/api/v1/alerts/:id/acknowledge` | `{ notes? }` | `{ acknowledged: true }` | All Authenticated |
| `POST` | `/api/v1/alerts/:id/escalate` | `{ reason }` | `{ escalated: true }` | Operator |
| `GET` | `/api/v1/ai/status` | — | `{ active, lastDecision, confidence }` | All Authenticated |

## 1.9 Backend Services

| Service | Responsibilities | Dependencies |
| :--- | :--- | :--- |
| **connection_manager.py** | Manages active WebSocket connections for edge and client browser, broadcasts updates | FastAPI WebSockets |
| **relays.py** | Processes relay overrides, manages override timers, validates safety envelopes | Firebase Admin SDK, WebSockets |
| **alerts.py** | Creates, reads, and acknowledges alert documents in Firestore | Firebase Admin SDK |
| **agent/** | Runs predictive tools and calculates optimization decisions | Python ML runtimes (LSTM, ARIMA) |

## 1.10 Database Integration

### Firestore
- **`alerts`** — Read unacknowledged alerts, update acknowledgment status
- **`relayStates`** — Read current relay states, update on override
- **`audit_logs`** — Insert MANUAL_RELAY_OVERRIDE, EMERGENCY_SHUTDOWN, ALERT_ACKNOWLEDGED actions
- **`systemConfigurations`** — Read safety thresholds for display
- **`telemetry`** — Query latest telemetry document for status panels and chart plots

## 1.11 Real-Time Communication

### WebSocket Client Messages (FastAPI to Browser)

| Event / Message Type | Direction | Payload | Broadcast |
| :--- | :--- | :--- | :--- |
| `telemetry_update` | Server → Client | `{ deviceId, metrics, timestamp }` | Broadcast to all clients |
| `alert_notification` | Server → Client | `{ alertType, severity, message, details }` | Broadcast to all clients |
| `agent_decision` | Server → Client | `{ relayCommands, confidence, predictions }` | Broadcast to all clients |

### WebSocket Edge Messages (ESP32 to FastAPI)

| Message Type | Direction | Payload |
| :--- | :--- | :--- |
| `telemetry_publish` | ESP32 → Server | JSON sensor readings (1Hz) |
| `relay_config` | Server → ESP32 | Target 8-channel relay configurations |
| `heartbeat` | ESP32 → Server | Device status ping (15s interval) |

### Live Update Strategy
- **Update frequency:** 1 Hz (every 1 second) for telemetry
- **Retry strategy:** Native WebSocket reconnect logic on connection failure (retry every 5 seconds)
- **Offline behavior:** Show "Disconnected" banner, cache last known values, auto-retry

## 1.12 State Management

### telemetry.store (Zustand)

```typescript
interface TelemetryState {
  metrics: SensorMetrics;           // 8 sensor fields (1Hz updates)
  relays: RelayStates;              // 5 relay boolean states
  alerts: Alert[];                  // Last 100 alerts
  unreadAlertCount: number;         // Badge counter
  overrideActive: boolean;          // Any override in effect
  overrideExpiresAt: Date | null;   // Override expiry timestamp
  isConnected: boolean;             // WebSocket connection status
  lastUpdateTimestamp: number;      // Epoch ms of last update
}
```

**Actions:** `updateTelemetry()`, `addAlert()`, `acknowledgeAlert()`, `setOverrideState()`, `setConnectionStatus()`

**Selectors (optimize re-renders):**
- `useTelemetryStore(s => s.metrics.solar_power_w)` — Single KPI
- `useTelemetryStore(s => s.unreadAlertCount)` — Alert badge
- `useTelemetryStore(s => s.isConnected)` — Connection indicator

### agent.store (Zustand)

```typescript
interface AgentState {
  lastDecision: RelayCommands | null;
  decisionTimestamp: number | null;
  confidence: number;
  solarForecast: number[];          // 4-step, 1-hour ahead
  loadForecast: number[];           // 4-step, 1-hour ahead
  anomalyScores: ComponentScores;   // 5 component failure probabilities
  explanation: string;
}
```

**Actions:** `updateAgentState()`

## 1.13 Security & RBAC Rules

### Access Rules

| Rule | Operator | Supervisor | Admin | Superadmin |
| :--- | :--- | :--- | :--- | :--- |
| View dashboard | ✅ | ✅ | ✅ | ✅ |
| View telemetry | ✅ | ✅ | ✅ | ✅ |
| Override relays (Tier 2/3) | ✅ (30min) | ✅ (extended) | ✅ (unlimited) | ✅ (unlimited) |
| Override Tier 1 | ❌ | ❌ | ❌ | ❌ |
| Emergency shutdown | ✅ | ✅ | ✅ | ✅ |
| Recovery authorization | ❌ | ❌ | ✅ | ✅ |
| Acknowledge alerts | ✅ | ✅ | ✅ | ✅ |

### UI Restrictions

| Component | Operator | Supervisor | Admin |
| :--- | :--- | :--- | :--- |
| Tier 1 relay toggle | Disabled + lock icon | Disabled + lock icon | Disabled + lock icon |
| Override duration options | 15min, 30min | 15min–4h | 15min–Indefinite |
| "Release All Overrides" button | Hidden | Visible | Visible |
| AI auto-mode toggle | Hidden | Hidden | Visible |

### Audit Requirements

| Action | Logged Fields | Retention |
| :--- | :--- | :--- |
| `MANUAL_RELAY_OVERRIDE` | relay, newState, reason, duration, userId | 2 years |
| `EMERGENCY_SHUTDOWN` | trigger, state_snapshot, userId | Permanent |
| `ALERT_ACKNOWLEDGED` | alertId, notes, userId | 1 year |
| `OVERRIDE_RELEASED` | relay, userId, method (manual/timeout) | 2 years |

## 1.14 Error Handling

| Error | User Message | Recovery |
| :--- | :--- | :--- |
| WebSocket disconnect | Banner: "Live data disconnected. Reconnecting..." | Auto-reconnect with backoff |
| Telemetry stale (>30s) | Banner: "Data may be stale — last update X seconds ago" | Auto-recovers when reconnected |
| Override API failure | Toast: "Override failed — please try again" | Retry button in toast |
| Emergency stop failure | Modal: "Shutdown command failed — contact supervisor immediately" | Manual hardware intervention |
| AI service unavailable | Badge: "AI Offline" in status bar | System continues with last-known relay state |
| Edge disconnect | Badge: "Edge Disconnected" in status bar | Backend auto-reconnects |

## 1.15 Performance Requirements

| Metric | Target |
| :--- | :--- |
| Dashboard initial load | < 2.0s (including WebSocket handshake) |
| Telemetry update rendering | < 50ms per frame |
| Override API response | < 300ms |
| Alert notification display | < 100ms from WebSocket event |
| Sankey diagram re-render | < 16ms (60fps) |
| Maximum alerts in memory | 100 (ring buffer) |
| KPI trend calculation | < 50ms |

## 1.16 Testing Requirements

### Unit Tests
- KPI value formatting (W, kW, %, V, °C)
- Relay toggle permission logic per role
- Alert severity color mapping
- Override countdown timer logic
- Sankey flow line width calculation

### Integration Tests
- WebSocket connection → `telemetry_update` → store updated → KPI re-renders
- Override POST → WebSocket command → relay state update → UI reflects change
- Alert WebSocket event → store update → badge increment → alert list updated

### E2E Tests
- Full operator workflow: Login → View dashboard → Toggle relay → Confirm override → See countdown → Release
- Emergency shutdown: Click → Type "SHUTDOWN" → Confirm → All relays off → Recovery locked
- Alert triage: Receive alert → Open details → Acknowledge → Alert moves to resolved
- Offline recovery: Disconnect WiFi → See warning → Reconnect → Data resumes

## 1.17 Future Enhancements

- **AI Recommendation Cards:** Proactive suggestions ("Consider enabling grid fallback — solar forecast drops 60% in 2 hours")
- **Predictive Alert Heatmap:** Visual heatmap showing predicted alert likelihood per component
- **Voice Commands:** "Alexa, override tier 3 relay" via voice integration
- **AR Overlay:** Mobile AR view overlaying relay states on physical hardware
- **Custom KPI Arrangement:** Drag-and-drop KPI widget positioning with persistence

---

# 2. Operations Console

## 2.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Operations Console |
| **Route Path** | `/operations` |
| **Accessible Roles** | Operator (L1), Supervisor (L2), Admin (L3), Superadmin (L4) |
| **Purpose** | Detailed live telemetry stream, real-time alert logs, and quick manual toggle buttons for field operations |
| **Business Objective** | Provide operators with a dense, information-rich console for active microgrid management |

## 2.2 Sections & Widgets

### Live Telemetry Stream Table

| Column | Data Source | Update | Format |
| :--- | :--- | :--- | :--- |
| Timestamp | `time` | 1Hz | `HH:mm:ss.SSS` |
| Solar (W) | `solar_power_w` | 1Hz | `0.0 W` |
| Load (W) | `load_power_w` | 1Hz | `0.0 W` |
| Battery SoC (%) | `battery_soc_percent` | 1Hz | `0.0 %` |
| Bus Voltage (V) | `bus_voltage_v` | 1Hz | `0.00 V` |
| Heatsink (°C) | `heatsink_temp_c` | 1Hz | `0.0 °C` |
| Ripple (V) | `voltage_ripple_v` | 1Hz | `0.00 V` |
| Grid Status | `grid_status` | 1Hz | Badge (Connected/Islanded/Fault) |

**Features:**
- Auto-scrolling log (latest at top)
- Configurable column visibility
- Row highlighting: yellow for WARNING-range values, red for CRITICAL-range
- Pause/resume auto-scroll toggle
- Export visible data to CSV

### Quick Action Panel

| Action | Icon | Description | Confirmation |
| :--- | :--- | :--- | :--- |
| Toggle Tier 2 | ⚡ | Quick toggle Important loads | Override modal |
| Toggle Tier 3 | 🔌 | Quick toggle Flexible loads | Override modal |
| Silence Alarms | 🔇 | Mute audible alerts for 15min | Single click confirm |
| Refresh Data | 🔄 | Force telemetry refresh | Immediate |

### Alert Log (Live Stream)

| Property | Value |
| :--- | :--- |
| **Format** | Chronological log with severity icons |
| **Max Display** | 50 most recent alerts |
| **Filtering** | By severity (INFO/WARNING/CRITICAL), by type (ANOMALY/THRESHOLD/FORECAST/SYSTEM) |
| **Actions** | Acknowledge, Escalate, Filter, Search |

## 2.3 API Requirements

| Method | Route | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/telemetry/live` | Latest telemetry snapshot | All |
| `GET` | `/api/v1/alerts?limit=50&unacknowledged=true` | Recent alerts | All |
| `POST` | `/api/v1/relays/override` | Quick toggle relay | Operator+ |

---

# 3. Microgrid Nodes (Fleet View)

## 3.1 Page Overview

| Property | Value |
| :--- | :--- |
| **Page Name** | Microgrid Nodes |
| **Route Path** | `/fleet` |
| **Accessible Roles** | Operator (L1), Supervisor (L2), Admin (L3), Superadmin (L4) |
| **Purpose** | Asset inventory showing status of solar PV arrays, battery packs, inverters, and relay units |

## 3.2 Sections & Widgets

### Node Grid / Table View Toggle

**Grid View (Default):**
- Card per hardware asset
- Status indicator (Online/Degraded/Offline)
- Key metrics: Last heartbeat, temperature, firmware version
- Health score (0–100%) with color gradient

**Table View:**

| Column | Description |
| :--- | :--- |
| Device ID | ESP32 device identifier |
| Type | Solar Panel / Battery / Inverter / Relay Unit |
| Status | Online (green) / Degraded (amber) / Offline (red) |
| Last Heartbeat | Relative timestamp (e.g., "3s ago") |
| Temperature | Current heatsink temperature |
| Firmware | Firmware version string |
| Health Score | 0–100% computed score |
| Actions | View Details, Report Issue |

### Node Detail Panel (Side Drawer)

| Property | Value |
| :--- | :--- |
| **Trigger** | Click node card/row |
| **Content** | Full device specifications, 24h telemetry mini-chart, maintenance history, firmware update status |
| **Actions** | "Report Issue" → Create incident, "View Telemetry" → Navigate to operations with device filter |

## 3.3 API Requirements

| Method | Route | Purpose | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/fleet/nodes` | List all microgrid nodes | All |
| `GET` | `/api/v1/fleet/nodes/:id` | Node detail with telemetry | All |
| `GET` | `/api/v1/fleet/nodes/:id/health` | Computed health score | All |

---

# 4–10. Additional Operator Pages

## 4. Site Management (`/sites`)

| Property | Value |
| :--- | :--- |
| **Purpose** | Physical location metrics, environmental sensors, site layout |
| **Sections** | Site map view, weather overlay, environmental sensor readings, site comparison table |
| **API** | `GET /api/v1/sites`, `GET /api/v1/sites/:id/telemetry` |

## 5. Incident Reporting (`/incidents`)

| Property | Value |
| :--- | :--- |
| **Purpose** | Manual logging of hardware faults, voltage events, thermal issues |
| **Sections** | Incident list table, create incident form, incident detail view with timeline |
| **Modal** | Create Incident: Asset select, severity, description, photos upload |
| **API** | `POST /api/v1/ops/incidents`, `GET /api/v1/ops/incidents`, `PUT /api/v1/ops/incidents/:id` |

## 6. Maintenance Requests (`/maintenance`)

| Property | Value |
| :--- | :--- |
| **Purpose** | Request and track sensor calibrations and hardware repairs |
| **Sections** | Open requests table, completed requests, create request form |
| **Modal** | Create Request: Equipment select, maintenance type, priority, description |
| **API** | `POST /api/v1/maintenance/requests`, `GET /api/v1/maintenance/requests` |

## 7. Tasks (`/tasks`)

| Property | Value |
| :--- | :--- |
| **Purpose** | Operator personal work list with safety check schedules |
| **Sections** | Kanban board (To Do / In Progress / Done), daily checklist, upcoming deadlines |
| **API** | `GET /api/v1/tasks?assignee=me`, `PUT /api/v1/tasks/:id` |

## 8. Load Scheduling (`/jobs`)

| Property | Value |
| :--- | :--- |
| **Purpose** | Configure flexible load schedules and priority runtime windows |
| **Sections** | Weekly schedule grid, load priority configuration, active schedule display |
| **API** | `GET /api/v1/schedules`, `POST /api/v1/schedules`, `PUT /api/v1/schedules/:id` |

## 9. Operational Checklists (`/checklists`)

| Property | Value |
| :--- | :--- |
| **Purpose** | Standard Operating Procedure check-offs for system start/stop |
| **Sections** | Active checklist, completed today, checklist templates |
| **API** | `GET /api/v1/checklists`, `POST /api/v1/checklists/:id/complete` |

## 10. Personal Reports (`/reports/my`)

| Property | Value |
| :--- | :--- |
| **Purpose** | Operator personal performance metrics and override history |
| **Sections** | Override response time chart, telemetry accuracy stats, monthly summary |
| **Restrictions** | Operators see only their own data |
| **API** | `GET /api/v1/reports/personal` |

---

# Shared Pages (All Authenticated Roles)

## 11. Notifications (`/notifications`)

| Property | Value |
| :--- | :--- |
| **Route** | `/notifications` |
| **Roles** | All Authenticated |
| **Purpose** | Centralized notification center with configurable categories |
| **Sections** | Notification list (grouped by date), filter by category, mark all read, notification preferences |
| **Real-Time** | Push notifications via WebSocket `alert_notification` event |
| **API** | `GET /api/v1/notifications`, `PUT /api/v1/notifications/:id/read`, `PUT /api/v1/notifications/read-all` |

## 12. User Profile (`/profile`)

| Property | Value |
| :--- | :--- |
| **Route** | `/profile` |
| **Roles** | All Authenticated |
| **Purpose** | Personal settings, password management, MFA configuration |
| **Sections** | Profile info card, change password form, MFA setup, theme preferences, notification settings |
| **API** | `GET /api/v1/auth/me`, `PUT /api/v1/auth/profile`, `PUT /api/v1/auth/change-password` |

## 13. Activity Center (`/activity`)

| Property | Value |
| :--- | :--- |
| **Route** | `/activity` |
| **Roles** | All Authenticated |
| **Purpose** | Personal session history, recent actions, and page visit timeline |
| **Sections** | Session table, action timeline, active sessions (with "Sign Out Other Sessions" button) |
| **API** | `GET /api/v1/activity/sessions`, `GET /api/v1/activity/actions`, `DELETE /api/v1/activity/sessions/:id` |

---

## 📐 Architecture Notes

- The Dashboard is the most performance-critical page — WebSocket updates at 1Hz drive all visualizations
- The Sankey diagram uses custom SVG rendering (not a charting library) for maximum control over animations
- Relay override commands flow: Frontend → Backend API → WebSocket connection → ESP32 hardware
- Emergency shutdown bypasses normal relay logic and sends a direct WebSocket de-energize command

## 🗺️ Related Documents

| Document | Purpose |
| :--- | :--- |
| [14_StateManagement.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/14_StateManagement.md) | Zustand store implementations |
| [16_User_Journey_Flows.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/16_User_Journey_Flows.md) | Operator daily monitoring flow |
| [API_Contract.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/API_Contract.md) | API endpoint specifications |
| [Database_Schema.md](file:///e:/Projects/Full%20Stack%20Project/2026/GridFlowX/Docs/Database_Schema.md) | Database table schemas |
