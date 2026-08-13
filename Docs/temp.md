# GridFlowX — Project Overview

**Smart AI-Driven Microgrid Management and Automation System**

**Document ID:** `DOC-01-REVISED`  
**Version:** 3.0  
**Date:** August 2026  
**Classification:** Product Requirements Document (PRD) · Executive Overview · Architecture Charter  
**Maintained By:** Platform Architecture & Embedded Systems Research Team

---

## 1. Project Title

**GridFlowX** — An Edge-Autonomous, Cyber-Physical Microgrid Energy Router with Real-Time Rainflow-Arrhenius Battery Health Optimization and Pareto Multi-Objective Reinforcement Learning Dispatch.

---

## 2. Executive Summary

GridFlowX is a production-grade, cyber-physical platform that bridges deterministic embedded firmware with cloud-native predictive intelligence to autonomously orchestrate distributed solar generation, battery storage, and grid power. The system combines real-time Rainflow-Arrhenius electro-thermal degradation modeling with Pareto multi-objective reinforcement learning to achieve measurable reductions in energy costs (≥ 15%) and battery degradation (≥ 20%), verified on a physical Hardware-in-the-Loop (HIL) benchtop testbed.

The platform targets residential prosumers, smart campuses, and remote off-grid micro-utilities. It delivers sub-10 ms deterministic safety switching on an ESP32-WROOM-32E edge controller, sub-50 ms AI inference latency via ONNX Runtime, and sub-200 ms edge-to-glass telemetry streaming to a Next.js 14 glassmorphic dashboard. The architecture is designed for IEEE conference publication (PEDES/INDICON) and Indian Patent Office (IPO Chennai) utility patent filing.

---

## 3. Problem Statement

Modern distributed energy resource (DER) installations face five fundamental technical challenges:

| #   | Challenge                            | Industry Impact                                                                         |
| --- | ------------------------------------ | --------------------------------------------------------------------------------------- |
| 1   | **Solar Generation Volatility**      | Voltage sags, frequency deviations, and unstable DC bus under rapid cloud transients.   |
| 2   | **Peak-Hour Utility Cost Inflation** | 300–400% time-of-use tariff spikes during peak demand windows.                          |
| 3   | **Accelerated Battery Degradation**  | High C-rates, deep cycling, and thermal stress reduce Li-ion/LiFePO₄ lifespan by > 40%. |
| 4   | **Rigid / Blind Load Shedding**      | Critical systems are unceremoniously tripped during emergency undervoltage events.      |
| 5   | **Cloud Failure Vulnerability**      | Internet dropouts cause microgrid disconnects or uncontrolled blackouts.                |

Legacy rule-based energy management systems (EMS) lack forward-looking intelligence, operate with fixed thresholds that ignore battery electro-thermal stress, and cannot arbitrage time-of-use tariffs dynamically.

---

## 4. Project Vision

> To engineer a resilient, decentralized microgrid controller that automates energy distribution by bridging sub-10 ms deterministic edge hardware with cloud-based predictive AI — ensuring affordable, safe, and uninterrupted renewable power delivery while maximizing energy asset lifespan.

> To enable smart buildings, industrial micro-utilities, and off-grid facilities to operate **autonomous, self-healing energy routers** that actively reduce carbon footprints, minimize grid strain during peak demand, and prevent premature battery failure through physics-informed AI.

---

## 5. Project Objectives

| #   | Objective                                    | Measurable Target                                                                                                                                              |
| --- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | **Autonomous Tri-Source Router**             | ESP32-based 8-channel relay matrix routing Solar PV, Battery, and Grid with < 10 ms software trip latency.                                                     |
| 2   | **Predictive Multi-Task Forecasting**        | Encoder-decoder Transformer predicting 1-hour ahead solar irradiance (MAE ≤ 12%) and load demand (MAPE ≤ 8%).                                                  |
| 3   | **Intelligent 3-Tier Load Management**       | Dynamic load-shedding hierarchy preserving Tier 1 (Critical) while shedding Tier 3 (Flexible) and Tier 2 (Important) under battery stress.                     |
| 4   | **ML-Driven Fault Detection**                | Anomaly detection isolating incipient faults with ≥ 92% precision and 24–48 h warning lead time.                                                               |
| 5   | **Electro-Thermal Rainflow SoH Model**       | Online Rainflow cycle counting integrated with Arrhenius stress factors to quantify real-time battery capacity fade (ΔSoH).                                    |
| 6   | **Pareto Multi-Objective Optimization Core** | RL decision core optimizing a vector of three competing cost functions (Grid Cost, Battery Degradation, Load Discomfort) bounded by hard safety penalties (Ψ). |
| 7   | **HIL Comparative Benchmarking**             | Benchtop HIL experiments comparing GridFlowX against a Rule-Based EMS to demonstrate ≥ 15% cost reduction and ≥ 20% degradation reduction.                     |
| 8   | **Full-Stack Cyber-Physical Platform**       | Next.js 14 dashboard + FastAPI WebSocket server + Firestore real-time pipeline with < 200 ms edge-to-glass telemetry and secure RBAC overrides.                |
| 9   | **Research & Patent Deliverables**           | IEEE conference manuscript (PEDES/INDICON) and Indian Utility Patent application (IPO Chennai, Form-2 Claims 1–3).                                             |

