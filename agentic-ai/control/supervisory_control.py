"""
GridFlowX Deterministic Supervisory Control Engine
==================================================
Strict safety enforcement boundary separating AI reasoning from physical actuation:
LLM Reasoning -> Agent Orchestration -> Tool Selection -> Tool Execution ->
Validation / Policy -> Supervisory Control -> Edge Controller -> Physical Device.

Ensures no LLM or agent can actuate physical hardware without deterministic safety validation.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from safety.failsafe_envelope import failsafe_envelope
from safety.interlocks import hardware_interlocks
from safety.validator import CommandValidator


class SupervisoryControlEngine:
    """Supervisory controller with deterministic authority over all edge actuation requests."""

    def __init__(self):
        self.enforce_hitl = True
        self.active_overrides: Dict[str, Any] = {}

    def validate_and_authorize_action(
        self,
        action_type: str,
        target_payload: Dict[str, Any],
        actor_role: str = "operator",
        telemetry: Optional[Dict[str, Any]] = None,
        auth_token: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Validates proposed actions against:
        1. Role permissions (operator, supervisor, admin)
        2. Hardware electrical interlocks (e.g. break-before-make)
        3. Cyber-physical failsafe envelope (voltage, current, thermal bounds)
        4. Human-In-The-Loop (HITL) gate for high-consequence operations
        """
        telemetry = telemetry or {}

        # 1. Emergency Stop is ALWAYS permitted and prioritized
        if action_type == "EMERGENCY_STOP":
            return {
                "authorized": True,
                "actionType": action_type,
                "reason": "Emergency stop validated unconditionally for safety.",
                "requiresSupervisor": False,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        # 2. Check Failsafe Safety Envelope
        is_safe, safety_violations = failsafe_envelope.validate_state(telemetry)
        if not is_safe:
            return {
                "authorized": False,
                "actionType": action_type,
                "reason": f"Safety envelope violated: {', '.join(safety_violations)}",
                "violations": safety_violations,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }

        # 3. Check High-Consequence Operations requiring Supervisor HITL
        if action_type in ("OVERRIDE_RELAY", "GRID_ISLANDING", "RETRAIN_MODEL"):
            if actor_role != "supervisor" and actor_role != "admin":
                return {
                    "authorized": False,
                    "actionType": action_type,
                    "reason": f"Action '{action_type}' requires supervisor or admin HITL authorization.",
                    "requiresSupervisor": True,
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }

        # 4. Check hardware interlocks for relay switching
        if action_type in ("APPLY_DISPATCH", "SWITCH_RELAYS"):
            proposed_states = target_payload.get("targetRelayStates", [])
            is_interlock_valid, interlock_err = hardware_interlocks.verify_states(proposed_states)
            if not is_interlock_valid:
                return {
                    "authorized": False,
                    "actionType": action_type,
                    "reason": f"Hardware interlock violation: {interlock_err}",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }

        return {
            "authorized": True,
            "actionType": action_type,
            "reason": "Deterministic supervisory validation passed cleanly.",
            "requiresSupervisor": False,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


supervisory_control = SupervisoryControlEngine()
