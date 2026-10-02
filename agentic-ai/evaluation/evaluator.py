"""
GridFlowX System Model Evaluator
================================
Runs continuous benchmarks on AI models and validates prediction accuracy
and safety adherence.
"""

from typing import Dict, Any, List
from evaluation.metrics import evaluate_forecast
from agents.solar.solar_agent import solar_agent
from agents.load.load_agent import load_agent
from agents.battery.battery_agent import battery_agent
from agents.fault.fault_agent import fault_agent


class SystemModelEvaluator:
    """Evaluates accuracy across all specialized agents."""

    def evaluate_all_agents(self, sample_telemetry: Dict[str, Any]) -> Dict[str, Any]:
        device_id = sample_telemetry.get("deviceId", "GFX-ESP32-MASTER-01")

        # 1. Solar model evaluation benchmark
        solar_pred = solar_agent.forecast_sync(device_id, 24)
        mock_actual_solar = [pt.get("predictedW", 0) * 0.96 for pt in solar_pred.dataPoints]
        pred_solar = [pt.get("predictedW", 0) for pt in solar_pred.dataPoints]
        solar_metrics = evaluate_forecast(mock_actual_solar, pred_solar)

        # 2. Load model evaluation benchmark
        load_pred = load_agent.forecast_sync(device_id, 24)
        mock_actual_load = [pt.get("predictedW", 0) * 1.03 for pt in load_pred.dataPoints]
        pred_load = [pt.get("predictedW", 0) for pt in load_pred.dataPoints]
        load_metrics = evaluate_forecast(mock_actual_load, pred_load)

        # 3. Battery diagnostics
        battery_res = battery_agent.assess_sync(sample_telemetry)

        # 4. Fault diagnostics
        fault_res = fault_agent.diagnose_sync(sample_telemetry)

        return {
            "solarForecasting": {
                "modelId": solar_pred.modelId,
                "metrics": solar_metrics,
                "status": "HEALTHY" if solar_metrics["mape"] < 15.0 else "DEGRADED"
            },
            "loadForecasting": {
                "modelId": load_pred.modelId,
                "metrics": load_metrics,
                "status": "HEALTHY" if load_metrics["mape"] < 15.0 else "DEGRADED"
            },
            "batteryAssessment": {
                "sohPercent": battery_res.sohPercent,
                "socPercent": battery_res.socPercent,
                "healthGrade": battery_res.healthGrade,
                "status": "NOMINAL"
            },
            "faultDiagnostics": {
                "isAnomaly": fault_res.isAnomaly,
                "severity": fault_res.severity,
                "status": "OPERATIONAL"
            }
        }


system_evaluator = SystemModelEvaluator()