---

## 6. Target Users

### User Personas

| Persona                  | Role                                             | Primary Goals                                                                     | Access Level |
| ------------------------ | ------------------------------------------------ | --------------------------------------------------------------------------------- | ------------ |
| **Grid Operator**        | Manages daily microgrid operations               | Monitor live telemetry, execute manual relay overrides, acknowledge safety alerts | Operator     |
| **System Administrator** | Configures safety thresholds and manages users   | Edit setpoints, manage RBAC accounts, review immutable audit trails               | Admin        |
| **Compliance Auditor**   | Reviews system history for regulatory compliance | Query historical telemetry, verify SoH metrics, export CSV/JSON audit logs        | Auditor      |
| **Field Technician**     | Maintains physical hardware                      | Inspect sensor calibration, test relay contact resistance, run HIL diagnostics    | Operator     |

### Stakeholder Segments

1. **Residential Microgrids & Prosumers:** Rooftop solar PV (1–5 kW) with LiFePO₄ battery storage and grid connection.
2. **Smart Campus & Small Industrial Nodes:** Academic laboratories, fabrication facilities, and commercial office clusters.
3. **Remote / Off-Grid Micro-Utilities:** Rural health clinics, telecommunication base stations, and agricultural pump sets.

---

## 7. Target Platforms

| Layer               | Platform                    | Specification                                        |
| ------------------- | --------------------------- | ---------------------------------------------------- |
| **Edge Hardware**   | ESP32-WROOM-32E             | Dual-core Xtensa LX6 @ 240 MHz, 4 MB flash, FreeRTOS |
| **Edge Firmware**   | Arduino Framework / ESP-IDF | C++17, FreeRTOS task isolation                       |
| **Backend Runtime** | Python 3.11+                | FastAPI + Uvicorn async engine                       |
| **AI Inference**    | ONNX Runtime 1.17+          | CPU-optimized, < 50 ms round-trip                    |
| **Web Frontend**    | Next.js 15 + React 19       | TypeScript 5.5+, App Router, SSR/ISR                 |
| **Database / Auth** | Firebase Platform           | Firestore NoSQL, Firebase Auth, Firebase App Hosting |
| **Backend Hosting** | Render / Google Cloud Run   | Containerized Docker deployment                      |
| **Development OS**  | Cross-platform              | Linux (primary), macOS, Windows (WSL2)               |

---

## 8. Core Use Cases

### UC-1: Autonomous Peak Shaving

During utility peak tariff hours, the RL agent discharges the battery to serve load demand, minimizing grid import cost while respecting SoC floors and thermal limits.

### UC-2: Solar Volatility Pre-Positioning

The multi-task transformer forecasts a cloud transient 15–60 minutes ahead. The agent pre-charges the battery before the transient to prevent bus voltage sag and avoid deep discharge cycles.

### UC-3: Graceful Load Shedding

When battery SoC drops below configurable thresholds, the system sheds Tier 3 (Flexible) loads first, then Tier 2 (Important), while guaranteeing uninterrupted Tier 1 (Critical) power.

### UC-4: Self-Healing Fault Isolation

Anomaly detection flags incipient relay contact bounce or capacitor degradation. The system automatically isolates the degraded branch via relay in < 10 ms and modifies the AI policy to exclude the faulty channel.

### UC-5: Operator Manual Override

An authenticated operator manually toggles a relay channel. The AI optimization is suspended for a 30-minute window, the action is logged immutably, and all connected dashboards display the override state.

### UC-6: Emergency Shutdown & Recovery

A critical fault (SoC < 2%, Temp > 90°C) triggers immediate de-energization of all relays. Only an Admin can authorize recovery after physical inspection.

---

## 9. Key Features

### Edge / Embedded

- **Dual-Core FreeRTOS Architecture:** Core 0 runs a 100 Hz deterministic safety loop (< 10 ms trip); Core 1 handles WiFi, WebSocket telemetry, and I2C LCD updates.
- **Tri-Source Power Router:** Autonomous management of Solar PV (MPPT), Battery (bidirectional DC-DC), and Grid (AC-DC rectifier) across an 8-channel optoisolated relay matrix.
- **3-Tier Prioritized Load Shedding:** Tier 1 (Critical — always on), Tier 2 (Important — shed at SoC < 40%), Tier 3 (Flexible — multi-factor shedding).
- **Offline Autonomy:** Local FreeRTOS state machine with SPIFFS telemetry buffering operates indefinitely without cloud connectivity (until SoC < 5%).

