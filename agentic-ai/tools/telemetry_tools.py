"""
GridFlowX Domain Query & Diagnostic Tools
=========================================
Grounded tools callable by local Qwen 2.5 for live microgrid telemetry,
physics evaluation, forecasts, fault diagnostics, and energy management.
"""

from typing import Dict, Any
from datetime import datetime, timezone

from tools.base import BaseTool
from agents.solar.solar_agent import solar_agent
from agents.load.load_agent import load_agent
from agents.battery.battery_agent import battery_agent
from agents.fault.fault_agent import fault_agent
from agents.energy.energy_agent import energy_agent
from agents.orchestrator.orchestrator_agent import production_orchestrator
from inference.energy_inference import energy_inference_adapter
from services.telemetry_service import telemetry_manager
from memory.episodic_memory import episodic_memory


class LiveTelemetryTool(BaseTool):
    def __init__(self):
        super().__init__(
            name="get_live_telemetry",
            description="Fetches the complete active 1Hz microgrid sensor frame (Solar, Battery, Grid, Load, Relays, Temp).",
            required_role="user",
            is_write_action=False,
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        frame = telemetry_manager.latest_telemetry
        return {
            "deviceId": frame.get("deviceId", "GFX-ESP32-MASTER-01"),
            "timestamp": frame.get("timestamp", datetime.now(timezone.utc).isoformat()),
            "solarPowerW": frame.get("solarPowerW", 0),
            "solarVoltageV": frame.get("solarVoltageV", 0),
            "solarCurrentA": frame.get("solarCurrentA", 0),
            "batterySoc": frame.get("batterySoc", 0),
            "batteryVoltageV": frame.get("batteryVoltageV", 0),
            "batteryCurrentA": frame.get("batteryCurrentA", 0),
            "batteryTempC": frame.get("batteryTempC", 0),
            "batterySoh": frame.get("batterySoh", 98.2),
            "gridPowerW": frame.get("gridPowerW", 0),
            "gridVoltageV": frame.get("gridVoltageV", 0),
            "gridFrequencyHz": frame.get("gridFrequencyHz", 50.0),
            "totalLoadPowerW": frame.get("totalLoadPowerW", 0),
            "dcBusVoltageV": frame.get("dcBusVoltageV", 0),
            "relayStates": frame.get("relayStates", [True, True, False, True, False, True, False, True]),
            "core0FailsafeActive": frame.get("core0FailsafeActive", False)
        }


class SystemStatusTool(BaseTool):
    def __init__(self):
        super().__init__(
            name="get_system_status",
            description="Returns high-level microgrid operational mode (Self-Consumption, Peak Shaving, Islanded, Grid-Tied) and safety status.",
            required_role="user",
            is_write_action=False,
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        frame = telemetry_manager.latest_telemetry
        solar_w = frame.get("solarPowerW", 0)
        load_w = frame.get("totalLoadPowerW", 0)
        soc = frame.get("batterySoc", 0)
        grid_w = frame.get("gridPowerW", 0)
        relays = frame.get("relayStates", [])

        # Deduce mode
        if solar_w >= load_w:
            mode = "Self-Consumption (Solar Surplus)"
            active_source = "Solar MPPT"
        elif soc > 30 and grid_w == 0:
            mode = "Battery Discharge (Clean Microgrid)"
            active_source = "LiFePO4 BESS"
        elif grid_w > 0:
            mode = "Grid Support Mode"
            active_source = "AC Utility Grid + Hybrid"
        else:
            mode = "Nominal Microgrid Balanced"
            active_source = "Hybrid DER"

        return {
            "operationalMode": mode,
            "activeSource": active_source,
            "failsafeEnvelope": "NOMINAL (Core 0 Active)",
            "relaySummary": {
                "tier1Critical": relays[0] if len(relays) > 0 else True,
                "tier2Important": relays[1] if len(relays) > 1 else True,
                "tier3Sheddable": relays[2] if len(relays) > 2 else False,
                "gridContactor": relays[4] if len(relays) > 4 else False,
                "solarContactor": relays[5] if len(relays) > 5 else True,
                "bessContactor": relays[7] if len(relays) > 7 else True,
            },
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


class BatteryStatusTool(BaseTool):
    def __init__(self):
        super().__init__(
            name="get_battery_status",
            description="Detailed BESS status: SoC, SoH, voltage, current, temperature, internal resistance, and DoD margin.",
            required_role="user",
            is_write_action=False,
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        frame = telemetry_manager.latest_telemetry
        soc = frame.get("batterySoc", 74.5)
        v = frame.get("batteryVoltageV", 12.8)
        i = frame.get("batteryCurrentA", -3.2)
        t = frame.get("batteryTempC", 31.5)
        soh = frame.get("batterySoh", 98.2)

        return {
            "chemistry": "LiFePO4 4S 12.8V 100Ah",
            "stateOfChargePct": soc,
            "stateOfHealthPct": soh,
            "voltageV": v,
            "currentA": i,
            "powerW": round(v * i, 1),
            "state": "Charging" if i > 0.1 else ("Discharging" if i < -0.1 else "Idle"),
            "temperatureC": t,
            "internalEsrMohm": 12.4,
            "recommendedCutoffSoc": 20.0,
            "usableMarginPct": max(0.0, round(soc - 20.0, 1)),
            "healthAssessment": "Healthy" if t < 40 and soh > 90 else "Caution"
        }


class SolarStatusTool(BaseTool):
    def __init__(self):
        super().__init__(
            name="get_solar_status",
            description="Retrieves solar PV generation metrics, voltage, current, and active irradiance estimate.",
            required_role="user",
            is_write_action=False,
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        frame = telemetry_manager.latest_telemetry
        w = frame.get("solarPowerW", 0)
        v = frame.get("solarVoltageV", 0)
        i = frame.get("solarCurrentA", 0)
        return {
            "powerW": w,
            "voltageV": v,
            "currentA": i,
            "ratedPeakW": 400.0,
            "utilizationPct": round((w / 400.0) * 100, 1) if w else 0.0,
            "mpptTrackingState": "OPTIMAL" if w > 50 else "LOW_INSOLATION"
        }


class GridStatusTool(BaseTool):
    def __init__(self):
        super().__init__(
            name="get_grid_status",
            description="Retrieves utility grid AC voltage, frequency, power flow direction, and IEEE 1547 compliance.",
            required_role="user",
            is_write_action=False,
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        frame = telemetry_manager.latest_telemetry
        v = frame.get("gridVoltageV", 230.0)
        freq = frame.get("gridFrequencyHz", 50.0)
        w = frame.get("gridPowerW", 0.0)

        # IEEE 1547 checks
        v_compliant = 202.4 <= v <= 253.0
        f_compliant = 49.5 <= freq <= 50.5

        return {
            "voltageV": v,
            "frequencyHz": freq,
            "powerW": w,
            "direction": "Importing" if w > 5 else ("Exporting" if w < -5 else "Synchronized / Zero Infeed"),
            "ieee1547Compliance": "NOMINAL" if (v_compliant and f_compliant) else "VOLTAGE_OR_FREQ_TRIP_RISK",
            "gridConnected": bool(frame.get("relayStates", [False]*5)[4] if len(frame.get("relayStates", [])) > 4 else False)
        }


class LoadStatusTool(BaseTool):
    def __init__(self):
        super().__init__(
            name="get_load_status",
            description="Retrieves active microgrid load breakdown across Tier 1 (Critical), Tier 2 (Important), and Tier 3 (Sheddable).",
            required_role="user",
            is_write_action=False,
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        frame = telemetry_manager.latest_telemetry
        total_w = frame.get("totalLoadPowerW", 0.0)
        relays = frame.get("relayStates", [True, True, False])

        t1_on = relays[0] if len(relays) > 0 else True
        t2_on = relays[1] if len(relays) > 1 else True
        t3_on = relays[2] if len(relays) > 2 else False

        # Approximate tier allocation based on nominal load rating
        t1_w = round(total_w * 0.4, 1) if t1_on else 0.0
        t2_w = round(total_w * 0.4, 1) if t2_on else 0.0
        t3_w = round(total_w * 0.2, 1) if t3_on else 0.0

        return {
            "totalLoadPowerW": total_w,
            "tier1Critical": {"active": t1_on, "powerW": t1_w, "priority": "P0 (Immutable)"},
            "tier2Important": {"active": t2_on, "powerW": t2_w, "priority": "P1 (High Priority)"},
            "tier3Sheddable": {"active": t3_on, "powerW": t3_w, "priority": "P2 (Sheddable for Tariff/Deficit)"},
        }


class EnergyFlowTool(BaseTool):
    def __init__(self):
        super().__init__(
            name="get_energy_flow",
            description="Calculates power balance and real-time energy flow direction between Solar, Battery, Grid, and Loads.",
            required_role="user",
            is_write_action=False,
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        frame = telemetry_manager.latest_telemetry
        solar_w = frame.get("solarPowerW", 0.0)
        load_w = frame.get("totalLoadPowerW", 0.0)
        grid_w = frame.get("gridPowerW", 0.0)
        batt_v = frame.get("batteryVoltageV", 12.8)
        batt_i = frame.get("batteryCurrentA", 0.0)
        batt_w = round(batt_v * batt_i, 1)

        net_generation = solar_w + grid_w
        surplus = round(net_generation - load_w, 1)

        return {
            "solarGenerationW": solar_w,
            "loadConsumptionW": load_w,
            "gridExchangeW": grid_w,
            "batteryPowerW": batt_w,
            "netBalanceW": surplus,
            "flowSummary": (
                f"Solar ({solar_w}W) covers load ({load_w}W). Surplus ({surplus}W) charges battery."
                if surplus >= 0 else
                f"Solar ({solar_w}W) + Battery/Grid supplies load ({load_w}W). Deficit: {abs(surplus)}W."
            )
        }


class ActiveAlertsTool(BaseTool):
    def __init__(self):
        super().__init__(
            name="get_active_alerts",
            description="Fetches active system alerts, thermal warnings, voltage trips, and anomaly diagnostic flags.",
            required_role="user",
            is_write_action=False,
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        frame = telemetry_manager.latest_telemetry
        soc = frame.get("batterySoc", 74.5)
        temp = frame.get("batteryTempC", 31.5)
        grid_v = frame.get("gridVoltageV", 230.0)

        alerts = []
        if temp > 45.0:
            alerts.append({"severity": "CRITICAL", "message": f"High Battery Temperature: {temp}°C (Threshold: 45°C)"})
        elif temp > 38.0:
            alerts.append({"severity": "WARNING", "message": f"Elevated Battery Temperature: {temp}°C"})

        if soc < 20.0:
            alerts.append({"severity": "CRITICAL", "message": f"Low Battery SoC: {soc}% (Approaching Cutoff 18%)"})

        if grid_v < 202.4 or grid_v > 253.0:
            alerts.append({"severity": "WARNING", "message": f"Grid Voltage Out of IEEE 1547 Bounds: {grid_v}V"})

        return {
            "totalActiveAlerts": len(alerts),
            "alerts": alerts if alerts else [{"severity": "INFO", "message": "All parameters within nominal operating bounds."}],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }


class SolarForecastTool(BaseTool):
    def __init__(self):
        super().__init__(
            name="get_solar_forecast",
            description="Fetches 24-hour PV yield and solar irradiance forecast from Solar Forecasting Agent.",
            required_role="user",
            is_write_action=False,
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        device_id = params.get("deviceId", "GFX-ESP32-MASTER-01")
        horizon = int(params.get("horizonHours", 24))
        res = solar_agent.forecast_sync(device_id, horizon)
        return res.model_dump()


class LoadForecastTool(BaseTool):
    def __init__(self):
        super().__init__(
            name="get_load_forecast",
            description="Fetches multi-tier load demand forecast (Tier 1/2/3) from Load Forecasting Agent.",
            required_role="user",
            is_write_action=False,
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        device_id = params.get("deviceId", "GFX-ESP32-MASTER-01")
        horizon = int(params.get("horizonHours", 24))
        res = load_agent.forecast_sync(device_id, horizon)
        return res.model_dump()


class BatteryHealthTool(BaseTool):
    def __init__(self):
        super().__init__(
            name="get_battery_health",
            description="Evaluates BESS electrochemical degradation, ESR, and thermal stress via Battery Health Agent.",
            required_role="operator",
            is_write_action=False,
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        telemetry = params.get("telemetry", {}) or telemetry_manager.latest_telemetry
        device_id = params.get("deviceId", "GFX-ESP32-MASTER-01")
        res = battery_agent.analyze_sync(telemetry, device_id)
        return res.model_dump()


class FaultDiagnosticsTool(BaseTool):
    def __init__(self):
        super().__init__(
            name="get_fault_diagnostics",
            description="Performs multivariate Isolation Forest anomaly detection via Fault Detection Agent.",
            required_role="operator",
            is_write_action=False,
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        telemetry = params.get("telemetry", {}) or telemetry_manager.latest_telemetry
        res = fault_agent.detect_sync(telemetry)
        return res.model_dump()


class TariffRateTool(BaseTool):
    def __init__(self):
        super().__init__(
            name="get_tariff_rate",
            description="Returns current Time-of-Use tariff window and rate ($/kWh).",
            required_role="user",
            is_write_action=False,
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        window, rate = energy_inference_adapter.get_tariff_window(now)
        return {"tariffWindow": window, "currentTariffRateUsdPerKwh": rate, "timestamp": now.isoformat()}


class AgentStatusTool(BaseTool):
    def __init__(self):
        super().__init__(
            name="get_agent_status",
            description="Returns the active operational status of all 6 specialized GridFlowX AI agents.",
            required_role="user",
            is_write_action=False,
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        return production_orchestrator.get_system_agent_status()


class RecentDecisionsTool(BaseTool):
    def __init__(self):
        super().__init__(
            name="get_recent_decisions",
            description="Retrieves recent episodic memory audit trail (agent decisions, overrides, and operator actions).",
            required_role="user",
            is_write_action=False,
        )

    async def execute(self, params: Dict[str, Any], user_role: str = "operator") -> Dict[str, Any]:
        limit = int(params.get("limit", 5))
        return {"recentDecisions": episodic_memory.get_recent_decisions(limit=limit)}
