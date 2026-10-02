"""
GridFlowX Solar Forecasting Agent
=================================
Predicts clear-sky irradiance and PV generation yield across a multi-hour horizon.
"""

from typing import Dict, Any
from agents.base import BaseAgent
from schemas.forecasts import SolarForecastResponse
from inference.solar_inference import solar_inference_adapter


class SolarForecastingAgent(BaseAgent[Dict[str, Any], SolarForecastResponse]):
    def __init__(self):
        super().__init__(
            name="Solar Forecasting Agent",
            version="3.1.2",
            role="Short-term & 24h PV yield prediction"
        )

    async def execute(self, input_data: Dict[str, Any]) -> SolarForecastResponse:
        return solar_inference_adapter.predict(input_data)

    def forecast_sync(self, device_id: str = "GFX-ESP32-MASTER-01", horizon_hours: int = 24) -> SolarForecastResponse:
        return solar_inference_adapter.predict({"deviceId": device_id, "horizonHours": horizon_hours})


solar_agent = SolarForecastingAgent()
