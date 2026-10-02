"""
GridFlowX Production AI Gateway & Microservice
==============================================
Asynchronous telemetry streaming, multi-agent orchestration,
safety enforcement, and real-time cyber-physical digital twin manager.
"""

import sys
import os

_AGENTIC_DIR = os.path.dirname(os.path.abspath(__file__))
if _AGENTIC_DIR not in sys.path:
    sys.path.insert(0, _AGENTIC_DIR)

import asyncio
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from services.telemetry_service import (
    telemetry_manager,
    microgrid_physics_simulator,
)
from api import (
    telemetry_router,
    relays_router,
    ai_forecast_router,
    ai_battery_router,
    ai_anomaly_router,
    ai_optimization_router,
    ai_models_router,
    agent_router,
    websockets_router,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: spawn physics simulation loop in background
    sim_task = asyncio.create_task(microgrid_physics_simulator())
    print("[SYSTEM] GridFlowX Microgrid Telemetry Engine Started (1Hz Real-Time Stream)")
    yield
    # Shutdown
    sim_task.cancel()


app = FastAPI(
    title=settings.app_name,
    description="Asynchronous telemetry streaming, forecasting, and relay routing manager.",
    version=settings.app_version,
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "gridflowx-ai",
        "version": settings.app_version,
        "connected_clients": len(telemetry_manager.active_clients),
        "connected_devices": len(telemetry_manager.active_devices),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@app.get("/api/ai/health")
async def ai_health_alias():
    from services.llm_service import local_llm_service
    return await local_llm_service.get_health_status()


# Include modular routers
app.include_router(telemetry_router)
app.include_router(relays_router)
app.include_router(ai_forecast_router)
app.include_router(ai_battery_router)
app.include_router(ai_anomaly_router)
app.include_router(ai_optimization_router)
app.include_router(ai_models_router)
app.include_router(agent_router)
app.include_router(websockets_router)

# Backward-compatibility alias
manager = telemetry_manager