### AI / ML

- **Multi-Task Perception Transformer:** Jointly forecasts solar irradiance, load demand, and component anomaly probabilities from a 96-step (24-hour) telemetry window.
- **Rainflow-Arrhenius SoH Tracker:** Real-time quantification of battery capacity fade using Rainflow cycle extraction, Arrhenius thermal acceleration, and SoC stress factors.
- **Pareto RL Decision Core:** Actor-critic network (PPO/SAC) optimizing grid cost, battery degradation penalty, and load discomfort with hard safety barrier penalties.
- **Anomaly Detection Head:** Isolation Forest and Autoencoder latent reconstruction for incipient fault detection.

### Backend

- **Unified FastAPI WebSocket Server:** Single async Python process serving REST API, bi-directional WebSocket telemetry hub, and AI inference orchestration.
- **Real-Time Telemetry Ingestion:** 1 Hz WebSocket streaming from ESP32; 100 Hz edge buffering.
- **Immutable Audit Logging:** Every state change, override, and AI decision is written to an append-only Firestore collection.

### Frontend

- **Glassmorphic Dark-Mode Dashboard:** Next.js 15 App Router with Tailwind CSS v4, Zustand state management, and Recharts data visualization.
- **Power Flow Sankey Diagram:** Real-time animated power flow visualization with click-to-drill-down.
- **Live Forecast Overlay:** Predicted vs. actual solar/load curves with 95% confidence bands.
- **Role-Based Navigation:** Dynamic page access and feature visibility based on Firebase Custom Claims.

---

## 10. Major System Components

| Component                 | Technology            | Responsibility                                                         |
| ------------------------- | --------------------- | ---------------------------------------------------------------------- |
| **ESP32 Edge Controller** | C++ / FreeRTOS        | Sensor acquisition, safety loop, relay actuation, WebSocket client     |
| **FastAPI Backend**       | Python 3.11           | REST API, WebSocket hub, Firebase Admin SDK, AI orchestrator           |
| **UAEO AI Agent**         | PyTorch → ONNX        | Perception transformer, RL decision core, Rainflow SoH calculator      |
| **Next.js Dashboard**     | TypeScript / React 19 | Operator console, analytics, settings, audit trails                    |
| **Firebase Firestore**    | NoSQL Document Store  | Telemetry, alerts, audit logs, config, relay states                    |
| **Firebase Auth**         | Identity Platform     | Authentication, MFA, custom claims RBAC                                |
| **HIL Testbed**           | Physical Hardware     | Solar emulator, programmable loads, 12V LiFePO₄ bank, data acquisition |

---

## 11. High-Level Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              CLOUD LAYER                                 │
│  ┌──────────────┐  ┌──────────────────────────┐  ┌─────────────────────┐ │
│  │ Next.js      │  │ FastAPI WebSocket Server │  │ Firebase Platform   │ │
│  │ Dashboard    │◄─┤ (Port 8000)              ├──┤ • Firestore         │ │
│  │ (App Router) │  │ • REST API               │  │ • Authentication    │ │
│  └──────────────┘  │ • WebSocket Manager      │  │ • App Hosting       │ │
│       ▲            │ • AI Orchestrator        │  └─────────────────────┘ │
│       │            └──────────────────────────┘                          │
│       │                          ▲                                       │
│       │            WSS (1Hz)     │     gRPC / Admin SDK                 │
│       └──────────────────────────┘                                      │
├──────────────────────────────────────────────────────────────────────────┤
│                              EDGE LAYER                                  │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    ESP32-WROOM-32E (Dual-Core)                      │ │
│  │  ┌─────────────────────┐        ┌─────────────────────────────────┐ │ │
│  │  │ Core 0: Safety Loop │        │ Core 1: Communication & Control │ │ │
│  │  │ • 100Hz ADC sampling│        │ • WiFi Manager                  │ │ │
│  │  │ • Failsafe FSM      │        │ • WebSocket Client (JSON)       │ │ │
│  │  │ • Relay isolation   │        │ • I2C LCD Display (16x2)        │ │ │
│  │  │   (<10ms trip)      │        │ • Command processing            │ │ │
│  │  └─────────────────────┘        └─────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│       ▲                                                                  │
│       │ Sensors: INA219 (V/I), DS18B20 (Temp), ACS712 (Current)        │
│       ▼                                                                  │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐ │
│  │ Solar PV    │    │ LiFePO₄     │    │ Grid AC     │    │ 3-Tier   │ │
│  │ (20W Mono)  │    │ Battery     │    │ (230V→12V)  │    │ Loads    │ │
│  └─────────────┘    └─────────────┘    └─────────────┘    └──────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### Communication Protocols

