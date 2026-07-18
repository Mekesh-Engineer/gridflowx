# 🏗️ System Architecture

## High-Level Architecture, Component Diagrams, Sequence Diagrams, and Service Communication Flows

**Document ID:** `DOC-04`
**Version:** 2.0
**Last Updated:** June 2026
**Classification:** System Architecture Document (SAD) · Engineering Reference · Recruiter Portfolio
**Maintained By:** Platform Architecture Team

---

## 📋 Purpose

This document provides the complete system architecture documentation for GridFlowX, including high-level and low-level architecture views, component interaction diagrams, sequence diagrams for all critical workflows, and inter-service communication protocols.

## 🎯 Scope

- Layered architecture overview (Physical → Edge → Backend/AI → Database Store → Web App)
- Component-level decomposition with interface definitions
- Sequence diagrams for telemetry ingestion, AI inference, manual overrides, and emergency shutdown
- Inter-service communication protocols (WebSockets, REST, Firebase SDK)
- Data flow diagrams showing complete request/response lifecycles

**Out of Scope:** Individual technology justifications (`03_Tech_Stack.md`), ML model internals (`05_Agentic_AI_Model.md`), database schemas (`Database_Schema.md`).

## 🔗 Dependencies

All backend services run as containerized instances. Edge-to-cloud communication depends on WiFi connectivity directly to the FastAPI WebSocket server.

## 📌 Assumptions

- The FastAPI server is the single point of contact between edge hardware, database stores, and web clients
- WebSocket connections are persistent and use automatic reconnection with exponential backoff
- The Python AI agent and FastAPI services run in a unified container or cloud service environment

## ⚠️ Constraints

- Maximum 1 WebSocket connection per ESP32 device to the backend
- WebSocket client latency: <100ms telemetry propagation
- Database read/write limits defined by the Firebase Firestore usage plans

---

## 🏗️ High-Level Architecture

```mermaid
flowchart TD
    subgraph EDGE ["🔌 Edge Layer (ESP32-WROOM-32E)"]
        HW["Solar / Battery / Grid\nSources"]
        FW["ESP32 Firmware\n(Dual-Core 240MHz)"]
        SAFE["Core 0: Safety Loop\n100Hz Deterministic"]
        COMM["Core 1: WebSocket Client\nWi-Fi + Telemetry Stream"]
        HW --> FW
        FW --> SAFE
        FW --> COMM
    end

    subgraph BACKEND ["⚙️ FastAPI WebSocket Server"]
        FASTAPI["FastAPI App\n(Async HTTP + WebSockets)"]
        WS_MGR["WebSocket Manager\n(Active Client Registry)"]
        AI_COR["AI Agent Coordinator\n(Rule Engine / Forecast)"]
        FB_ADMIN["Firebase Admin SDK\n(Firestore & Auth)"]
    end

    subgraph STORAGE ["💾 Database Store"]
        FIREBASE[("Firebase NoSQL\nFirestore & Auth")]
    end

    subgraph WEBAPP ["💻 Web Application"]
        UI["Next.js Dashboard\n(Zustand + Tailwind)"]
    end

    subgraph AI ["🧠 AI Agent"]
        AGENT["Microgrid Energy Agent\n(LSTM, ARIMA, Decision Layer)"]
    end

    COMM <-->|"Wi-Fi / WebSockets"| WS_MGR
    WS_MGR <--> FASTAPI
    FASTAPI <--> FB_ADMIN
    FB_ADMIN <--> FIREBASE
    UI <-->|"WebSockets / REST"| FASTAPI
    AI_COR <--> AGENT
    FASTAPI <--> AI_COR
```

---

## 🧩 Low-Level Component Architecture

### Edge Layer Internals

