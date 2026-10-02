"""
GridFlowX Emergency Response & Fault Isolation Workflow
=======================================================
Executes deterministically when severe safety threshold excursions,
thermal runaway threats, or severe electrical anomalies are triggered.
"""

from typing import Dict, Any, List
from datetime import datetime, timezone
from workflows.base import BaseWorkflow
from agents.fault.fault_agent import fault_agent
from agents.battery.battery_agent import battery_agent
from safety.failsafe_envelope import failsafe_envelope
from memory.episodic_memory import episodic_memory
from monitoring.metrics import ai_metrics
from monitoring.logger import audit_logger


class EmergencyResponseWorkflow(BaseWorkflow):
    def __init__(self):
        super().__init__(
            name="Emergency Response Workflow",
            description="Rapid cyber-physical emergency tripping, load-shedding, and fault isolation."
        )

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        t0 = datetime.now()
        telemetry = context.get("telemetry", {})
        trigger_reason = context.get("reason", "UNSPECIFIED_ANOMALY")
        current_relays = telemetry.get("relayStates", [True, True, True, True, True, True, True, True])

        # 1. Diagnose specific subsystem faults
        fault_info = fault_agent.diagnose_sync(telemetry)
        battery_info = battery_agent.assess_sync(telemetry)

        # 2. Determine Safe Tripping Posture:
        # Tier 1 Critical Infrastructure (Relay 0: Medical/Life Support, Relay 1: Core Networking) remain ON if safe.
        # Tier 3 (Relay 4, 5) and Tier 4 (Relay 6, 7) are immediately shed.
        emergency_relays = [
            current_relays[0],  # Critical Tier 1
            current_relays[1],  # Critical Tier 1
            False,              # Secondary
            False,              # Secondary
            False,              # Comfort / Non-critical (SHED)
            False,              # Comfort / Non-critical (SHED)
            False,              # Heavy Loads (SHED)
            False               # Heavy Loads (SHED)
        ]

        # 3. If Battery Thermal Runaway or Severe Over-temp > 65C, cut entire battery inverter bus
        temp = telemetry.get("batteryTemp", 25.0)
        voltage = telemetry.get("batteryVoltage", 51.2)
        if temp > 60.0 or voltage < 42.0 or voltage > 58.4:
            emergency_relays[2] = False  # Isolate BESS charge/discharge bus

        # 4. Enforce via failsafe envelope
        safe_relays, was_modified, reason = failsafe_envelope.validate_and_filter_relays(
            current_relays=current_relays,
            proposed_relays=emergency_relays,
            telemetry=telemetry,
            actor_role="emergency_system"
        )

        latency_ms = (datetime.now() - t0).total_seconds() * 1000
        ai_metrics.record_workflow_execution("EmergencyResponseWorkflow", latency_ms, True)
        audit_logger.log_invocation(
            agent_name="EmergencyResponseWorkflow",
            model_id="deterministic_failsafe",
            task_type="EMERGENCY_TRIP",
            latency_ms=latency_ms,
            success=True,
            details={"reason": trigger_reason, "trippedRelays": [i for i, r in enumerate(safe_relays) if not r]}
        )

        return {
            "workflow": self.name,
            "success": True,
            "triggerReason": trigger_reason,
            "anomalyDiagnosed": fault_info.isAnomaly,
            "anomalySeverity": fault_info.severity,
            "batteryStatus": battery_info.healthGrade,
            "trippedRelayStates": safe_relays,
            "executionTimeMs": round(latency_ms, 2),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


emergency_response_workflow = EmergencyResponseWorkflow()
