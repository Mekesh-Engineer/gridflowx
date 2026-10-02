"""
GridFlowX Energy Management & Dispatch Schemas
==============================================
"""

from typing import List
from pydantic import BaseModel


class OptimizationResponse(BaseModel):
    decisionId: str
    deviceId: str
    timestamp: str
    tariffWindow: str  # 'OFF_PEAK' | 'STANDARD' | 'PEAK' | 'CRITICAL_PEAK'
    currentTariffRateUsdPerKwh: float
    targetRelayStates: List[bool]
    actionSummary: str
    reasoningTrace: List[str]
    estimatedCostSavingsUsd: float
    estimatedCo2DisplacedKg: float
    confidencePct: float
    status: str
    requiresSupervisorApproval: bool
