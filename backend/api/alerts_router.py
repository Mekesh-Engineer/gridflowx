"""
GridFlowX Alerts Router
"""

from typing import List, Dict, Any
from fastapi import APIRouter, Query, HTTPException, status
from backend.services.alert_service import alert_service

router = APIRouter(prefix="/api/v1/alerts", tags=["Alerts"])


@router.get("")
def list_alerts(activeOnly: bool = Query(False)) -> List[Dict[str, Any]]:
    return alert_service.list_alerts(active_only=activeOnly)


@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str) -> Dict[str, Any]:
    success = alert_service.acknowledge_alert(alert_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Alert {alert_id} not found")
    return {"success": True, "alertId": alert_id, "status": "ACKNOWLEDGED"}
