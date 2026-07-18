# 📂 Project Structure & Coding Conventions

## Technical Directory Blueprint, Coding Standards, and Repository Architecture

**Document ID:** `DOC-STRUCTURE`  
**Version:** 4.1  
**Last Updated:** June 2026  
**Classification:** Engineering Reference · Development Standards  
**Maintained By:** Engineering Team

---

## 📋 Purpose

This document defines the actual, detailed directory structure, file organization, naming conventions, and coding standards for the GridFlowX repository. The structure is designed to showcase high-quality full-stack software design, serverless database engineering, and real-time embedded systems integrations.

---

## 🏗️ Repository Directory Tree

GridFlowX is organized as a monorepo consisting of the root Next.js frontend, the Node.js Express backend, the Python FastAPI AI service, ESP32 firmware, and supporting infrastructure folders.

```text
GridFlowX/
│
├── Docs/                               # System Design & Architecture Docs
│   ├── 01_Project_Overview.md
│   ├── 02_Features_and_Functionality.md
│   ├── 03_Tech_Stack.md
│   ├── 04_System_Architecture.md
│   ├── 05_Agentic_AI_Model.md
│   ├── 06_Data_Collection_and_Preprocessing.md
│   ├── 07_Model_Training_and_FineTuning.md
│   ├── 08_Agent_Workflows.md
│   ├── 09_AI_Ethics_and_Governance.md
│   ├── 10_Authentication.md
│   ├── 11_SecurityRules.md
│   ├── 12_Access_Control.md
│   ├── 13_UI_UX_Guidelines.md
│   ├── 14_StateManagement.md
│   ├── 15_Styling.md
│   ├── 16_User_Journey_Flows.md
│   ├── 17_Testing.md
│   ├── 18_Performance_Benchmarking.md
│   ├── 19_Model_Drift_Monitoring.md
│   ├── 20_Deployment.md
│   ├── 21_Monitoring_and_Logging.md
│   ├── 22_Incident_Playbooks.md
│   ├── 23_Future_Roadmap.md
│   ├── API_Contract.md
│   ├── Agentic_AI_Prompt_Design.md
│   ├── Database_Schema.md
│   ├── Hardware_Spec.md
│   ├── ProjectStructure.md
│   └── Pages/                          # User Facing Page Specifications
│       ├── Pages.md
│       ├── 01_Public_Pages_Spec.md
│       ├── 02_Operator_Pages_Spec.md
│       ├── 03_Supervisor_Pages_Spec.md
│       ├── 04_Admin_Pages_Spec.md
│       └── 05_Superadmin_Utility_Pages_Spec.md
│
├── backend/                            # Node.js/TypeScript Express 5 Server
│   ├── app/
│   │   ├── jobs/                       # BullMQ background queues & job definitions
│   │   ├── services/                   # Internal business services (MQTT logic, Firebase integration)
│   │   ├── sockets/                    # Socket.IO WebSocket gateway routing & lifecycle
│   │   └── utils/                      # Internal helpers (logger, custom exception handlers)
│   ├── server.ts                       # Backend application entry point
│   ├── Dockerfile                      # Multistage backend container setup
│   └── package.json
│
├── ai-service/                         # Python FastAPI AI Microservice
│   ├── app/
│   │   ├── api/                        # REST endpoints (forecasting, battery, optimization)
│   │   ├── core/                       # App configurations and system lifecycle
│   │   ├── models/                     # PyTorch/ONNX runtime model loading scripts
│   │   ├── schemas/                    # Pydantic input/output validation schemas
│   │   ├── services/                   # Internal AI services (anomaly detection, dynamic programming optimizer)
│   │   └── main.py                     # AI service ASGI entry point
│   ├── requirements.txt                # Python package requirements
│   └── Dockerfile                      # AI service container definition
│
├── src/                                # Next.js Frontend (App Router + TS)
│   ├── app/                            # Next.js App Router Page Tree
│   │   ├── layout.tsx                  # Root layout (Theme providers, notifications container)
│   │   ├── page.tsx                    # Landing / public home page
│   │   ├── providers.tsx               # Client-side Context Providers wrapper
│   │   ├── admin/                      # Admin Configuration views
│   │   │   └── page.tsx
│   │   ├── auth/                       # Credentials and password reset flow pages
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── reset/
│   │   │       └── page.tsx
│   │   ├── dashboard/                  # Core operator metrics & forecasting overview page
│   │   │   └── page.tsx
│   │   ├── operator/                   # Manual relay overrides control panel page
│   │   │   └── page.tsx
│   │   ├── superadmin/                 # Platform tenant management utilities page
│   │   │   └── page.tsx
│   │   └── supervisor/                 # Historical log queries & reports generator page
│   │       └── page.tsx
│   │
│   ├── assets/                         # Static files served directly (favicons, manifests)
│   ├── components/                     # Stateless Presentation UI Components (with 'use client' as needed)
│   │   ├── alerts/                     # Notification banners & active alarms warnings
│   │   ├── auth/                       # LoginForm, CustomClaimsGuard, PasswordResetForm
│   │   ├── charts/                     # Recharts wrappers (SankeyPowerFlow, HistoricalCharts)
│   │   ├── control/                    # RelayOverrideToggles, FailsafeTriggerButtons
│   │   ├── forms/                      # Generic validated forms wrappers
│   │   ├── layouts/                    # SidebarNav, HeaderBar, Footer, PageWrapper
│   │   ├── tables/                     # TelemetryLogTable, AuditHistoryList
│   │   └── ui/                         # Primitives (Button, Modal, Card, Badge, Input)
│   │
│   ├── features/                       # Modular Feature Components
│   │   ├── auth/                       # Signup & credentials workflow wrappers
│   │   ├── booking/                    # Demo scheduler modules
│   │   └── home/                       # Landing page widgets & analytics previews
│   │
│   ├── hooks/                          # Custom React Hooks (State/Lifecycle logic helpers)
│   │
│   ├── lib/                            # 3rd-Party SDK & Client Config Wrappers
│   │   ├── axios.ts                    # HTTP Client instance with headers interceptor
│   │   ├── constants.ts                # App-wide constants (URLs, error keys)
│   │   ├── firebase.ts                 # Firebase Client SDK & Auth configuration
│   │   ├── logger.ts                   # Client-side logger utility
│   │   ├── utils.ts                    # Styling & classnames joining helper
│   │   └── websocket.ts                # WebSocket state machine client wrapper
│   │
│   ├── services/                       # Network Request Modules
│   │   ├── ai.service.ts               # Calls to FastAPI AI microservice endpoints
│   │   ├── auth.service.ts             # Auth REST/SDK calls
│   │   ├── firebase.ts                 # Direct Firestore read/write query maps
│   │   ├── relay.service.ts            # Relay action override REST requests
│   │   ├── report.service.ts           # BullMQ report request triggers
│   │   ├── socket.service.ts           # Socket.IO WebSocket subscriptions manager
│   │   └── telemetry.service.ts        # Telemetry historical log queries
│   │
│   ├── shared/                         # Shared Types, Schemas, & Constants
│   │
│   ├── store/                          # Zustand Global Stores
│   │   ├── alertStore.ts               # Active alarm alarms & notifications state
│   │   ├── authStore.ts                # Active user object & Custom Claims states
│   │   ├── energyStore.ts              # Optimizations recommendations & forecasts
│   │   ├── systemStore.ts              # Live 1Hz telemetry updates & socket status
│   │   └── zustand/                    # Internal state configuration directory
│   │
│   ├── styles/                         # CSS Modules & Styling Variables
│   │   ├── animations.css              # Custom keyframes for Sankey power flows
│   │   ├── base.css                    # Browser normalization & core rules
│   │   ├── globals.css                 # Typography & element defaults (Next.js entry)
│   │   ├── utilities.css               # Flex, layout, and position shorthand classes
│   │   └── variables.css               # CSS Custom Properties (Colors, spacings, borders)
│   │
│   ├── utils/                          # Metric Conversion & Math Helpers
│   │
│   ├── middleware.ts                   # Next.js Middleware for session/role RBAC verification
│   └── next-env.d.ts                   # Next.js environment typings

│
├── firmware/                           # ESP32 C++ PlatformIO Code
│   ├── include/                        # C++ Header files
│   ├── lib/                            # Custom hardware peripheral drivers
│   ├── src/
│   │   ├── main.cpp                    # Firmware main FreeRTOS scheduler & loops
│   │   ├── communication/              # WiFi & WebSocket streaming controllers
│   │   ├── power_management/           # ADC voltage safety loop
│   │   ├── relay/                      # Relay output pin configurations
│   │   ├── sensors/                    # ADC reading & thermal sensors acquisition
│   │   └── telemetry/                  # Telemetry packing & JSON structures
│   ├── test/                           # Hardware test modules
│   └── platformio.ini                  # PlatformIO library configuration & board profiles
│
├── firebase/                           # Firebase Setup & Infrastructure Rules
│   ├── .firebaserc                     # Active Firebase project bindings
│   ├── firebase.json                   # Firebase CLI services setups
│   ├── firestore.rules                 # Cloud Firestore data read/write rules
│   ├── indexes.json                    # Firestore index configurations
│   └── storage.rules                   # Firebase Storage security policies
│
├── models/                             # ML Model Checkpoints & ONNX Weights
│   ├── anomaly_detection/              # Anomaly detection model assets
│   ├── battery_health/                 # State of Health model weights
│   ├── checkpoints/                    # Saved PyTorch intermediate checkpoints
│   ├── lstm_forecasting/               # Forecast model parameters
│   └── onnx/                           # Production-ready ONNX model files
│
├── infrastructure/                     # Infrastructure as Code (IaC) & Orchestration
│   ├── docker/                         # Multi-environment Docker configs
│   ├── github-actions/                 # GitHub actions runners & setups
│   ├── helm/                           # Kubernetes Helm charts configurations
│   ├── k8s/                            # Kubernetes deployment manifests
│   └── terraform/                      # Terraform code provisioning resources
│
├── public/                             # Static files served directly by Next.js
├── docker-compose.yml                  # Docker Compose configuration (FastAPI + Express + Nginx)
├── package.json                        # Frontend & Monorepo script dependencies
├── tsconfig.json                       # Next.js/Frontend TypeScript configurations
├── next.config.ts                      # Next.js application configuration file
└── README.md
```

