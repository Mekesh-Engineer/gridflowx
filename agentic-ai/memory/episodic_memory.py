"""
GridFlowX Episodic Memory & Audit Trail
=======================================
Maintains chronological event logs of agent decisions, tool invocations,
operator overrides, safety envelope trips, and HITL authorization records.
"""

from typing import Dict, Any, List, Optional
from collections import deque
from datetime import datetime, timezone


class EpisodicMemory:
    """Maintains immutable episodic event log for operational auditability."""

    def __init__(self, max_records: int = 1000):
        self.decision_log: deque = deque(maxlen=max_records)
        self.override_log: deque = deque(maxlen=max_records)
        self.hitl_approvals: deque = deque(maxlen=max_records)
        self.anomaly_events: deque = deque(maxlen=max_records)

    def record_decision(self, decision: Dict[str, Any], agent_name: str = "EnergyManagementAgent") -> None:
        self.decision_log.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "agent": agent_name,
            "decision": decision
        })

    def record_override(self, override: Dict[str, Any], operator_role: str = "operator") -> None:
        self.override_log.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "operatorRole": operator_role,
            "override": override
        })

    def record_hitl_approval(self, approval: Dict[str, Any]) -> None:
        self.hitl_approvals.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "approval": approval
        })

    def record_anomaly_event(self, anomaly: Dict[str, Any]) -> None:
        self.anomaly_events.append({
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "anomaly": anomaly
        })

    def get_recent_decisions(self, limit: int = 20) -> List[Dict[str, Any]]:
        return list(self.decision_log)[-limit:]

    def get_recent_overrides(self, limit: int = 20) -> List[Dict[str, Any]]:
        return list(self.override_log)[-limit:]

    def get_recent_anomalies(self, limit: int = 20) -> List[Dict[str, Any]]:
        return list(self.anomaly_events)[-limit:]

    def get_audit_summary(self) -> Dict[str, Any]:
        """Generates structured audit metrics for operator compliance reporting."""
        return {
            "totalDecisionsLogged": len(self.decision_log),
            "totalOverridesLogged": len(self.override_log),
            "totalHitlApprovals": len(self.hitl_approvals),
            "totalAnomaliesRecorded": len(self.anomaly_events),
            "latestDecision": self.decision_log[-1] if self.decision_log else None,
            "latestAnomaly": self.anomaly_events[-1] if self.anomaly_events else None,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


episodic_memory = EpisodicMemory()
