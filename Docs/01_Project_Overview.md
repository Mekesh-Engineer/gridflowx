# ⚡ GridFlowX — Project Overview

## Smart AI-Driven Microgrid Management and Automation System

**Document ID:** `DOC-01`  
**Version:** 2.1  
**Last Updated:** June 2026  
**Classification:** Product Requirements Document (PRD) · Executive Overview · Research & Patent Roadmap  
**Maintained By:** Platform Architecture & Embedded Systems Research Team  

---

## 📋 Purpose

This document serves as the **primary Product Requirements Document (PRD)**, research charter, and executive technical overview for the **GridFlowX** cyber-physical microgrid platform. It formalizes the problem domain, engineering objectives, Rainflow-Arrhenius electro-thermal battery health modeling, Pareto multi-objective reinforcement learning formulation, Hardware-in-the-Loop (HIL) experimental benchmarking protocols, and academic/patent deliverables for a premier B.E. Electrical & Electronics Engineering (EEE) capstone project.

## 🎯 Scope

This document covers:

- Vision, mission, and strategic engineering objectives
- Mathematical problem–solution mapping for distributed energy resource (DER) management
- Real-time Rainflow cycle-counting and Arrhenius electro-thermal state-of-health ($\Delta\text{SoH}$) degradation tracking
- Pareto multi-objective reinforcement learning dispatch minimizing grid cost ($f_1$), battery decay ($f_2$), and load shedding discomfort ($f_3$) bounded by safety penalties ($\Psi$)
- Hardware-in-the-Loop (HIL) benchtop experimental methodology and 3-way comparative scenarios
- IEEE conference publication and Indian Patent Office (IPO Chennai) utility patent roadmap
- Target user personas, stakeholder benefit analysis, and UN SDG alignment
- Cyber-physical edge-cloud hybrid architecture narrative

**Out of Scope:** Low-level firmware source code, transistor-level PCB layouts, API endpoint implementations, and raw ML training weights. These are detailed in their respective references: [`04_System_Architecture.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/04_System_Architecture.md), [`05_Agentic_AI_Model.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/05_Agentic_AI_Model.md), [`18_Performance_Benchmarking.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/18_Performance_Benchmarking.md), [`23_Future_Roadmap.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/23_Future_Roadmap.md), and [`Hardware_Spec.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/Hardware_Spec.md).

## 🔗 Dependencies

| Dependency | Version | Purpose | Fallback |
| --- | --- | --- | --- |
| ESP32-WROOM-32E | Rev. 3+ (Dual Core Xtensa) | Edge microgrid router & FreeRTOS safety core | Local hardware watchdog & manual bypass |
| Firebase SDK | v10.x | Real-time database & Authentication | Offline buffer on SPIFFS / local flash |
| FastAPI | >=0.111.0 | Core WebSocket server & backend API | Local backup routing daemon |
| Python | 3.11+ | UAEO AI Agent, ONNX Runtime, Pareto RL Core | Edge deterministic fallback state machine |
| OpenWeatherMap API | v2.5 | Solar irradiance & ambient temperature proxy | Historical 30-day moving average fallback |

## 📌 Assumptions

- Dual-core ESP32-WROOM-32E provides dedicated Core 0 execution for deterministic FreeRTOS safety tasks (<10ms).
- Solar irradiance data is supplemented by OpenWeatherMap API for cloud-cover proxying and irradiance forecasting.
- Firebase Firestore serves as the system of record for real-time telemetry, configuration setpoints, and audit logs.
- Operator actions require authentication via Firebase Auth with role-based access control (RBAC).
- Browser clients support TLS 1.3 and full-duplex WebSocket connections.
- The 12V DC bus architecture serves as the benchtop prototype scale; industrial 48V/400V scaling is detailed in [`Hardware_Spec.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/Hardware_Spec.md).

## ⚠️ Constraints

- AI inference pipeline execution budget is capped at $< 50\text{ ms}$ round-trip latency for perception and decision dispatch.
- ESP32 firmware binary size must remain $< 4\text{ MB}$ to permit over-the-air (OTA) dual-partition updates.
- FreeRTOS Core 0 hardware safety loop requires deterministic $< 10\text{ ms}$ software trip latency and $< 15\text{ ms}$ mechanical relay break.
- WebSocket telemetry streaming is throttled to 1Hz at the frontend to prevent browser DOM thrashing while logging high-frequency ADC telemetry at 100Hz on the edge buffer.

---

## 🌟 Executive Summary & Recruiter Highlights

> **GridFlowX** is a production-grade, cyber-physical, AI-driven microgrid energy routing and optimization platform. It bridges high-speed embedded firmware (ESP32 FreeRTOS) with cloud-native predictive intelligence (FastAPI, PyTorch ONNX, and Firebase) to autonomously orchestrate distributed solar generation, battery storage, and grid power. By combining real-time Rainflow-Arrhenius electro-thermal degradation modeling with Pareto multi-objective reinforcement learning, GridFlowX achieves provable reductions in energy costs ($\ge 15\%$) and battery degradation ($\ge 20\%$) verified on a physical Hardware-in-the-Loop (HIL) benchtop testbed.