---

## 📏 Naming Conventions

| Element | Convention | Example |
| --- | --- | --- |
| **Directories** | lowercase, kebab-case | `backend/app/controllers/` |
| **React/Next.js Components** | PascalCase, `.tsx` | `LiveMetrics.tsx`, `SankeyDiagram.tsx` |
| **Custom Hooks** | camelCase, starts with `use`, `.ts` | `useTelemetry.ts`, `useAuth.ts` |
| **Zustand Stores** | camelCase, ends with `Store` | `useTelemetryStore.ts` |
| **Python Files** | snake_case, `.py` | `main.py`, `preprocessors.py` |
| **Python Classes** | PascalCase | `TelemetryInput`, `DataPreprocessor` |
| **C++ Files** | snake_case, `.cpp` / `.h` | `main.cpp`, `relays.h` |
| **C++ Variables** | camelCase | `solarVoltageADC`, `relayStates` |
| **Firestore Collections**| camelCase | `auditLogs`, `systemConfigurations` |
| **Firestore Fields** | camelCase | `batterySoc`, `solarPower` |
| **Environment Variables**| UPPER_SNAKE_CASE | `FIREBASE_SERVICE_ACCOUNT_JSON` |

---

## ⚙️ Coding Standards & Principles

### 1. Frontend Principles (Next.js + Zustand)
- **Props-Driven Presentation:** UI components are stateless and read data from props. Store subscriptions are encapsulated in custom hooks or page layout controllers.
- **Unified WebSocket Ingestion:** A single connection (via `useWebSocket` hook) handles real-time updates and pipes them to the Zustand `useTelemetryStore`.
- **Strict Typing:** All components and state stores must have full TypeScript interfaces, avoiding `any` types.

### 2. Backend Principles (Node.js/TypeScript Express 5)
- **Controller-Repository Pattern:** Decouples API endpoints (`controllers`) from data persistence logic (`repositories`).
- **Asynchronous Execution:** Async/await is used on all network routes to prevent event loop blocks.
- **Schema Validation:** Use robust middleware schema validators to confirm incoming HTTP request payloads.

### 3. AI Microservice Principles (FastAPI)
- **Fast Execution:** FastAPI runs asynchronous coroutines with minimal request validation latency.
- **Model Decoupling:** Model loaders are decoupled from endpoints, allowing hot-swapping model weights without API service downtime.

### 4. Firmware Principles (ESP32 C++ / FreeRTOS)
- **Dual-Core Isolation:**
  - Core 0 runs the safety loops (sensor checks, threshold enforcement) at 100Hz without network dependencies.
  - Core 1 handles network routines (WiFi connection, WebSocket frames) and updates the I2C 16x2 LCD.
- **Deterministic Failsafe:** Normally Closed relay pin configuration guarantees electrical load isolation on power failure.