```mermaid
flowchart TD
    subgraph ESP32 ["🧠 ESP32-WROOM-32E (Dual-Core 240MHz)"]
        subgraph CORE0 ["Core 0 — Safety Loop (100Hz)"]
            SENSORS["Voltage, Current, Temp\nSoC, Grid Status"]
            FSM["Failsafe State Machine\n(< 10ms response)"]
            GPIO_OUT["GPIO Relay Drivers\n(8 channel optocoupled)"]
            
            SENSORS --> FSM
            FSM --> GPIO_OUT
        end

        subgraph CORE1 ["Core 1 — Communication Hub"]
            WIFI["WiFi Manager\n(Auto-reconnect)"]
            WS_C["WebSocket Client\n(bi-directional)"]
            JSON_S["ArduinoJson\n(Serialize/Deserialize)"]
            LCD_D["16x2 LCD Display\n(I2C Status)"]
            
            WIFI --> WS_C
            WS_C --> JSON_S
            JSON_S --> LCD_D
        end

        FSM -->|"Telemetry\nBuffer"| WS_C
        WS_C -->|"Override\nCommands"| FSM
    end
```

### Backend Layer Internals

```mermaid
flowchart TD
    subgraph FASTAPI ["⚙️ FastAPI WebSocket Server"]
        subgraph ROUTES ["API & WebSocket endpoints"]
            WS_E["/ws/telemetry\n(ESP32 connection)"]
            WS_U["/ws/client\n(Web Dashboard connection)"]
            REST_R["/api/v1/auth & /api/v1/config\n(REST endpoints)"]
        end

        subgraph MIDDLEWARE ["FastAPI Middlewares"]
            CORS_M["CORS Middleware"]
            AUTH_M["Firebase Token Validator"]
            RATE_M["Rate Limiting Middleware"]
        end

        subgraph CORE ["Core App Logic"]
            WS_MGR["WebSocket Connection Manager"]
            AI_ORCH["AI Agent Orchestrator"]
            DB_CLIENT["Firebase Firestore SDK"]
        end

        subgraph AI_AGENT ["AI Agent System"]
            LSTM["Solar Forecast Tool (LSTM)"]
            ARIMA["Load Forecast Tool (ARIMA)"]
            DECISION["Decision Layer"]
        end

        ROUTES --> MIDDLEWARE
        MIDDLEWARE --> CORE
        CORE --> AI_AGENT
        CORE --> DB_CLIENT
    end
```

---

## 🔄 Sequence Diagrams

### 1. Telemetry Ingestion Pipeline

```mermaid
sequenceDiagram
    participant SENSOR as Sensors (V, I, Temp, SoC, Grid)
    participant ESP32 as ESP32 MCU
    participant FASTAPI as FastAPI Server
    participant FIRESTORE as Firebase Firestore
    participant NEXTJS as Next.js Dashboard

    SENSOR->>ESP32: Analog/Digital readings (100Hz)
    ESP32->>ESP32: Preprocess & serialize JSON
    ESP32->>FASTAPI: WebSocket push (1Hz)<br/>Topic: telemetry_stream
    
    par Stream Routing
        FASTAPI->>FIRESTORE: Update document<br/>telemetry/current
        FASTAPI->>NEXTJS: WebSocket broadcast<br/>telemetry_update
    end
    
    NEXTJS->>NEXTJS: Zustand update & Re-render UI
```

### 2. AI Inference & Relay Command Pipeline

```mermaid
sequenceDiagram
    participant FASTAPI as FastAPI Server
    participant AI as AI Agent Core
    participant FORECAST as Forecast Models (LSTM/ARIMA)
    participant FIRESTORE as Firebase Firestore
    participant ESP32 as ESP32 MCU
    participant RELAY as 8-Channel Relay Module

    Note over FASTAPI: Every 15 minutes (or sensor state change)
    FASTAPI->>FIRESTORE: Get telemetry history & config
    FIRESTORE-->>FASTAPI: Historical logs & thresholds
    FASTAPI->>AI: Trigger step logic
    AI->>FORECAST: Request solar & load predictions
    FORECAST-->>AI: Predicted yields & loads
    AI->>AI: Execute decision logic (Rule-Based/LangGraph)
    AI-->>FASTAPI: Command payload {relays, battery_setpoint}
    FASTAPI->>FIRESTORE: Log decision & state
    FASTAPI->>ESP32: WebSocket: SET_RELAYS {state}
    ESP32->>RELAY: Toggle GPIO pins
    ESP32->>FASTAPI: WebSocket: ACK status
```

