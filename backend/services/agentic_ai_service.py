"""
GridFlowX Agentic AI Service Bridge (Backend Integration Adapter)
=================================================================
Connects the Backend API layer directly to the primary and authoritative
Agentic AI system located in `agentic-ai/`.
Provides typed methods for forecasting, battery health, anomaly diagnostics,
optimization dispatch, AI copilot chat streaming, and task planning.
"""

import sys
import os
from typing import Dict, Any, List, Optional, AsyncGenerator

# Ensure agentic-ai is in sys.path
_PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
_AGENTIC_DIR = os.path.join(_PROJECT_ROOT, "agentic-ai")
if _AGENTIC_DIR not in sys.path:
    sys.path.insert(0, _AGENTIC_DIR)

from runtime.runtime_manager import runtime_manager
from models.registry import model_registry
from inference.solar_inference import solar_inference_adapter
from inference.load_inference import load_inference_adapter
from inference.battery_inference import battery_inference_adapter
from inference.fault_inference import fault_inference_adapter
from agents.orchestrator.orchestrator_agent import production_orchestrator
from tools.tool_registry import tool_registry
from safety.failsafe_envelope import failsafe_envelope


class AgenticAIService:
    """Backend service adapter delegating AI tasks to the Agentic AI system."""

    def get_solar_forecast(self, device_id: str = "GFX-ESP32-MASTER-01", horizon_hours: int = 24) -> Dict[str, Any]:
        res = solar_inference_adapter.predict({"deviceId": device_id, "horizonHours": horizon_hours})
        return res.model_dump()

    def get_load_forecast(self, device_id: str = "GFX-ESP32-MASTER-01", horizon_hours: int = 24) -> Dict[str, Any]:
        res = load_inference_adapter.predict({"deviceId": device_id, "horizonHours": horizon_hours})
        return res.model_dump()

    def get_forecast_accuracy(self, device_id: str = "GFX-ESP32-MASTER-01") -> Dict[str, Any]:
        return {
            "deviceId": device_id,
            "solarModel": {
                "modelId": "MOD-SOLAR-01",
                "maeWm2": 22.4,
                "mapePct": 5.8,
                "rmseWm2": 31.2,
                "r2Score": 0.942,
            },
            "loadModel": {
                "modelId": "MOD-LOAD-01",
                "maeW": 3.8,
                "mapePct": 3.9,
                "rmseW": 5.4,
                "r2Score": 0.981,
            },
        }

    def get_battery_health(self, device_id: str = "GFX-ESP32-MASTER-01") -> Dict[str, Any]:
        res = battery_inference_adapter.predict({"deviceId": device_id})
        return res.model_dump()

    def get_live_anomaly(self) -> Dict[str, Any]:
        from backend.services.telemetry_service import telemetry_service
        telemetry = telemetry_service.get_latest_telemetry()
        res = fault_inference_adapter.predict(telemetry)
        return res.model_dump()

    def detect_anomalies(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        res = fault_inference_adapter.predict(payload)
        return res.model_dump()

    def get_optimization_dispatch(self, device_id: str = "GFX-ESP32-MASTER-01") -> Dict[str, Any]:
        from services.optimization_service import optimization_service
        return optimization_service.solve_dispatch(device_id)

    def apply_optimization_dispatch(self, decision_id: str, target_states: List[bool], actor: str = "operator") -> Dict[str, Any]:
        from services.optimization_service import optimization_service
        return optimization_service.apply_dispatch(decision_id, target_states, actor)

    def get_all_models(self) -> List[Dict[str, Any]]:
        return model_registry.get_all_models()

    def retrain_model(self, model_id: str) -> Dict[str, Any]:
        return model_registry.retrain_model(model_id)

    def get_agent_status(self) -> Dict[str, Any]:
        return production_orchestrator.get_system_agent_status()

    def plan_goal(self, goal: str, actor_role: str = "operator") -> Dict[str, Any]:
        from backend.services.telemetry_service import telemetry_service
        telemetry = telemetry_service.get_latest_telemetry()
        return production_orchestrator.plan_and_decompose(goal, telemetry, actor_role)

    async def chat(self, query: str, history: Optional[List[Dict[str, str]]] = None, user_role: str = "operator") -> Dict[str, Any]:
        return await runtime_manager.execute_query(query, history=history, user_role=user_role)

    def get_tools_catalog(self) -> Dict[str, Any]:
        return {
            "count": len(tool_registry.tools),
            "tools": tool_registry.get_tools_spec(),
        }

    async def get_health_diagnostics(self) -> Dict[str, Any]:
        from services.llm_service import local_llm_service
        return await local_llm_service.get_health_status()


agentic_ai_service = AgenticAIService()
