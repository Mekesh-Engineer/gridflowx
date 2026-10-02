"""
GridFlowX Day-Ahead Predictive Planning Workflow
================================================
Generates 24-hour and 48-hour forward dispatch schedules, cost minimization curves,
and BESS charge/discharge profiles based on multi-agent forecast integration.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone
from workflows.base import BaseWorkflow
from agents.solar.solar_agent import solar_agent
from agents.load.load_agent import load_agent
from agents.battery.battery_agent import battery_agent
from monitoring.metrics import ai_metrics


class PredictivePlanningWorkflow(BaseWorkflow):
    def __init__(self):
        super().__init__(
            name="Predictive Planning Workflow",
            description="24-hour day-ahead horizon dispatch schedule, solar alignment, and tariff arbitrage planning."
        )

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        t0 = datetime.now()
        device_id = context.get("deviceId", "GFX-ESP32-MASTER-01")
        horizon = context.get("horizonHours", 24)
        telemetry = context.get("telemetry", {})

        # 1. Fetch 24h Solar & Load profiles
        solar_plan = solar_agent.forecast_sync(device_id, horizon)
        load_plan = load_agent.forecast_sync(device_id, horizon)
        battery_assess = battery_agent.assess_sync(telemetry)

        # 2. Build hourly optimization schedule
        solar_pts = solar_plan.dataPoints
        load_pts = load_plan.dataPoints

        schedule = []
        projected_cost = 0.0
        battery_sim_soc = battery_assess.socPercent

        for i in range(min(len(solar_pts), len(load_pts))):
            s_watt = solar_pts[i].get("predictedW", 0)
            l_watt = load_pts[i].get("predictedW", 0)
            net_power = s_watt - l_watt

            # Determine dispatch mode
            if net_power > 200:
                # Excess solar -> charge battery
                action = "CHARGE_BATTERY"
                battery_sim_soc = min(98.0, battery_sim_soc + (net_power / 5000.0) * 10)
                grid_draw = 0.0
            elif net_power < -200 and battery_sim_soc > 25.0:
                # Deficit -> discharge battery
                action = "DISCHARGE_BATTERY"
                battery_sim_soc = max(20.0, battery_sim_soc - (abs(net_power) / 5000.0) * 10)
                grid_draw = max(0.0, abs(net_power) - 2000.0)
            else:
                action = "GRID_FLOAT"
                grid_draw = max(0.0, -net_power)

            tariff_rate = 0.18 if (17 <= i <= 21) else 0.08  # Peak vs Off-peak ToU
            projected_cost += (grid_draw / 1000.0) * tariff_rate

            schedule.append({
                "hourIndex": i,
                "predictedSolarW": round(s_watt, 1),
                "predictedLoadW": round(l_watt, 1),
                "netPowerW": round(net_power, 1),
                "plannedAction": action,
                "projectedSoC": round(battery_sim_soc, 1),
                "gridDrawW": round(grid_draw, 1),
                "tariffRateUsd": tariff_rate
            })

        latency_ms = (datetime.now() - t0).total_seconds() * 1000
        ai_metrics.record_workflow_execution("PredictivePlanningWorkflow", latency_ms, True)

        return {
            "workflow": self.name,
            "success": True,
            "horizonHours": horizon,
            "totalProjectedSolarKwh": round(solar_plan.totalYieldKwh, 2),
            "projectedPeakDemandW": round(load_plan.peakDemandW, 1),
            "estimatedEnergyCostUsd": round(projected_cost, 2),
            "hourlySchedule": schedule,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


predictive_planning_workflow = PredictivePlanningWorkflow()
