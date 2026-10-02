"""
GridFlowX Telemetry REST Router
"""

from typing import Dict, Any, List
from fastapi import APIRouter, Query
from backend.services.telemetry_service import telemetry_service
from backend.database.repositories import telemetry_repo

router = APIRouter(prefix="/api/v1/telemetry", tags=["Telemetry"])


@router.get("/live")
def get_live_telemetry() -> Dict[str, Any]:
    """Returns the latest 1Hz real-time telemetry frame."""
    return telemetry_service.get_latest_telemetry()


@router.get("/history")
def get_telemetry_history(limit: int = Query(60, ge=1, le=600)) -> List[Dict[str, Any]]:
    """Returns recent historical telemetry frames."""
    return telemetry_repo.get_history(limit)
