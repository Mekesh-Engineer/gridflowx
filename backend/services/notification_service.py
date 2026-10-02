"""
GridFlowX Notifications & Incident Alerts Service
=================================================
Manages operational alarms, threshold violations, and incident escalations.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone
from backend.websocket.connection_manager import ws_manager


class NotificationService:
    def __init__(self):
        self.active_alerts: List[Dict[str, Any]] = []

    async def emit_alert(self, level: str, title: str, message: str, source: str) -> Dict[str, Any]:
        alert = {
            "id": f"ALT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "level": level,  # INFO, WARNING, CRITICAL
            "title": title,
            "message": message,
            "source": source,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "acknowledged": False,
        }
        self.active_alerts.append(alert)
        await ws_manager.broadcast_client_event("SYSTEM_ALERT", alert)
        return alert

    def get_active_alerts(self) -> List[Dict[str, Any]]:
        return self.active_alerts


notification_service = NotificationService()
