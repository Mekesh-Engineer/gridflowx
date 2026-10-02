"""
GridFlowX Solar & Load Forecast Schemas
=======================================
"""

from typing import List
from pydantic import BaseModel


class SolarForecastPoint(BaseModel):
    timestamp: str
    predictedYieldW: float
    lowerBoundW: float
    upperBoundW: float
    irradianceWm2: float
    ambientTempC: float


class SolarForecastResponse(BaseModel):
    deviceId: str
    generatedAt: str
    modelId: str = "GridBrain-SolarLSTM-v3.0"
    horizonHours: int = 1
    confidencePct: float = 88.5
    dataPoints: List[SolarForecastPoint]


class LoadForecastPoint(BaseModel):
    timestamp: str
    predictedDemandW: float
    tier1CriticalW: float
    tier2ImportantW: float
    tier3FlexibleW: float
    lowerBoundW: float
    upperBoundW: float


class LoadForecastResponse(BaseModel):
    deviceId: str
    generatedAt: str
    modelId: str = "GridBrain-LoadARIMA-v2.1"
    horizonHours: int = 1
    peakDemandW: float
    peakDemandTimestamp: str
    dataPoints: List[LoadForecastPoint]
