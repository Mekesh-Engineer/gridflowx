"""
GridFlowX Energy Management & Decision Agent
============================================
Formulates optimal relay routing, peak shaving, and tariff responses.
Treats decisions as *proposals* to be validated by the deterministic safety layer.
"""

from typing import Dict, Any
from agents.base import BaseAgent
from schemas.optimization import OptimizationResponse
from inference.energy_inference import energy_inference_adapter


class EnergyManagementAgent(BaseAgent[Dict[str, Any], OptimizationResponse]):
    def __init__(self):
        super().__init__(
            name="Energy Management Decision Agent",
            version="1.8.1",
            role="Autonomous ToU tariff optimization & source selection"
        )

    async def execute(self, input_data: Dict[str, Any]) -> OptimizationResponse:
        return energy_inference_adapter.predict(input_data)

    def optimize_sync(self, telemetry: Dict[str, Any], device_id: str = "GFX-ESP32-MASTER-01") -> OptimizationResponse:
        payload = dict(telemetry)
        payload["deviceId"] = device_id
        return energy_inference_adapter.predict(payload)


energy_agent = EnergyManagementAgent()
