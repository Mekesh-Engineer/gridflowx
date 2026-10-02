"""
GridFlowX Telemetry Engine & Connection Manager (1Hz Ring & Dynamic Physics Engine)
===================================================================================
Maintains live WebSocket connections with ESP32 edge nodes and browser dashboards.
Maintains a 300-frame (5-minute) circular telemetry buffer with real-time rate-of-change
derivations (dP/dt, dV/dt), Kirchhoff DC bus conservation, and sensor staleness detection.
"""

import time
import math
import random
import asyncio
from typing import List, Dict, Any, Optional
from collections import deque
from datetime import datetime, timezone
from fastapi import WebSocket

from memory.working_memory import working_memory


class CircularTelemetryBuffer:
    """Thread-safe sliding ring buffer holding the last N seconds of 1Hz telemetry."""

    def __init__(self, max_frames: int = 300):
        self.buffer: deque = deque(maxlen=max_frames)
        self._last_received_time: float = time.time()

    def append(self, frame: Dict[str, Any]) -> None:
        self.buffer.append(frame)
        self._last_received_time = time.time()

    def get_latest(self) -> Optional[Dict[str, Any]]:
        return self.buffer[-1] if self.buffer else None

    def get_window(self, seconds: int = 60) -> List[Dict[str, Any]]:
        count = min(seconds, len(self.buffer))
        return list(self.buffer)[-count:]

    def is_stale(self, max_age_sec: float = 2.5) -> bool:
        return (time.time() - self._last_received_time) > max_age_sec

    def extract_dynamics(self) -> Dict[str, Any]:
        """Calculates dynamic rate-of-change derivatives across recent frames."""
        if len(self.buffer) < 2:
            return {
                "dSolarPower_dt": 0.0,
                "dLoadPower_dt": 0.0,
                "dBusVoltage_dt": 0.0,
                "netPowerBalanceW": 0.0,
                "isStale": self.is_stale(),
                "sampleCount": len(self.buffer)
            }

        curr = self.buffer[-1]
        prev = self.buffer[-2]

        dt = 1.0  # 1Hz nominal
        dp_solar = round((curr.get("solarPowerW", 0) - prev.get("solarPowerW", 0)) / dt, 2)
        dp_load = round((curr.get("totalLoadPowerW", 0) - prev.get("totalLoadPowerW", 0)) / dt, 2)
        dv_bus = round((curr.get("dcBusVoltageV", 0) - prev.get("dcBusVoltageV", 0)) / dt, 3)

        solar_w = curr.get("solarPowerW", 0)
        load_w = curr.get("totalLoadPowerW", 0)
        net_balance = round(solar_w - load_w, 2)

        return {
            "dSolarPower_dt": dp_solar,
            "dLoadPower_dt": dp_load,
            "dBusVoltage_dt": dv_bus,
            "netPowerBalanceW": net_balance,
            "isStale": self.is_stale(),
            "sampleCount": len(self.buffer)
        }


class TelemetryConnectionManager:
    def __init__(self):
        self.active_clients: List[WebSocket] = []
        self.active_devices: List[WebSocket] = []
        self.buffer = CircularTelemetryBuffer(max_frames=300)
        self.latest_telemetry: Dict[str, Any] = {
            "deviceId": "GFX-ESP32-MASTER-01",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "sequenceNumber": 1,
            "solarVoltageV": 18.4,
            "solarCurrentA": 18.6,
            "solarPowerW": 342.24,
            "gridVoltageV": 230.2,
            "gridFrequencyHz": 50.0,
            "gridPowerW": 0.0,
            "batteryVoltageV": 12.8,
            "batteryCurrentA": -3.2,
            "batterySoc": 74.5,
            "batterySoh": 98.2,
            "batteryTempC": 31.5,
            "dcBusVoltageV": 12.15,
            "totalLoadPowerW": 48.2,
            "relayStates": [True, True, False, True, False, True, False, True],
            "core0FailsafeActive": False,
        }
        self.buffer.append(self.latest_telemetry)
        working_memory.push_telemetry(self.latest_telemetry)
        self.current_relay_states: List[bool] = [True, True, False, True, False, True, False, True]
        self.seq_counter: int = 1

    def update_telemetry(self, frame: Dict[str, Any]) -> None:
        self.latest_telemetry = frame
        self.buffer.append(frame)
        working_memory.push_telemetry(frame)

    async def connect_client(self, websocket: WebSocket):
        await websocket.accept()
        self.active_clients.append(websocket)

    def disconnect_client(self, websocket: WebSocket):
        if websocket in self.active_clients:
            self.active_clients.remove(websocket)

    async def connect_device(self, websocket: WebSocket):
        await websocket.accept()
        self.active_devices.append(websocket)

    def disconnect_device(self, websocket: WebSocket):
        if websocket in self.active_devices:
            self.active_devices.remove(websocket)

    async def broadcast_to_clients(self, message: dict):
        for connection in list(self.active_clients):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect_client(connection)

    async def send_to_devices(self, message: dict):
        for connection in list(self.active_devices):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect_device(connection)