- **ESP32 ↔ FastAPI:** WebSockets over Wi-Fi (port 8000), JSON payload, 1 Hz telemetry upstream, command downstream.
- **FastAPI ↔ Firestore:** gRPC via Firebase Admin SDK (service account).
- **Next.js ↔ FastAPI:** HTTPS REST + WSS for real-time telemetry and overrides.
- **Next.js ↔ Firebase Auth:** Client SDK for authentication and ID token management.

---

## 12. AI/ML and Agentic AI Overview

### Unified Agentic Energy Orchestrator (UAEO)

The UAEO is the central intelligence layer, comprising three integrated modules:

#### 12.1 Perception Transformer

- **Input:** 96-step sliding window (24 hours × 15-minute intervals) of 9 telemetry features.
- **Architecture:** 3-layer Transformer encoder (d_model=64, nhead=4) with learnable positional encodings.
- **Task Heads:**
  - **Solar Head:** 4-step solar irradiance forecast (MAE target ≤ 12%).
  - **Load Head:** 4-step load demand forecast (MAPE target ≤ 8%).
  - **Anomaly Head:** 5-component failure probability vector (sigmoid output).

#### 12.2 Rainflow-Arrhenius SoH Model

- **Rainflow Cycle Extraction:** Online half/full cycle counting from real-time current and voltage telemetry.
- **Degradation Power Law:** f(DoDₖ) = α · (DoDₖ)^β (α ≈ 1.2×10⁻⁴, β ≈ 1.8 for LiFePO₄).
- **Arrhenius Thermal Factor:** S_T(Tₖ) = exp[(Eₐ/R)(1/T_ref − 1/Tₖ)] with Eₐ = 31.7 kJ/mol.
- **SoC Stress Factor:** S_SoC(SoC̄ₖ) = exp[k_SoC · (SoC̄ₖ − SoC_ref)].

#### 12.3 Pareto RL Decision Core

- **Formulation:** Constrained Markov Decision Process (CMDP) minimizing:
  - f₁(t) = C_grid(t) · P_grid(t) · Δt _(Grid import cost)_
  - f₂(t) = C_bat_capital · ΔSoH(t) _(Battery degradation penalty)_
  - f₃(t) = Σ λᵢ · P_shed,i(t) · Δt _(Load shedding discomfort)_
- **Safety Barrier:** Ψ(sₜ, aₜ) = +∞ if I_bus > I_max, T_bat > T_max, or SoC < SoC_min.
- **Algorithm:** Proximal Policy Optimization (PPO) or Soft Actor-Critic (SAC) via Stable-Baselines3.
- **Action Space:** Discrete (16 relay configurations) + Continuous (battery current setpoint, −5 A to +5 A).

#### 12.4 Deployment Pipeline

- **Training:** PyTorch 2.2+ with `torch.compile()` on GPU.
- **Export:** `torch.onnx.export()` → ONNX Runtime 1.17+ for CPU inference.
- **Edge Fallback:** ONNX → TensorFlow → TFLite Micro (int8 quantized, < 500 KB) for offline ESP32 execution.
- **Latency Budget:** Perception (12.5 ms) + Decision (8.2 ms) + Serialization (1.8 ms) + Network (0.3 ms) = **22.8 ms total**.

---

## 13. Frontend Overview

- **Framework:** Next.js 15 with React 19, App Router, and React Server Components.
- **Language:** TypeScript 5.5+ with `strict: true` enforcement.
- **State Management:** Zustand 4.x (Auth Store, Telemetry Store, Agent Store, Config Store).
- **Styling:** Tailwind CSS v4 (CSS-first configuration), glassmorphic design system, dark-mode primary.
- **UI Components:** shadcn/ui primitives (unstyled, composable).
- **Charts:** Recharts 2.x for time-series, Sankey diagrams, and KPI gauges.
- **Forms:** React Hook Form + Zod for schema validation.
- **Real-Time:** Native WebSocket client managed outside React lifecycle, piping to Zustand stores.
- **Accessibility:** WCAG 2.1 AA compliance, keyboard navigation, `prefers-reduced-motion` support, ARIA labels.

**Key Pages:**

- `/` — Public landing
- `/login` — Firebase Authentication gateway
- `/dashboard` — Real-time operator console (Sankey, KPIs, forecasts)
- `/operator` — Manual relay override panel
- `/analytics` — Historical data explorer with export
- `/audit` — Immutable audit trail viewer
- `/settings` — Safety threshold configuration (Admin only)

---

## 14. Backend Overview

