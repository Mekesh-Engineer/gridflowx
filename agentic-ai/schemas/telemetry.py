"""
GridFlowX Telemetry & Calibration Schemas
=========================================
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class TelemetryPacket(BaseModel):
    deviceId: str = Field(..., description="Unique hardware ID of reporting node (e.g. 'GFX-ESP32-01')")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    sequenceNumber: int = Field(0, description="Sequential frame index")

    # Solar PV
    solarVoltageV: float = Field(..., ge=0.0, le=100.0, description="PV array voltage in Volts")
    solarCurrentA: float = Field(..., ge=0.0, le=50.0, description="PV array current in Amperes")
    solarPowerW: float = Field(..., ge=0.0, description="Instantaneous solar power in Watts")

    # Grid
    gridVoltageV: float = Field(..., ge=0.0, le=300.0, description="Grid AC RMS voltage in Volts")
    gridFrequencyHz: float = Field(50.0, ge=40.0, le=70.0, description="Grid AC line frequency")
    gridPowerW: float = Field(0.0, description="Grid active power in Watts (+ import, - export)")

    # Battery
    batteryVoltageV: float = Field(..., ge=0.0, le=60.0, description="Battery DC terminal voltage")
    batteryCurrentA: float = Field(..., description="Battery current in Amperes (+ charge, - discharge)")
    batterySoc: float = Field(..., ge=0.0, le=100.0, description="State of Charge percentage")
    batterySoh: float = Field(100.0, ge=0.0, le=100.0, description="State of Health percentage")
    batteryTempC: float = Field(..., ge=-30.0, le=120.0, description="Enclosure temperature in Celsius")

    # DC Bus & Loads
    dcBusVoltageV: float = Field(..., ge=0.0, le=60.0, description="Regulated DC Bus voltage in Volts")
    totalLoadPowerW: float = Field(..., ge=0.0, description="Aggregated load power consumption in Watts")

    # Actuator states
    relayStates: List[bool] = Field(default_factory=lambda: [False] * 8, min_length=8, max_length=8)
    core0FailsafeActive: bool = Field(False, description="Core 0 hardware failsafe cutoff flag")


class CalibrationPayload(BaseModel):
    deviceId: str = "GFX-ESP32-01"
    solarVoltageRatio: float = 7.6667
    gridVoltageRatio: float = 5.5455
    batteryVoltageRatio: float = 4.5946
    acs712SensitivityVpA: float = 0.100
    acs712ZeroOffsetV: float = 1.650
    thermalWarningThresholdC: float = 50.0
    thermalCutoffThresholdC: float = 65.0
    minBatteryCutoffV: float = 11.5
    maxBatteryChargeV: float = 14.4
    calibratedByUid: Optional[str] = "SYSTEM"
