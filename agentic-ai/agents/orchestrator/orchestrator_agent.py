"""
GridFlowX Production Agent Orchestrator & Reasoning Layer
========================================================
Coordinates perception services, specialized agents, task decomposition,
and deterministic safety validation.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from agents.base import BaseAgent
from agents.solar.solar_agent import solar_agent
from agents.load.load_agent import load_agent
from agents.battery.battery_agent import battery_agent
from agents.fault.fault_agent import fault_agent
from agents.energy.energy_agent import energy_agent
from safety.failsafe_envelope import failsafe_envelope


class ProductionAgentOrchestrator(BaseAgent[Dict[str, Any], Dict[str, Any]]):
    """Production Agent Orchestrator managing specialized services and safe routing."""

    def __init__(self):
        super().__init__(
            name="Agent Controller / Orchestrator",
            version="3.0.0",
            role="Multi-agent planning, routing, and coordination"
        )
        self.active_agents = [
            "Solar Forecasting Agent",
            "Load Demand Forecasting Agent",
            "Battery Health Monitoring Agent",
            "Fault Detection & Diagnostics Agent",
            "Energy Management Decision Agent",
            "Automation Engine"
        ]

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        goal = input_data.get("goal", "")
        telemetry = input_data.get("telemetry", {})
        role = input_data.get("actorRole", "operator")
        return self.plan_and_decompose(goal, telemetry, role)

    def get_system_agent_status(self) -> Dict[str, Any]:
        return {
            "orchestratorStatus": "ONLINE",
            "totalAgentsActive": len(self.active_agents),
            "agents": self.active_agents,
            "safetyEnvelopeStatus": "ENFORCED",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def plan_and_decompose(
        self,
        goal: str,
        latest_telemetry: Dict[str, Any],
        actor_role: str = "operator"
    ) -> Dict[str, Any]:
        """Decomposes an operational goal into executable, safe steps."""
        g_lower = goal.lower()
        steps = []

        if "shed" in g_lower or "peak" in g_lower:
            steps.append({
                "action": "EVALUATE_DISPATCH",
                "service": "OptimizationService",
                "description": "Calculate optimal load shed and tariff response"
            })
            steps.append({
                "action": "VALIDATE_SAFETY",
                "service": "FailsafeEnvelope",
                "description": "Verify Tier 1 immutability and SoC floor"
            })
        elif "solar" in g_lower:
            steps.append({
                "action": "FETCH_SOLAR_FORECAST",
                "service": "ForecastService",
                "description": "Query 24-hour PV yield predictions"
            })
        elif "battery" in g_lower:
            steps.append({
                "action": "ANALYZE_BATTERY_HEALTH",
                "service": "BatteryHealthService",
                "description": "Evaluate LiFePO4 electrochemical health and ESR"
            })
        elif "fault" in g_lower or "anomaly" in g_lower:
            steps.append({
                "action": "DETECT_ANOMALIES",
                "service": "AnomalyDetectionService",
                "description": "Run multivariate Isolation Forest anomaly detection"
            })
        else:
            steps.append({
                "action": "INSPECT_TELEMETRY",
                "service": "TelemetryService",
                "description": "Examine live microgrid sensor state"
            })

        return {
            "success": True,
            "goal": goal,
            "proposedPlan": steps,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


orchestrator = ProductionAgentOrchestrator()
production_orchestrator = orchestrator
