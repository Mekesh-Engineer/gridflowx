"""
GridFlowX Hardware Safety Interlocks
====================================
Deterministic physical interlocks for microgrid contactors, battery protection,
and IEEE 1547 anti-islanding compliance.
"""

from typing import Dict, Any, List, Optional
from config.constants import (
    RELAY_TIER1_CRITICAL,
    RELAY_TIER2_IMPORTANT,
    RELAY_TIER3_FLEXIBLE,
    RELAY_GRID_INFEED,
    GRID_VOLTAGE_MIN_V,
    GRID_VOLTAGE_MAX_V,
    GRID_FREQ_MIN_HZ,
    GRID_FREQ_MAX_HZ,
    BATTERY_SOC_MIN_CUTOFF_PCT,
    BATTERY_TEMP_CRITICAL_CUTOFF_C,
)


class HardwareInterlocks:
    """Evaluates cyber-physical interlocks against active telemetry."""

    @staticmethod
    def check_tier1_lock(channel: int, target_state: bool) -> Optional[str]:
        """Tier 1 Critical Load (Channel 0) can NEVER be disconnected."""
        if channel == RELAY_TIER1_CRITICAL and not target_state:
            return "Interlock Violation: Channel 0 (Tier 1 Critical Life-Safety Load) is immutable and cannot be disconnected."
        return None

    @staticmethod
    def check_battery_deep_discharge(channel: int, target_state: bool, soc: float) -> Optional[str]:
        """Prevents activating non-essential loads when battery is in deep discharge state."""
        if channel in (RELAY_TIER2_IMPORTANT, RELAY_TIER3_FLEXIBLE) and target_state:
            if soc < BATTERY_SOC_MIN_CUTOFF_PCT:
                return f"Interlock Violation: Low Battery SoC ({soc:.1f}% < {BATTERY_SOC_MIN_CUTOFF_PCT}%). Load activation prohibited."
        return None

    @staticmethod
    def check_anti_islanding(channel: int, target_state: bool, grid_v: float, grid_f: float) -> Optional[str]:
        """Prevents connecting grid contactor when grid parameters are out of IEEE 1547 bounds."""
        if channel == RELAY_GRID_INFEED and target_state:
            if grid_v < GRID_VOLTAGE_MIN_V or grid_v > GRID_VOLTAGE_MAX_V:
                return f"Anti-Islanding Violation: Grid AC voltage ({grid_v:.1f}V) out of synchronization envelope ({GRID_VOLTAGE_MIN_V}-{GRID_VOLTAGE_MAX_V}V)."
            if grid_f < GRID_FREQ_MIN_HZ or grid_f > GRID_FREQ_MAX_HZ:
                return f"Anti-Islanding Violation: Grid frequency ({grid_f:.2f}Hz) out of synchronization envelope ({GRID_FREQ_MIN_HZ}-{GRID_FREQ_MAX_HZ}Hz)."
        return None

    @staticmethod
    def check_thermal_overload(battery_temp: float) -> Optional[str]:
        """Thermal runaway protection cutoff."""
        if battery_temp >= BATTERY_TEMP_CRITICAL_CUTOFF_C:
            return f"Thermal Cutoff Violation: BESS temperature ({battery_temp:.1f}°C) exceeds critical cutoff ({BATTERY_TEMP_CRITICAL_CUTOFF_C}°C)."
        return None

    def verify_states(self, proposed_states: List[bool]) -> tuple[bool, Optional[str]]:
        """Verifies proposed relay states against static hardware interlocks."""
        if proposed_states and len(proposed_states) > 0 and not proposed_states[0]:
            return False, "Channel 0 (Tier 1 Critical Life-Safety Load) is immutable."
        return True, None


hardware_interlocks = HardwareInterlocks()

