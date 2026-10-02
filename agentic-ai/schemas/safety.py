"""
GridFlowX Safety & Interlock Schemas
====================================
"""

from typing import List
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class SafetyValidationResult(BaseModel):
    is_safe: bool
    safe_relay_states: List[bool]
    was_modified: bool
    violations: List[str] = Field(default_factory=list)
    explanation: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class InterlockStatus(BaseModel):
    tier1_critical_locked: bool = True
    contactor_dwell_active: bool = False
    deep_discharge_active: bool = False
    anti_islanding_active: bool = False
    thermal_cutoff_active: bool = False