### 3. Manual Override Flow

```mermaid
sequenceDiagram
    participant OPS as Operator (Browser)
    participant NEXTJS as Next.js Dashboard
    participant FASTAPI as FastAPI Server
    participant FIRESTORE as Firebase Firestore
    participant ESP32 as ESP32 MCU

    OPS->>NEXTJS: Toggle relay 4 override
    NEXTJS->>FASTAPI: REST POST /api/v1/relays/override<br/>Bearer ID Token
    FASTAPI->>FASTAPI: Verify Token via Firebase Auth
    FASTAPI->>FIRESTORE: Log override to audit_logs
    FASTAPI->>FIRESTORE: Set relayStates/channel4 to true
    FASTAPI->>ESP32: WebSocket Command: OVERRIDE {channel: 4, state: true}
    ESP32->>ESP32: Set local override timer (30 min)
    ESP32->>ESP32: Toggle GPIO pin 4
    ESP32-->>FASTAPI: ACK override active
    FASTAPI-->>NEXTJS: 200 OK override active
    NEXTJS->>NEXTJS: Display override banner
```

### 4. Emergency Shutdown Sequence

```mermaid
sequenceDiagram
    participant TRIGGER as Emergency Trigger
    participant ESP32 as ESP32 MCU
    participant RELAY as 8-Channel Relay Module
    participant FASTAPI as FastAPI Server
    participant FIRESTORE as Firebase Firestore
    participant NEXTJS as Next.js Dashboard
    participant ADMIN as Admin User

    TRIGGER->>ESP32: Critical threshold exceeded<br/>(SoC < 2% OR Temp > 90°C)
    ESP32->>RELAY: De-energize ALL relays (GPIO LOW, < 10ms)
    ESP32->>FASTAPI: WebSocket: EMERGENCY_SHUTDOWN {reason}
    FASTAPI->>FIRESTORE: Log shutdown in alerts & audit_logs
    FASTAPI->>NEXTJS: WebSocket: emergency_alert event
    NEXTJS->>NEXTJS: Display emergency overlay
    ADMIN->>NEXTJS: Click authorize recovery
    NEXTJS->>FASTAPI: REST POST /api/v1/relays/recovery
    FASTAPI->>FASTAPI: Verify Admin role
    FASTAPI->>ESP32: WebSocket: RECOVERY_AUTHORIZED
    ESP32->>ESP32: Graceful startup sequence
    ESP32->>RELAY: Re-energize relays sequentially
```

---

## 🌐 Inter-Service Communication Protocols

### Protocol Summary

```mermaid
flowchart LR
    ESP32["🔌 ESP32"] <-->|"Wi-Fi / WebSockets\nPort 8000"| FASTAPI["⚙️ FastAPI Server"]
    FASTAPI <-->|"Firebase SDK"| FIRESTORE["💾 Firestore Database"]
    NEXTJS["💻 Next.js App"] <-->|"WebSockets / REST\nPort 8000"| FASTAPI
    FASTAPI <-->|"Python APIs"| AI["🧠 AI Agent Core"]
```

### 1. WebSockets (ESP32 ↔ FastAPI)

| Property | Value |
| --- | --- |
| **Protocol** | WebSockets over Wi-Fi |
| **Port** | 8000 |
| **Endpoint** | `/ws/telemetry` |
| **Authentication** | Token handshake verification |
| **Telemetry Format** | JSON (every 1 second) |
| **Command Format** | JSON commands from FastAPI |

### 2. WebSockets / REST (Next.js ↔ FastAPI)

| Property | Value |
| --- | --- |
| **Protocol** | Secure WebSockets (WSS) / HTTPS |
| **Port** | 8000 |
| **Authentication** | Firebase ID Token verification |
| **WSS Endpoint** | `/ws/client` |
| **API Base** | `/api/v1` |

