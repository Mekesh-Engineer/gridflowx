"""
GridFlowX Autonomous Energy Optimization Workflow
=================================================
Pipeline: OBSERVE -> PREDICT -> OPTIMIZE -> VALIDATE -> PROPOSE -> AUDIT
"""

from typing import Dict, Any
from workflows.base import BaseWorkflow
from agents.solar.solar_agent import solar_agent
from agents.load.load_agent import load_agent
from agents.energy.energy_agent import energy_agent
from safety.failsafe_envelope import failsafe_envelope
from memory.episodic_memory import episodic_memory


class EnergyOptimizationWorkflow(BaseWorkflow):
    def __init__(self):
        super().__init__(
            name="Autonomous Energy Optimization Workflow",
            description="Multi-agent energy dispatch planning and deterministic safety check"
        )

    async def run(self, context: Dict[str, Any]) -> Dict[str, Any]:
        telemetry = context.get("telemetry", {})
        device_id = context.get("deviceId", "GFX-ESP32-MASTER-01")

        # 1. PREDICT: Gather solar and load forecasts concurrently
        solar_res = solar_agent.forecast_sync(device_id, 24)
        load_res = load_agent.forecast_sync(device_id, 24)

        # 2. OPTIMIZE: Run Energy Management Decision Agent
        opt_res = energy_agent.optimize_sync(telemetry, device_id)

        # 3. VALIDATE: Filter proposed relay states through deterministic failsafe envelope
        current_relays = telemetry.get("relayStates", [True, True, False, True, False, True, False, True])
        safe_relays, was_modified, explanation = failsafe_envelope.validate_and_filter_relays(
            current_relays=current_relays,
            proposed_relays=opt_res.targetRelayStates,
            telemetry=telemetry,
            actor_role="operator"
        )

        # 4. AUDIT: Record decision trace in episodic memory
        episodic_memory.record_decision({
            "decisionId": opt_res.decisionId,
            "actionSummary": opt_res.actionSummary,
            "wasModifiedBySafety": was_modified,
            "finalRelayStates": safe_relays,
        })

        return {
            "success": True,
            "optimizationDecision": opt_res.model_dump(),
            "validatedRelayStates": safe_relays,
            "safetyModified": was_modified,
            "safetyExplanation": explanation,
        }


energy_optimization_workflow = EnergyOptimizationWorkflow()
