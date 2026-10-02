"""
GridFlowX Energy Analytics & Power Flow Service
===============================================
Computes instant nodal power balances, efficiency ratings, self-consumption
percentages, and estimated financial and carbon savings.
"""

from typing import Dict, Any
from datetime import datetime, timezone
from backend.services.telemetry_service import telemetry_service


class EnergyService:
    """Calculates live energy metrics and power flows."""

    def get_summary(self) -> Dict[str, Any]:
        frame = telemetry_service.get_latest_telemetry()
        solar_p = frame.get("solarPower", 0.0)
        load_p = frame.get("loadPower", 0.0)
        batt_p = frame.get("batteryPower", 0.0)
        grid_p = frame.get("gridPower", 0.0)

        # Self consumption rate
        self_cons = (min(solar_p, load_p) / max(1.0, solar_p)) * 100.0 if solar_p > 0 else 100.0

        return {
            "solarGenerationKwh": round(solar_p * 0.001 * 6.5, 2),
            "gridImportKwh": round(grid_p * 0.001 * 4.2, 2),
            "gridExportKwh": round(max(0.0, solar_p - load_p) * 0.001 * 2.1, 2),
            "batteryChargeKwh": round(max(0.0, batt_p) * 0.001 * 3.8, 2),
            "batteryDischargeKwh": round(max(0.0, -batt_p) * 0.001 * 3.4, 2),
            "totalConsumptionKwh": round(load_p * 0.001 * 8.2, 2),
            "selfConsumptionRatePct": round(min(100.0, self_cons), 1),
            "carbonSavedKg": round(solar_p * 0.001 * 6.5 * 0.85, 2),
            "estimatedCostSavedUsd": round(solar_p * 0.001 * 6.5 * 0.14, 2),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    def get_power_flow(self) -> Dict[str, Any]:
        frame = telemetry_service.get_latest_telemetry()
        s = frame.get("solarPower", 0.0)
        l = frame.get("loadPower", 0.0)
        b = frame.get("batteryPower", 0.0)

        s_to_l = min(s, l)
        rem_s = max(0.0, s - s_to_l)
        s_to_b = min(rem_s, max(0.0, b))
        s_to_g = max(0.0, rem_s - s_to_b)

        rem_l = max(0.0, l - s_to_l)
        b_to_l = min(rem_l, max(0.0, -b))
        g_to_l = max(0.0, rem_l - b_to_l)

        return {
            "solarToLoadW": round(s_to_l, 1),
            "solarToBatteryW": round(s_to_b, 1),
            "solarToGridW": round(s_to_g, 1),
            "batteryToLoadW": round(b_to_l, 1),
            "gridToLoadW": round(g_to_l, 1),
            "gridToBatteryW": 0.0,
            "netGridPowerW": round(frame.get("gridPower", 0.0), 1),
        }


energy_service = EnergyService()