- **Framework:** FastAPI (Python 3.11+) with Uvicorn ASGI server.
- **Architecture:** Unified single-process backend handling HTTP REST, WebSocket bi-directional communication, and AI inference orchestration.
- **Authentication:** Firebase Admin SDK verifying ID tokens from `Authorization: Bearer <token>` headers.
- **Authorization:** Custom dependency injection enforcing RBAC (Admin, Supervisor, Operator, Auditor).
- **WebSocket Manager:** Connection registry tracking ESP32 devices and dashboard clients; broadcast and targeted message routing.
- **AI Orchestrator:** Background task triggering UAEO inference every 15 minutes or on sensor state changes.
- **Safety Envelope:** Hardcoded, non-negotiable rule layer that post-processes all AI decisions (SoC floors, thermal limits, Tier 1 protection).

**Key Endpoints:**

- `GET /api/v1/telemetry/history` — Historical time-series queries
- `POST /api/v1/relays/override` — Manual relay toggle (Operator+)
- `POST /api/v1/relays/recovery` — Emergency recovery authorization (Admin only)
- `GET/PUT /api/v1/config/thresholds` — Safety setpoint management (Admin only)
- `POST /api/v1/auth/claims` — Role assignment via Firebase Custom Claims (Admin only)
- `/ws/telemetry` — ESP32 bi-directional telemetry channel
- `/ws/client` — Dashboard real-time subscription channel

---

## 15. Database Overview

- **Platform:** Firebase Firestore (NoSQL Document Database).
- **Rationale:** Zero server maintenance, native real-time synchronization, automatic multi-region replication, and granular security rules.

**Collections:**

| Collection             | Purpose                           | Key Fields                                                        |
| ---------------------- | --------------------------------- | ----------------------------------------------------------------- |
| `users`                | User profiles and roles           | `uid`, `email`, `role`, `isActive`                                |
| `telemetry`            | Time-series sensor readings       | `deviceId`, `timestamp`, `solarPower`, `batterySoc`, `busVoltage` |
| `telemetryCurrent`     | Latest snapshot per device        | Overwritten frequently for live dashboard sync                    |
| `alerts`               | Active and historical alerts      | `alertType`, `severity`, `acknowledged`, `source`                 |
| `audit_logs`           | Immutable compliance records      | `userId`, `action`, `details`, `ipAddress`, `timestamp`           |
| `systemConfigurations` | Safety thresholds and calibration | `socTier2Shed`, `tempShutdown`, `acs712Scale`                     |
| `relayStates`          | Real-time relay status per device | `currentStates[8]`, `lastSource`, `overrideExpiresAt`             |
| `modelEvaluations`     | AI accuracy tracking              | `solarMae`, `loadMape`, `modelVersion`, `timestamp`               |

**Indexing:**

- Composite: `telemetry.deviceId` (Asc) + `timestamp` (Desc)
- Composite: `alerts.acknowledged` (Asc) + `createdAt` (Desc)

**Security:** Firestore Security Rules enforce role-based access at the data layer. Client-side direct access is restricted; sensitive writes (telemetry, audit logs) are performed exclusively via the FastAPI Admin SDK.

---

## 16. Hardware / Embedded System Overview

### Microcontroller

- **ESP32-WROOM-32E** (Dual-core Xtensa LX6, 240 MHz, 4 MB flash, 520 KB SRAM).

### Sensor Array

| Sensor          | Measurement                          | Interface | Pins                       |
| --------------- | ------------------------------------ | --------- | -------------------------- |
| INA219          | Solar / Battery Voltage & Current    | I2C       | SDA (GPIO21), SCL (GPIO22) |
| ACS712          | Hall-effect current (±5 A, 185 mV/A) | Analog    | ADC1_CH6, ADC1_CH7         |
| DS18B20         | Heatsink & ambient temperature       | 1-Wire    | GPIO4 (4.7 kΩ pull-up)     |
| Voltage Divider | Bus voltage (3.703:1 ratio)          | Analog    | ADC1_CH0, ADC1_CH2         |
| Optocoupler     | Grid availability detection          | Digital   | GPIO39                     |

### Actuators

- **8-Channel Relay Module:** SPDT relays with optoisolated inputs.
  - Ch 1: Solar path switch
  - Ch 2: Grid fallback switch
  - Ch 3: Battery charge/discharge switch
  - Ch 4–7: Tier 1–4 load switches
  - Ch 8: Emergency shutdown (Normally Closed fail-safe)
- **16×2 I2C LCD:** PCF8574 backpack at address `0x27`, updated at 1 Hz on Core 1.

### Power Architecture

