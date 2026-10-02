"""
GridFlowX Autonomous Dispatch Workflow
=======================================
Multi-agent real-time dispatch cycle:
Telemetry Ingestion -> Model-Driven State Estimation -> Micro/Macro Control Selection -> Deterministic Safety Clamping -> Output Actuation.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone
from workflows.base import BaseWorkflow
from agents.solar.solar_agent import solar_agent
from agents.load.load_agent import load_agent
from agents.battery.battery_agent import battery_agent
from agents.fault.fault_agent import fault_agent
from control.macro_control import macro_controller
from control.micro_control import micro_controller
from safety.failsafe_envelope import failsafe_envelope
from memory.episodic_memory import episodic_memory
from monitoring.metrics import ai_metrics


class AutonomousDispatchWorkflow(BaseWorkflow):
    def __init__(self):
        super().__init__(
            name="Autonomous Dispatch Workflow",
            description="Real-time multi-agent microgrid power balancing, BESS dispatch, and load prioritization."
        )

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        t0 = datetime.now()
        telemetry = context.get("telemetry", {})
        device_id = context.get("deviceId", "GFX-ESP32-MASTER-01")
        target_mode = context.get("mode", "ECONOMIC")

        # 1. State Ingestion & Diagnostics
        anomaly_diag = fault_agent.diagnose_sync(telemetry)
        battery_state = battery_agent.assess_sync(telemetry)

        # 2. Predictive Context
        solar_pred = solar_agent.forecast_sync(device_id, 12)
        load_pred = load_agent.forecast_sync(device_id, 12)

        # 3. Macro Dispatch Calculation
        current_relays = telemetry.get("relayStates", [True, True, True, True, False, False, False, False])
        macro_result = macro_controller.calculate_supervisory_dispatch(
            telemetry=telemetry,
            grid_status="ONLINE" if telemetry.get("gridVoltage", 230) > 180 else "OUTAGE",
            target_mode=target_mode
        )

        # 4. Micro Parameter Clamping
        micro_result = micro_controller.validate_relay_command(
            relay_index=macro_result.get("targetRelayStates", [0])[0] if macro_result.get("targetRelayStates") else 0,
            desired_state=True,
            current_telemetry=telemetry,
            actor_role="automation"
        )

        # 5. Full Safety Interlock Validation
        proposed_relays = macro_result.get("targetRelayStates", current_relays)
        safe_relays, was_modified, reason = failsafe_envelope.validate_and_filter_relays(
            current_relays=current_relays,
            proposed_relays=proposed_relays,
            telemetry=telemetry,
            actor_role="automation"
        )

        latency_ms = (datetime.now() - t0).total_seconds() * 1000
        ai_metrics.record_workflow_execution("AutonomousDispatchWorkflow", latency_ms, True)

        result = {
            "workflow": self.name,
            "success": True,
            "targetMode": target_mode,
            "anomalyDetected": anomaly_diag.isAnomaly,
            "batterySoC": battery_state.socPercent,
            "batteryHealth": battery_state.healthGrade,
            "proposedRelays": proposed_relays,
            "validatedRelays": safe_relays,
            "safetyOverridden": was_modified,
            "safetyReason": reason,
            "latencyMs": round(latency_ms, 2),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

        episodic_memory.record_decision({
            "workflow": self.name,
            "summary": f"Autonomous dispatch in mode {target_mode}",
            "validatedRelays": safe_relays,
            "anomaly": anomaly_diag.isAnomaly
        })

        return result


autonomous_dispatch_workflow = AutonomousDispatchWorkflow()
