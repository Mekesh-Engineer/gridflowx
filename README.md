# ⚡ GridFlowX — Smart AI-Driven Microgrid Management System

GridFlowX is a cyber-physical AI platform designed to manage and optimize local microgrid energy distribution. It integrates embedded hardware sensors and actuators (ESP32) with a real-time async communication hub (FastAPI) and an interactive glassmorphic operator dashboard (Next.js 15).

## 📂 Repository Directory Structure

- `/app`: Next.js App Router layout and pages (including public, dashboard, admin, operator, and supervisor views, plus API endpoints).
- `/components`: Reusable, modular UI components (charts, forms, layout elements).
- `/features`: Feature-specific modules (telemetry, forecasting, relay control, battery analytics).
- `/lib` & `/services`: Shared configuration wrappers (Firebase, Websocket) and business services.
- `/store`: Zustand client-side state stores.
- `/ai`: Python FastAPI backend service housing telemetry ingest, WebSocket broadcasting, and AI forecasting/optimization agents.
- `/firmware`: Embedded C++ PlatformIO code running deterministic FreeRTOS safety/communication tasks on the ESP32 edge microcontroller.
- `/models`: Saved model weights and checkpoints for LSTM solar yield, ARIMA load, and Anomaly Detection.

## 🚀 Quick Start

### 1. Backend & AI Microservice
```bash
cd ai
pip install -r requirements.txt
npm run ai:dev
```

### 2. Frontend Web Application
```bash
npm install
npm run dev
```

### 3. Firmware Build
Open `/firmware` in VS Code with PlatformIO extension and deploy to target ESP32-WROOM-32E board.
