"""
GridFlowX Telemetry & Cyber-Physical Simulation Service
======================================================
Produces high-fidelity, real-time 1Hz sensor telemetry frames simulating:
- Solar PV generation (clear sky curve + atmospheric variation)
- Battery state (Coulomb counting, internal resistance voltage drop, thermal rise)
- Dynamic load curves across 4 tiers
- AC Grid interface with realistic voltage/frequency fluctuations
"""

import math
import time
import asyncio
from typing import Dict, Any, List
from datetime import datetime, timezone
from backend.websocket.connection_manager import ws_manager
from backend.database.repositories import telemetry_repo


class TelemetryService:
    """Manages real-time telemetry state and hardware/simulation feeds."""

    def __init__(self):
        self.device_id = "GFX-ESP32-MASTER-01"
        self.relay_states = [True, True, True, True, False, False, False, False]
        self.battery_soc = 82.4
        self.battery_soh = 97.2
        self.battery_temp = 29.5
        self.sim_tick = 0
        self.latest_frame: Dict[str, Any] = self._generate_frame()

    def get_latest_telemetry(self) -> Dict[str, Any]:
        return self.latest_frame

    def update_relay_states(self, new_states: List[bool]):
        self.relay_states = list(new_states)
        self.latest_frame["relayStates"] = self.relay_states

    def _generate_frame(self) -> Dict[str, Any]:
        self.sim_tick += 1
        t = self.sim_tick

        # Diurnal Solar Profile (simulated peak around midday)
        hour = (datetime.now().hour + datetime.now().minute / 60.0)
        solar_elevation = max(0.0, math.sin(math.pi * (hour - 6.0) / 12.0)) if 6.0 <= hour <= 18.0 else 0.0
        cloud_factor = 0.95 + 0.05 * math.sin(t / 15.0)
        irradiance = round(1000.0 * solar_elevation * cloud_factor, 1)
        solar_power = round(irradiance * 3.5, 1)  # 3.5 kWp array
        solar_voltage = round(380.0 + 10.0 * math.sin(t / 20.0), 1) if solar_power > 0 else 0.0
        solar_current = round(solar_power / max(1.0, solar_voltage), 2)

        # Dynamic Load Tiers based on active relays
        t1 = 450.0 if self.relay_states[0] else 0.0
        t2 = 380.0 if self.relay_states[1] else 0.0
        t3 = 620.0 if self.relay_states[2] else 0.0
        t4 = 1100.0 if self.relay_states[3] else 0.0
        base_load = t1 + t2 + t3 + t4 + 80.0 * math.sin(t / 30.0)
        load_power = round(max(200.0, base_load), 1)
        load_voltage = round(230.0 + 1.5 * math.sin(t / 10.0), 1)
        load_current = round(load_power / max(1.0, load_voltage), 2)

        # Battery Balance: Net power = Solar - Load
        net = solar_power - load_power
        if net > 0:
            # Solar charging battery
            battery_power = min(net, 2500.0)
            self.battery_soc = min(100.0, self.battery_soc + (battery_power / 10000.0) * 0.05)
            battery_current = round(battery_power / 51.2, 2)
        else:
            # Discharging battery
            battery_power = max(net, -3000.0)
            self.battery_soc = max(15.0, self.battery_soc - (abs(battery_power) / 10000.0) * 0.05)
            battery_current = round(battery_power / 51.2, 2)

        battery_voltage = round(51.2 + (self.battery_soc - 50.0) * 0.04, 2)
        self.battery_temp = round(28.0 + (abs(battery_current) / 30.0) * 4.0, 1)

        # AC Grid Balance
        grid_power = round(max(0.0, load_power - solar_power - max(0.0, -battery_power)), 1)
        grid_voltage = round(230.5 + 2.0 * math.sin(t / 8.0), 1)
        grid_freq = round(50.0 + 0.04 * math.sin(t / 12.0), 2)
        grid_current = round(grid_power / max(1.0, grid_voltage), 2)

        frame = {
            "deviceId": self.device_id,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "gridVoltage": grid_voltage,
            "gridCurrent": grid_current,
            "gridFrequency": grid_freq,
            "gridPower": grid_power,
            "solarVoltage": solar_voltage,
            "solarCurrent": solar_current,
            "solarPower": solar_power,
            "solarIrradiance": irradiance,
            "batteryVoltage": battery_voltage,
            "batteryCurrent": battery_current,
            "batteryPower": round(battery_power, 1),
            "batterySoc": round(self.battery_soc, 1),
            "batterySoh": self.battery_soh,
            "batteryTemp": self.battery_temp,
            "loadVoltage": load_voltage,
            "loadCurrent": load_current,
            "loadPower": load_power,
            "tier1LoadW": t1,
            "tier2LoadW": t2,
            "tier3LoadW": t3,
            "tier4LoadW": t4,
            "relayStates": list(self.relay_states),
            "isIslanded": False,
            "ambientTemp": 28.5,
        }
        return frame


telemetry_service = TelemetryService()


async def microgrid_physics_simulator():
    """1Hz async broadcast loop feeding WebSockets and historical persistence."""
    while True:
        try:
            frame = telemetry_service._generate_frame()
            telemetry_service.latest_frame = frame
            telemetry_repo.save_telemetry(frame)
            await ws_manager.broadcast(frame, channel="telemetry")
        except Exception as e:
            pass
        await asyncio.sleep(1.0)
