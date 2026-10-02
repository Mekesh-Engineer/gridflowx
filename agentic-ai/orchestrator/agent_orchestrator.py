"""
GridFlowX Central Agent Orchestrator
====================================
Coordinates all specialized agents (Solar, Load, Battery, Fault, Energy, Automation)
and handles macro task decomposition and execution.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from agents.solar.solar_agent import solar_agent
from agents.load.load_agent import load_agent
from agents.battery.battery_agent import battery_agent
from agents.fault.fault_agent import fault_agent
from agents.energy.energy_agent import energy_agent
from agents.automation.automation_engine import automation_engine
from workflows.energy_optimization import energy_optimization_workflow
from workflows.autonomous_dispatch import autonomous_dispatch_workflow
from workflows.emergency_response import emergency_response_workflow
from workflows.predictive_planning import predictive_planning_workflow
from runtime.manager import agentic_runtime


class AgentOrchestrator:
    """Master agent coordinating perception, workflows, and cloud inference."""

    def __init__(self):
        self.agents = {
            "solar": solar_agent,
            "load": load_agent,
            "battery": battery_agent,
            "fault": fault_agent,
            "energy": energy_agent,
            "automation": automation_engine
        }
        self.workflows = {
            "energy_optimization": energy_optimization_workflow,
            "autonomous_dispatch": autonomous_dispatch_workflow,
            "emergency_response": emergency_response_workflow,
            "predictive_planning": predictive_planning_workflow
        }

    def list_agents(self) -> List[Dict[str, Any]]:
        return [
            {"id": "solar", "name": "Solar Forecasting Agent", "type": "predictive"},
            {"id": "load", "name": "Load Demand Forecasting Agent", "type": "predictive"},
            {"id": "battery", "name": "Battery Health Monitoring Agent", "type": "electro-thermal"},
            {"id": "fault", "name": "Fault Detection & Diagnostics Agent", "type": "anomaly-detection"},
            {"id": "energy", "name": "Energy Management Decision Agent", "type": "optimization"},
            {"id": "automation", "name": "Microgrid Automation Engine", "type": "supervisory-control"}
        ]

    def list_workflows(self) -> List[str]:
        return list(self.workflows.keys())

    async def execute_workflow(self, workflow_name: str, context: Dict[str, Any]) -> Dict[str, Any]:
        workflow = self.workflows.get(workflow_name)
        if not workflow:
            raise ValueError(f"Unknown workflow: {workflow_name}. Available: {list(self.workflows.keys())}")
        return await workflow.run(context)

    def plan_and_decompose(self, goal: str, latest_telemetry: Dict[str, Any], actor_role: str = "operator") -> Dict[str, Any]:
        """Decomposes a user or operational goal into sequenced agent tasks."""
        g_lower = goal.lower()
        steps = []

        if "emergency" in g_lower or "trip" in g_lower or "overvoltage" in g_lower:
            steps.append({
                "sequence": 1,
                "workflow": "emergency_response",
                "description": "Execute deterministic fault isolation and load shedding"
            })
        elif "optimize" in g_lower or "shed" in g_lower or "tariff" in g_lower:
            steps.append({
                "sequence": 1,
                "workflow": "energy_optimization",
                "description": "Run ToU tariff optimization and failsafe envelope verification"
            })
        elif "plan" in g_lower or "ahead" in g_lower or "24h" in g_lower:
            steps.append({
                "sequence": 1,
                "workflow": "predictive_planning",
                "description": "Compute 24h day-ahead solar, load, and BESS schedule"
            })
        else:
            steps.append({
                "sequence": 1,
                "workflow": "autonomous_dispatch",
                "description": "Execute 1-cycle autonomous state balancing"
            })

        return {
            "success": True,
            "goal": goal,
            "actorRole": actor_role,
            "decomposedPlan": steps,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


agent_orchestrator = AgentOrchestrator()
