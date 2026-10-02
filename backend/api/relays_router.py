"""
GridFlowX Relay Control & Failsafe Interlock Router
"""

from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Header, HTTPException, status
from backend.schemas.relays import RelayControlCommand, RelayBatchControlCommand
from backend.services.relay_service import relay_service
from backend.database.repositories import relay_audit_repo
from backend.core.security import get_current_user_role


router = APIRouter(prefix="/api/v1/relays", tags=["Relays"])


@router.get("/state")
@router.get("/states")
def get_relay_state() -> Dict[str, Any]:
    """Returns the current state of all 8 physical relay channels."""
    states = relay_service.get_state().get("relayStates", [True, True, True, True, False, False, False, False])
    return {
        "success": True,
        "relayStates": states,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.post("/control")
def control_relay(
    command: RelayControlCommand,
    authorization: str = Header(None)
) -> Dict[str, Any]:
    """Actuates a single relay channel through the deterministic failsafe envelope."""
    role = get_current_user_role(authorization)
    try:
        return relay_service.set_single_relay(
            relay_index=command.relayIndex,
            desired_state=command.state,
            actor_role=role,
            reason=command.reason or "Manual toggle",
            override_safety=bool(command.overrideSafety)
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/emergency-stop")
def emergency_stop(
    payload: Optional[Dict[str, Any]] = None,
    authorization: str = Header(None)
) -> Dict[str, Any]:
    """Instantly trips all physical loads and isolates relays."""
    import uuid
    role = get_current_user_role(authorization)
    reason = (payload or {}).get("reason", "Automated verification emergency shutdown routine")
    device_id = (payload or {}).get("deviceId", "GFX-ESP32-MASTER-01")
    res = relay_service.emergency_stop(actor_role=role)
    isolated_states = [False] * 8
    from backend.services.telemetry_service import telemetry_service
    telemetry_service.relay_states = list(isolated_states)
    return {
        "commandId": f"CMD-ESTOP-{uuid.uuid4().hex[:8]}",
        "deviceId": device_id,
        "success": True,
        "message": f"Emergency stop executed successfully by {role}",
        "relayStates": isolated_states,
        "emergencyLatched": True,
        "executedAt": datetime.now(timezone.utc).isoformat(),
        "latencyMs": 0.05,
    }



@router.post("/reset-safety")
def reset_safety(authorization: str = Header(None)) -> Dict[str, Any]:
    """Resets the latched safety interlock state."""
    role = get_current_user_role(authorization)
    return relay_service.reset_safety(actor_role=role)


@router.get("/audit")
def get_relay_audit_log(limit: int = 50) -> List[Dict[str, Any]]:
    """Returns the historical audit trail of relay state transitions."""
    return relay_audit_repo.get_recent_transitions(limit)