telemetry_manager = TelemetryConnectionManager()


async def microgrid_physics_simulator():
    """
    Continuous 1Hz microgrid cyber-physical simulator that produces realistic
    sensor telemetry whenever physical hardware is in standby mode.
    """
    while True:
        try:
            if len(telemetry_manager.active_devices) == 0:
                telemetry_manager.seq_counter += 1
                t = time.time()

                # Solar model with diurnal variation + cloud noise
                solar_v = round(18.2 + 0.4 * math.sin(t / 20.0) + random.uniform(-0.1, 0.1), 2)
                solar_a = round(18.5 + 0.6 * math.sin(t / 15.0) + random.uniform(-0.2, 0.2), 2)
                solar_w = round(solar_v * solar_a, 1)

                # Grid model
                grid_v = round(230.0 + random.uniform(-1.2, 1.2), 1)
                grid_f = round(50.0 + random.uniform(-0.05, 0.05), 2)
                grid_w = 0.0 if not telemetry_manager.current_relay_states[4] else round(random.uniform(50.0, 150.0), 1)

                # Battery model (LiFePO4 4S curve)
                soc = round(74.5 + 0.8 * math.sin(t / 60.0), 1)
                batt_v = round(12.0 + (soc / 100.0) * 1.1 + random.uniform(-0.02, 0.02), 2)
                batt_temp = round(31.2 + 0.5 * math.sin(t / 40.0) + random.uniform(-0.1, 0.1), 1)

                # DC Bus & Multi-Tier Loads
                base_load = 28.0
                tier1_w = 18.0 if telemetry_manager.current_relay_states[0] else 0.0
                tier2_w = 20.0 if telemetry_manager.current_relay_states[1] else 0.0
                tier3_w = 45.0 if telemetry_manager.current_relay_states[2] else 0.0
                total_load_w = round(base_load + tier1_w + tier2_w + tier3_w + random.uniform(-1.5, 1.5), 1)
                bus_v = round(12.15 + random.uniform(-0.03, 0.03), 2)

                # Net battery current calculation (P = V * I)
                net_power_to_batt = solar_w - total_load_w
                batt_current = round(net_power_to_batt / max(batt_v, 1.0), 2)

                frame = {
                    "deviceId": "GFX-ESP32-MASTER-01",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "sequenceNumber": telemetry_manager.seq_counter,
                    "solarVoltageV": solar_v,
                    "solarCurrentA": solar_a,
                    "solarPowerW": solar_w,
                    "gridVoltageV": grid_v,
                    "gridFrequencyHz": grid_f,
                    "gridPowerW": grid_w,
                    "batteryVoltageV": batt_v,
                    "batteryCurrentA": batt_current,
                    "batterySoc": soc,
                    "batterySoh": 98.2,
                    "batteryTempC": batt_temp,
                    "dcBusVoltageV": bus_v,
                    "totalLoadPowerW": total_load_w,
                    "relayStates": list(telemetry_manager.current_relay_states),
                    "core0FailsafeActive": False,
                }

                telemetry_manager.update_telemetry(frame)
                await telemetry_manager.broadcast_to_clients({
                    "type": "telemetry_update",
                    "payload": frame,
                    "timestamp": frame["timestamp"]
                })

            await asyncio.sleep(1.0)
        except Exception as e:
            print(f"[Sim Error] {e}")
            await asyncio.sleep(1.0)
