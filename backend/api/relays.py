"""
GridFlowX Relay Control Endpoints
=================================
"""

from typing import Dict, Any, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException

from backend.services.relay_service import relay_service
from backend.core.security import security_manager

router = APIRouter(prefix="/api/v1/relays", tags=["Relays"])


class RelayControlRequest(BaseModel):
    deviceId: str = Field(default="GFX-ESP32-MASTER-01")
    relayIndex: int = Field(..., ge=0, le=7)
    state: bool


class EmergencyStopRequest(BaseModel):
    deviceId: str = Field(default="GFX-ESP32-MASTER-01")
    reason: str = Field(default="Emergency stop triggered by operator")


class RelayOverrideRequest(BaseModel):
    deviceId: str = Field(default="GFX-ESP32-MASTER-01")
    relayIndex: int = Field(..., ge=0, le=7)
    targetState: bool
    overrideDurationMinutes: int = Field(default=30)
    authPinOrToken: str = Field(...)
    reason: str = Field(default="Manual maintenance override")


@router.get("/states")
def get_relay_states(deviceId: str = "GFX-ESP32-MASTER-01"):
    return {
        "deviceId": deviceId,
        "relayStates": relay_service.get_relay_states(deviceId),
    }


@router.post("/control")
async def control_relay(req: RelayControlRequest, user: Dict[str, Any] = Depends(security_manager.verify_token)):
    security_manager.require_role("operator", user)
    return await relay_service.switch_relay(
        device_id=req.deviceId,
        relay_index=req.relayIndex,
        state=req.state,
        actor=user.get("email", "operator"),
    )


@router.post("/emergency-stop")
async def emergency_stop(req: EmergencyStopRequest, user: Dict[str, Any] = Depends(security_manager.verify_token)):
    security_manager.require_role("operator", user)
    return await relay_service.emergency_stop(
        device_id=req.deviceId,
        reason=req.reason,
        actor=user.get("email", "operator"),
    )


@router.post("/override")
async def override_relay(req: RelayOverrideRequest, user: Dict[str, Any] = Depends(security_manager.verify_token)):
    security_manager.require_role("supervisor", user)
    res = await relay_service.switch_relay(
        device_id=req.deviceId,
        relay_index=req.relayIndex,
        state=req.targetState,
        actor=user.get("email", "supervisor"),
    )
    return {
        "success": True,
        "overrideActive": True,
        "details": res,
        "authorizedBy": user.get("email"),
    }
