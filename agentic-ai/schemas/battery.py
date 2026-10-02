"""
GridFlowX Battery Health & Degradation Schemas
==============================================
"""

from typing import List
from pydantic import BaseModel


class BatteryHealthResponse(BaseModel):
    deviceId: str
    analyzedAt: str
    stateOfHealthPct: float
    stateOfChargePct: float
    internalResistanceOhms: float
    totalCyclesCompleted: int
    estimatedRemainingLifetimeDays: int
    degradationStatus: str  # 'OPTIMAL' | 'MODERATE' | 'ACCELERATED' | 'CRITICAL'
    thermalStressIndex: float
    recommendedMaxChargeCurrentA: float
    actionRecommendations: List[str]
