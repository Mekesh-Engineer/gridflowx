"""
GridFlowX Load Demand Forecasting Agent
=======================================
Predicts multi-tier microgrid demand profiles and peak consumption timing.
"""

from typing import Dict, Any
from agents.base import BaseAgent
from schemas.forecasts import LoadForecastResponse
from inference.load_inference import load_inference_adapter


class LoadDemandForecastingAgent(BaseAgent[Dict[str, Any], LoadForecastResponse]):
    def __init__(self):
        super().__init__(
            name="Load Demand Forecasting Agent",
            version="2.1.0",
            role="Multi-tier demand prediction"
        )

    async def execute(self, input_data: Dict[str, Any]) -> LoadForecastResponse:
        return load_inference_adapter.predict(input_data)

    def forecast_sync(self, device_id: str = "GFX-ESP32-MASTER-01", horizon_hours: int = 24) -> LoadForecastResponse:
        return load_inference_adapter.predict({"deviceId": device_id, "horizonHours": horizon_hours})


load_agent = LoadDemandForecastingAgent()
