<p align="center">
  <img src="https://img.shields.io/badge/GridFlowX-v3.0.0-06B6D4?style=for-the-badge&logoColor=white" alt="GridFlowX" />
</p>

<h1 align="center">⚡ GridFlowX</h1>

<p align="center">
  <strong>AI-Powered Microgrid Intelligence Platform</strong><br/>
  A cyber-physical system connecting ESP32 edge hardware, a Python FastAPI WebSocket service,<br/>
  and a glassmorphic Next.js 15 operator dashboard — unified in a single monorepo.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/shadcn%2Fui-new--york-1a1a1a?style=flat-square" alt="shadcn/ui" />
  <img src="https://img.shields.io/badge/Firebase-12-FFCA28?style=flat-square&logo=firebase" alt="Firebase 12" />
  <img src="https://img.shields.io/badge/FastAPI-0.111-009688?style=flat-square&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?style=flat-square&logo=python" alt="Python 3.11" />
  <img src="https://img.shields.io/badge/ESP32-PlatformIO-E7352C?style=flat-square&logo=espressif" alt="ESP32" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker" alt="Docker" />
  <img src="https://img.shields.io/badge/Zustand-5-FF6B35?style=flat-square" alt="Zustand 5" />
  <img src="https://img.shields.io/badge/Vercel_Analytics-ready-black?style=flat-square&logo=vercel" alt="Vercel" />
  <img src="https://img.shields.io/badge/License-MIT-22c55e?style=flat-square" alt="MIT License" />
