"""
GridFlowX In-Memory Fast State Store
====================================
High-speed in-memory store for:
- Live telemetry circular buffer
- Device registry
- Active client WebSocket connections
- Support tickets & audit trail
"""

from typing import Dict, Any, List, Optional
from collections import deque
from datetime import datetime, timezone


class MemoryStore:
    def __init__(self, telemetry_buffer_size: int = 300):
        self.telemetry_history = deque(maxlen=telemetry_buffer_size)
        self.devices: Dict[str, Dict[str, Any]] = {
            "GFX-ESP32-MASTER-01": {
                "deviceId": "GFX-ESP32-MASTER-01",
                "name": "Primary Microgrid Inverter Controller",
                "location": "Central Array Substation A",
                "status": "ONLINE",
                "firmwareVersion": "v3.0.4-FreeRTOS-dualcore",
                "lastHeartbeat": datetime.now(timezone.utc).isoformat(),
                "ipAddress": "192.168.1.120",
                "rssiDbm": -62,
                "uptimeSeconds": 86400,
            }
        }
        self.tickets: List[Dict[str, Any]] = []
        self.audit_logs: List[Dict[str, Any]] = []

    def record_telemetry(self, frame: Dict[str, Any]):
        self.telemetry_history.append(frame)

    def get_telemetry_history(self, limit: int = 50) -> List[Dict[str, Any]]:
        history = list(self.telemetry_history)
        return history[-limit:] if history else []

    def add_audit_log(self, actor: str, action: str, details: Dict[str, Any]):
        log = {
            "logId": f"AUDIT-{len(self.audit_logs) + 1:04d}",
            "actor": actor,
            "action": action,
            "details": details,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self.audit_logs.append(log)
        return log


memory_store = MemoryStore()