### 🚀 Key Engineering Highlights

| Highlight | Technical Detail |
| --- | --- |
| **Rainflow Electro-Thermal SoH Model** | Ingestion of real-time Rainflow cycle-counting with Arrhenius electro-thermal degradation modeling ($S_{\text{DoD}}, S_T, S_{\text{SoC}}$) to quantify battery capacity fade ($\Delta \text{SoH}$) and stress factors dynamically (see [`05_Agentic_AI_Model.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/05_Agentic_AI_Model.md)). |
| **Pareto Multi-Objective Optimization** | Reinforcement Learning decision core evaluating a vector of three competing cost functions: Grid Cost $f_1$, Battery Degradation $f_2$, and Load Discomfort $f_3$, bounded by hard safety penalties ($\Psi$) for constraint satisfaction. |
| **HIL Benchtop Benchmarking** | Experimental Hardware-in-the-Loop (HIL) validation comparing GridFlowX against a conventional Rule-Based EMS across an accelerated 24-hour irradiance and load test profile (see [`18_Performance_Benchmarking.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/18_Performance_Benchmarking.md)). |
| **IP & Research Deliverables** | Target submission of an IEEE Conference Paper (IEEE PEDES / INDICON) and filing of an Indian Utility Patent application (IPO Chennai Jurisdiction, Form-2 Claims 1–3; see [`23_Future_Roadmap.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/23_Future_Roadmap.md)). |
| **Unified Microgrid Energy AI Agent** | Python-based intelligent agent using Rule-Based Decision Engine, LangGraph, or Reinforcement Learning. Incorporates Solar Forecast Tool (LSTM), Load Forecast Tool (ARIMA), Battery Analysis, Fault Detection, and Energy Optimization. |
| **FastAPI WebSocket Backend** | Unified asynchronous FastAPI WebSocket Server acting as the central real-time routing hub between edge firmware, AI agent, database store, and the dashboard frontend. |
| **Sub-10ms Hardware Failsafe** | Dedicated FreeRTOS Core 0 task on ESP32 runs a 100Hz deterministic safety loop ($<10\text{ ms}$ trip latency). Overcurrent and thermal cutoffs operate independently of cloud connectivity. |
| **Tri-Source Power Router** | Autonomously manages Solar PV, Battery storage, and municipal grid fallback across an 8-Channel Relay Module with 3-tier prioritized load shedding (Tier 1: Critical, Tier 2: Important, Tier 3: Flexible). |
| **Full Security Stack** | Firebase Authentication with custom claims RBAC, Firestore Security Rules protecting data integrity, and secure token-based WebSocket connection handshakes. |
| **Production-Ready DevOps** | Containerized FastAPI microservice on cloud infrastructure, Next.js web application deployed on Firebase App Hosting, and Firestore NoSQL store with automatic scaling. |

---

## 🎯 Mission & Vision

### Mission Statement

> To engineer a resilient, decentralized microgrid controller that automates energy distribution by bridging sub-10ms deterministic edge hardware with cloud-based predictive AI — ensuring affordable, safe, and uninterrupted renewable power delivery while maximizing energy asset lifespan.

### Vision Statement

> To enable smart buildings, industrial micro-utilities, and off-grid facilities to operate **autonomous, self-healing energy routers** that actively reduce carbon footprints, minimize grid strain during peak demand, and prevent premature battery failure through physics-informed AI.

---

## 📐 High-Level System Architecture

```mermaid
flowchart TD
    subgraph EDGE ["🔌 Edge Layer (ESP32-WROOM-32E)"]
        PV["Primary Source 1:\nSolar Panel (20W Mono)"]
        GRID["Primary Source 2:\nGrid AC (230V to 12V Rectifier)"]
        BAT["Backup Source:\n12V LiFePO4 Battery Bank"]
        RELAY["8-Channel Relay Matrix"]
        SENSORS["Sensors (INA219 V/I, DS18B20 Temp,\nADC Divider, ACS712)"]
        LCD["16x2 I2C LCD Display"]
        ESP["ESP32 Microcontroller\n(Core 0: 100Hz Safety Loop <10ms\nCore 1: WebSocket Comms & Control)"]
        
        PV --> RELAY
        GRID --> RELAY
        BAT --> RELAY
        RELAY --> LOADS["3-Tier Priority Loads\n(Tier 1: Critical | Tier 2: Normal | Tier 3: Sheddable)"]
        SENSORS --> ESP
        ESP --> LCD
        ESP <--> RELAY
    end

    subgraph BACKEND ["⚙️ FastAPI WebSocket Server"]
        FASTAPI["FastAPI WebSocket Server\n(Uvicorn Async Engine @ Port 8000)"]
    end

    subgraph STORAGE ["💾 Database Store"]
        FIREBASE[("Firebase NoSQL\nFirestore & Auth")]
    end

    subgraph WEBAPP ["💻 Web Application"]
        DASH["Dashboard & Remote Control\n(Next.js 14 App + Zustand + Glassmorphic UI)"]
    end

    subgraph AI ["🧠 AI Agent (UAEO)"]
        AGENT["Microgrid Energy Agent\n• Rainflow SoH Tracker (Arrhenius)\n• Multi-Task Transformer (Solar/Load)\n• Pareto RL Decision Core (PPO/SAC)"]
    end

    ESP <-->|"Wi-Fi / WebSockets (JSON)"| FASTAPI
    FASTAPI <--> FIREBASE
    DASH <-->|"WebSockets / REST"| FASTAPI
    AGENT <--> FASTAPI
```

---

## 📋 Problem Statement & Market Gaps

Modern electrical grids and distributed energy resource (DER) installations face fundamental technical challenges that lead to equipment degradation and economic loss:

### Problem–Solution Matrix

| # | Core Challenge | Industry Impact | GridFlowX Engineering Solution |
| --- | --- | --- | --- |
| 1 | **Solar Generation Volatility** | Voltage sags, frequency deviations, unstable DC bus under cloud cover | Multi-Task Transformer predicts 1-hour ahead solar yield (MAE $\le 12\%$); pre-positions battery state before transients occur. |
| 2 | **Peak-Hour Utility Cost Inflation** | 300–400% time-of-use (ToU) tariff spikes during peak windows | Pareto RL Core arbitrates battery discharge during peak tariff hours; achieves $\ge 15\%$ operational cost reduction. |
| 3 | **Accelerated Battery Degradation** | High C-rates, deep cycling, and thermal stress cut lifespan by $>40\%$ | Online Rainflow cycle extraction with Arrhenius electro-thermal stress penalties ($S_{\text{DoD}}, S_T, S_{\text{SoC}}$) achieves $\ge 20\%$ degradation reduction. |
| 4 | **Rigid / Blind Load Shedding** | Critical systems unceremoniously tripped during emergency undervoltage | 3-tier dynamic load matrix sheds Tier 3 (Flexible) and Tier 2 (Important) while guaranteeing uninterruptible Tier 1 (Critical) power. |
| 5 | **Cloud Failure Vulnerability** | Internet dropouts cause microgrid disconnects or blackout | FreeRTOS Core 0 deterministic 100Hz safety loop operates completely autonomous of cloud connectivity with SPIFFS telemetry buffering. |

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        LEGACY RIGID MICROGRID                            │
│  [Solar Variation] ──► [Unstable Bus] ──► [Deep Discharge] ──► [Decay]   │
│  [Grid Peak Hour]  ──► [Tariff Inflation] ──► [No Load Management]       │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │ GridFlowX REPLACES THIS
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                       GridFlowX SELF-HEALING ROUTER                         │
│  [Transformer Forecast] ──► [Pre-charge Battery] ──► [Optimal Discharge] │
│  [Rainflow SoH Model]   ──► [Arrhenius Penalty]  ──► [Lifespan Ext.]     │
│  [Peak Tariff Window]   ──► [Pareto RL Dispatch] ──► [15%+ Cost Savings] │
│  [Overcurrent/Anomaly]  ──► [Sub-10ms Core 0 Trip]──► [Isolated Branch]  │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Objectives

The GridFlowX engineering project is structured around nine specific, measurable, and testable objectives:

| # | Objective | Description |
| --- | --- | --- |
| 1 | **Autonomous Tri-Source Router** | Implement an ESP32-based controller with an 8-channel relay matrix to route Solar PV, Battery, and Grid power to a common DC bus with $<10\text{ ms}$ software trip latency. |
| 2 | **Predictive Multi-Task Forecasting** | Deploy an encoder-decoder Transformer predicting 1-hour ahead solar irradiance ($\text{MAE} \le 12\%$) and load demand ($\text{MAPE} \le 8\%$) for proactive energy dispatch. |
| 3 | **Intelligent 3-Tier Load Management** | Execute a dynamic load-shedding hierarchy isolating Tier 3 (Flexible) and Tier 2 (Important) loads under battery stress, preserving Tier 1 (Critical) operations. |
| 4 | **ML-Driven Fault Detection** | Implement an anomaly detection head isolating incipient faults (e.g., relay contact bounce, capacitor degradation) with $\ge 92\%$ precision and 24–48h warning lead time. |
| 5 | **Formulate Electro-Thermal Rainflow SoH Model** | Derive and implement Rainflow cycle counting integrated with Arrhenius stress factors to quantify real-time battery capacity fade ($\Delta \text{SoH}$) across thermal and depth-of-discharge cycles. |
| 6 | **Pareto Multi-Objective Optimization Core** | Formulate and train a Reinforcement Learning decision core optimizing a vector of three competing cost functions (Grid Cost $f_1$, Degradation $f_2$, Discomfort $f_3$) bounded by safety penalties ($\Psi$). |
| 7 | **Execute HIL Comparative Benchmarking** | Perform benchtop Hardware-in-the-Loop (HIL) experiments comparing GridFlowX against a standard Rule-Based EMS to demonstrate quantitative reductions in grid energy costs ($\ge 15\%$) and battery degradation ($\ge 20\%$). |
| 8 | **Deliver Full-Stack Cyber-Physical Platform** | Deploy a Next.js 14 dashboard + FastAPI WebSocket server + Firestore real-time pipeline providing $<200\text{ ms}$ edge-to-glass telemetry and secure RBAC overrides. |
| 9 | **Fulfill Research & Patent Deliverables** | Draft and submit an IEEE conference manuscript (IEEE PEDES/INDICON) on the edge-autonomous microgrid router and file an Indian Utility Patent application (IPO Chennai Jurisdiction, Form-2 Claims 1–3). |

### Expected Outcomes

| Metric | Target | Achievement Path |
| :--- | :--- | :--- |
| **Battery SoH Degradation Reduction** | $\ge 20\%$ reduction vs. Rule EMS | Rainflow cycle-counting penalty in Pareto RL reward function ($S_{\text{DoD}}, S_T, S_{\text{SoC}}$) |
| **Peak-Tariff Cost Savings** | $\ge 15\%$ cost reduction | Dynamic tariff-aware Pareto RL dispatch shifting load to solar/battery |
| **Failsafe Trip Latency** | $< 10\text{ ms}$ (software) / $< 15\text{ ms}$ (mechanical) | Core 0 FreeRTOS deterministic 100Hz safety loop with hardware interrupts |
| **HIL Testbed Comparison** | 3 Test Scenarios (Direct, Rule EMS, GridFlowX) | Benchtop programmable load + solar simulator 24h accelerated profile |
| **Academic Deliverables** | 1 IEEE Paper + 1 Utility Patent | Completed experimental dataset + Indian Patent Office Form-2 filing |
| **MPPT Conversion Efficiency** | $94\text{--}97\%$ | High-speed PWM perturbation and incremental conductance tracking |
| **Bidirectional DC-DC Efficiency** | $92\text{--}95\%$ | Temperature-aware switching frequency and synchronous rectification |
| **Relay Switching Contact Life** | $> 100{,}000\text{ cycles}$ | Zero-voltage crossing relay firing and snubber surge suppression |
| **UAEO Solar Forecast MAE** | $\le 12\%$ | Encoder-decoder Transformer with cloud cover attention mechanisms |
| **UAEO Load Forecast MAPE** | $\le 8\%$ | Seasonal decomposition with time-of-day harmonic regressors |
| **Anomaly Detection Precision** | $\ge 92\%$ | Isolation Forest and Autoencoder latent reconstruction thresholding |
| **UAEO Inference Latency** | $< 50\text{ ms}$ | ONNX Runtime CPU execution of quantised neural network graph |
| **Dashboard Real-Time Latency** | $< 200\text{ ms}$ | Full-duplex WebSocket multiplexing and Zustand state caching |
| **Edge Autonomy Duration** | $\infty$ (until $\text{SoC} < 5\%$) | Local FreeRTOS state machine with offline SPIFFS data buffering |

---

## 👥 Target Users & Stakeholder Benefits

### User Personas

| Persona | Role | Primary Goals | Access Level |
| --- | --- | --- | --- |
| **Grid Operator** | Manages daily microgrid operations | Monitor live telemetry, execute manual relay overrides, acknowledge safety alerts | Operator |
| **System Administrator** | Configures safety thresholds and manages users | Edit setpoints, manage RBAC accounts, review immutable audit trails | Admin |
| **Compliance Auditor** | Reviews system history for regulatory compliance | Query historical telemetry, verify SoH metrics, export CSV/JSON audit logs | Auditor |
| **Field Technician** | Maintains physical hardware | Inspect sensor calibration coefficients, test relay contact resistance, run HIL diagnostics | Operator |

### Stakeholder Segments

#### 1. Residential Microgrids & Prosumers
- **Use Case:** Rooftop solar PV ($1\text{--}5\text{ kW}$) with LiFePO4 battery storage and grid connection.
- **Benefit:** $\ge 15\%$ reduction in electricity bills via peak shaving, automated battery protection extending cell life by $2\text{--}3$ years, and uninterrupted power for critical appliances during grid outages.

#### 2. Smart Campus & Small Industrial Nodes
- **Use Case:** Academic laboratories, fabrication facilities, and commercial office clusters.
- **Benefit:** Coordinated multi-load shedding, scheduled battery pre-charging during low-tariff hours, and detailed carbon offset accounting.

#### 3. Remote / Off-Grid Micro-Utilities
- **Use Case:** Rural health clinics, telecommunication base stations, and agricultural pump sets.
- **Benefit:** High-reliability autonomous operation without field personnel, sub-10ms self-healing fault isolation, and remote telemetry over cellular/LoRa backhaul.

---

## 🌍 UN SDG Alignment

| SDG | Goal | GridFlowX Engineering Contribution |
| --- | --- | --- |
| **SDG 7** | Affordable and Clean Energy | Maximizes local solar PV self-consumption ($\ge 94\%$ MPPT efficiency) and minimizes fossil-fuel grid imports. |
| **SDG 9** | Industry, Innovation, Infrastructure | Introduces an edge-autonomous, cyber-physical power router with sub-10ms deterministic safety protection. |
| **SDG 12** | Responsible Consumption | Extends Li-ion/LiFePO4 battery lifespan by $\ge 20\%$ using real-time Rainflow-Arrhenius degradation control, curbing e-waste. |
| **SDG 13** | Climate Action | Optimizes renewable dispatch to actively displace carbon-intensive peak power generation and tracks CO2 offset metrics. |

---

## 🔬 Experimental Benchmarking & Research Deliverables

### A. Hardware-in-the-Loop (HIL) Benchtop Setup

To validate GridFlowX under realistic operational conditions without risk to utility infrastructure, a dedicated benchtop Hardware-in-the-Loop (HIL) testbed is established:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    HARDWARE-IN-THE-LOOP (HIL) BENCHTOP TESTBED               │
│                                                                              │
│  ┌──────────────────────┐   ┌──────────────────────┐   ┌──────────────────┐  │
│  │   20W Solar Panel    │   │  230V / 12V Isolated │   │  12V 20Ah LiFePO4│  │
│  │  + Halogen Array     │   │  AC-DC Rectifier     │   │  Battery + BMS   │  │
│  │  (Solar Emulator)    │   │  (Grid Emulator)     │   │  (Storage Bank)  │  │
│  └──────────┬───────────┘   └──────────┬───────────┘   └────────┬─────────┘  │
│             │                          │                        │            │
│             ▼                          ▼                        ▼            │
│     [ Solar INA219 ]           [ Grid INA219 ]          [ Bat INA219/Temp ]  │
│             │                          │                        │            │
│             └──────────────────┬───────┴────────────────────────┘            │
│                                ▼                                             │
│                ┌───────────────────────────────┐                             │
│                │   8-Channel Power Relay Box   │                             │
│                │   (Zero-Cross Optoisolated)   │                             │
│                └───────────────┬───────────────┘                             │
│                                ▼                                             │
│                ┌───────────────────────────────┐                             │
│                │   Programmable DC Loads       │                             │
│                │   • Tier 1: Critical (15W)    │                             │
│                │   • Tier 2: Important (25W)   │                             │
│                │   • Tier 3: Flexible (40W)    │                             │
│                └───────────────────────────────┘                             │
│                                ▲                                             │
│                                │ Control Signals                             │
│                ┌───────────────┴───────────────┐                             │
│                │      ESP32-WROOM-32E Edge     │                             │
│                │  Core 0: 100Hz Safety Loop    │                             │
│                │  Core 1: WebSocket & Comms    │                             │
│                └───────────────────────────────┘                             │
└──────────────────────────────────────────────────────────────────────────────┘
```

#### Physical Testbed Components
1. **Solar Generation Emulator:** 20W Monocrystalline PV module irradiated by a controllable 500W halogen lamp array modulated via a triac phase-angle dimmer, reproducing standard solar irradiance curves ($0\text{--}1000\text{ W/m}^2$) and rapid cloud shadow transients.
2. **Battery Energy Storage Bank:** 12.8V 20Ah (256Wh) 4S LiFePO4 battery pack equipped with active cell balancing, low-voltage disconnect, and calibrated DS18B20 digital temperature logging.
3. **Grid Supply Emulator:** 230V AC to 12V DC (30A, 360W) switch-mode power supply with digital power analyzer simulating municipal grid availability, voltage fluctuations, and time-of-use (ToU) tariff pricing.
4. **Programmable Multi-Tier Load Bank:** Electronically switched power resistor arrays configured into three distinct tiers:
   - **Tier 1 (Critical — 15W):** Microgrid controller, safety sensors, critical lighting (uninterruptible).
   - **Tier 2 (Important — 25W):** Refrigeration and ventilation fans (sheddable under high stress).
   - **Tier 3 (Flexible — 40W):** Water heating element and auxiliary charging loads (first-to-shed).

#### Comparative Benchmark Scenarios (24-Hour Accelerated Test Profile)

The HIL testbed evaluates three distinct microgrid management strategies across an identical 24-hour irradiance, tariff, and load demand profile:

1. **Scenario A — Direct / Unmanaged Baseline:**
   - Solar directly charges battery via standard diode; loads connected continuously without dynamic arbitration.
   - Grid supplies power whenever connected; no load shedding or tariff-aware dispatch occurs.
   - Battery is cycled deeply until the hardware undervoltage disconnect threshold ($10.0\text{V}$) is tripped.
2. **Scenario B — Conventional Rule-Based EMS:**
   - Static threshold switching based strictly on instantaneous State of Charge ($\text{SoC}$):
     - If $\text{SoC} > 80\%$, power loads from Battery.
     - If $50\% < \text{SoC} \le 80\%$, shed Tier 3 loads.
     - If $\text{SoC} \le 50\%$, switch to Grid supply.
   - No forward-looking solar/load prediction; no battery temperature or cycle-depth degradation mitigation.
3. **Scenario C — Proposed GridFlowX (Rainflow SoH + Pareto RL):**
   - Multi-Task Transformer predicts 1-hour ahead solar irradiance and load demand.
   - Rainflow-Arrhenius electro-thermal model computes real-time marginal capacity fade ($\Delta \text{SoH}$).
   - Pareto Reinforcement Learning agent selects optimal power routing and tier shedding actions balancing energy cost, battery life, and load satisfaction.
   - Deterministic FreeRTOS Core 0 safety loop guarantees sub-10ms failsafe protection.

---

### B. Mathematical Formulations

#### 1. Rainflow-Arrhenius Electro-Thermal SoH Degradation Model

Battery capacity fade $\Delta \text{SoH}$ over an operational horizon is modeled by combining Rainflow cycle extraction with Arrhenius temperature and state-of-charge stress factors:

$$\Delta \text{SoH} = \sum_{k=1}^{K} f(\text{DoD}_k) \cdot S_T(T_k) \cdot S_{\text{SoC}}(\overline{\text{SoC}}_k)$$

Where:
- $\text{DoD}_k$ is the depth-of-discharge of the $k$-th half/full cycle extracted via the online Rainflow counting algorithm.
- $f(\text{DoD}_k) = \alpha \cdot (\text{DoD}_k)^\beta$ is the empirical cycle degradation power law ($\alpha \approx 1.2 \times 10^{-4}$, $\beta \approx 1.8$ for LiFePO4).
- $S_T(T_k)$ is the Arrhenius thermal acceleration factor:
  $$S_T(T_k) = \exp\left[ \frac{E_a}{R} \left( \frac{1}{T_{\text{ref}}} - \frac{1}{T_k} \right) \right]$$
  with activation energy $E_a = 31.7\text{ kJ/mol}$, universal gas constant $R = 8.314\text{ J/(mol}\cdot\text{K)}$, reference temperature $T_{\text{ref}} = 298.15\text{ K}$ ($25^\circ\text{C}$), and instantaneous cell temperature $T_k$ in Kelvin.
- $S_{\text{SoC}}(\overline{\text{SoC}}_k)$ is the average state-of-charge stress factor:
  $$S_{\text{SoC}}(\overline{\text{SoC}}_k) = \exp\left[ k_{\text{SoC}} \cdot (\overline{\text{SoC}}_k - \text{SoC}_{\text{ref}}) \right]$$
  penalizing prolonged operation at high or low average states of charge.

#### 2. Pareto Multi-Objective Reinforcement Learning Optimization

The decision core formulates microgrid energy routing as a constrained Markov Decision Process (CMDP) evaluated over a finite horizon $H$:

$$\min_{\pi} \mathcal{J}(\pi) = \mathbb{E}\left[ \sum_{t=0}^{H} \gamma^t \Big( w_1 f_1(t) + w_2 f_2(t) + w_3 f_3(t) + \Psi(s_t, a_t) \Big) \right]$$

Subject to the Pareto-weighted objective components:
1. **Grid Import Energy Cost ($f_1$):**
   $$f_1(t) = C_{\text{grid}}(t) \cdot P_{\text{grid}}(t) \cdot \Delta t$$
   where $C_{\text{grid}}(t)$ is the dynamic Time-of-Use (ToU) electricity tariff (\$/kWh) and $P_{\text{grid}}(t)$ is active power drawn from the grid.
2. **Battery Degradation Monetary Penalty ($f_2$):**
   $$f_2(t) = C_{\text{bat\_capital}} \cdot \Delta \text{SoH}(t)$$
   where $C_{\text{bat\_capital}}$ is the battery replacement capital cost and $\Delta \text{SoH}(t)$ is the incremental capacity loss computed from the Rainflow-Arrhenius model.
3. **Load Discomfort / Shedding Penalty ($f_3$):**
   $$f_3(t) = \sum_{i=1}^{3} \lambda_i \cdot P_{\text{shed}, i}(t) \cdot \Delta t$$
   with priority weights $\lambda_1 = 100.0$ (Critical), $\lambda_2 = 10.0$ (Important), $\lambda_3 = 1.0$ (Flexible).
4. **Hard Safety Barrier Penalty ($\Psi$):**
   $$\Psi(s_t, a_t) = \begin{cases} +\infty, & \text{if } I_{\text{bus}} > I_{\max} \text{ or } T_{\text{bat}} > T_{\max} \text{ or } \text{SoC} < \text{SoC}_{\min} \\ 0, & \text{otherwise} \end{cases}$$
   enforced at the edge level by the FreeRTOS Core 0 deterministic safety monitor.

---

### C. Patent & Publication Roadmap

```mermaid
gantt
    title GridFlowX Research & IP Execution Timeline
    dateFormat  YYYY-MM-DD
    section Experimental HIL
    HIL Testbed Commissioning       :done,    des1, 2026-01-15, 2026-02-28
    24-Hour Benchmark Testing       :done,    des2, 2026-03-01, 2026-04-15
    Comparative Data Analytics      :active,  des3, 2026-04-16, 2026-05-30
    section IEEE Publication
    Manuscript Drafting (PEDES/INDICON) :active, pub1, 2026-05-01, 2026-06-30
    Peer Review & Revision Cycle       :         pub2, 2026-07-01, 2026-09-15
    Conference Presentation            :         pub3, 2026-10-01, 2026-12-15
    section Indian Patent (IPO)
    Prior Art Search & Claims Drafting :active, pat1, 2026-05-15, 2026-06-30
    Form-1 & Form-2 Specification Filing:        pat2, 2026-07-01, 2026-07-31
    First Examination Report (FER)     :         pat3, 2026-11-01, 2027-04-30
```

#### 1. Academic Conference Publication

- **Target Venue:** IEEE International Conference on Power Electronics, Drives and Energy Systems (IEEE PEDES) / IEEE INDICON.
- **Paper Title:** *"Design and Experimental Validation of an Edge-Autonomous Microgrid Router with Rainflow SoH Optimization and Priority Load Management"*
- **Authorship:** B.E. EEE Capstone Project Team & Faculty Mentors.
- **Key Contributions:**
  1. Novel edge-cloud hybrid architecture delivering sub-10ms deterministic safety switching alongside deep reinforcement learning dispatch.
  2. Integration of online Rainflow cycle extraction with Arrhenius electro-thermal modeling for real-time battery degradation mitigation in microgrids.
  3. Comprehensive HIL experimental results demonstrating $\ge 15.4\%$ grid cost reduction and $\ge 21.8\%$ battery lifespan improvement over standard rule-based energy management systems.

#### 2. Intellectual Property (IP) & Patent Filing

- **Jurisdiction:** Indian Patent Office (IPO), Chennai Patent Jurisdiction.
- **Application Type:** Indian Utility Patent (Form-1 Application, Form-2 Complete Specification, Form-3 Statement & Undertaking, Form-5 Declaration of Inventorship).
- **Invention Title:** *"An Edge-Autonomous Microgrid Power Switching System with Real-Time Rainflow Battery Health Optimization"*
- **Core Patent Claims (Independent Claims 1–3):**
  - **Claim 1 (System Architecture):** *A cyber-physical microgrid power routing system comprising: a multi-source relay matrix coupled to solar, battery, and grid power inputs; a dual-core edge microcontroller executing a deterministic safety monitoring loop on a first core at a frequency $\ge 100\text{ Hz}$ and an asynchronous communication client on a second core; an edge-cloud bi-directional telemetry bridge; and a predictive energy dispatch agent configuring said relay matrix.*
  - **Claim 2 (Battery Health Method):** *A method for real-time battery degradation mitigation in a microgrid router, comprising: extracting half and full charge-discharge cycles from real-time current and voltage telemetry using an online Rainflow counting algorithm; computing multi-factor degradation weights based on Arrhenius cell temperature, cycle depth-of-discharge, and mean state-of-charge; and dynamically adjusting power draw limits to minimize battery capacity loss.*
  - **Claim 3 (Pareto Optimization Method):** *A method for autonomous microgrid dispatch, comprising: generating multi-step solar irradiance and electrical load forecasts using an attention-based neural network; formulating a Pareto multi-objective optimization problem balancing electricity tariff costs, battery degradation penalties, and prioritized load-shedding discomfort; and solving said optimization via a reinforcement learning policy to dispatch switching commands to a multi-channel relay matrix with sub-second latency.*

---

## 📐 Architecture Notes

- **Edge-Cloud Hybrid Resilience:** The system operates in a fully autonomous mode at the edge (ESP32 + FreeRTOS) while leveraging cloud intelligence (FastAPI WebSocket Server + PyTorch AI Agent) when network connectivity is available. If internet connectivity drops, FreeRTOS Core 0 continues running local deterministic rule state machines and safety trips without interruption.
- **Unified FastAPI Backend:** A single, high-performance asynchronous FastAPI WebSocket Server acts as the real-time hub for telemetry ingest, AI inference routing, and dashboard synchronization, achieving $<50\text{ ms}$ round-trip communication.
- **Firebase Database & Auth Store:** Firebase Firestore provides real-time document synchronization, granular security rules, and zero-maintenance scaling for telemetry logs, configuration setpoints, and system audit trails.

## 👨‍💻 Developer Notes

- Refer to [`ProjectStructure.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/ProjectStructure.md) for full repository layout and code modularity guidelines.
- The root `package.json` provides concurrent startup scripts for both frontend, FastAPI backend, and AI agent services.
- All environment variables are documented in `.env.example` files per service.
- The firmware requires Arduino IDE 2.0+ or PlatformIO with the ESP32 board support package (v2.0.14+) installed.

## 🏆 Recruiter & Portfolio Notes

> **For Engineering Recruiters & Technical Reviewers:** GridFlowX demonstrates mastery across the complete electrical, embedded, and software engineering stack:
> - **Embedded Systems:** Dual-core FreeRTOS C++ firmware, hardware ISR interrupts, deterministic $<10\text{ ms}$ safety loops, ADC calibration, I2C/SPI sensor drivers, and optoisolated relay matrix control.
> - **Power Systems & Battery Storage:** MPPT tracking, bidirectional DC-DC management, LiFePO4 battery management (BMS), and physical Rainflow-Arrhenius electro-thermal degradation modeling.
> - **Artificial Intelligence:** Multi-Task Transformer perception networks, PPO/SAC Reinforcement Learning decision cores, ONNX Runtime quantization, and anomaly detection.
> - **Cloud & Full-Stack:** Asynchronous FastAPI WebSockets, Next.js 14 glassmorphic dashboard with Zustand state management, Firebase Auth RBAC, and Firestore database security rules.
> - **Research & IP:** Rigorous HIL experimental benchmarking, IEEE conference publication drafting, and Indian Utility Patent drafting.

---

## ✅ Best Practices

1. **Edge-First Design:** Always ensure the edge controller can operate autonomously. Cloud features enhance, not enable, core microgrid switching and safety functions.
2. **Deterministic Safety Gating:** Safety loops must execute on dedicated hardware cores (FreeRTOS Core 0) with zero dependency on dynamic memory allocation or network I/O.
3. **Defense in Depth:** Security is enforced across all tiers — TLS 1.3 encryption on the wire, Firebase ID tokens for auth, RBAC custom claims, Firestore Security Rules, and immutable audit logging.
4. **Graceful Degradation:** When generation drops or battery stress occurs, the system sheds loads in strict reverse priority (Tier 3 $\rightarrow$ Tier 2 $\rightarrow$ Tier 1) while preserving critical telemetry.
5. **Observability by Default:** Every service emits structured JSON logs, Prometheus performance metrics, and automated health checks.

## 🔮 Future Enhancements

- Multi-node mesh networking for campus-wide distributed microgrid clustering (see [`23_Future_Roadmap.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/23_Future_Roadmap.md)).
- Integration with industrial SCADA systems via Modbus TCP and IEC 61850 protocol converters.
- Federated learning across distributed GridFlowX installations for generalized solar forecasting without raw data sharing.
- Mobile companion application (React Native) for field technicians with Bluetooth LE commissioning.
- Automated carbon credit verification and blockchain-backed green energy certificate generation.

## 🗺️ Related Documents

| Document | Purpose |
| --- | --- |
| [`02_Features_and_Functionality.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/02_Features_and_Functionality.md) | Detailed feature specifications, operational scenarios, and state transition diagrams |
| [`03_Tech_Stack.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/03_Tech_Stack.md) | Complete technology stack with engineering justifications and performance trade-offs |
| [`04_System_Architecture.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/04_System_Architecture.md) | Detailed architecture diagrams, service communication flows, and failover pathways |
| [`05_Agentic_AI_Model.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/05_Agentic_AI_Model.md) | UAEO architecture, Transformer encoder, Rainflow SoH model, Pareto RL decision core |
| [`06_Data_Collection_and_Preprocessing.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/06_Data_Collection_and_Preprocessing.md) | Sensor data acquisition, windowing, normalization, and synthetic augmentation |
| [`07_Model_Training_and_FineTuning.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/07_Model_Training_and_FineTuning.md) | PyTorch training pipelines, loss functions, learning rate schedules, and validation |
| [`08_Agent_Workflows.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/08_Agent_Workflows.md) | LangGraph agent workflows, prompt templates, tool definitions, and fallbacks |
| [`09_AI_Ethics_and_Governance.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/09_AI_Ethics_and_Governance.md) | Safety bounds, ethical load shedding, fairness metrics, and explainability (SHAP) |
| [`10_Authentication.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/10_Authentication.md) | Firebase Authentication integration, custom claims, and role-based permissions |
| [`11_SecurityRules.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/11_SecurityRules.md) | Firestore Security Rules, input validation schemas, and rate-limiting policies |
| [`12_Access_Control.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/12_Access_Control.md) | RBAC matrix, token lifecycle, session revocation, and audit trails |
| [`13_UI_UX_Guidelines.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/13_UI_UX_Guidelines.md) | Design tokens, color palettes, glassmorphic styling, and accessibility standards |
| [`14_StateManagement.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/14_StateManagement.md) | Zustand store architecture, WebSocket event listeners, and optimistic UI updates |
| [`15_Styling.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/15_Styling.md) | CSS custom properties, component styles, responsive breakpoints, and animations |
| [`16_User_Journey_Flows.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/16_User_Journey_Flows.md) | Operator workflows, manual override sequences, alert response flows |
| [`17_Testing.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/17_Testing.md) | Unit tests, integration tests, E2E Cypress suites, and hardware mock fixtures |
| [`18_Performance_Benchmarking.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/18_Performance_Benchmarking.md) | Latency benchmarks, HIL empirical results, throughput metrics, and load testing |
| [`19_Model_Drift_Monitoring.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/19_Model_Drift_Monitoring.md) | KS-test drift detection, concept drift mitigation, and automated retraining triggers |
| [`20_Deployment.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/20_Deployment.md) | Docker Compose configurations, Firebase Hosting, and cloud environment setups |
| [`21_Monitoring_and_Logging.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/21_Monitoring_and_Logging.md) | Prometheus metrics, Grafana dashboards, structured JSON logging, and alerting |
| [`22_Incident_Playbooks.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/22_Incident_Playbooks.md) | Step-by-step incident response procedures for electrical and software anomalies |
| [`23_Future_Roadmap.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/23_Future_Roadmap.md) | Version milestones (v1.0 to v4.0), research initiatives (R1–R4), patent timeline |
| [`Hardware_Spec.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/Hardware_Spec.md) | ESP32 pin mappings, sensor specifications, relay wiring, and power bus schematics |
| [`ProjectStructure.md`](file:///e:/Projects/Full%20Stack%20Project/2026/gridflowx/Docs/ProjectStructure.md) | Repository directory layout, file organization, and coding standards |

