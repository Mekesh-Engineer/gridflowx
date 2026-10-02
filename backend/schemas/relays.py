"""
GridFlowX Relay Schemas
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class RelayControlCommand(BaseModel):
    relayIndex: int = Field(..., ge=0, le=7, description="Relay channel 0-7")
    state: bool = Field(..., description="Target state: True=CLOSED/ON, False=OPEN/OFF")
    reason: Optional[str] = "Manual operator action"
    overrideSafety: Optional[bool] = False


class RelayBatchControlCommand(BaseModel):
    relayStates: List[bool] = Field(..., min_length=8, max_length=8)
    reason: Optional[str] = "Batch optimization command"
    overrideSafety: Optional[bool] = False


class RelayStateResponse(BaseModel):
    deviceId: str = "GFX-ESP32-MASTER-01"
    relayStates: List[bool]
    lastUpdated: str
    safetyLocked: bool = False
    activeOverrides: List[int] = []
    relayNames: List[str] = [
        "Relay 1 (Life Support / Medical)",
        "Relay 2 (Core Server / Comms)",
        "Relay 3 (Refrigeration / Labs)",
        "Relay 4 (Emergency Lighting)",
        "Relay 5 (Main Lighting)",
        "Relay 6 (HVAC / Air Conditioning)",
        "Relay 7 (EV Charging Station)",
        "Relay 8 (Water Pump / Auxiliary)"
    ]
