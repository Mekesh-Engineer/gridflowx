"""
GridFlowX Health & Liveness Probes
==================================
"""

from datetime import datetime, timezone
from fastapi import APIRouter
from backend.core.settings import settings
from backend.services.telemetry_service import telemetry_service
from backend.services.agentic_ai_service import agentic_ai_service

router = APIRouter(tags=["Health"])


@router.get("/health")
def root_health():
    return {
        "status": "healthy",
        "service": "gridflowx-backend",
        "version": settings.app_version,
        "connected_clients": len(telemetry_service.active_clients),
        "connected_devices": len(telemetry_service.active_devices),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/api/health")
def api_health():
    return root_health()


@router.get("/api/v1/health")
def api_v1_health():
    return root_health()


@router.get("/api/ai/health")
async def ai_health_alias():
    return await agentic_ai_service.get_health_diagnostics()
