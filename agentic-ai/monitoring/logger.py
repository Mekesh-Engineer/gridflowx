"""
GridFlowX Agentic AI Monitoring & Audit Logger
=============================================
Provides structured audit logging for agent invocations, tool executions,
failsafe overrides, and model routing decisions.
"""

import logging
import json
import os
from typing import Dict, Any, Optional
from datetime import datetime, timezone

logger = logging.getLogger("gridflowx.agentic_ai")
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter(
        "[%(asctime)s] [%(levelname)s] [AGENTIC-AI] %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S"
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)


class AgenticAuditLogger:
    """Structured audit trail recorder for autonomous decisions."""

    def __init__(self):
        self.logs: list[Dict[str, Any]] = []
        self.max_memory_logs = 1000

    def log_invocation(
        self,
        agent_name: str,
        model_id: str,
        task_type: str,
        latency_ms: float,
        success: bool,
        details: Optional[Dict[str, Any]] = None
    ):
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "category": "AGENT_INVOCATION",
            "agentName": agent_name,
            "modelId": model_id,
            "taskType": task_type,
            "latencyMs": round(latency_ms, 2),
            "success": success,
            "details": details or {}
        }
        self.logs.append(entry)
        if len(self.logs) > self.max_memory_logs:
            self.logs.pop(0)

        level = logging.INFO if success else logging.WARNING
        logger.log(level, f"Agent [{agent_name}] model={model_id} task={task_type} latency={latency_ms:.1f}ms success={success}")

    def log_safety_override(
        self,
        relay_index: int,
        attempted_state: bool,
        enforced_state: bool,
        reason: str
    ):
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "category": "SAFETY_OVERRIDE",
            "relayIndex": relay_index,
            "attemptedState": attempted_state,
            "enforcedState": enforced_state,
            "reason": reason
        }
        self.logs.append(entry)
        if len(self.logs) > self.max_memory_logs:
            self.logs.pop(0)

        logger.warning(
            f"SAFETY OVERRIDE: Relay {relay_index} ({attempted_state} -> {enforced_state}): {reason}"
        )

    def get_recent_logs(self, limit: int = 50, category: Optional[str] = None) -> list[Dict[str, Any]]:
        if category:
            filtered = [log for log in self.logs if log.get("category") == category]
            return filtered[-limit:]
        return self.logs[-limit:]


audit_logger = AgenticAuditLogger()
