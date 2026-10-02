"""
GridFlowX Authoritative RAG Knowledge Store
===========================================
Curated technical documentation, developer metadata, system architecture,
AI agent specifications, IEEE 1547 standards, and operating procedures.
"""

from typing import List, Dict, Any

KNOWLEDGE_DOCUMENTS: List[Dict[str, Any]] = [
    {
        "id": "DOC-PROJECT-IDENTITY",
        "title": "GridFlowX Project Identity, Developer & Institutional Metadata",
        "category": "metadata",
        "content": (
            "System Name: GridFlowX — AI-Integrated Smart Microgrid Energy Management and Monitoring System. "
            "Developer: Mekeshkumar (Mekesh). "
            "Organization / Studio: Mk Studios. "
            "Institution: Kongu Engineering College (KEC). "
            "Project Scope: An enterprise-grade cyber-physical microgrid platform integrating Solar PV generation, "
            "LiFePO4 battery storage, utility grid infeed, prioritized 3-tier load management, and 6 specialized AI agents "
            "for autonomous predictive energy management, fault diagnostics, and Time-of-Use (ToU) tariff optimization."
        ),
        "tags": ["developer", "mekesh", "mekeshkumar", "mk studios", "kongu", "kec", "creator", "built", "who", "author", "metadata"]
    },
    {
        "id": "DOC-SYSTEM-ARCHITECTURE",
        "title": "GridFlowX 4-Tier Cyber-Physical System Architecture",
        "category": "architecture",
        "content": (
            "GridFlowX is built upon a 4-tier cyber-physical architecture: "
            "1. Hardware / Edge Layer: Dual-core ESP32 microcontroller with FreeRTOS. Core 0 executes deterministic sub-10ms "
            "failsafe envelopes and hardware interlocks; Core 1 handles 1Hz sensor telemetry acquisition (INA219, ACS712, ZMPT101B, DS18B20) "
            "and 8-channel relay matrix contactors. "
            "2. Backend Microservice Layer: High-performance Python FastAPI service providing REST endpoints, bi-directional "
            "1Hz WebSockets, and ML inference pipelines. "
            "3. Agentic AI Layer: Local Qwen 2.5 LLM engine running on Ollama, multi-agent orchestrator, AI query router, and RAG knowledge retriever. "
            "4. Frontend Presentation Layer: Next.js 15 glassmorphic dashboard with Tailwind CSS, Lucide icons, real-time Canvas Gauges, "
            "and interactive AI Copilot."
        ),
        "tags": ["architecture", "hardware", "esp32", "freertos", "fastapi", "nextjs", "stack", "frontend", "backend", "system"]
    },
    {
        "id": "DOC-AI-AGENTS-FLEET",
        "title": "GridFlowX 6 Specialized AI Agents & Machine Learning Models",
        "category": "ai_agents",
        "content": (
            "GridFlowX coordinates 6 specialized AI agents: "
            "1. Solar Forecasting Agent: Uses deep LSTM networks (SolarNet-v3.1) to forecast 24h-48h clear-sky GHI irradiance and PV yield. "
            "2. Load Demand Forecasting Agent: Uses ARIMA & LSTM models (LoadARIMA-v2.1) to predict multi-tier microgrid demand. "
            "3. Battery Health Monitoring Agent: Uses XGBoost, Random Forest, and Arrhenius electro-thermal equations to estimate SoH, ESR, and degradation. "
            "4. Fault Detection Agent: Uses multivariate Isolation Forest (GridGuard-IsoForest-v2.0) and autoencoders to detect sensor drift, blackouts, and thermal anomalies. "
            "5. Energy Management Agent: Uses Reinforcement Learning (PPO/SAC) and deterministic solver for ToU tariff peak shaving and source arbitration. "
            "6. Automation Engine: Enforces rule-based supervisory control, failsafe limits, and scheduled relay dispatching."
        ),
        "tags": ["ai", "agents", "models", "lstm", "arima", "xgboost", "isolation forest", "ppo", "machine learning", "forecasting"]
    },
    {
        "id": "DOC-BESS-LIFEPO4",
        "title": "LiFePO4 4S 12.8V 100Ah Battery Energy Storage System (BESS)",
        "category": "hardware",
        "content": (
            "Battery Chemistry: Lithium Iron Phosphate (LiFePO4) 4S configuration. "
            "Nominal Pack Voltage: 12.8V (3.2V per cell, operating range 10.0V - 14.6V). "
            "Capacity: 100Ah (1.28 kWh storage). "
            "Standard Charge: 0.2C (20A) CC-CV up to 14.4V bulk absorption limit. "
            "Maximum Continuous Discharge: 1.0C (100A). "
            "Depth of Discharge (DoD) Cutoff: 80% (cutoff at 18-20% SoC or 11.5V to preserve cycle life). "
            "Operating Temperature Envelope: 15°C to 35°C optimal, >45°C thermal throttle, >50°C critical cutoff. "
            "Nominal Internal ESR: 12.0 mΩ. Cell delta balance threshold: <20mV."
        ),
        "tags": ["battery", "lifepo4", "soc", "soh", "bess", "temperature", "charging", "voltage", "current", "esr"]
    },
    {
        "id": "DOC-RELAY-ROUTING",
        "title": "Microgrid 8-Channel Relay Contactor Matrix & 3-Tier Load Prioritization",
        "category": "operations",
        "content": (
            "GridFlowX employs an 8-channel relay matrix and 3-tier prioritized load architecture: "
            "• Channel 0: Tier 1 Critical Load (Security, telemetry, safety interlocks, emergency lighting) — IMMUTABLE (Never shed). "
            "• Channel 1: Tier 2 Important Load (Edge servers, ventilation fans, refrigeration) — Sheddable only under critical deficit (<25% SoC). "
            "• Channel 2: Tier 3 Flexible / Sheddable Load (Auxiliary heating, EV trickle charging) — Sheddable during peak tariff or generation deficit. "
            "• Channel 4: AC Utility Grid Infeed Contactor. "
            "• Channel 5: MPPT Solar Array Contactor. "
            "• Channel 7: BESS Inverter / Battery Contactor."
        ),
        "tags": ["relays", "loads", "tiers", "channel", "switching", "tier 1", "tier 2", "tier 3", "shedding"]
    },
    {
        "id": "DOC-SOURCE-ARBITRATION",
        "title": "Source Arbitration Hierarchy & Operating Modes",
        "category": "operations",
        "content": (
            "GridFlowX manages source arbitration based on a strict priority hierarchy: "
            "1. Priority 1 (Solar PV): Clean self-consumption directly powers active loads. "
            "2. Priority 2 (LiFePO4 BESS): If solar is insufficient, BESS discharges provided SoC > 20%. "
            "3. Priority 3 (Utility Grid): Grid power supplies the deficit if BESS is depleted or during off-peak economic charging. "
            "Operating Modes: "
            "• Self-Consumption Mode: Solar powers loads; surplus charges BESS. "
            "• Peak Shaving Mode: BESS discharges during expensive ToU tariff windows. "
            "• Islanded / Off-Grid Mode: Grid contactor open; Solar and BESS maintain microgrid stability. "
            "• Grid-Tied Mode: Synchronized with utility grid."
        ),
        "tags": ["arbitration", "solar", "battery", "grid", "modes", "self-consumption", "peak shaving", "islanded"]
    },
    {
        "id": "DOC-IEEE-1547",
        "title": "IEEE 1547-2018 Interconnection Standard & Grid Protection",
        "category": "compliance",
        "content": (
            "IEEE 1547-2018 Standard for Interconnection and Interoperability of Distributed Energy Resources. "
            "Under-voltage trip: Must disconnect within 2.0s if AC grid voltage < 0.88 p.u. (202.4V on 230V nominal). "
            "Over-voltage trip: Must disconnect within 0.16s if AC grid voltage > 1.10 p.u. (253.0V). "
            "Frequency trip bounds: 49.5Hz to 50.5Hz nominal (50Hz grid). "
            "Anti-islanding protection: Active frequency drift and passive rate of change of frequency (ROCOF)."
        ),
        "tags": ["grid", "safety", "anti-islanding", "voltage", "frequency", "ieee 1547", "compliance"]
    },
    {
        "id": "DOC-ESTOP-SOP",
        "title": "Emergency Stop & Disaster Recovery Standard Operating Procedure",
        "category": "safety_sop",
        "content": (
            "Emergency Stop (E-STOP) Protocol: "
            "Atomically drives all 8 relay channels to OPEN (OFF) state, isolating BESS, Solar MPPT, AC Grid infeed, "
            "and all load tiers. Deterministic sub-10ms hardware cutoff on ESP32 Core 0. "
            "Disaster Recovery: Requires authorized Supervisor or Admin authentication with PIN/Token. "
            "Restores Channel 0 (Tier 1 Critical) first, validates bus voltage stability, then re-engages BESS and Solar."
        ),
        "tags": ["emergency", "estop", "recovery", "safety", "shutdown", "disaster"]
    }
]
