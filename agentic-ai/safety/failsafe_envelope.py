"""
GridFlowX Production Hardware Failsafe Envelope & Interlock Gatekeeper
====================================================================
Prevents unvalidated, dangerous, or out-of-bounds commands from reaching
microgrid physical hardware (relays, contactors, inverters).
"""

import time
from typing import Dict, Any, List, Tuple
from config.constants import MIN_RELAY_DWELL_TIME_SEC
from safety.interlocks import HardwareInterlocks
from schemas.safety import SafetyValidationResult


class ProductionFailsafeEnvelope:
    """
    Deterministic Gatekeeper enforcing physical safety invariants:
    - Tier 1 Critical Load (Channel 0) is immutable and can never be disabled.
    - Battery discharge cutoff at SoC < 18%.
    - Contactor chatter prevention with 3.0s minimum dwell time.
    - Anti-islanding grid parameters validation.
    """

    def __init__(self):
        self.last_relay_toggle_time: List[float] = [0.0] * 8

    def validate_and_filter_relays(
        self,
        current_relays: List[bool],
        proposed_relays: List[bool],
        telemetry: Dict[str, Any],
        actor_role: str = "operator"
    ) -> Tuple[List[bool], bool, str]:
        """
        Filters proposed relay states through deterministic interlocks.
        Returns: (safe_relays: List[bool], was_modified: bool, explanation: str)
        """
        safe_relays = list(current_relays)
        was_modified = False
        reasons: List[str] = []

        now = time.time()
        soc = float(telemetry.get("batterySoc", 50.0))
        grid_v = float(telemetry.get("gridVoltageV", 230.0))
        grid_f = float(telemetry.get("gridFrequencyHz", 50.0))

        for ch in range(min(8, len(proposed_relays))):
            target = proposed_relays[ch]
            current = current_relays[ch]

            if target != current:
                # Rule 1: Tier 1 Critical Load (Channel 0) Immutability
                err = HardwareInterlocks.check_tier1_lock(ch, target)
                if err:
                    was_modified = True
                    reasons.append(f"Ch{ch}: Tier 1 Critical Load cannot be disconnected.")
                    continue

                # Rule 2: Dwell time check (3.0 seconds)
                elapsed = now - self.last_relay_toggle_time[ch]
                if elapsed < MIN_RELAY_DWELL_TIME_SEC and actor_role != "emergency_stop":
                    was_modified = True
                    reasons.append(f"Ch{ch}: Dwell lock active ({elapsed:.1f}s < {MIN_RELAY_DWELL_TIME_SEC}s).")
                    continue

                # Rule 3: Deep Discharge Cutoff
                err_soc = HardwareInterlocks.check_battery_deep_discharge(ch, target, soc)
                if err_soc:
                    was_modified = True
                    reasons.append(f"Ch{ch}: Low SoC interlock ({soc:.1f}% < 18.0%).")
                    continue

                # Rule 4: Grid anti-islanding
                err_grid = HardwareInterlocks.check_anti_islanding(ch, target, grid_v, grid_f)
                if err_grid:
                    was_modified = True
                    reasons.append(f"Ch{ch}: Grid out of sync ({grid_v:.1f}V).")
                    continue

                # Approved
                safe_relays[ch] = target
                self.last_relay_toggle_time[ch] = now

        msg = " | ".join(reasons) if reasons else "All proposed relays verified against hardware failsafe envelope."
        return safe_relays, was_modified, msg

    def validate_proposal(
        self,
        current_relays: List[bool],
        proposed_relays: List[bool],
        telemetry: Dict[str, Any],
        actor_role: str = "operator"
    ) -> SafetyValidationResult:
        """Returns a strongly-typed SafetyValidationResult object."""
        safe_relays, was_modified, explanation = self.validate_and_filter_relays(
            current_relays, proposed_relays, telemetry, actor_role
        )
        return SafetyValidationResult(
            is_safe=not was_modified,
            safe_relay_states=safe_relays,
            was_modified=was_modified,
            violations=[explanation] if was_modified else [],
            explanation=explanation
        )


failsafe_envelope = ProductionFailsafeEnvelope()
