"""
GridFlowX AI Forecasting Router
"""

from typing import Dict, Any
from fastapi import APIRouter, Query
from backend.services.agentic_client import agentic_client

router = APIRouter(prefix="/api/v1/ai/forecast", tags=["AI Forecasting"])


@router.get("/solar")
def get_solar_forecast(
    deviceId: str = Query("GFX-ESP32-MASTER-01"),
    horizonHours: int = Query(24, ge=1, le=72)
) -> Dict[str, Any]:
    """Generates 24h/72h Clear-sky GHI solar yield forecasts."""
    return agentic_client.get_solar_forecast(deviceId, horizonHours)


@router.get("/load")
def get_load_forecast(
    deviceId: str = Query("GFX-ESP32-MASTER-01"),
    horizonHours: int = Query(24, ge=1, le=72)
) -> Dict[str, Any]:
    """Generates multi-tier load demand forecasts."""
    return agentic_client.get_load_forecast(deviceId, horizonHours)


@router.get("/accuracy")
def get_forecast_accuracy(deviceId: str = Query("GFX-ESP32-MASTER-01")) -> Dict[str, Any]:
    """Returns empirical error metrics (MAE, MAPE, RMSE) for active models."""
    from services.forecast_service import ForecastService
    return ForecastService.get_forecast_accuracy_metrics(device_id=deviceId)

