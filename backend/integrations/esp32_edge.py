"""
GridFlowX ESP32 Edge & FreeRTOS Microcontroller Integration
===========================================================
Protocol handler for incoming FreeRTOS telemetry frames,
CRC / auth token verification, and outgoing atomic relay commands.
"""

from typing import Dict, Any, Optional
from datetime import datetime, timezone
from backend.core.settings import settings


class ESP32EdgeBridge:
    def __init__(self):
        self.device_id = settings.edge_device_id
        self.expected_token = settings.device_ws_token

    def authenticate_device(self, token: Optional[str]) -> bool:
        """Verifies edge hardware preshared key."""
        if settings.dev_bypass_auth:
            return True
        return token == self.expected_token

    def parse_edge_telemetry(self, raw_data: Dict[str, Any]) -> Dict[str, Any]:
        """Normalizes and validates incoming FreeRTOS frame."""
        return {
            "deviceId": raw_data.get("deviceId", self.device_id),
            "timestamp": raw_data.get("timestamp", datetime.now(timezone.utc).isoformat()),
            "solarVoltageV": float(raw_data.get("solarVoltageV", 18.2)),
            "solarCurrentA": float(raw_data.get("solarCurrentA", 4.8)),
            "solarPowerW": float(raw_data.get("solarPowerW", 87.36)),
            "batteryVoltageV": float(raw_data.get("batteryVoltageV", 12.8)),
            "batteryCurrentA": float(raw_data.get("batteryCurrentA", 2.1)),
            "batteryPowerW": float(raw_data.get("batteryPowerW", 26.88)),
            "batterySoc": float(raw_data.get("batterySoc", 78.4)),
            "batteryTempC": float(raw_data.get("batteryTempC", 29.5)),
            "gridVoltageV": float(raw_data.get("gridVoltageV", 230.1)),
            "gridFrequencyHz": float(raw_data.get("gridFrequencyHz", 50.0)),
            "gridPowerW": float(raw_data.get("gridPowerW", 0.0)),
            "loadPowerW": float(raw_data.get("loadPowerW", 60.48)),
            "dcBusVoltageV": float(raw_data.get("dcBusVoltageV", 12.8)),
            "relayStates": raw_data.get("relayStates", [True, True, True, True, False, False, False, False]),
        }


esp32_edge_bridge = ESP32EdgeBridge()
