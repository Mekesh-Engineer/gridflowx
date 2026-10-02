"""
GridFlowX / SAMEMAMS Autonomous Energy Optimization & Model Registry Service
============================================================================
Time-of-Use (ToU) tariff evaluation, 8-channel optimal relay routing dispatch,
economic & carbon footprint modeling, and versioned AI model lifecycle management.
"""

from typing import List, Dict, Any, Tuple
from datetime import datetime
from schemas.optimization import OptimizationResponse
from agents.energy.energy_agent import energy_agent
from inference.energy_inference import energy_inference_adapter
from models.registry import model_registry


class OptimizationService:
    MODELS_REGISTRY = model_registry.MODELS_REGISTRY

    @staticmethod
    def get_tariff_window(now: datetime) -> Tuple[str, float]:
        return energy_inference_adapter.get_tariff_window(now)

    @classmethod
    def solve_optimal_dispatch(
        cls,
        telemetry: Dict[str, Any],
        device_id: str = "GFX-ESP32-MASTER-01"
    ) -> OptimizationResponse:
        return energy_agent.optimize_sync(telemetry=telemetry, device_id=device_id)

    @classmethod
    def get_models(cls) -> List[Dict[str, Any]]:
        return model_registry.get_all_models()

    @classmethod
    def retrain_model(cls, model_id: str) -> Dict[str, Any]:
        return model_registry.retrain_model(model_id)
