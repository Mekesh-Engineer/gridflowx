"""
GridFlowX Micro-Level Control Interface
=======================================
Handles localized device, sensor, relay, and individual component actuation.
"""

from typing import Dict, Any, List
from control.supervisory_control import supervisory_control


class MicroControlManager:
    """Manages fine-grained, localized operations on specific circuits or sensors."""

    def switch_single_relay(
        self,
        device_id: str,
        relay_index: int,
        target_state: bool,
        actor_role: str = "operator",
        telemetry: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """Validates and executes a single relay switch."""
        validation = supervisory_control.validate_and_authorize_action(
            action_type="SWITCH_RELAYS",
            target_payload={"relayIndex": relay_index, "targetState": target_state},
            actor_role=actor_role,
            telemetry=telemetry,
        )
        if not validation["authorized"]:
            return {
                "success": False,
                "error": validation["reason"],
                "requiresSupervisor": validation.get("requiresSupervisor", False),
            }

        return {
            "success": True,
            "deviceId": device_id,
            "relayIndex": relay_index,
            "newState": target_state,
            "message": f"Relay #{relay_index} switched to {target_state}",
        }


micro_control = MicroControlManager()
micro_controller = micro_control

