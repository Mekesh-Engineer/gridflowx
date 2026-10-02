"""
GridFlowX Relay & Actuator Schemas
==================================
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class RelayOverrideRequest(BaseModel):
    deviceId: str = Field(default="GFX-ESP32-01")
    relayIndex: int = Field(..., ge=0, le=7, description="Channel index 0-7")
    newState: bool = Field(..., description="Target relay contact state (True=ON, False=OFF)")
    reason: str = Field(..., min_length=3, description="Audit justification for manual override")
    durationMinutes: Optional[int] = Field(None, ge=1, le=1440, description="Auto-revert timer")
    requestedByUid: Optional[str] = None
    requestedByRole: Optional[str] = "operator"


class EmergencyStopRequest(BaseModel):
    deviceId: str = Field(default="GFX-ESP32-01")
    reason: str = Field(..., min_length=3, description="Emergency justification")
    requestedByUid: Optional[str] = None
    requestedByRole: Optional[str] = "operator"


class RecoveryRequest(BaseModel):
    deviceId: str = Field(default="GFX-ESP32-01")
    reason: str = Field(..., min_length=3, description="Recovery authorization justification")
    authorizedByUid: Optional[str] = None
    authorizedByRole: Optional[str] = "supervisor"


class RelayCommandResponse(BaseModel):
    commandId: str
    deviceId: str
    success: bool
    message: str
    relayStates: List[bool]
    executedAt: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    latencyMs: float = 0.0
