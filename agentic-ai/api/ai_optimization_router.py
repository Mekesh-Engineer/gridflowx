"""
GridFlowX Optimization & Relay Dispatch API Router
==================================================
"""

from typing import Dict, Any
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from schemas.optimization import OptimizationResponse
from services.optimization_service import OptimizationService
from services.telemetry_service import telemetry_manager
from utils.auth import AuthUser, require_operator_or_above

router = APIRouter(prefix="/api/v1/ai/optimization", tags=["AI Energy Optimization"])


@router.get("/dispatch", response_model=OptimizationResponse)
def get_optimal_dispatch(deviceId: str = "GFX-ESP32-MASTER-01"):
    """Calculates real-time optimal relay routing and Time-of-Use tariff response."""
    return OptimizationService.solve_optimal_dispatch(
        telemetry=telemetry_manager.latest_telemetry,
        device_id=deviceId
    )


@router.post("/apply")
async def apply_optimization_decision(
    payload: Dict[str, Any],
    user: AuthUser = Depends(require_operator_or_above)
):
    """Applies recommended optimization relay states to live hardware."""
    decision_id = payload.get("decisionId", "DEC-UNKNOWN")
    target_relays = payload.get("targetRelayStates", telemetry_manager.current_relay_states)

    if len(target_relays) == 8:
        telemetry_manager.current_relay_states = list(target_relays)
        await telemetry_manager.send_to_devices({
            "type": "OPTIMIZATION_DISPATCH",
            "decisionId": decision_id,
            "payload": {
                "targetRelayStates": telemetry_manager.current_relay_states,
                "appliedBy": user.email or user.uid,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        })

    return {
        "success": True,
        "message": f"Optimization decision {decision_id} applied successfully by {user.role}",
        "currentRelayStates": telemetry_manager.current_relay_states,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
