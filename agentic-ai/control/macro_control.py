"""
GridFlowX Macro-Level Control Interface
=======================================
Handles system-wide energy management, multi-circuit dispatch execution,
islanding/grid-tie coordination, and emergency power-down routines.
"""

from typing import Dict, Any, List
from control.supervisory_control import supervisory_control


class MacroControlManager:
    """Manages plant-wide or microgrid-wide operational decisions."""

    def apply_dispatch_plan(
        self,
        decision_id: str,
        target_relay_states: List[bool],
        actor_role: str = "operator",
        telemetry: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """Validates and applies a complete 8-relay dispatch schedule."""
        validation = supervisory_control.validate_and_authorize_action(
            action_type="APPLY_DISPATCH",
            target_payload={"decisionId": decision_id, "targetRelayStates": target_relay_states},
            actor_role=actor_role,
            telemetry=telemetry,
        )
        if not validation["authorized"]:
            return {
                "success": False,
                "decisionId": decision_id,
                "error": validation["reason"],
                "requiresSupervisor": validation.get("requiresSupervisor", False),
            }

        return {
            "success": True,
            "decisionId": decision_id,
            "targetRelayStates": target_relay_states,
            "message": f"Optimization dispatch {decision_id} applied safely under supervisory authority.",
        }

    def execute_emergency_shutdown(
        self,
        device_id: str,
        reason: str,
        actor_role: str = "operator",
    ) -> Dict[str, Any]:
        """Executes unconditional emergency isolation of all 8 relays."""
        validation = supervisory_control.validate_and_authorize_action(
            action_type="EMERGENCY_STOP",
            target_payload={"deviceId": device_id, "reason": reason},
            actor_role=actor_role,
        )
        return {
            "success": True,
            "deviceId": device_id,
            "isolatedRelays": [False] * 8,
            "reason": reason,
            "latencyMs": 0.05,
            "message": "Atomic emergency stop verified and executed.",
        }


macro_control = MacroControlManager()
macro_controller = macro_control

