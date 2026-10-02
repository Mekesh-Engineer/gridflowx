"""
GridFlowX Enterprise Backend System
====================================
Unified production server integrating REST APIs, real-time WebSockets,
telemetry stream simulation, physical relay protection, Supabase data sync,
and seamless delegation to the Agentic AI subsystem.
"""

import sys
import os
import asyncio
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI

# Ensure backend and agentic-ai are on sys.path
_BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_BACKEND_DIR, ".."))
_AGENTIC_DIR = os.path.join(_PROJECT_ROOT, "agentic-ai")

for p in (_BACKEND_DIR, _PROJECT_ROOT, _AGENTIC_DIR):
    if p not in sys.path:
        sys.path.insert(0, p)

from backend.core.config import settings
from backend.middleware.cors import setup_cors
from backend.middleware.error_handler import setup_error_handlers
from backend.middleware.logging import setup_request_logging
from backend.services.telemetry_service import (
    telemetry_service,
    microgrid_physics_simulator,
)
from backend.services.agentic_client import agentic_client
from backend.websocket.connection_manager import ws_manager
from backend.api import (
    health_router,
    telemetry_router,
    relays_router,
    energy_router,
    devices_router,
    alerts_router,
    forecasting_router,
    battery_router,
    fault_router,
    optimization_router,
    ai_models_router,
    agent_router,
    websockets_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: spawn physics simulation loop in background
    sim_task = asyncio.create_task(microgrid_physics_simulator())
    print(f"[BACKEND] GridFlowX Microgrid Telemetry Engine Active (1Hz Real-Time Stream on port {settings.port})")
    print(f"[BACKEND] Connected to Agentic AI Subsystem (Gemma 4 31B Cloud & GPT-OSS 120B Cloud)")
    yield
    # Shutdown
    sim_task.cancel()
    print("[BACKEND] Telemetry Engine safely stopped.")


app = FastAPI(
    title=settings.app_name,
    description="GridFlowX Enterprise Server: Telemetry, Relays, Energy Management & Agentic AI Gateway.",
    version=settings.app_version,
    lifespan=lifespan
)

# Configure Middlewares
setup_cors(app)
setup_error_handlers(app)
setup_request_logging(app)

# Include All Routers
app.include_router(health_router)
app.include_router(telemetry_router)
app.include_router(relays_router)
app.include_router(energy_router)
app.include_router(devices_router)
app.include_router(alerts_router)
app.include_router(forecasting_router)
app.include_router(battery_router)
app.include_router(fault_router)
app.include_router(optimization_router)
app.include_router(ai_models_router)
app.include_router(agent_router)
app.include_router(websockets_router)


@app.get("/api/ai/health")
async def ai_health_alias():
    return await agentic_client.get_system_health()


# Backward compatibility manager alias
manager = ws_manager
