"""
GridFlowX Agentic AI Client Bridge
==================================
The primary gateway through which the Backend API interacts with the Agentic AI system.
Bridges:
- Runtime & Model Router (Gemma 4 31B Cloud vs GPT-OSS 120B Cloud)
- Specialized Agents (Solar, Load, Battery, Fault, Energy, Automation)
- Workflows (Autonomous Dispatch, Emergency Response, Day-Ahead Planning)
- Safety Envelope & Failsafe Validator
- RAG & System Knowledge Retriever
"""

import sys
import os
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

# Ensure agentic-ai is in sys.path
_CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_CURRENT_DIR, "..", ".."))
_AGENTIC_DIR = os.path.join(_PROJECT_ROOT, "agentic-ai")
if _AGENTIC_DIR not in sys.path:
    sys.path.insert(0, _AGENTIC_DIR)

# Import authoritative Agentic AI modules
from runtime.manager import agentic_runtime
from runtime.router import model_router, TaskType
from runtime.ollama_cloud import ollama_cloud_client
from agents.solar.solar_agent import solar_agent
from agents.load.load_agent import load_agent
from agents.battery.battery_agent import battery_agent
from agents.fault.fault_agent import fault_agent
from agents.energy.energy_agent import energy_agent
from agents.automation.automation_engine import automation_engine
from agents.orchestrator.query_router import query_router
from orchestrator.agent_orchestrator import agent_orchestrator
from workflows import (
    energy_optimization_workflow,
    autonomous_dispatch_workflow,
    emergency_response_workflow,
    predictive_planning_workflow,
)
from safety.failsafe_envelope import failsafe_envelope
from services.llm_service import local_llm_service
from services.forecast_service import ForecastService
from services.battery_service import BatteryHealthService
from services.anomaly_service import AnomalyDetectionService
from services.optimization_service import OptimizationService


class AgenticAIClient:
    """Enterprise client interfacing Backend APIs to the Agentic AI subsystem."""

    def __init__(self):
        self.runtime = agentic_runtime
        self.orchestrator = agent_orchestrator
        self.failsafe = failsafe_envelope

    async def chat(
        self,
        query: str,
        history: Optional[List[Dict[str, str]]] = None,
        telemetry: Optional[Dict[str, Any]] = None,
        actor_role: str = "operator"
    ) -> Dict[str, Any]:
        """Interacts with the AI Copilot using optimal cloud model routing."""
        return await local_llm_service.generate_grounded_chat(
            query=query,
            latest_telemetry=telemetry or {},
            history=history or [],
            user_role=actor_role
        )

    def get_solar_forecast(self, device_id: str = "GFX-ESP32-MASTER-01", horizon: int = 24) -> Dict[str, Any]:
        res = solar_agent.forecast_sync(device_id, horizon)
        return res.model_dump()

    def get_load_forecast(self, device_id: str = "GFX-ESP32-MASTER-01", horizon: int = 24) -> Dict[str, Any]:
        res = load_agent.forecast_sync(device_id, horizon)
        return res.model_dump()

    def get_battery_health(self, telemetry: Dict[str, Any], device_id: str = "GFX-ESP32-MASTER-01") -> Dict[str, Any]:
        res = battery_agent.assess_sync(telemetry, device_id)
        return res.model_dump()

    def detect_anomalies(self, telemetry: Dict[str, Any], device_id: str = "GFX-ESP32-MASTER-01") -> Dict[str, Any]:
        res = fault_agent.diagnose_sync(telemetry, device_id)
        return res.model_dump()

    def optimize_dispatch(self, telemetry: Dict[str, Any], device_id: str = "GFX-ESP32-MASTER-01") -> Dict[str, Any]:
        res = energy_agent.optimize_sync(telemetry, device_id)
        return res.model_dump()

    async def execute_workflow(self, workflow_name: str, context: Dict[str, Any]) -> Dict[str, Any]:
        return await self.orchestrator.execute_workflow(workflow_name, context)

    def decompose_goal(self, goal: str, telemetry: Dict[str, Any], actor_role: str = "operator") -> Dict[str, Any]:
        return self.orchestrator.plan_and_decompose(goal, telemetry, actor_role)

    async def get_system_health(self) -> Dict[str, Any]:
        llm_health = await local_llm_service.get_health_status()
        cloud_models = ollama_cloud_client.get_available_models()
        return {
            "status": "OPERATIONAL",
            "cloudModels": cloud_models,
            "llmStatus": llm_health,
            "activeAgents": [a["name"] for a in self.orchestrator.list_agents()],
            "activeWorkflows": self.orchestrator.list_workflows(),
            "safetyEnvelopeStatus": "ENFORCED",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


agentic_client = AgenticAIClient()
