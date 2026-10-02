"""
GridFlowX System Health Endpoints
"""

from typing import Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter
from backend.core.config import settings
from backend.services.telemetry_service import telemetry_service
from backend.websocket.connection_manager import ws_manager

router = APIRouter(tags=["Health"])


@router.get("/health")
def health_check() -> Dict[str, Any]:
    return {
        "status": "healthy",
        "service": "gridflowx-backend",
        "version": settings.app_version,
        "environment": settings.environment,
        "connectedClients": len(ws_manager.active_clients),
        "connectedDevices": len(ws_manager.active_devices),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.get("/api/health")
def api_health_check() -> Dict[str, Any]:
    return health_check()
