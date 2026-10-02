"""
GridFlowX Relay Control & Emergency Safety Router
=================================================
"""

import time
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from schemas.relays import (
    RelayOverrideRequest,
    EmergencyStopRequest,
    RecoveryRequest,
    RelayCommandResponse,
)
from services.telemetry_service import telemetry_manager
from utils.auth import (
    AuthUser,
    get_current_user,
    require_operator_or_above,
    require_supervisor_or_above,
)

router = APIRouter(prefix="/api/v1/relays", tags=["Relays"])


@router.get("/states")
async def get_relay_states(user: AuthUser = Depends(get_current_user)):
    return {
        "success": True,
        "relayStates": telemetry_manager.current_relay_states,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "requestedBy": user.email or user.uid
    }


@router.post("/override", response_model=RelayCommandResponse)
async def toggle_override(
    payload: RelayOverrideRequest,
    user: AuthUser = Depends(require_operator_or_above)
):
    start_time = time.time()
    command_id = f"CMD-OVR-{uuid.uuid4().hex[:8]}"

    print(f"[Override] Actor: {user.email} ({user.role}) toggled channel {payload.relayIndex} to {payload.newState}. Reason: {payload.reason}")
    telemetry_manager.current_relay_states[payload.relayIndex] = payload.newState

    command = {
        "type": "OVERRIDE",
        "commandId": command_id,
        "payload": {
            "channel": payload.relayIndex,
            "state": payload.newState,
            "reason": payload.reason,
            "requestedBy": user.email or user.uid
        }
    }
    await telemetry_manager.send_to_devices(command)

    latency = round((time.time() - start_time) * 1000, 2)
    return RelayCommandResponse(
        commandId=command_id,
        deviceId=payload.deviceId,
        success=True,
        message=f"Relay channel {payload.relayIndex} override dispatched successfully by {user.role}",
        relayStates=telemetry_manager.current_relay_states,
        executedAt=datetime.now(timezone.utc).isoformat(),
        latencyMs=latency
    )


@router.post("/emergency-stop", response_model=RelayCommandResponse)
async def emergency_stop(
    payload: EmergencyStopRequest,
    user: AuthUser = Depends(require_operator_or_above)
):
    start_time = time.time()
    command_id = f"CMD-ESTOP-{uuid.uuid4().hex[:8]}"

    print(f"[EMERGENCY STOP] Actor: {user.email} ({user.role}) triggered for device {payload.deviceId}. Reason: {payload.reason}")
    # Force all relays to safe isolated state
    telemetry_manager.current_relay_states = [False] * 8

    command = {
        "type": "EMERGENCY_STOP",
        "commandId": command_id,
        "payload": {
            "reason": payload.reason,
            "requestedBy": user.email or user.uid,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    }
    await telemetry_manager.send_to_devices(command)

    latency = round((time.time() - start_time) * 1000, 2)
    return RelayCommandResponse(
        commandId=command_id,
        deviceId=payload.deviceId,
        success=True,
        message=f"Emergency stop atomic shutdown dispatched by {user.role}",
        relayStates=telemetry_manager.current_relay_states,
        executedAt=datetime.now(timezone.utc).isoformat(),
        latencyMs=latency
    )


@router.post("/recovery", response_model=RelayCommandResponse)
async def authorize_recovery(
    payload: RecoveryRequest,
    user: AuthUser = Depends(require_supervisor_or_above)
):
    start_time = time.time()
    command_id = f"CMD-REC-{uuid.uuid4().hex[:8]}"

    print(f"[Recovery] Actor: {user.email} ({user.role}) authorized recovery for device {payload.deviceId}. Reason: {payload.reason}")
    # Restore default safe states (Tier 1 on, Tier 2 on, MPPT on, Main Inverter on)
    telemetry_manager.current_relay_states = [True, True, False, True, False, True, False, True]

    command = {
        "type": "RECOVERY_AUTHORIZED",
        "commandId": command_id,
        "payload": {
            "reason": payload.reason,
            "authorizedBy": user.email or user.uid,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    }
    await telemetry_manager.send_to_devices(command)

    latency = round((time.time() - start_time) * 1000, 2)
    return RelayCommandResponse(
        commandId=command_id,
        deviceId=payload.deviceId,
        success=True,
        message=f"Emergency recovery authorized by {user.role} and safe operational state restored",
        relayStates=telemetry_manager.current_relay_states,
        executedAt=datetime.now(timezone.utc).isoformat(),
        latencyMs=latency
    )
