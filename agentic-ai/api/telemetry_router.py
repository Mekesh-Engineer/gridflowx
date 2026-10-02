"""
GridFlowX Telemetry API Router
==============================
"""

from datetime import datetime, timezone
from fastapi import APIRouter
from services.telemetry_service import telemetry_manager

router = APIRouter(prefix="/api/v1/telemetry", tags=["Telemetry"])


@router.get("/live")
def get_live_telemetry():
    """Returns the latest acquired 1Hz microgrid sensor frame."""
    return {
        "success": True,
        "telemetry": telemetry_manager.latest_telemetry,
        "connectedDevices": len(telemetry_manager.active_devices),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
