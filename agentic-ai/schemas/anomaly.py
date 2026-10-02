"""
GridFlowX Anomaly Detection Schemas
===================================
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class AnomalyItem(BaseModel):
    circuitName: str
    metric: str
    anomalyScore: float = Field(..., ge=0.0, le=1.0)
    isAnomalous: bool
    severity: str  # 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    observedValue: float
    expectedRange: List[float]
    rootCauseHypothesis: str


class AnomalyDetectionResponse(BaseModel):
    deviceId: str
    timestamp: str
    overallAnomalyDetected: bool
    isolationForestScore: float
    anomalies: List[AnomalyItem]
    mitigationRecommendation: Optional[str] = None