- **DC Bus:** 12 V common distribution.
- **Solar Input:** 20 W monocrystalline PV + MPPT buck converter (94–97% efficiency).
- **Battery:** 12.8 V 20 Ah (256 Wh) 4S LiFePO₄ with active BMS.
- **Grid Input:** 230 V AC → 12 V DC isolated rectifier (30 A, 360 W).

### Firmware Architecture

- **Core 0 (Safety):** 100 Hz loop — ADC sampling, threshold checking, failsafe state machine, relay isolation. Zero dynamic memory allocation. Zero network dependency.
- **Core 1 (Communication):** WiFi manager, WebSocket client (JSON serialization), command dispatcher, I2C LCD driver.
- **Memory:** Firmware ~1.5 MB, TFLite Micro partition < 500 KB, SPIFFS ~1 MB (offline buffer), OTA dual partition reserved.

---

## 17. External Services and Integrations

| Service                     | Purpose                                     | Integration Method                         | Fallback                         |
| --------------------------- | ------------------------------------------- | ------------------------------------------ | -------------------------------- |
| **Firebase Auth**           | User authentication, MFA, custom claims     | Client SDK + Admin SDK                     | Local session cache              |
| **Firebase Firestore**      | Real-time database, audit logs, config      | Admin SDK (backend), Client SDK (frontend) | Offline SDK cache                |
| **Firebase App Hosting**    | Next.js SSR/ISR hosting                     | Firebase CLI deploy                        | —                                |
| **OpenWeatherMap API v2.5** | Solar irradiance proxy, ambient temperature | REST API (backend)                         | 30-day historical moving average |
| **Render / Cloud Run**      | FastAPI container hosting                   | Docker image push + deploy                 | Local Docker Compose             |
| **GitHub Actions**          | CI/CD pipeline                              | YAML workflows                             | Manual deployment                |

---

## 18. Security Overview

### Authentication

- **Firebase Authentication:** Email/password with optional MFA. ID tokens (JWT) expire in 1 hour; refresh tokens auto-rotate.
- **Token Verification:** FastAPI validates every request via Firebase Admin SDK `verify_id_token()`.

### Authorization

- **RBAC via Custom Claims:** Roles embedded in the cryptographically signed ID token (Admin, Supervisor, Operator, Auditor).
- **Firestore Security Rules:** Enforce collection-level read/write permissions based on `request.auth.token.role`.

### Transport & Application Security

- **TLS 1.3:** All HTTP, WebSocket, and gRPC traffic.
- **CORS:** Restricted to known origins (`https://gridflowx-dashboard.web.app`, `localhost:3000`).
- **Rate Limiting:** 100 requests / 15 minutes (general); 5 attempts / 15 minutes (auth endpoints).
- **Input Validation:** Pydantic schemas on all REST endpoints; strict range checks on relay indices and threshold values.
- **Secrets Management:** Service account keys and API keys stored as encrypted environment variables; never committed to source control.
- **Audit Immutability:** `audit_logs` collection has `allow write: if false` in Firestore rules; writes exclusively via Admin SDK.

### Edge Security

- **Pre-Shared Key (PSK):** ESP32 WebSocket handshake uses `DEVICE_WS_TOKEN` to prevent unauthorized edge connections.
- **Hardware Watchdog:** Independent of software state; triggers relay de-energization on firmware crash.

---

## 19. Deployment Overview

### Local Development

- **Docker Compose:** FastAPI backend + Nginx reverse proxy (TLS termination) running locally.
- **Firebase Emulators:** Local Firestore and Auth for integration testing.

### Staging / Production

- **Frontend:** Deployed to Firebase App Hosting (serverless Next.js SSR).
- **Backend:** Containerized FastAPI deployed to Render or Google Cloud Run.
- **Database:** Firebase Firestore (serverless, auto-scaling).
- **CI/CD:** GitHub Actions pipeline — test → build → deploy frontend to Firebase + push backend container.

### Environment Configuration

- `.env` files per service (`.env.example` committed; actual secrets injected via CI/CD).
- Key variables: `FIREBASE_SERVICE_ACCOUNT_JSON`, `OPENWEATHER_API_KEY`, `DEVICE_WS_TOKEN`, `NEXT_PUBLIC_WS_URL`.

---

## 20. Monitoring and Maintenance Overview

### Metrics (Prometheus + Grafana)

- **FastAPI Instrumentation:** `prometheus-fastapi-instrumentator` exposing `/metrics`.
- **Key Metrics:** HTTP p95/p99 latency, active WebSocket connections, AI inference duration, CPU/memory utilization.
- **Alert Rules:** High API latency (> 1.5 s), WebSocket disconnection, inference latency > 100 ms.

### Logging

- **Structured JSON Logs:** FastAPI emits JSON-formatted logs to stdout with timestamp, level, service, module, and contextual details.
- **Log Aggregation:** Cloud Logging (or ELK/Filebeat) for centralized search and alerting.

