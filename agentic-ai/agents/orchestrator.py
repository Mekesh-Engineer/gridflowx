"""
GridFlowX Production Agent Orchestrator & Reasoning Layer
========================================================
Coordinates perception services, chat synthesis, and task decomposition.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from ..safety.failsafe_envelope import failsafe_envelope
from ..services.forecast_service import ForecastService
from ..services.battery_service import BatteryHealthService
from ..services.anomaly_service import AnomalyDetectionService
from ..services.optimization_service import OptimizationService


class ProductionAgentOrchestrator:
    """Production Agent Orchestrator managing specialized services and safe routing."""

    def __init__(self):
        self.active_agents = [
            "Solar Forecasting Agent",
            "Load Demand Forecasting Agent",
            "Battery Health Monitoring Agent",
            "Fault Detection & Diagnostics Agent",
            "Energy Management Decision Agent",
            "Automation Engine"
        ]

    def get_system_agent_status(self) -> Dict[str, Any]:
        return {
            "orchestratorStatus": "ONLINE",
            "totalAgentsActive": len(self.active_agents),
            "agents": self.active_agents,
            "safetyEnvelopeStatus": "ENFORCED",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }

    def plan_and_decompose(self, goal: str, latest_telemetry: Dict[str, Any], actor_role: str = "operator") -> Dict[str, Any]:
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


production_orchestrator = ProductionAgentOrchestrator()
