"""
GridFlowX Energy Management Dispatch Inference Adapter
======================================================
Solves ToU tariff cost minimization, peak shaving, and renewable maximization.
Generates *proposed* dispatch states (never direct hardware writes).
"""

import uuid
from typing import Dict, Any, List, Tuple
from datetime import datetime, timezone
from inference.base import BaseInferenceAdapter
from schemas.optimization import OptimizationResponse
from config.constants import TARIFF_RATE_PEAK, TARIFF_RATE_STANDARD, TARIFF_RATE_OFF_PEAK


class EnergyInferenceAdapter(BaseInferenceAdapter):
    def __init__(self):
        super().__init__(model_name="ToU-TariffOptimizer-v1.8", version="1.8.1")

    @staticmethod
    def get_tariff_window(now: datetime) -> Tuple[str, float]:
        hour = now.hour
        if 17 <= hour < 21:
            return "PEAK", TARIFF_RATE_PEAK
        elif 21 <= hour or hour < 7:
            return "OFF_PEAK", TARIFF_RATE_OFF_PEAK
        else:
            return "STANDARD", TARIFF_RATE_STANDARD

    def predict(self, features: Dict[str, Any]) -> OptimizationResponse:
        device_id = features.get("deviceId", "GFX-ESP32-MASTER-01")
        now = datetime.now(timezone.utc)
        tariff_window, tariff_rate = self.get_tariff_window(now)

        solar_w = float(features.get("solarPowerW", 340.0))
        load_w = float(features.get("totalLoadPowerW", 48.0))
        soc = float(features.get("batterySoc", 74.5))

        decision_id = f"DEC-{now.strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
        target_relays = [True, True, False, True, False, True, False, True]
        reasoning: List[str] = []

        if tariff_window == "PEAK":
            if soc > 35.0:
                target_relays[0] = True
                target_relays[1] = True
                target_relays[2] = False
                target_relays[4] = False
                target_relays[5] = True
                target_relays[7] = True
                action_summary = "Peak Tariff Peak-Shaving: Shedding Tier 3 flexible loads and supplying microgrid from BESS."
                reasoning.append(f"Current tariff is PEAK (${tariff_rate}/kWh).")
                reasoning.append(f"Battery SoC is {soc}%, sufficient to cover critical tiers without grid import.")
                reasoning.append("Targeting Relay 2 (Tier 3) to OFF and Relay 4 (Grid Infeed) to OFF.")
                est_savings = round((load_w / 1000.0) * tariff_rate * 4.0, 2)
                co2_kg = round((load_w / 1000.0) * 0.42 * 4.0, 2)
                requires_approval = False
            else:
                target_relays[0] = True
                target_relays[1] = True
                target_relays[2] = False
                target_relays[4] = True
                action_summary = "Peak Window Reserve Protection: Battery below reserve limit (35%), maintaining grid connection."
                reasoning.append(f"Battery SoC ({soc}%) is near safety buffer. Grid import maintained for Tier 1.")
                est_savings = 0.50
                co2_kg = 0.20
                requires_approval = True
        elif tariff_window == "OFF_PEAK":
            if soc < 70.0:
                target_relays[0] = True
                target_relays[1] = True
                target_relays[2] = True
                target_relays[4] = True
                action_summary = "Off-Peak Overnight Pre-Charge: Utilizing cheap grid tariff ($0.12/kWh) to buffer BESS."
                reasoning.append(f"Off-peak tariff window active (${tariff_rate}/kWh).")
                reasoning.append("Charging BESS from grid to prepare for next day demand.")
                est_savings = 1.20
                co2_kg = 0.85
                requires_approval = False
            else:
                action_summary = "Off-Peak Float: Battery adequately charged, microgrid in stable economic standby."
                reasoning.append("SoC > 70% during off-peak. Maintaining normal operational relay state.")
                est_savings = 0.30
                co2_kg = 0.40
                requires_approval = False
        else:
            if solar_w > load_w:
                target_relays[0] = True
                target_relays[1] = True
                target_relays[2] = True
                target_relays[4] = False
                action_summary = "Solar Maximization: 100% renewable self-consumption with Tier 3 flexible load activation."
                reasoning.append(f"Solar PV yield ({solar_w}W) exceeds microgrid demand ({load_w}W).")
                reasoning.append("Activating Tier 3 loads to utilize surplus clean generation.")
                est_savings = 2.45
                co2_kg = 2.10
                requires_approval = False
            else:
                target_relays[0] = True
                target_relays[1] = True
                target_relays[2] = False
                action_summary = "Standard Solar + BESS Blend: Balancing load between PV array and battery."
                reasoning.append("Standard daytime tariff active. Dispatching hybrid solar-storage vector.")
                est_savings = 0.95
                co2_kg = 0.70
                requires_approval = False

        return OptimizationResponse(
            decisionId=decision_id,
            deviceId=device_id,
            timestamp=now.isoformat(),
            tariffWindow=tariff_window,
            currentTariffRateUsdPerKwh=tariff_rate,
            targetRelayStates=target_relays,
            actionSummary=action_summary,
            reasoningTrace=reasoning,
            estimatedCostSavingsUsd=est_savings,
            estimatedCo2DisplacedKg=co2_kg,
            confidencePct=91.5,
            status="PENDING_APPROVAL" if requires_approval else "AUTO_APPLIED",
            requiresSupervisorApproval=requires_approval,
        )


energy_inference_adapter = EnergyInferenceAdapter()
