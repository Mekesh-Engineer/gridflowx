"""
GridFlowX Command Validator
===========================
Validates proposed commands against actor roles, high-consequence requirements,
and safety boundaries before dispatching to physical hardware.
"""

from typing import Dict, Any, List, Optional
from schemas.safety import SafetyValidationResult
from safety.interlocks import HardwareInterlocks


class CommandValidator:
    """Validates operational commands and high-consequence actions."""

    @staticmethod
    def requires_human_approval(action_type: str, details: Dict[str, Any]) -> bool:
        """Determines if an action mandates Human-in-the-Loop (HITL) approval."""
        high_consequence_actions = {
            "DISCONNECT_GRID_PEAK",
            "DEEP_LOAD_SHED",
            "RECOVERY_AUTHORIZATION",
            "FORCE_CALIBRATION_UPDATE",
        }
        return action_type.upper() in high_consequence_actions

    @staticmethod
    def validate_action_permissions(user_role: str, required_role: str) -> bool:
        """Verifies RBAC hierarchy."""
        hierarchy = {"user": 1, "auditor": 2, "operator": 3, "supervisor": 4, "admin": 5}
        return hierarchy.get(user_role.lower(), 0) >= hierarchy.get(required_role.lower(), 0)
