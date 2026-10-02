"""
GridFlowX Anomaly & Fault Detection Router
==========================================
Supports both /api/v1/ai/anomaly and /api/v1/ai/anomalies
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Body
from backend.services.agentic_client import agentic_client
from backend.services.telemetry_service import telemetry_service

router = APIRouter(prefix="/api/v1/ai", tags=["Fault AI"])


@router.get("/anomaly/live")
@router.get("/anomalies/active")
def get_live_anomalies() -> Dict[str, Any]:
    """Evaluates live telemetry for active sensor or electrical anomalies."""
    telemetry = telemetry_service.get_latest_telemetry()
    return agentic_client.detect_anomalies(telemetry)


@router.post("/anomaly/detect")
@router.post("/anomalies/detect")
def detect_anomalies(payload: Optional[Dict[str, Any]] = Body(None)) -> Dict[str, Any]:
    """Runs Isolation Forest anomaly detection on sensor frame."""
    telemetry = payload or telemetry_service.get_latest_telemetry()
    return agentic_client.detect_anomalies(telemetry)
