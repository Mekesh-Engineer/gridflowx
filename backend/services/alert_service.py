"""
GridFlowX Alert & Alarm Management Service
"""

from typing import List, Dict, Any
from datetime import datetime, timezone
from backend.database.repositories import alert_repo


class AlertService:
    """Manages active alarms and warnings."""

    def __init__(self):
        # Pre-seed with nominal status alert
        if not alert_repo.alerts:
            alert_repo.add_alert({
                "id": "ALT-001",
                "severity": "INFO",
                "title": "System Initialized",
                "message": "GridFlowX Enterprise Backend and Agentic AI subsystems nominal.",
                "subsystem": "SAFETY_ENVELOPE",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "acknowledged": True
            })

    def list_alerts(self, active_only: bool = False) -> List[Dict[str, Any]]:
        if active_only:
            return alert_repo.get_active_alerts()
        return alert_repo.alerts

    def acknowledge_alert(self, alert_id: str) -> bool:
        return alert_repo.acknowledge_alert(alert_id)


alert_service = AlertService()
