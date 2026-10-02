"""
GridFlowX Telemetry REST Endpoints
==================================
"""

from typing import Dict, Any, List
from fastapi import APIRouter, Query
from backend.services.telemetry_service import telemetry_service
from backend.database.memory_store import memory_store

router = APIRouter(prefix="/api/v1/telemetry", tags=["Telemetry"])


@router.get("/live")
def get_live_telemetry() -> Dict[str, Any]:
    return telemetry_service.get_latest_telemetry()


@router.get("/history")
def get_telemetry_history(limit: int = Query(50, ge=1, le=500)) -> List[Dict[str, Any]]:
    return memory_store.get_telemetry_history(limit)
