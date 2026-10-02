"""
GridFlowX API Routers Package
"""

from backend.api.telemetry_router import router as telemetry_router
from backend.api.relays_router import router as relays_router
from backend.api.energy_router import router as energy_router
from backend.api.devices_router import router as devices_router
from backend.api.alerts_router import router as alerts_router
from backend.api.forecasting_router import router as forecasting_router
from backend.api.battery_router import router as battery_router
from backend.api.fault_router import router as fault_router
from backend.api.optimization_router import router as optimization_router
from backend.api.ai_models_router import router as ai_models_router
from backend.api.agent_router import router as agent_router
from backend.api.health_router import router as health_router
from backend.api.websockets_router import router as websockets_router

__all__ = [
    "telemetry_router",
    "relays_router",
    "energy_router",
    "devices_router",
    "alerts_router",
    "forecasting_router",
    "battery_router",
    "fault_router",
    "optimization_router",
    "ai_models_router",
    "agent_router",
    "health_router",
    "websockets_router",
]