### 3. Firebase Admin SDK (FastAPI ↔ Firestore)

| Property | Value |
| --- | --- |
| **Protocol** | gRPC (internal SDK) |
| **Access Control** | Service Account Credentials |
| **Firestore Sync** | Push data to collections: `telemetry`, `alerts`, `relayStates` |

---

## 🏢 Deployment Architecture

```mermaid
flowchart TD
    subgraph CLOUD_INFRA ["☁️ Cloud Infrastructure"]
        subgraph FIREBASE_ENV ["Firebase Platform"]
            HOSTING["Firebase App Hosting\n(Next.js App)"]
            AUTH["Firebase Authentication\n(OAuth / Email / RBAC)"]
            FIRESTORE["Firebase Firestore\n(NoSQL Telemetry & Config)"]
        end

        subgraph BACKEND_ENV ["Backend App Runtime"]
            FASTAPI_CONTAINER["FastAPI Container\n(Render / Cloud Run)"]
        end
    end

    subgraph EDGE_DEVICE ["🔌 Edge Device"]
        ESP32["ESP32 Microcontroller\n(WebSocket Client)"]
    end

    ESP32 <-->|"Secure WebSockets (WSS)"| FASTAPI_CONTAINER
    HOSTING <-->|"REST API / WebSockets"| FASTAPI_CONTAINER
    FASTAPI_CONTAINER <-->|"Firebase Admin SDK"| FIRESTORE
    FASTAPI_CONTAINER <-->|"Firebase Admin SDK"| AUTH
```

---

## 📐 Architecture Notes

- **Separation of Concerns:** FastAPI handles real-time connection routing and AI coordinator execution, Firebase handles the persistent data stores and user roles.
- **Edge Autonomy:** The ESP32 FreeRTOS safety loop runs on Core 0 independently of connection state, maintaining failsafe operations.
- **Unified Stack:** Python runs both the backend FastAPI framework and the AI agent algorithms (LSTM/ARIMA), eliminating dual-language overhead.

## 👨‍💻 Developer Notes

- The WebSocket client on the ESP32 implements auto-reconnect logic with exponential backoff.
- Firebase Security Rules guard direct access to Firestore collections, while the FastAPI server uses the Admin SDK for updates.
- All variables and credentials are configuration-driven via environmental properties.

## 🏆 Recruiter & Portfolio Notes

> **Architecture Maturity:** The GridFlowX architecture has been modernized to present a highly efficient, production-grade cloud-edge structure. By replacing the multi-container message broker and database stack with a unified FastAPI WebSocket service and Firebase Firestore, overall platform complexity and latency have been drastically reduced. The edge controller maintains deterministic <10ms safety controls.

## ✅ Best Practices

1. **Direct Communication:** Minimize intermediate hops (MQTT brokers) for time-critical telemetry routing.
2. **Serverless Scale:** Delegate user authentication and horizontal data scale to Firebase.
3. **Hardware Watchdog:** Enable hardware interrupts and failsafes on the ESP32 to guarantee safety.

## 🔮 Future Enhancements

- **LangGraph Integration:** Advance the AI routing from rules to full LangGraph multi-agent systems.
- **Edge Analytics:** Run lightweight TensorFlow models directly on the ESP32.
- **Mesh Routing:** Enable peer-to-peer Wi-Fi mesh networking between multiple ESP32 edge boards.

## 🗺️ Related Documents

| Document | Purpose |
| --- | --- |
| `01_Project_Overview.md` | Executive overview and high-level architecture narrative |
| `03_Tech_Stack.md` | Technology selection justifications and version matrix |
| `05_Agentic_AI_Model.md` | AI Agent architecture and tools specifications |
| `Hardware_Spec.md` | ESP32 specs, pin maps, and relay configuration |
| `10_Authentication.md` | Firebase Authentication implementation and configuration |
| `20_Deployment.md` | Cloud configurations and Firebase Hosting deployment |
| `21_Monitoring_and_Logging.md` | Prometheus, Grafana, and ELK Stack setup |
