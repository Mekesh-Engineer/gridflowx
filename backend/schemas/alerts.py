"""
GridFlowX Alert & Notification Schemas
"""

from typing import List, Optional
from pydantic import BaseModel


class AlertItem(BaseModel):
    id: str
    severity: str  # 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY'
    title: str
    message: str
    subsystem: str  # 'SOLAR' | 'BATTERY' | 'GRID' | 'LOAD' | 'SAFETY_ENVELOPE'
    timestamp: str
    acknowledged: bool = False
    resolvedAt: Optional[str] = None