### Model Monitoring

- **Continuous Evaluation:** Solar MAE, Load MAPE, and anomaly F1 tracked in `modelEvaluations` collection.
- **Drift Detection:** Daily batch jobs running Kolmogorov-Smirnov tests and Population Stability Index (PSI) on input features.
- **Retraining Triggers:** Automated weekly retraining; manual Admin trigger; drift-alert triggered retraining.

### Incident Response

- **Playbooks:** Documented runbooks for FastAPI service down, AI orchestrator failure, WebSocket connection loss, emergency shutdown events, and security token compromise.
- **Escalation:** Critical alerts notify Admin + Operator via dashboard overlay and optional external channels (email/Discord/Telegram in v1.1).

---

## 21. Expected Outcomes

| Metric                            | Target                   | Verification Method                  |
| --------------------------------- | ------------------------ | ------------------------------------ |
| Battery SoH degradation reduction | ≥ 20% vs. Rule-Based EMS | HIL 24-hour accelerated test profile |
| Peak-tariff cost savings          | ≥ 15%                    | Comparative billing simulation       |
| Failsafe trip latency             | < 10 ms (software)       | Logic analyzer on GPIO               |
| AI inference latency              | < 50 ms                  | ONNX Runtime benchmark               |
| Dashboard real-time latency       | < 200 ms                 | Edge-to-glass timing                 |
| Solar forecast accuracy           | MAE ≤ 12%                | Rolling 30-day evaluation            |
| Load forecast accuracy            | MAPE ≤ 8%                | Rolling 30-day evaluation            |
| Anomaly detection precision       | ≥ 92%                    | Labeled fault event evaluation       |
| Edge autonomy duration            | ∞ (until SoC < 5%)       | Disconnect WiFi endurance test       |
| Academic deliverables             | 1 IEEE Paper + 1 Patent  | Submission confirmations             |

---

## 22. Project Constraints

| #   | Constraint                                                                                                   | Implication                                                                |
| --- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------- |
| 1   | AI inference pipeline must complete within < 50 ms round-trip.                                               | Limits model complexity; mandates ONNX Runtime CPU optimization.           |
| 2   | ESP32 firmware binary must remain < 4 MB.                                                                    | Requires aggressive quantization for edge ML; OTA dual-partition overhead. |
| 3   | FreeRTOS Core 0 safety loop requires deterministic < 10 ms software trip and < 15 ms mechanical relay break. | No dynamic memory allocation in safety path; hardware interrupt priority.  |
| 4   | WebSocket telemetry throttled to 1 Hz at frontend to prevent DOM thrashing.                                  | High-frequency ADC data (100 Hz) buffered and averaged on edge or backend. |
| 5   | Firestore free tier limits (1 GB storage, 50K reads/day) for development.                                    | Requires telemetry aggregation and archival strategy to control costs.     |
| 6   | OpenWeatherMap free tier limits API calls to 60/minute.                                                      | Requires 60-minute polling with in-memory caching.                         |
| 7   | 12 V DC bus architecture for benchtop prototype.                                                             | Industrial scaling to 48 V / 400 V deferred to future hardware revisions.  |
| 8   | Capstone timeline and resource constraints.                                                                  | Feature scope must be ruthlessly prioritized; v1.0 is MVP + research.      |

---

## 23. Assumptions

> **ASSUMPTION:** The ESP32-WROOM-32E provides sufficient computational headroom on Core 0 for deterministic 100 Hz safety task execution with < 8 ms worst-case execution time.

> **ASSUMPTION:** Solar irradiance data from OpenWeatherMap API, supplemented by on-panel irradiance sensors, provides sufficient signal for 1-hour ahead forecasting with MAE ≤ 12%.

> **ASSUMPTION:** Firebase Firestore serves as the system of record for real-time telemetry, configuration setpoints, and audit logs without requiring a secondary relational database for v1.0.

> **ASSUMPTION:** Browser clients support TLS 1.3 and native WebSocket connections without requiring polyfills.

> **ASSUMPTION:** The 12 V 20 Ah LiFePO₄ battery bank with active BMS provides stable voltage profiles suitable for Rainflow cycle extraction and Coulomb-counting SoC estimation.

> **ASSUMPTION:** The HIL benchtop testbed using a 500 W halogen lamp array and triac dimmer can reproduce standard solar irradiance curves and rapid cloud transients with sufficient fidelity for comparative benchmarking.

> **ASSUMPTION:** The operator base has basic technical literacy sufficient to interpret dashboard telemetry and respond to alert notifications.

> **ASSUMPTION:** Internet connectivity at the deployment site is stable enough to maintain WebSocket connections for > 95% of operational hours; edge fallback handles the remaining 5%.

