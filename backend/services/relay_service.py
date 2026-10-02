"""
GridFlowX Relay Service & Safety Interlock Gateway
==================================================
Manages 8 physical relay channels with deterministic safety interlocks:
- Relay 0: Tier 1 Critical Infrastructure (Life Support / Medical) - Hardware Interlocked
- Relay 1: Tier 1 Core Networking / Server Bus - Hardware Interlocked
- Relays 2-7: Subsystem Loads, Battery Bus, Solar Inverter
"""

from typing import List, Dict, Any, Tuple
from datetime import datetime, timezone
from backend.services.telemetry_service import telemetry_service
from backend.database.repositories import relay_audit_repo
from backend.services.agentic_client import failsafe_envelope


class RelayService:
    """Relay channel actuation with safety verification."""

    def __init__(self):
        self.channel_count = 8
        self.emergency_latched = False
        self.channel_names = [
            "Relay 1 (Life Support / Medical)",
            "Relay 2 (Core Server / Comms)",
            "Relay 3 (Refrigeration / Labs)",
            "Relay 4 (Emergency Lighting)",
            "Relay 5 (Main Lighting)",
            "Relay 6 (HVAC / Air Conditioning)",
            "Relay 7 (EV Charging Station)",
            "Relay 8 (Water Pump / Auxiliary)"
        ]

    def get_state(self) -> Dict[str, Any]:
        return {
            "deviceId": telemetry_service.device_id,
            "relayStates": telemetry_service.relay_states,
            "lastUpdated": datetime.now(timezone.utc).isoformat(),
            "safetyLocked": self.emergency_latched,
            "activeOverrides": [],
            "relayNames": self.channel_names,
        }

    def set_single_relay(
        self,
        relay_index: int,
        desired_state: bool,
        actor_role: str = "operator",
        reason: str = "Manual toggle",
        override_safety: bool = False
    ) -> Dict[str, Any]:
        if relay_index < 0 or relay_index >= self.channel_count:
            raise ValueError(f"Invalid relay channel {relay_index}. Must be 0..7")

        current_states = list(telemetry_service.relay_states)
        previous_state = current_states[relay_index]
        proposed = list(current_states)
        proposed[relay_index] = desired_state

        # Validate through deterministic safety envelope
        telemetry = telemetry_service.get_latest_telemetry()
        safe_relays, was_modified, explanation = failsafe_envelope.validate_and_filter_relays(
            current_relays=current_states,
            proposed_relays=proposed,
            telemetry=telemetry,
            actor_role=actor_role
        )

        final_state = safe_relays[relay_index]
        telemetry_service.update_relay_states(safe_relays)

        # Audit log transition
        relay_audit_repo.record_transition(
            relay_index=relay_index,
            previous_state=previous_state,
            new_state=final_state,
            actor_role=actor_role,
            reason=reason,
            was_overridden_by_safety=was_modified
        )

        return {
            "success": True,
            "relayIndex": relay_index,
            "previousState": previous_state,
            "newState": final_state,
            "relayStates": safe_relays,
            "wasSafetyOverridden": was_modified,
            "safetyExplanation": explanation,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def emergency_stop(self, actor_role: str = "operator") -> Dict[str, Any]:
        """Atomic cutoff of all non-critical loads."""
        current_states = list(telemetry_service.relay_states)
        # Relays 0 and 1 (Tier 1 Life Support / Comms) remain powered; others cut
        emergency_states = [True, True, False, False, False, False, False, False]
        telemetry_service.update_relay_states(emergency_states)
        self.emergency_latched = True

        for i in range(self.channel_count):
            if current_states[i] != emergency_states[i]:
                relay_audit_repo.record_transition(
                    relay_index=i,
                    previous_state=current_states[i],
                    new_state=emergency_states[i],
                    actor_role=actor_role,
                    reason="EMERGENCY_STOP_ACTUATED",
                    was_overridden_by_safety=True
                )

        return {
            "success": True,
            "message": "EMERGENCY CUTOFF EXECUTED. Non-critical loads tripped.",
            "relayStates": emergency_states,
            "emergencyLatched": True,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def reset_safety(self, actor_role: str = "admin") -> Dict[str, Any]:
        """Clears latched emergency lock."""
        self.emergency_latched = False
        return {
            "success": True,
            "message": "Safety interlock lock reset.",
            "emergencyLatched": False,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


relay_service = RelayService()
