"""
GridFlowX Battery Health Inference Adapter
==========================================
Evaluates LiFePO4 electrochemical aging, Arrhenius thermal degradation,
internal resistance (ESR), and dynamic charge throttling.
"""

import math
from typing import Dict, Any, List
from datetime import datetime, timezone
from inference.base import BaseInferenceAdapter
from schemas.battery import BatteryHealthResponse


class BatteryInferenceAdapter(BaseInferenceAdapter):
    def __init__(self):
        super().__init__(model_name="BESS-Arrhenius-Degradation-v2.0", version="2.0.1")

    def predict(self, features: Dict[str, Any]) -> BatteryHealthResponse:
        device_id = features.get("deviceId", "GFX-ESP32-MASTER-01")
        voltage = float(features.get("batteryVoltageV", 12.8))
        current = float(features.get("batteryCurrentA", -3.2))
        soc = float(features.get("batterySocPct", 74.5))
        temp_c = float(features.get("batteryTempC", 31.5))
        cycles = int(features.get("cumulativeCycles", 142))

        now = datetime.now(timezone.utc)

        # 1. Cycle Degradation Model (3500 cycle rating to 80% SoH)
        cycle_degradation = (cycles / 3500.0) * 20.0

        # 2. Thermal Stress Acceleration (Arrhenius factor relative to 25°C)
        thermal_acceleration = math.exp(0.04 * (temp_c - 25.0)) if temp_c > 25.0 else 1.0
        total_degradation_pct = cycle_degradation * thermal_acceleration
        soh_pct = max(70.0, round(100.0 - total_degradation_pct, 1))

        # 3. DC Equivalent Internal Resistance (ESR in Ohms)
        base_esr = 0.012
        esr_increase = (100.0 - soh_pct) * 0.0008
        internal_resistance_ohms = round(base_esr + esr_increase, 4)

        # 4. Thermal Stress Index (0 to 100)
        if temp_c <= 25.0:
            thermal_stress = max(0.0, (temp_c / 25.0) * 20.0)
        elif temp_c <= 40.0:
            thermal_stress = 20.0 + ((temp_c - 25.0) / 15.0) * 45.0
        else:
            thermal_stress = min(100.0, 65.0 + (temp_c - 40.0) * 3.5)

        # 5. Remaining Lifetime in Days
        remaining_cycles = max(0, int((soh_pct - 80.0) / 20.0 * 3500))
        remaining_lifetime_days = int(remaining_cycles / 0.8) if remaining_cycles > 0 else 90

        # 6. Degradation Status
        if soh_pct >= 95.0:
            degradation_status = "OPTIMAL"
        elif soh_pct >= 88.0:
            degradation_status = "MODERATE"
        elif soh_pct >= 80.0:
            degradation_status = "ACCELERATED"
        else:
            degradation_status = "CRITICAL"

        # 7. Dynamic Charge Current Limit
        if temp_c > 48.0:
            rec_charge_current = 0.0
        elif temp_c > 40.0:
            rec_charge_current = 10.0
        elif soc > 92.0:
            rec_charge_current = 8.0
        else:
            rec_charge_current = 30.0

        # 8. Action Recommendations
        recommendations: List[str] = []
        if temp_c > 35.0:
            recommendations.append("Active enclosure cooling recommended: pack temperature exceeds 35°C nominal threshold.")
        if soc < 20.0:
            recommendations.append("Deep discharge mitigation: schedule top-up charge from solar or off-peak grid.")
        if soh_pct < 85.0:
            recommendations.append("Plan preventive cell impedance balancing during the upcoming maintenance window.")
        if not recommendations:
            recommendations.append("BESS operating within optimal electrochemical safety envelope.")

        return BatteryHealthResponse(
            deviceId=device_id,
            analyzedAt=now.isoformat(),
            stateOfHealthPct=soh_pct,
            stateOfChargePct=round(soc, 1),
            internalResistanceOhms=internal_resistance_ohms,
            totalCyclesCompleted=cycles,
            estimatedRemainingLifetimeDays=remaining_lifetime_days,
            degradationStatus=degradation_status,
            thermalStressIndex=round(thermal_stress, 1),
            recommendedMaxChargeCurrentA=round(rec_charge_current, 1),
            actionRecommendations=recommendations,
        )


battery_inference_adapter = BatteryInferenceAdapter()
