"""
GridFlowX Microgrid Device Registry Service
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone


class DeviceService:
    """Manages connected IoT and Edge hardware devices."""

    def __init__(self):
        self.devices = {
            "GFX-ESP32-MASTER-01": {
                "deviceId": "GFX-ESP32-MASTER-01",
                "deviceName": "Main Microgrid RTU (ESP32-S3)",
                "deviceType": "ESP32_CONTROLLER",
                "status": "ONLINE",
                "ipAddress": "192.168.1.120",
                "macAddress": "24:6F:28:B4:7A:1A",
                "firmwareVersion": "v3.2.1-esp-idf-v5.1",
                "lastHeartbeat": datetime.now(timezone.utc).isoformat(),
                "telemetryRateHz": 1.0,
                "channelCount": 8
            },
            "GFX-INV-SOLAR-01": {
                "deviceId": "GFX-INV-SOLAR-01",
                "deviceName": "Solar Hybrid Inverter (5kW)",
                "deviceType": "SOLAR_INVERTER",
                "status": "ONLINE",
                "ipAddress": "192.168.1.125",
                "macAddress": "24:6F:28:B4:7A:2B",
                "firmwareVersion": "v2.1.0-modbus",
                "lastHeartbeat": datetime.now(timezone.utc).isoformat(),
                "telemetryRateHz": 1.0,
                "channelCount": 2
            },
            "GFX-BESS-LFP-01": {
                "deviceId": "GFX-BESS-LFP-01",
                "deviceName": "LiFePO4 10kWh Battery Pack",
                "deviceType": "BESS",
                "status": "ONLINE",
                "ipAddress": "192.168.1.130",
                "macAddress": "24:6F:28:B4:7A:3C",
                "firmwareVersion": "v1.4.8-canbus",
                "lastHeartbeat": datetime.now(timezone.utc).isoformat(),
                "telemetryRateHz": 1.0,
                "channelCount": 16
            }
        }

    def list_devices(self) -> List[Dict[str, Any]]:
        return list(self.devices.values())

    def get_device(self, device_id: str) -> Optional[Dict[str, Any]]:
        return self.devices.get(device_id)


device_service = DeviceService()
