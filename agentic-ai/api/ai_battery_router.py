"""
GridFlowX Battery Health API Router
===================================
"""

from fastapi import APIRouter
from schemas.battery import BatteryHealthResponse
from services.battery_service import BatteryHealthService
from services.telemetry_service import telemetry_manager

router = APIRouter(prefix="/api/v1/ai/battery", tags=["AI Battery Health"])


@router.get("/health", response_model=BatteryHealthResponse)
def get_battery_health(deviceId: str = "GFX-ESP32-MASTER-01"):
    """Evaluates electro-thermal degradation, ESR, and thermal stress on BESS."""
    t = telemetry_manager.latest_telemetry
    return BatteryHealthService.analyze_battery_health(
        device_id=deviceId,
        battery_voltage_v=float(t.get("batteryVoltageV", 12.8)),
        battery_current_a=float(t.get("batteryCurrentA", -3.2)),
        battery_soc_pct=float(t.get("batterySoc", 74.5)),
        battery_temp_c=float(t.get("batteryTempC", 31.5)),
        cumulative_cycles=142
    )
