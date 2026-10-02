"""
GridFlowX Structured Audit Logger
=================================
Writes structured audit events for security, high-consequence relay actions,
and agent decision traceability.
"""

from typing import Dict, Any, Optional
from datetime import datetime, timezone


class AuditLogger:
    @staticmethod
    def log_action(
        actor: str,
        role: str,
        action: str,
        target: str,
        reason: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        event = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "actor": actor,
            "role": role,
            "action": action,
            "target": target,
            "reason": reason,
            "metadata": metadata or {}
        }
        print(f"[AUDIT] {event['timestamp']} | {role.upper()}:{actor} -> {action} on {target}. Reason: {reason}")
        return event


audit_logger = AuditLogger()
