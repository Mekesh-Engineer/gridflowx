"""
GridFlowX Fault Detection & Diagnostics Agent
=============================================
Detects multivariate cyber-physical anomalies, overtemperatures, and safety hazards.
"""

from typing import Dict, Any
from agents.base import BaseAgent
from schemas.anomaly import AnomalyDetectionResponse
from inference.fault_inference import fault_inference_adapter


class FaultDetectionAgent(BaseAgent[Dict[str, Any], AnomalyDetectionResponse]):
    def __init__(self):
        super().__init__(
            name="Fault Detection & Diagnostics Agent",
            version="2.0.4",
            role="Real-time multivariate anomaly detection"
        )

    async def execute(self, input_data: Dict[str, Any]) -> AnomalyDetectionResponse:
        return fault_inference_adapter.predict(input_data)

    def detect_sync(self, telemetry: Dict[str, Any], device_id: str = "GFX-ESP32-MASTER-01") -> AnomalyDetectionResponse:
        return fault_inference_adapter.predict(telemetry)

    def diagnose_sync(self, telemetry: Dict[str, Any], device_id: str = "GFX-ESP32-MASTER-01") -> AnomalyDetectionResponse:
        return self.detect_sync(telemetry, device_id)


fault_agent = FaultDetectionAgent()
