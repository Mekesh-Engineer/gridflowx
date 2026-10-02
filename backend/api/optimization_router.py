"""
GridFlowX Autonomous Optimization Router
========================================
Supports /api/v1/ai/optimization and /api/v1/ai/optimize
"""

from typing import Dict, Any, Optional
from fastapi import APIRouter, Body, Header
from backend.services.agentic_client import agentic_client
from backend.services.telemetry_service import telemetry_service
from backend.services.relay_service import relay_service
from backend.core.security import get_current_user_role

router = APIRouter(prefix="/api/v1/ai", tags=["Optimization AI"])


@router.get("/optimization/dispatch")
@router.get("/optimize/dispatch")
def get_optimal_dispatch_get(deviceId: str = "GFX-ESP32-MASTER-01") -> Dict[str, Any]:
    """Calculates real-time optimal relay routing and Time-of-Use tariff response."""
    telemetry = telemetry_service.get_latest_telemetry()
    return agentic_client.optimize_dispatch(telemetry, deviceId)


@router.post("/optimization/dispatch")
@router.post("/optimize/dispatch")
def get_optimal_dispatch_post(payload: Optional[Dict[str, Any]] = Body(None)) -> Dict[str, Any]:
    """Calculates real-time optimal relay routing and Time-of-Use tariff response."""
    data = payload or {}
    telemetry = data.get("telemetry") or telemetry_service.get_latest_telemetry()
    device_id = data.get("deviceId", "GFX-ESP32-MASTER-01")
    return agentic_client.optimize_dispatch(telemetry, device_id)


@router.post("/optimization/apply")
@router.post("/optimize/apply")
def apply_optimization_decision(
    payload: Dict[str, Any],
    authorization: str = Header(None)
) -> Dict[str, Any]:
    """Applies recommended optimization relay states to live hardware."""
    role = get_current_user_role(authorization)
    decision_id = payload.get("decisionId", "DEC-UNKNOWN")
    target_relays = payload.get("targetRelayStates", telemetry_service.relay_states)

    if len(target_relays) == 8:
        for i, state in enumerate(target_relays):
            relay_service.set_single_relay(
                relay_index=i,
                desired_state=state,
                actor_role=role,
                reason=f"Apply optimization decision {decision_id}"
            )

    return {
        "success": True,
        "message": f"Optimization decision {decision_id} applied successfully by {role}",
        "currentRelayStates": telemetry_service.relay_states,
    }


@router.get("/optimize/tariffs")
@router.get("/optimization/tariffs")
def get_tariffs() -> Dict[str, Any]:
    """Returns Time-of-Use (ToU) electricity tariffs."""
    return {
        "currency": "USD",
        "unit": "kWh",
        "offPeakRate": 0.08,
        "standardRate": 0.12,
        "peakRate": 0.22,
        "peakHours": ["17:00-21:00"],
        "superOffPeakHours": ["00:00-06:00"],
    }