</p>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [Solution Overview](#-solution-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Application Architecture](#-application-architecture)
- [Authentication Flow](#-authentication-flow)
- [Role-Based Access Control](#-role-based-access-control)
- [Technology Stack](#-technology-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Installation & Setup](#-installation--setup)
- [Environment Variables](#-environment-variables)
- [Firebase Configuration](#-firebase-configuration)
- [Running the Project](#-running-the-project)
- [npm Scripts](#-npm-scripts)
- [Pages & Routes](#-pages--routes)
- [Components](#-components)
- [Features & Services](#-features--services)
- [State Management](#-state-management)
- [API Endpoints](#-api-endpoints-fastapi-microservice)
- [Firmware](#-firmware-esp32)
- [AI Models](#-ai-models)
- [Docker Deployment](#-docker-deployment)
- [Testing](#-testing)
- [Security](#-security)
- [Performance Considerations](#-performance-considerations)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 🌟 Project Overview

**GridFlowX** is a full-stack, cyber-physical AI platform for intelligent microgrid energy management. It bridges the gap between embedded IoT hardware (ESP32 edge controllers), a real-time Python FastAPI backend (WebSocket relay + AI inference), and a modern web operator dashboard built with Next.js 15.

The platform is designed to give microgrid operators, engineers, and administrators a unified interface to monitor live telemetry, execute relay overrides, authorize emergency recovery, and view AI-driven energy forecasts — all with fine-grained role-based access control.

**Target Users:** Energy system operators, facility managers, grid engineers, compliance auditors, and system administrators managing small-to-medium microgrid installations.

**Business Value:**

- Reduces manual intervention through AI-driven relay routing decisions
- Prevents equipment damage via real-time hardware safety envelopes (ESP32 Core 0)
- Enables data-driven energy cost optimization through solar/load forecasting
- Provides a complete audit trail for regulatory compliance

---

## ❓ Problem Statement

Modern microgrids — combining solar PV, battery storage, and grid fallback — require constant monitoring and rapid decision-making. Traditional approaches are:

- ❌ **Manual and error-prone** — human operators cannot react fast enough to sub-second fault events
- ❌ **Opaque** — there is no unified interface to see sensor readings, relay states, and AI decisions simultaneously
- ❌ **Unsafe** — without deterministic hardware safety loops, software failures can cause equipment damage or fires
- ❌ **Inaccessible** — industrial SCADA systems are expensive and require on-premise installation

---

## 💡 Solution Overview

GridFlowX solves these challenges through a three-layer cyber-physical architecture:

- 🔌 **Edge Layer** — ESP32-WROOM-32 firmware runs a deterministic 100Hz FreeRTOS safety loop (Core 0) alongside a 1Hz WebSocket telemetry loop (Core 1), ensuring hardware protection is never blocked by software
- ⚙️ **Backend Layer** — Python FastAPI service acts as a real-time WebSocket relay between edge devices and the dashboard, plus an HTTP REST API for relay overrides, battery analytics, forecasting, and report generation
- 💻 **Dashboard Layer** — Next.js 15 operator console with glassmorphic dark-mode UI, Firebase Authentication with custom RBAC claims, and real-time WebSocket telemetry display

---

## ✨ Key Features

| Feature                            | Status                 | Description                                                                                                                                 |
| ---------------------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 🌐 **Public Landing Page**         | ✅ Implemented         | Multi-section marketing site (Hero, Features, How It Works, Infrastructure, Metrics, Integrations, Security, Developers, Testimonials, CTA) |
| 🔐 **Firebase Authentication**     | ✅ Implemented         | Email/password login with ID token management via Firebase Web SDK v12                                                                      |
| 📝 **Multi-Step Registration**     | ✅ Implemented         | 3-step form (personal info → profile details → password + consents) with Zod validation and password strength meter                         |
| ✉️ **Email Verification**          | ✅ Implemented         | Firebase `sendEmailVerification` with redirect handling; unverified users are gated to `/verify-email`                                      |
| 🔑 **Forgot Password**             | ✅ Implemented         | Firebase `sendPasswordResetEmail` flow                                                                                                      |
| 🔄 **Reset Password**              | ✅ Implemented         | Firebase OOB code-based password reset page                                                                                                 |
| 🛡️ **Role-Based Access Control**   | ✅ Implemented         | 4 roles (`admin`, `supervisor`, `operator`, `auditor`) enforced via Firebase Custom Claims and client-side `RouteGuard`                     |
| 🚧 **Protected Route Guard**       | ✅ Implemented         | `RouteGuard` provider enforces auth state, email verification, and role-based dashboard redirects                                           |
| 📊 **Operator Dashboard**          | ✅ Implemented         | Sidebar layout with `AppSidebar`, `SectionCards`, interactive area chart (`ChartAreaInteractive`), and `DataTable`                          |
| 🌗 **Dark / Light Theme**          | ✅ Implemented         | `next-themes` with system default; toggleable via `ThemeToggle` in Navbar and Auth pages                                                    |
| 📡 **WebSocket Telemetry Client**  | ✅ Implemented         | `initializeWebSocket()` with exponential backoff reconnection (1s → 30s)                                                                    |
| 🔌 **Relay Override Service**      | ✅ Implemented         | `toggleRelayOverride()` and `triggerEmergencyRecovery()` POST to FastAPI `/api/v1/relays/*`                                                 |
| 🔋 **Battery Health Service**      | ✅ Implemented         | `fetchBatteryHealthAnalysis()` fetches SoH, temperature, voltage, internal resistance from AI service                                       |
| ☀️ **Solar/Load Forecast Service** | ✅ Implemented         | `fetchSolarAndLoadForecasts()` returns 4-step ahead predictions per device                                                                  |
| ⚙️ **Optimization Parameters**     | ✅ Implemented         | `updateOptimizationParameters()` posts peak hour + SoC constraints to AI service                                                            |
| 📋 **Report Generation Service**   | ✅ Implemented         | `requestOperationalReport()` triggers async PDF/CSV report generation                                                                       |
| 📜 **Firestore Telemetry Query**   | ✅ Implemented         | `fetchHistoricalTelemetry()` queries Firestore `telemetry` collection with ordering and limit                                               |
| 🤖 **FastAPI AI Microservice**     | ✅ Implemented         | WebSocket relay (`/ws/telemetry`, `/ws/client`), relay override REST, and health check endpoints                                            |
| 🔧 **ESP32 Firmware**              | ✅ Implemented         | Dual-core FreeRTOS: 100Hz safety loop (Core 0) + 1Hz WebSocket telemetry/command loop (Core 1)                                              |
| 🐳 **Docker Compose**              | ✅ Implemented         | Nginx proxy + FastAPI container with health check, resource limits, and restart policy                                                      |
| 🧭 **Responsive Navbar**           | ✅ Implemented         | Megamenu, mobile menu, notifications dropdown, search modal, theme toggle                                                                   |
| 🎨 **3D Animations**               | ✅ Implemented         | `react-three-fiber` + `@react-three/drei` animated sphere, tetrahedron, and wave scenes                                                     |
| 🔔 **Toast Notifications**         | ✅ Implemented         | `sonner` toast library integrated via `<Toaster />`                                                                                         |
| **Admin Dashboard**                | ⏳ Not yet implemented | `/admin` route reserved; `.gitkeep` placeholder                                                                                             |
| **Supervisor Dashboard**           | ⏳ Not yet implemented | `/supervisor` route reserved; `.gitkeep` placeholder                                                                                        |
| **Alerts Feature**                 | ⏳ Not yet implemented | `src/features/alerts/` scaffolded; `.gitkeep` placeholder                                                                                   |
| **Settings Feature**               | ⏳ Not yet implemented | `src/features/settings/` scaffolded; `.gitkeep` placeholder                                                                                 |
| **Next.js API Routes**             | ⏳ Not yet implemented | `src/app/api/` directories scaffolded with `.gitkeep` placeholders; backend handled by FastAPI                                              |

---

## 🏗️ System Architecture

GridFlowX consists of three physical layers communicating through well-defined protocols:

```mermaid
flowchart TD
    subgraph EDGE ["🔌 Edge Layer — ESP32-WROOM-32E"]
        SENSORS["Voltage / Current / Temp\nSensors (ADC 100Hz)"]
        CORE0["FreeRTOS Core 0\n100Hz Safety Loop\n(Emergency Cutoff < 10ms)"]
        CORE1["FreeRTOS Core 1\n1Hz WebSocket\nTelemetry Transmitter"]
        RELAY_HW["8-Channel Relay Module\n(GPIO 12–19)"]

        SENSORS --> CORE0
        SENSORS --> CORE1
        CORE0 --> RELAY_HW
    end

    subgraph BACKEND ["⚙️ Python FastAPI AI Microservice (Port 8000)"]
        WS_TEL["/ws/telemetry\nESP32 Device Gateway"]
        WS_CLI["/ws/client\nDashboard Client Gateway"]
        REST_API["REST API\n/api/v1/relays/override\n/api/v1/relays/recovery\n/health"]
        CM["ConnectionManager\n(Clients + Devices Registry)"]

        WS_TEL --> CM
        WS_CLI --> CM
        REST_API --> CM
    end

    subgraph FIREBASE ["☁️ Firebase Platform"]
        FB_AUTH["Firebase Authentication\n(Email/Password + Custom Claims)"]
        FIRESTORE["Cloud Firestore\n(telemetry · relayStates · alerts\nusers · audit_logs · systemConfigurations)"]
    end

    subgraph NEXTJS ["💻 Next.js 15 Dashboard (Port 3000)"]
        ROUTE_GUARD["RouteGuard Provider\n(Auth + Email Verify + RBAC)"]
        AUTH_STORE["Zustand AuthStore\n(Persisted Session)"]
        WS_CLIENT["WebSocket Client\n(Exponential Backoff Reconnect)"]
        PAGES["Pages\n(Public · Auth · Dashboard)"]

        ROUTE_GUARD --> AUTH_STORE
        AUTH_STORE --> WS_CLIENT
        WS_CLIENT --> PAGES
    end

    CORE1 <-->|"WebSocket\nJSON Telemetry 1Hz"| WS_TEL
    CM -->|"WebSocket Broadcast"| WS_CLI
    WS_CLI <-->|"WebSocket\nJSON Events"| WS_CLIENT
    NEXTJS -->|"REST API\nBearer Token"| REST_API
    REST_API -->|"WebSocket Command\n(OVERRIDE / RECOVERY)"| WS_TEL
    WS_TEL --> CORE1
    CORE1 --> RELAY_HW

    NEXTJS <-->|"Firebase Web SDK v12"| FB_AUTH
    NEXTJS <-->|"Firebase Web SDK v12"| FIRESTORE
    BACKEND -->|"Firebase Admin SDK\n(Audit Logs)"| FIRESTORE
```

---

## 🧩 Application Architecture

### Folder-Based Role Separation

The Next.js App Router separates concerns using route groups:

| Route Group  | Purpose                                                | Auth Required                                |
| ------------ | ------------------------------------------------------ | -------------------------------------------- |
| `(public)`   | Marketing site + landing page                          | ❌ No                                        |
| `(auth)`     | Login, register, forgot/reset password, verify email   | ❌ No (guest-only redirect if authenticated) |
| `dashboard`  | Operator console                                       | ✅ Yes + email verified                      |
| `admin`      | Admin panel _(scaffolded, not yet implemented)_        | ✅ Admin role                                |
| `supervisor` | Supervisor panel _(scaffolded, not yet implemented)_   | ✅ Supervisor role                           |
| `operator`   | Operator panel _(scaffolded, not yet implemented)_     | ✅ Operator role                             |
| `api/*`      | Next.js API routes _(scaffolded, not yet implemented)_ | —                                            |

### Provider Hierarchy

```
RootLayout
└── ThemeProvider (next-themes)
    └── AuthProvider (Firebase onAuthStateChanged → Zustand)
        └── RouteGuard (RBAC + email verification enforcer)
            └── Page Content
```

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant USER as Browser
    participant NEXTJS as Next.js App
    participant FB_AUTH as Firebase Auth
    participant FIRESTORE as Firestore
    participant GUARD as RouteGuard

    Note over USER,GUARD: Registration (3-step form)
    USER->>NEXTJS: Submit step 1 (name, email)
    USER->>NEXTJS: Submit step 2 (profile + role selection)
    USER->>NEXTJS: Submit step 3 (password + consents)
    NEXTJS->>FB_AUTH: createUserWithEmailAndPassword()
    FB_AUTH-->>NEXTJS: UserCredential
    NEXTJS->>FB_AUTH: updateProfile() + sendEmailVerification()
    NEXTJS->>FIRESTORE: setDoc(users/{uid}) — profile + role + consents
    NEXTJS->>USER: Redirect → /verify-email

    Note over USER,GUARD: Email Verification Gate
    USER->>NEXTJS: Visit /verify-email (resend link option)
    USER->>FB_AUTH: Click email link (verified=true)
    GUARD->>GUARD: emailVerified === true
    GUARD->>NEXTJS: Redirect → ROLE_DASHBOARDS[role]

    Note over USER,GUARD: Login
    USER->>NEXTJS: POST email + password
    NEXTJS->>FB_AUTH: signInWithEmailAndPassword()
    FB_AUTH-->>NEXTJS: ID Token (JWT with custom claims)
    NEXTJS->>FIRESTORE: getDoc(users/{uid}) — fetch role
    NEXTJS->>NEXTJS: useAuthStore.setUser({ role, ... })
    GUARD->>NEXTJS: Redirect → /dashboard (operator) | /dashboard/admin etc.

    Note over USER,GUARD: Session Persistence
    NEXTJS->>NEXTJS: Zustand persist('gridflowx-auth') → localStorage
    NEXTJS->>FB_AUTH: onAuthStateChanged() listener (AuthProvider)
    FB_AUTH-->>NEXTJS: Restored user on page reload
```

### Route Guard Logic

The `RouteGuard` component enforces these rules on every navigation:

1. **Unauthenticated + protected path** → redirect to `/login?redirectTo=<path>`
2. **Authenticated + unverified email** → redirect to `/verify-email` (except public paths)
3. **Authenticated + verified + guest-only path** (login/register) → redirect to role dashboard
4. **Authenticated + wrong-role dashboard** → redirect to own role's dashboard
5. **Authenticated + verified + verify-email page** → redirect to role dashboard

---

## 🔒 Role-Based Access Control

GridFlowX implements RBAC at three layers: Firebase Custom Claims (cryptographic), Firestore Security Rules (database-level), and the client-side `RouteGuard` (UX-level).

### Role Definitions

```typescript
// src/lib/constants.ts
export enum UserRole {
  ADMIN = "admin",
  SUPERVISOR = "supervisor",
  OPERATOR = "operator",
  AUDITOR = "auditor",
}
```

### Role → Dashboard Mapping

| Role         | Default Dashboard Route                         |
| ------------ | ----------------------------------------------- |
| `admin`      | `/dashboard/admin` _(not yet implemented)_      |
| `supervisor` | `/dashboard/supervisor` _(not yet implemented)_ |
| `operator`   | `/dashboard`                                    |
| `auditor`    | `/dashboard/audit` _(not yet implemented)_      |

### Firestore Collection Permissions

| Collection             | Read                              | Write                             | Notes                         |
| ---------------------- | --------------------------------- | --------------------------------- | ----------------------------- |
| `telemetry`            | All roles                         | Backend Admin SDK only            | ESP32 → FastAPI → Firestore   |
| `relayStates`          | All roles                         | `admin`, `supervisor`, `operator` | Manual overrides              |
| `alerts`               | All roles                         | `admin`, `supervisor` (update)    | Create/delete: Admin SDK only |
| `audit_logs`           | `admin`, `supervisor`, `auditor`  | Admin SDK only                    | Immutable                     |
| `systemConfigurations` | `admin`, `supervisor`, `operator` | `admin` only                      | Thresholds, calibration       |
| `users`                | Own doc or `admin`                | `admin` only                      | Profile management            |

### Registration Role Selection

During registration (Step 2), users self-select one of three roles from `register.schema.ts`:

```typescript
role: z.enum(["operator", "supervisor", "admin"]);
```

> **Note:** The `auditor` role is not available via self-registration in the current implementation. It must be assigned via Firebase Admin SDK or Admin panel (not yet implemented).

---

## 🧪 Technology Stack

### Frontend

| Technology           | Version     | Purpose                                         |
| -------------------- | ----------- | ----------------------------------------------- |
| Next.js              | 15.1.11     | React framework with App Router, RSC, Turbopack |
| React                | 19.0.0      | UI library                                      |
| TypeScript           | 5.7.x       | Type safety                                     |
| Tailwind CSS         | 4.0.0-alpha | Utility-first styling with PostCSS pipeline     |
| shadcn/ui            | new-york    | Component system built on Radix UI primitives   |
| Radix UI             | Various     | Accessible headless UI primitives (full suite)  |
| Framer Motion        | 12.x        | Animations and page transitions                 |
| GSAP                 | 3.15        | Advanced timeline-based animations              |
| React Three Fiber    | 9.x         | Three.js declarative React binding              |
| @react-three/drei    | 10.x        | R3F helpers (OrbitControls, environment, etc.)  |
| Three.js             | 0.185       | 3D graphics engine                              |
| Recharts             | 3.x         | Chart components (area, line, bar)              |
| TanStack React Query | 5.x         | Server state management and caching             |
| TanStack React Table | 8.x         | Headless data table                             |
| Zustand              | 5.x         | Global client state management                  |
| next-themes          | 0.4.6       | Dark / light theme provider                     |
| React Hook Form      | 7.x         | Form state management                           |
| Zod                  | 3.x         | Schema validation                               |
| @dnd-kit             | 6–10.x      | Drag and drop primitives                        |
| date-fns             | 4.x         | Date utilities                                  |
| Sonner               | 2.x         | Toast notifications                             |
| Lucide React         | 1.x         | Icon library                                    |
| @tabler/icons-react  | 3.x         | Additional icon library                         |
| embla-carousel-react | 8.x         | Carousel component                              |
| cmdk                 | 1.x         | Command palette                                 |
| vaul                 | 1.x         | Drawer (bottom sheet)                           |
| Geist                | 1.x         | Vercel Geist font                               |
| @vercel/analytics    | 2.x         | Vercel Analytics integration                    |

### Backend (Python AI Microservice)

| Technology     | Version     | Purpose                               |
| -------------- | ----------- | ------------------------------------- |
| FastAPI        | ≥ 0.111.0   | Async HTTP + WebSocket server         |
| Uvicorn        | ≥ 0.30.0    | ASGI server (standard extras)         |
| Pydantic       | ≥ 2.7.0     | Request/response schema validation    |
| firebase-admin | ≥ 6.5.0     | Firestore Admin SDK access            |
| onnxruntime    | ≥ 1.17.0    | ONNX model inference (AI forecasting) |
| NumPy          | ≥ 1.24.0    | Numerical computation                 |
| pytest         | ≥ 8.0.0     | Backend testing framework             |
| httpx          | ≥ 0.27.0    | Async HTTP client for testing         |
| Docker         | —           | Containerized multi-stage build       |
| Nginx          | 1.25 Alpine | Reverse proxy / TLS termination       |

### Authentication & Database

| Technology              | Version          | Purpose                             |
| ----------------------- | ---------------- | ----------------------------------- |
| Firebase Authentication | 12.x (Web SDK)   | Email/password auth + Custom Claims |
| Firebase Admin SDK      | ≥ 6.5.0 (Python) | Server-side Firestore access        |
| Cloud Firestore         | —                | NoSQL real-time database            |

### Edge Firmware

| Technology                  | Purpose                                |
| --------------------------- | -------------------------------------- |
| Arduino Framework + ESP-IDF | ESP32-WROOM-32E hardware abstraction   |
| PlatformIO                  | Build system and dependency management |
| FreeRTOS                    | Dual-core task scheduling              |
| ArduinoJson v7              | JSON serialization/deserialization     |
| WebSockets (links2004)      | WebSocket client library               |

### Fonts

| Font                      | Variable                  | Usage                      |
| ------------------------- | ------------------------- | -------------------------- |
| Instrument Sans           | `--font-instrument`       | Primary sans-serif body/UI |
| Instrument Serif          | `--font-instrument-serif` | Display headings           |
| JetBrains Mono            | `--font-jetbrains`        | Code blocks, monospace     |
| Material Symbols Outlined | —                         | Material icon set (CDN)    |

### Tooling

| Tool                           | Purpose                 |
| ------------------------------ | ----------------------- |
| PostCSS + @tailwindcss/postcss | CSS processing pipeline |
| ESLint (Next.js preset)        | Code linting            |
| Docker Compose                 | Service orchestration   |

---

## 📁 Project Directory Structure

```text
gridflowx-app1/
├── frontend/                        # Complete Next.js 15 Web Application (Port 3000)
│   ├── app/                         # App Router (69 static and dynamic routes)
│   │   ├── (auth)/                  # Login, Register, Forgot/Reset Password, Verify Email
│   │   ├── (public)/                # Landing, About, Contact, Developers, Features
│   │   └── dashboard/               # Operator, Admin, Supervisor, Audit, AI, Energy, IoT, Twin
│   ├── components/                  # shadcn/ui primitives, dashboards, glassmorphic widgets
│   ├── features/                    # Feature domains: auth, telemetry, bess, relays, ai
│   ├── hooks/                       # Custom React hooks (useAuth, useTelemetry, etc.)
│   ├── lib/                         # Clients: API, WebSocket, Firebase, logger, utils
│   ├── services/                    # Frontend HTTP/WS communication services
│   ├── store/                       # Zustand persisted client state
│   └── styles/                      # Tailwind CSS v4 & theme tokens
│
├── backend/                         # Complete Production Backend System (FastAPI, Port 8000)
│   ├── api/                         # REST & WS routers: health, telemetry, relays, devices, energy, auth, agent
│   ├── core/                        # Settings, security (RBAC, JWT), structured logging
│   ├── database/                    # Firebase Admin SDK client & high-performance memory store
│   ├── integrations/                # Firebase integration & ESP32 FreeRTOS edge hardware emulation
│   ├── middleware/                  # Security headers, CORS, request tracing
│   ├── models/                      # Domain models & database entities
│   ├── schemas/                     # Pydantic validation schemas
│   ├── services/                    # Telemetry (1Hz), relays, safety interlocks, audit, agentic bridge
│   ├── tasks/                       # Cyber-physical 1Hz background simulation loop
│   ├── websocket/                   # Real-time WebSocket connection manager (/ws/telemetry, /ws/client)
│   └── main.py                      # Primary FastAPI entrypoint & lifecycle manager
│
├── agentic-ai/                      # Single Authoritative Primary AI & Agentic AI Subsystem
│   ├── agents/                      # Specialized agents: solar, load, battery, fault, energy, diagnostics, chat
│   ├── control/                     # Micro-control, macro-control, supervisory deterministic envelope
│   ├── evaluation/                  # Offline & online agent evaluation harnesses
│   ├── integrations/                # Ollama Cloud dual-model client & local daemon fallback
│   ├── memory/                      # Context window management, working memory, semantic RAG
│   ├── models/                      # Model definitions (gemma4:31b-cloud, gpt-oss:120b-cloud)
│   ├── monitoring/                  # Real-time inference metrics, drift detection, health checks
│   ├── orchestrator/                # Multi-agent orchestrator & semantic query router
│   ├── prompts/                     # Grounded system prompts & tool definitions
│   ├── runtime/                     # Model selector, task router, context manager, safe executor
│   ├── tools/                       # 15 domain tools with strict deterministic boundary
│   ├── workflows/                   # Automated multi-step autonomous dispatch & triage workflows
│   └── main.py                      # Standalone AI microservice entrypoint (Port 8000 / 8001)
│
├── firebase/                        # Firebase project configuration & security rules
│   ├── firestore.rules              # Cryptographic RBAC Firestore rules
│   ├── storage.rules                # Storage security rules
│   └── indexes.json                 # Composite database query indexes
│
├── docs/                            # Comprehensive architectural & engineering documentation
│   ├── 01_Project_Overview.md ... 23_Future_Roadmap.md
│   ├── API_Contract.md
│   ├── Database_Schema.md
│   └── Hardware_Spec.md
│
├── scripts/                         # Multi-process development & automation scripts
│   └── dev-all.mjs                  # Unified runner: Ollama + Backend + Next.js
│
└── test/                            # Comprehensive test & verification suites
    ├── unit/                        # Node.js relay safety and RBAC tests
    ├── integration/                 # Node.js circular buffer and conservation tests
    ├── test_backend_suite.py        # 18-point REST API & safety interlock suite
    ├── test_ai_suite.py             # 16-point specialized agent & model suite
    ├── test_query_router.py         # Grounding & RAG retrieval verification
    └── test_ws.py                   # 1Hz real-time WebSocket client test
```

---

## 🛠️ Installation & Setup

### Prerequisites

| Requirement      | Version | Notes                                      |
| ---------------- | ------- | ------------------------------------------ |
| Node.js          | 20+     | LTS recommended (v20 or v22)               |
| Python           | ≥ 3.10  | Required for FastAPI Backend & Agentic AI  |
| npm              | 10+     | Included with Node.js                      |
| pip              | Latest  | Python package manager                     |
| Ollama           | Latest  | For local/cloud dual-model inference       |
| Git              | Latest  | Version control                            |
| Firebase Project | —       | Firestore + Authentication configured      |

### 1. Clone the Repository

```bash
git clone https://github.com/Mekesh-Engineer/gridflowx.git
cd gridflowx-app1
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Install Python Dependencies (Backend & Agentic AI)

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

```bash
cp .env.example .env
cp .env.example frontend/.env.local
```

Configure your Firebase credentials and Ollama Cloud keys in `.env` and `frontend/.env.local` (see [Environment Variables](#-environment-variables) below).

### 5. Deploy Firestore Security Rules

```bash
cd firebase
firebase deploy --only firestore:rules --project <your-project-id>
firebase deploy --only firestore:indexes --project <your-project-id>
cd ..
```

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root based on `.env.example`:

```bash
# ── Application Ports ──
PORT=5000
FRONTEND_PORT=3000
AI_SERVICE_PORT=8000

# ── Firebase Web SDK (Next.js Client) ──
# All NEXT_PUBLIC_ variables are exposed to the browser
NEXT_PUBLIC_FIREBASE_API_KEY="your-firebase-api-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-XXXXXXXXXX"

# ── FastAPI AI Service URL ──
NEXT_PUBLIC_AI_SERVICE_URL="http://localhost:8000"

# ── WebSocket URL (optional — defaults to ws://localhost:8000) ──
NEXT_PUBLIC_WS_URL="ws://localhost:8000"
```

**For the FastAPI AI service** (Docker / production), set these as container environment variables:

```bash
FIREBASE_SERVICE_ACCOUNT_JSON=<base64-encoded-or-path-to-service-account-key.json>
OPENWEATHER_API_KEY=<your-openweathermap-api-key>
DEVICE_WS_TOKEN=<secure-token-for-esp32-handshake>
```

> **Never commit `.env.local` or any service account JSON to version control.** Both are listed in `.gitignore`.

---

## 🔥 Firebase Configuration

### 1. Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named `gridflowx` (or any name)
3. Enable **Authentication** → Email/Password provider
4. Enable **Cloud Firestore** → Start in production mode
5. Register a Web App → copy the config values to `.env.local`

### 2. Generate a Service Account Key (Backend)

1. Firebase Console → Project Settings → Service Accounts
2. Click **Generate new private key** → download JSON
3. Pass as `FIREBASE_SERVICE_ACCOUNT_JSON` environment variable to the FastAPI container

### 3. Deploy Security Rules

The Firestore Security Rules in `firebase/firestore.rules` enforce RBAC at the database level using Firebase Custom Claims:

```javascript
// firebase/firestore.rules (excerpt)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function getUserRole() {
      return request.auth.token.role;
    }

    match /telemetry/{document} {
      allow read: if hasRole(['admin', 'supervisor', 'operator', 'auditor']);
      allow write: if false; // Backend Admin SDK only
    }

    match /audit_logs/{document} {
      allow read: if hasRole(['admin', 'supervisor', 'auditor']);
      allow write: if false; // Immutable — Admin SDK only
    }
    // ... (see firebase/firestore.rules for full rules)
  }
}
```

Deploy rules and indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes --project <your-project-id>
```

### 4. Set Custom Claims for Roles

Firebase Custom Claims must be set server-side via the Admin SDK. In the AI service (or a separate admin script):

```python
from firebase_admin import auth

auth.set_custom_user_claims(uid, {"role": "operator"})
```

> The registration flow writes the role to Firestore, but Custom Claims for Firestore Security Rules must be set via the Admin SDK — this is a planned Admin panel feature.

---

## ▶️ Running the Project

### Running GridFlowX

#### Option 1: Unified Multi-Process Development (Recommended)

Starts the Ollama Cloud engine probe, the FastAPI Enterprise Backend / Agentic AI Gateway (Port 8000), and the Next.js 15 Web Application (Port 3000) with a single command:

```bash
npm run dev:all
```

#### Option 2: Running Components Individually

**Terminal 1 — Next.js 15 Web Application (Port 3000):**
```bash
npm run dev
# → http://localhost:3000
```

**Terminal 2 — Enterprise Backend API Gateway (Port 8000):**
```bash
npm run dev:backend
# → http://localhost:8000
# → Swagger Docs: http://localhost:8000/docs
```

**Terminal 3 — Standalone Agentic AI Microservice (Port 8001):**
```bash
npm run dev:agentic-ai
# → http://localhost:8001
```

### Complete Verification Test Suite

Run the full end-to-end multi-tier test suite across frontend, backend, agentic AI, and query router:

```bash
npm run test:all
```

---

## 📜 npm Scripts

All scripts are defined in `package.json`:

| Script            | Command                                                                                   | Description                                            |
| ----------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `dev`             | `npm run dev:frontend`                                                                    | Start Next.js development server on port 3000          |
| `dev:all`         | `node scripts/dev-all.mjs`                                                                | Concurrently launch Ollama, Backend & Next.js          |
| `dev:frontend`    | `npm run dev --prefix frontend`                                                           | Launch Next.js web application                         |
| `dev:backend`     | `py -m uvicorn main:app --app-dir backend --reload --port 8000`                           | Launch FastAPI Enterprise Backend on port 8000         |
| `dev:ai`          | `py -m uvicorn main:app --app-dir agentic-ai --reload --port 8000`                       | Launch Agentic AI runtime on port 8000                 |
| `dev:agentic-ai`  | `py -m uvicorn main:app --app-dir agentic-ai --reload --port 8001`                       | Launch Agentic AI microservice standalone on port 8001 |
| `build`           | `npm run build --prefix frontend`                                                         | Cleanly compile Next.js production build (69 pages)    |
| `start`           | `npm run start --prefix frontend`                                                         | Run Next.js production server                          |
| `test`            | `node --test test/unit/*.test.mjs test/integration/*.test.mjs`                             | Run Node.js unit and integration safety tests          |
| `test:backend`    | `py test/test_backend_suite.py`                                                           | Run 18-point backend REST API verification suite       |
| `test:ai`         | `py test/test_ai_suite.py`                                                                | Run 16-point specialized AI agent verification suite   |
| `test:router`     | `py test/test_query_router.py`                                                            | Run intent classification & RAG grounding tests        |
| `test:ws`         | `py test/test_ws.py`                                                                      | Run real-time WebSocket client telemetry test          |
| `test:all`        | (Full multi-tier test runner)                                                             | Execute all 61 Node, Python, AI, and Backend tests     |

---

## 🗺️ Pages & Routes

### Public Pages (No authentication required)

| Route           | Page           | Description                          |
| --------------- | -------------- | ------------------------------------ |
| `/`             | Landing / Home | Full marketing site with 10 sections |
| `/about`        | About          | About GridFlowX                      |
| `/contact`      | Contact        | Contact form                         |
| `/developers`   | Developers     | API documentation for developers     |
| `/explorer`     | Explorer       | Public data explorer                 |
| `/features`     | Features       | Platform features overview           |
| `/how-it-works` | How It Works   | Architecture walkthrough             |

### Authentication Pages (Redirect to dashboard if authenticated)

| Route              | Page            | Description                                        |
| ------------------ | --------------- | -------------------------------------------------- |
| `/login`           | Login           | Email + password sign-in                           |
| `/register`        | Register        | 3-step multi-part registration with role selection |
| `/forgot-password` | Forgot Password | Send password reset email                          |
| `/reset-password`  | Reset Password  | OOB code-based new password form                   |
| `/verify-email`    | Verify Email    | Email verification gate with resend option         |

### Protected Dashboard Pages

| Route                   | Page             | Role                         | Status                 |
| ----------------------- | ---------------- | ---------------------------- | ---------------------- |
| `/dashboard`            | Operator Console | All authenticated + verified | ✅ Implemented         |
| `/dashboard/admin`      | Admin Panel      | `admin` only                 | ✅ Implemented         |
| `/dashboard/supervisor` | Supervisor Panel | `supervisor`, `admin`        | ✅ Implemented         |
| `/dashboard/audit`      | Audit Trail      | `auditor`, `admin`           | ✅ Implemented         |

---

## 🧩 Components

### Providers

| Component       | File                                          | Purpose                                                                                |
| --------------- | --------------------------------------------- | -------------------------------------------------------------------------------------- |
| `AuthProvider`  | `components/providers/auth-provider.tsx`      | Listens to `onAuthStateChanged`, syncs to Zustand, creates Firestore doc for new users |
| `RouteGuard`    | `components/providers/route-guard.tsx`        | Enforces auth state, email verification, and role-based route access                   |
| `ThemeProvider` | `components/layout/Navbar/theme-provider.tsx` | next-themes wrapper with system default                                                |

### Dashboard Components

| Component              | File                                    | Purpose                                           |
| ---------------------- | --------------------------------------- | ------------------------------------------------- |
| `AppSidebar`           | `components/app-sidebar.tsx`            | Collapsible sidebar with nav groups, user menu    |
| `SiteHeader`           | `components/site-header.tsx`            | Dashboard top bar with sidebar trigger            |
| `SectionCards`         | `components/section-cards.tsx`          | KPI summary cards grid (gradient variant)         |
| `ChartAreaInteractive` | `components/chart-area-interactive.tsx` | Interactive area chart (Recharts)                 |
| `DataTable`            | `components/data-table.tsx`             | Feature-rich sortable data table (TanStack Table) |
| `NavMain`              | `components/nav-main.tsx`               | Primary sidebar navigation links                  |
| `NavDocuments`         | `components/nav-documents.tsx`          | Document-type sidebar navigation                  |
| `NavSecondary`         | `components/nav-secondary.tsx`          | Secondary/utility sidebar navigation              |
| `NavUser`              | `components/nav-user.tsx`               | User avatar menu (profile, notifications, logout) |

### Navbar Components

| Component               | File                                                 | Purpose                       |
| ----------------------- | ---------------------------------------------------- | ----------------------------- |
| `Megamenu`              | `components/layout/Navbar/Megamenu.tsx`              | Desktop dropdown megamenu     |
| `MobileMenu`            | `components/layout/Navbar/MobileMenu.tsx`            | Mobile navigation drawer      |
| `NotificationsDropdown` | `components/layout/Navbar/NotificationsDropdown.tsx` | Notification bell popover     |
| `SearchModal`           | `components/layout/Navbar/SearchModal.tsx`           | Global search command palette |
| `ThemeToggle`           | `components/layout/Navbar/ThemeToggle.tsx`           | Dark/light mode switch        |

### Auth Feature Components

| Component               | File                                                 | Purpose                                 |
| ----------------------- | ---------------------------------------------------- | --------------------------------------- |
| `AuthFormInput`         | `features/auth/components/AuthFormInput.tsx`         | Styled form input with validation       |
| `AuthErrorAlert`        | `features/auth/components/AuthErrorAlert.tsx`        | Firebase error message display          |
| `AuthLogoMark`          | `features/auth/components/AuthLogoMark.tsx`          | GridFlowX logo for auth pages           |
| `AuthPromoPanel`        | `features/auth/components/AuthPromoPanel.tsx`        | Right-side promotional panel            |
| `AuthThemeToggle`       | `features/auth/components/AuthThemeToggle.tsx`       | Theme toggle for auth pages             |
| `PasswordStrengthMeter` | `features/auth/components/PasswordStrengthMeter.tsx` | Visual password strength indicator      |
| `RoleSelector`          | `features/auth/components/RoleSelector.tsx`          | Role picker (operator/supervisor/admin) |

### Shared Components

| Component       | File                                   | Purpose                              |
| --------------- | -------------------------------------- | ------------------------------------ |
| `Container`     | `components/shared/container.tsx`      | Responsive max-width wrapper         |
| `SectionHeader` | `components/shared/section-header.tsx` | Reusable section title + description |
| `ThemeToggle`   | `components/shared/theme-toggle.tsx`   | Reusable theme toggle button         |

### Animation Components

| Component             | File                                  | Purpose                          |
| --------------------- | ------------------------------------- | -------------------------------- |
| `AnimatedSphere`      | `animations/animated-sphere.tsx`      | Three.js animated 3D sphere      |
| `AnimatedTetrahedron` | `animations/animated-tetrahedron.tsx` | Three.js animated 3D tetrahedron |
| `AnimatedWave`        | `animations/animated-wave.tsx`        | Three.js animated wave plane     |

### UI Primitives (shadcn/ui — `components/ui/`)

50+ generated shadcn/ui components including: `accordion`, `alert-dialog`, `alert`, `avatar`, `badge`, `breadcrumb`, `button`, `calendar`, `card`, `carousel`, `chart`, `checkbox`, `command`, `dialog`, `drawer`, `dropdown-menu`, `form`, `input`, `label`, `navigation-menu`, `pagination`, `popover`, `progress`, `radio-group`, `resizable`, `scroll-area`, `select`, `separator`, `sheet`, `sidebar`, `skeleton`, `slider`, `sonner`, `spinner`, `switch`, `table`, `tabs`, `textarea`, `toast`, `tooltip`, and more.

---

## ⚙️ Features & Services

### Auth Feature (`src/features/auth/`)

#### Services

**`auth.service.ts`** — Login and logout:

```typescript
loginWithCredentials(email: string, password: string): Promise<UserCredential>
logout(): Promise<void>
```

**`authService.ts`** — Registration with Firestore profile creation:

```typescript
registerWithEmail(payload: RegisterPayload): Promise<User>
// Creates Firebase Auth user → updates profile → sends email verification
// → writes user doc to Firestore (users/{uid})
```

#### Hooks

| Hook                | File                                       | Purpose                                          |
| ------------------- | ------------------------------------------ | ------------------------------------------------ |
| `useLogin`          | `features/auth/hooks/useLogin.ts`          | Login form logic                                 |
| `useForgotPassword` | `features/auth/hooks/useForgotPassword.ts` | Password reset email                             |
| `useResetPassword`  | `features/auth/hooks/useResetPassword.ts`  | New password submission                          |
| `useAuth`           | `hooks/use-auth.ts`                        | Global auth state + logout + resend verification |

#### Registration Schema (Zod, 3-step)

```
Step 1: firstName, lastName, email
Step 2: gender, dob (age ≥ 13), country, city, role
Step 3: password (8+ chars, uppercase, lowercase, number, special char), confirmPassword, terms
```

### Telemetry Feature (`src/features/telemetry/`)

**`telemetry.service.ts`** — Firestore historical query:

```typescript
fetchHistoricalTelemetry(deviceId: string, limitCount?: number): Promise<TelemetryRecord[]>
// Queries: telemetry collection, filtered by deviceId, ordered by timestamp desc
```

**`TelemetryRecord` interface:**

```typescript
interface TelemetryRecord {
  id: string;
  deviceId: string;
  timestamp: string;
  solarPowerW: number;
  batteryCurrentA: number;
  batterySoc: number;
  gridPowerW: number;
  busVoltageV: number;
  relayStates: boolean[];
}
```

### Relay Feature (`src/features/relay/`)

```typescript
toggleRelayOverride(relayIndex, newState, reason, token?): Promise<OverrideResponse>
// POST /api/v1/relays/override → FastAPI → WebSocket → ESP32

triggerEmergencyRecovery(reason, token?): Promise<OverrideResponse>
// POST /api/v1/relays/recovery → FastAPI → WebSocket → ESP32
```

### Battery Feature (`src/features/battery/`)

```typescript
fetchBatteryHealthAnalysis(deviceId, token?): Promise<BatteryStateAnalysis>
// GET /api/v1/battery/{deviceId}/health
// Returns: stateOfHealth, temperatureC, voltageV, currentA,
//          internalResistance, cyclesCompleted, recommendedMaxChargeCurrent
```

### Forecasting Feature (`src/features/forecasting/`)

```typescript
fetchSolarAndLoadForecasts(deviceId, token?): Promise<ForecastDataPoint[]>
// GET /api/v1/forecast/{deviceId}
// Returns array of: { timestamp, predictedSolarYieldW, predictedLoadDemandW }
```

### Optimization Feature (`src/features/optimization/`)

```typescript
updateOptimizationParameters(params, token?): Promise<OptimizationResponse>
// POST /api/v1/optimization/parameters
// params: { peakStartHour, peakEndHour, minChargeSoC, maxDischargeSoC }
```

### Reports Feature (`src/features/reports/`)

```typescript
requestOperationalReport(startDate, endDate, token?): Promise<ReportMeta>
// POST /api/v1/reports/request
// Returns: { reportId, generatedAt, status, downloadUrl? }
```

### WebSocket Client (`src/lib/websocket.ts`)

```typescript
initializeWebSocket(token: string, callbacks: WebSocketCallbacks): void
// Connects to NEXT_PUBLIC_WS_URL/ws/client?token=<token>
// Handles: onMessage(type, payload), onStatusChange(online)
// Auto-reconnects with exponential backoff: 1s → 2s → 4s → ... → 30s max

disconnectWebSocket(): void
// Removes event listeners, closes socket, clears reconnect timer
```

### AI HTTP Client (`src/lib/ai.ts`)

```typescript
fetchFromAIService<T>(endpoint: string, options?: AIRequestOptions): Promise<T>
// Base URL: NEXT_PUBLIC_AI_SERVICE_URL (default: http://localhost:8000)
// Handles: Authorization Bearer token, JSON body serialization, error throwing
```

---

## 📦 State Management

GridFlowX uses **Zustand 5** for global client state with two stores in `src/store/zustand/stores.ts`:

### `useAuthStore` (Persisted)

```typescript
// Persisted to localStorage under key 'gridflowx-auth'
interface AuthStoreState {
  user: AuthUser | null; // Full user profile including role
  isAuthenticated: boolean;
  setUser: (user: AuthUser | null) => void;
  clearUser: () => void;
}
```

**`AuthUser` shape:**

```typescript
interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  role: UserRole; // 'admin' | 'supervisor' | 'operator' | 'auditor'
  emailVerified: boolean;
  dob?: string | null;
  gender?: string | null;
  consents?: { terms; marketing; whatsapp; liveLocation };
}
```

### `useThemeStore` (Thin Wrapper)

```typescript
function useThemeStore() {
  // Wraps next-themes useTheme()
  return { isDarkMode: boolean, toggleTheme: () => void };
}
```

### `useAuth()` Hook

The primary hook for consuming auth state across the app:

```typescript
const {
  user,
  isAuthenticated,
  role,
  isInitialized,
  logout,
  resendVerification,
} = useAuth();
```

---

## 🔌 API Endpoints (FastAPI Microservice)

The FastAPI service (`ai/app/main.py`) exposes the following endpoints at `http://localhost:8000`:

### REST Endpoints

| Method | Endpoint                  | Auth         | Description                                                                   |
| ------ | ------------------------- | ------------ | ----------------------------------------------------------------------------- |
| `GET`  | `/health`                 | None         | Health check → `{ status, service, version }`                                 |
| `POST` | `/api/v1/relays/override` | Bearer token | Toggle a relay channel; broadcasts `OVERRIDE` command to all connected ESP32s |
| `POST` | `/api/v1/relays/recovery` | Bearer token | Authorize emergency recovery; broadcasts `RECOVERY_AUTHORIZED` to ESP32s      |

**`POST /api/v1/relays/override` Request Body:**

```json
{
  "relayIndex": 3,
  "newState": true,
  "reason": "Manual maintenance override"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Relay override sent for index 3",
  "relayStates": [false, false, false, true, false, false, false, false]
}
```

### WebSocket Endpoints

| Endpoint                                    | Client Type       | Description                                                                            |
| ------------------------------------------- | ----------------- | -------------------------------------------------------------------------------------- |
| `ws://host:8000/ws/telemetry`               | ESP32 firmware    | Device gateway; receives JSON telemetry frames and broadcasts to all dashboard clients |
| `ws://host:8000/ws/client?token=<id_token>` | Next.js dashboard | Dashboard client gateway; receives broadcasts from ESP32 telemetry                     |

**Telemetry Frame (ESP32 → FastAPI → Dashboard):**

```json
{
  "type": "telemetry_update",
  "payload": {
    "deviceId": "esp32-node-01",
    "solarPowerW": 342.5,
    "batteryCurrentA": 2.1,
    "batterySoc": 78.3,
    "busVoltageV": 12.6,
    "relayStates": [true, true, true, false, false, false, false, false]
  }
}
```

**Override Command (FastAPI → ESP32):**

```json
{
  "type": "OVERRIDE",
  "payload": { "channel": 3, "state": true }
}
```

**Recovery Command (FastAPI → ESP32):**

```json
{
  "type": "RECOVERY_AUTHORIZED",
  "payload": { "reason": "Admin authorized restart" }
}
```

### Planned API Routes (Next.js `src/app/api/` — Not yet implemented)

The following Next.js API route directories are scaffolded with `.gitkeep` placeholders and are **not yet implemented**:

- `GET/POST /api/auth` — Authentication helpers
- `GET /api/battery` — Battery state proxy
- `GET /api/forecast` — Forecast data proxy
- `GET/POST /api/optimization` — Optimization parameters proxy
- `POST /api/relay` — Relay override proxy
- `GET/POST /api/reports` — Report generation proxy
- `GET /api/telemetry` — Telemetry query proxy

> **Current behavior:** All AI service calls go directly from the Next.js client to the FastAPI service at `NEXT_PUBLIC_AI_SERVICE_URL`. The planned Next.js API routes would proxy these calls server-side for improved security and token handling.

---

## 🔧 Firmware (ESP32)

The firmware in `firmware/src/main.cpp` runs on an **ESP32-WROOM-32E** using PlatformIO with the Arduino framework.

### Dual-Core Architecture

| Core       | Task         | Rate         | Responsibility                                                                             |
| ---------- | ------------ | ------------ | ------------------------------------------------------------------------------------------ |
| **Core 0** | `safetyLoop` | 100Hz (10ms) | Read ADC sensors, execute emergency cutoff (SoC < 5% OR Temp > 90°C → all relays OFF)      |
| **Core 1** | `commsLoop`  | 1Hz (1000ms) | WiFi connection, WebSocket connection to FastAPI, JSON telemetry transmit, command receive |

### Relay Pin Mapping

```cpp
const int RELAY_PINS[8] = {12, 13, 14, 15, 16, 17, 18, 19};
```

### WebSocket Event Handling

The firmware responds to two command types from FastAPI:

| Command Type          | Action                                                 |
| --------------------- | ------------------------------------------------------ |
| `OVERRIDE`            | Sets the specified relay GPIO HIGH/LOW immediately     |
| `RECOVERY_AUTHORIZED` | Logs recovery authorization and re-initializes modules |

### Build & Flash

```bash
# Install PlatformIO CLI (if not installed)
pip install platformio

# Build firmware
cd firmware
pio run

# Flash to connected ESP32
pio run --target upload

# Open serial monitor (115200 baud)
pio device monitor --baud 115200
```

### PlatformIO Configuration (`firmware/platformio.ini`)

```ini
[env:esp32dev]
platform  = espressif32
board     = esp32dev
framework = arduino
monitor_speed = 115200
lib_deps =
    bblanchon/ArduinoJson @ ^7.0.0
    links2004/WebSockets  @ ^2.4.1
```

---

## 🤖 AI Models

The `models/` directory contains subdirectories for four planned AI model categories. **All subdirectories are currently scaffolded with `.gitkeep` placeholders** — model weights are not yet included in the repository.

| Directory              | Model Type                     | Purpose                                                                     |
| ---------------------- | ------------------------------ | --------------------------------------------------------------------------- |
| `models/forecasting/`  | LSTM / Transformer             | Solar yield and load demand forecasting (1-hour horizon, 15-min resolution) |
| `models/anomaly/`      | Isolation Forest / Autoencoder | Component fault detection and anomaly classification                        |
| `models/battery/`      | Physics-informed regression    | Battery state-of-health analysis                                            |
| `models/optimization/` | PPO / SAC (RL)                 | Energy routing optimization (relay configuration)                           |

The FastAPI service includes `onnxruntime` in its requirements, indicating model inference is planned via ONNX Runtime. Refer to `Docs/05_Agentic_AI_Model.md` and `Docs/07_Model_Training_and_FineTuning.md` for full architectural specifications.

---

## 🐳 Docker Deployment

The `docker-compose.yml` defines two services behind an Nginx reverse proxy:

```yaml
services:
  nginx: # SSL/TLS termination, reverse proxy
  fastapi-backend: # GridFlowX AI Microservice (Port 8000)
```

### Build and Run

```bash
# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f fastapi-backend

# Stop all services
docker compose down
```

### FastAPI Container Details

| Property       | Value                              |
| -------------- | ---------------------------------- |
| Base Image     | `python:3.11-slim` (multi-stage)   |
| Exposed Port   | 8000                               |
| Health Check   | `GET /health` every 30s, 3 retries |
| CPU Limit      | 2.0 vCPUs                          |
| Memory Limit   | 2GB                                |
| Restart Policy | `unless-stopped`                   |

### Environment Variables for Docker

Pass these as container environment variables or via a `.env` file:

```bash
FIREBASE_SERVICE_ACCOUNT_JSON=<service-account-json-content>
OPENWEATHER_API_KEY=<your-key>
DEVICE_WS_TOKEN=<secure-token>
TAG=latest  # Docker image tag
```

---

## 🧪 Testing

### Backend Testing (pytest)

The FastAPI service includes `pytest` and `httpx` in `ai/requirements.txt` for async API testing.

```bash
cd ai
pytest
```

> Test files and coverage configuration are **not yet implemented** in the current repository state (`ai/` sub-directories are `.gitkeep` scaffolds). The testing infrastructure is planned per `Docs/17_Testing.md`.

### Firmware Testing (PlatformIO)

```bash
cd firmware
pio test
```

> `firmware/test/` directory is present but test files are **not yet implemented**.

### Frontend Testing

> Frontend testing (Vitest / React Testing Library / Cypress) is **not yet implemented** in the current repository. No testing configuration or test files are present in `src/`.

---

## 🔒 Security

### Implemented Security Measures

| Layer                  | Measure                                     | Implementation                                                                   |
| ---------------------- | ------------------------------------------- | -------------------------------------------------------------------------------- |
| **Authentication**     | Firebase Auth (Email/Password)              | ID tokens signed by Google; auto-refreshed by Firebase SDK                       |
| **Authorization**      | Firebase Custom Claims (RBAC)               | Cryptographically signed role claims embedded in JWT                             |
| **Database Rules**     | Firestore Security Rules                    | Role-gated read/write per collection; Admin SDK bypasses for backend writes      |
| **Route Protection**   | Client-side `RouteGuard`                    | Redirects unauthenticated/wrong-role users on every navigation                   |
| **Email Verification** | Firebase `sendEmailVerification`            | Unverified users cannot access any protected route                               |
| **Input Validation**   | Zod schemas (frontend) + Pydantic (backend) | Multi-step registration validated client-side; FastAPI validates all POST bodies |
| **Transport Security** | HTTPS/WSS (via Nginx in Docker)             | Nginx configured for SSL/TLS termination                                         |
| **Secret Management**  | Environment variables                       | Firebase credentials and service account never committed to version control      |
| **Audit Trail**        | Firestore `audit_logs` collection           | Immutable — write-only via Admin SDK                                             |

### Hardware Safety

The ESP32 firmware implements a hardware-level safety envelope on Core 0 (100Hz, independent of network):

- **Emergency Cutoff:** All 8 relays de-energized immediately if `batterySoc < 5.0` OR `batteryTempC > 90.0`
- **Independent of software:** Core 0 safety loop cannot be blocked by WebSocket communication on Core 1

---

## ⚡ Performance Considerations

### Frontend

- **React Server Components (RSC):** Next.js 15 App Router enables per-page RSC vs. client component splits
- **Code Splitting:** Next.js automatic route-level code splitting
- **Font Optimization:** `next/font/google` with `display: swap` for Instrument Sans/Serif and JetBrains Mono
- **Vercel Analytics:** `@vercel/analytics` integrated in root layout for Core Web Vitals tracking
- **Tailwind v4 CSS:** PostCSS pipeline with automatic tree-shaking of unused utility classes
- **Image Optimization:** Next.js `<Image>` component (used where applicable in public pages)

### Backend

- **Async throughout:** FastAPI + Uvicorn ASGI stack with async WebSocket handlers
- **ONNX Runtime:** Planned model inference via ONNX (faster than PyTorch at runtime, no GPU required)
- **WebSocket Broadcasting:** In-memory connection registry — no Redis/broker required for single-instance deployment
- **Docker health check:** `/health` endpoint ensures container is replaced before traffic routing during restarts

---

## 🔮 Roadmap

The following features are planned or documented in `Docs/23_Future_Roadmap.md` but **not yet implemented** in the codebase:

| Priority | Feature                                            | Notes                                                                                         |
| -------- | -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| High     | **Admin Dashboard** (`/admin`)                     | User management, threshold configuration, audit log viewer                                    |
| High     | **Supervisor Dashboard** (`/dashboard/supervisor`) | Alert acknowledgement, operational oversight                                                  |
| High     | **Auditor Dashboard** (`/dashboard/audit`)         | Read-only telemetry + compliance report viewer                                                |
| High     | **Next.js API Route Proxies**                      | Server-side proxying of FastAPI calls for improved security                                   |
| High     | **AI Model Inference**                             | ONNX Runtime inference in FastAPI for solar/load forecasting and anomaly detection            |
| Medium   | **Alerts Feature**                                 | Real-time alert panel with severity levels and acknowledgement                                |
| Medium   | **Settings Feature**                               | Threshold configuration UI (SoC limits, temperature limits)                                   |
| Medium   | **Firebase Custom Claims Admin Panel**             | Role assignment UI for admin users                                                            |
| Medium   | **Frontend Testing**                               | Vitest unit tests + Cypress E2E                                                               |
| Medium   | **Model Drift Monitoring**                         | Daily bias checks and automated retraining triggers (see `Docs/19_Model_Drift_Monitoring.md`) |
| Low      | **Telemetry Store**                                | Zustand telemetry store for real-time dashboard state                                         |
| Low      | **Monitoring & Logging**                           | Prometheus + Grafana integration (see `Docs/21_Monitoring_and_Logging.md`)                    |
| Low      | **Multi-Site / Fleet**                             | Multi-ESP32 device management across installations                                            |
| Low      | **PWA**                                            | Offline capability and installability                                                         |

---

## 🤝 Contributing

Contributions are welcome. To contribute:

1. **Fork** the repository on GitHub.
2. **Create** a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Commit** your changes using Conventional Commits:
   ```bash
   git commit -m "feat: add telemetry Zustand store"
   ```
4. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Open a Pull Request** with a clear description of the change and why.

### Development Guidelines

- Follow the existing TypeScript strict mode configuration (`tsconfig.json`)
- Use `shadcn/ui` component patterns and the `new-york` style for new UI components
- Place feature-specific logic in the appropriate `src/features/<feature>/` directory
- Use Zod schemas for all form validation
- Run `npm run lint` before committing
- Do not commit `.env.local`, service account keys, or model weights
- Backend Python changes must maintain compatibility with `requirements.txt` versions

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License © 2026 Mekesh Engineer
```

---

## 👤 Author

**Mekesh Engineer**
B.E. Electrical & Electronics Engineering — Kongu Engineering College, Tamil Nadu
Embedded Systems · IoT · Computer Vision · Full-Stack Development · AI/ML

- GitHub: [@Mekesh-Engineer](https://github.com/Mekesh-Engineer)

---
