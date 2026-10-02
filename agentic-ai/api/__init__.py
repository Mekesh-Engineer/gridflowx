from .telemetry_router import router as telemetry_router
from .relays_router import router as relays_router
from .ai_forecast_router import router as ai_forecast_router
from .ai_battery_router import router as ai_battery_router
from .ai_anomaly_router import router as ai_anomaly_router
from .ai_optimization_router import router as ai_optimization_router
from .ai_models_router import router as ai_models_router
from .agent_router import router as agent_router
from .websockets_router import router as websockets_router

__all__ = [
    "telemetry_router",
    "relays_router",
    "ai_forecast_router",
    "ai_battery_router",
    "ai_anomaly_router",
    "ai_optimization_router",
    "ai_models_router",
    "agent_router",
    "websockets_router",
]
