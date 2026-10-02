"""
GridFlowX Telemetry Schemas
"""

from typing import List, Optional
from pydantic import BaseModel, Field


class TelemetryFrame(BaseModel):
    deviceId: str = "GFX-ESP32-MASTER-01"
    timestamp: str
    gridVoltage: float = Field(..., description="AC Grid Voltage (V)")
    gridCurrent: float = Field(..., description="AC Grid Current (A)")
    gridFrequency: float = Field(..., description="Grid Frequency (Hz)")
    gridPower: float = Field(..., description="AC Grid Power (W)")
    
    solarVoltage: float = Field(..., description="PV String Voltage (V)")
    solarCurrent: float = Field(..., description="PV String Current (A)")
    solarPower: float = Field(..., description="PV Output Power (W)")
    solarIrradiance: float = Field(..., description="Solar Irradiance (W/m2)")
    
    batteryVoltage: float = Field(..., description="BESS Bus Voltage (V)")
    batteryCurrent: float = Field(..., description="BESS Charge/Discharge Current (A)")
    batteryPower: float = Field(..., description="BESS Power (W)")
    batterySoc: float = Field(..., description="Battery State of Charge (%)")
    batterySoh: float = Field(..., description="Battery State of Health (%)")
    batteryTemp: float = Field(..., description="Battery Core Temperature (°C)")
    
    loadVoltage: float = Field(..., description="AC Load Bus Voltage (V)")
    loadCurrent: float = Field(..., description="Total Load Current (A)")
    loadPower: float = Field(..., description="Total Active Load (W)")
    tier1LoadW: float = Field(..., description="Tier 1 Critical Load (W)")
    tier2LoadW: float = Field(..., description="Tier 2 Essential Load (W)")
    tier3LoadW: float = Field(..., description="Tier 3 Comfort Load (W)")
    tier4LoadW: float = Field(..., description="Tier 4 Heavy Load (W)")
    
    relayStates: List[bool] = Field(..., description="States of 8 physical relays")
    isIslanded: bool = Field(False, description="Microgrid islanding status")
    ambientTemp: float = Field(28.0, description="Ambient Temperature (°C)")
