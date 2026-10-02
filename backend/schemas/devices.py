"""
GridFlowX Device Management Schemas
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class DeviceInfo(BaseModel):
    deviceId: str
    deviceName: str
    deviceType: str  # 'ESP32_CONTROLLER' | 'SOLAR_INVERTER' | 'BESS' | 'GRID_METER'
    status: str      # 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'ALARM'
    ipAddress: Optional[str] = "192.168.1.120"
    macAddress: Optional[str] = "24:6F:28:B4:7A:1A"
    firmwareVersion: str = "v3.2.1-esp-idf-v5.1"
    lastHeartbeat: str
    telemetryRateHz: float = 1.0
    channelCount: int = 8