> **ASSUMPTION:** The Pareto RL agent can be trained effectively in simulation and transferred to the physical system without dangerous exploration behavior, due to the hard safety envelope and curriculum learning strategy.

---

## 24. Risks

| Risk                                       | Likelihood | Impact | Mitigation                                                                                                                          |
| ------------------------------------------ | ---------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Hybrid Action Space RL Complexity**      | High       | High   | Simplify to discrete-only action space or use Ray RLlib if SB3 proves insufficient.                                                 |
| **Firestore Write Volume / Cost**          | High       | High   | Aggregate 100 Hz edge data into 15-second or 1-minute windows before writing; use `telemetryCurrent` for high-frequency overwrites. |
| **TFLite Micro Transformer Feasibility**   | High       | Medium | Fallback to deterministic rule-based state machine on edge; full ONNX model remains in cloud.                                       |
| **Sensor Calibration Drift**               | Medium     | High   | Monthly calibration checks; drift monitoring in bias detection dashboard.                                                           |
| **WebSocket Auth Security**                | Medium     | Medium | Avoid URL query parameter tokens; use first-message JSON handshake or `Sec-WebSocket-Protocol` header.                              |
| **FreeRTOS WiFi + Safety Task Contention** | Medium     | High   | Strict core pinning — WiFi stack on Core 1, safety loop on Core 0 with highest priority.                                            |
| **OpenWeatherMap API Unavailability**      | Medium     | Medium | Implement 30-day historical moving average fallback for forecasting.                                                                |
| **Capstone Timeline Overrun**              | Medium     | High   | Agile sprint planning; MVP-first delivery; defer v1.1+ features.                                                                    |
| **Patent vs. Open Source Conflict**        | Low        | High   | Keep repository private until patent filing is complete; clarify licensing strategy.                                                |

---

## 25. Future Expansion Possibilities

### v1.1 — Operational Polish (Q3 2026)

- OAuth providers (Google, Microsoft) and MFA.
- Mobile-responsive dashboard optimization.
- Automated Firestore backups.
- Discord / Telegram critical alerts.

### v2.0 — Intelligence Upgrade (Q4 2026)

- Hierarchical planning agent (6–24 hour horizon).
- Natural language decision explanations via LLM.
- Online learning with replay buffers.
- Satellite imagery solar forecasting.

### v3.0 — Multi-Site Platform (Q1 2027)

- Multi-agent coordination for campus-scale optimization.
- Federated learning across distributed installations.
- Kubernetes migration and multi-region deployment.
- API gateway (Kong) for partner integrations.

### v4.0 — Enterprise Edition (Q3 2027)

- Grid-interactive demand response participation.
- Modbus TCP / IEC 61850 industrial protocol converters.
- EV charging station integration.
- Digital twin simulation environment.
- SaaS multi-tenant architecture.

### Research Initiatives

- **R1:** Attention pooling and autoregressive decoders for extended forecast horizons.
- **R2:** Multi-Agent RL (MARL) and Safe RL (Constrained Policy Optimization).
- **R3:** Neural Architecture Search (NAS) for ESP32-compatible sub-100 KB models.
- **R4:** Virtual Power Plant (VPP) participation and peer-to-peer energy trading.

---

## 26. Success Criteria

The GridFlowX project will be considered successful if all of the following criteria are met:

1. **Functional:** The ESP32 successfully routes power between Solar, Battery, and Grid sources while maintaining Tier 1 load uptime through all test scenarios.
2. **Safety:** The FreeRTOS safety loop consistently trips within < 10 ms under simulated overcurrent, undervoltage, and thermal runaway conditions.
3. **AI Performance:** The UAEO achieves solar forecast MAE ≤ 12%, load forecast MAPE ≤ 8%, and anomaly detection precision ≥ 92% on the test dataset.
4. **Economic:** HIL benchmarking demonstrates ≥ 15% grid cost reduction and ≥ 20% battery degradation reduction versus the Rule-Based EMS baseline.
5. **System Integration:** The end-to-end pipeline (ESP32 → FastAPI → Firestore → Next.js Dashboard) operates with < 200 ms edge-to-glass latency and supports concurrent operator sessions.
6. **Security:** Penetration testing confirms no unauthorized relay control, no privilege escalation, and immutable audit trails.
7. **Research:** IEEE conference manuscript is submitted and Indian Utility Patent application (Form-2) is filed with the IPO Chennai jurisdiction.
8. **Code Quality:** Test coverage ≥ 85% (backend), all critical paths covered by E2E tests, and zero critical security vulnerabilities in dependency scans.

---

**End of Document**

_This document serves as the single source of truth for the GridFlowX platform. All subsystem designs, implementation tasks, and test plans must align with the requirements, constraints, and success criteria defined herein._
