"""
GridFlowX Energy Analytics Schemas
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class EnergySummary(BaseModel):
    solarGenerationKwh: float
    gridImportKwh: float
    gridExportKwh: float
    batteryChargeKwh: float
    batteryDischargeKwh: float
    totalConsumptionKwh: float
    selfConsumptionRatePct: float
    carbonSavedKg: float
    estimatedCostSavedUsd: float
    timestamp: str


class PowerFlow(BaseModel):
    solarToLoadW: float
    solarToBatteryW: float
    solarToGridW: float
    gridToLoadW: float
    batteryToLoadW: float
    gridToBatteryW: float
    netGridPowerW: float
