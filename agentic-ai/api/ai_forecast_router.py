"""
GridFlowX Forecasting API Router
================================
"""

from typing import Dict, Any
from fastapi import APIRouter
from schemas.forecasts import (
    SolarForecastResponse,
    LoadForecastResponse,
)
from services.forecast_service import ForecastService

router = APIRouter(prefix="/api/v1/ai/forecast", tags=["AI Forecasting"])


@router.get("/solar", response_model=SolarForecastResponse)
def get_solar_forecast(
    deviceId: str = "GFX-ESP32-MASTER-01",
    horizonHours: int = 24
):
    """Calculates clear-sky solar irradiance and PV yield predictions."""
    return ForecastService.calculate_solar_forecast(
        device_id=deviceId,
        horizon_hours=horizonHours
    )


@router.get("/load", response_model=LoadForecastResponse)
def get_load_forecast(
    deviceId: str = "GFX-ESP32-MASTER-01",
    horizonHours: int = 24
):
    """Calculates multi-tier load demand forecasts (Tier 1/2/3)."""
    return ForecastService.calculate_load_forecast(
        device_id=deviceId,
        horizon_hours=horizonHours
    )


@router.get("/accuracy")
def get_forecast_accuracy(deviceId: str = "GFX-ESP32-MASTER-01"):
    """Returns empirical error metrics (MAE, MAPE, RMSE) for active models."""
    return ForecastService.get_forecast_accuracy_metrics(device_id=deviceId)
