"""
GridFlowX Data Repositories (Supabase PostgreSQL & In-Memory Store)
===================================================================
Abstracts data access for telemetry snapshots, relay state transitions, and alerts.
Seamlessly syncs to Supabase PostgreSQL when connected, and maintains an in-memory
circular buffer for high-frequency low-latency local reads.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
from backend.database.supabase_client import supabase_manager
from backend.core.logging import logger


class TelemetryRepository:
    """Manages telemetry historical buffer and Supabase PostgreSQL sync."""

    def __init__(self):
        self.history_buffer: List[Dict[str, Any]] = []
        self.max_buffer_size = 3600  # 1 hour at 1Hz

    def save_telemetry(self, frame: Dict[str, Any]):
        self.history_buffer.append(frame)
        if len(self.history_buffer) > self.max_buffer_size:
            self.history_buffer.pop(0)

        # Sync to Supabase PostgreSQL if connected
        if supabase_manager.is_connected:
            try:
                # Transform to PostgreSQL column schema
                pg_record = {
                    "device_id": frame.get("deviceId", "GFX-ESP32-MASTER-01"),
                    "timestamp": frame.get("timestamp", datetime.now(timezone.utc).isoformat()),
                    "solar_power_w": frame.get("solarPowerW", frame.get("solar_power", 0.0)),
                    "solar_voltage_v": frame.get("solarVoltageV", frame.get("solar_voltage", 0.0)),
                    "solar_current_a": frame.get("solarCurrentA", frame.get("solar_current", 0.0)),
                    "load_power_w": frame.get("loadPowerW", frame.get("load_power", 0.0)),
                    "battery_power_w": frame.get("batteryPowerW", frame.get("battery_power", 0.0)),
                    "battery_soc": frame.get("batterySoc", frame.get("battery_soc", 82.4)),
                    "battery_soh": frame.get("batterySoh", frame.get("battery_soh", 97.2)),
                    "battery_voltage_v": frame.get("batteryVoltageV", frame.get("battery_voltage", 52.5)),
                    "battery_current_a": frame.get("batteryCurrentA", frame.get("battery_current", 0.0)),
                    "battery_temp_c": frame.get("batteryTempC", frame.get("battery_temp", 34.6)),
                    "grid_voltage_v": frame.get("gridVoltageV", frame.get("grid_voltage", 230.7)),
                    "grid_current_a": frame.get("gridCurrentA", frame.get("grid_current", 0.0)),
                    "grid_frequency_hz": frame.get("gridFrequencyHz", frame.get("grid_frequency", 50.0)),
                    "grid_power_w": frame.get("gridPowerW", frame.get("grid_power", 0.0)),
                    "bus_voltage_v": frame.get("busVoltageV", frame.get("bus_voltage", 52.5)),
                    "relay_states": frame.get("relayStates", frame.get("relays", [True, True, True, True, False, False, False, False])),
                    "ambient_temp_c": frame.get("ambientTempC", frame.get("ambient_temp", 28.5)),
                    "is_islanded": frame.get("isIslanded", frame.get("is_islanded", False)),
                }
                supabase_manager.client.table("telemetry").insert(pg_record).execute()
            except Exception as e:
                logger.debug(f"Telemetry sync to Supabase bypassed: {e}")

    def get_latest(self) -> Optional[Dict[str, Any]]:
        return self.history_buffer[-1] if self.history_buffer else None

    def get_history(self, limit: int = 60) -> List[Dict[str, Any]]:
        return self.history_buffer[-limit:]


class RelayAuditRepository:
    """Records every relay state transition with actor, reason, and safety override status."""

    def __init__(self):
        self.audit_log: List[Dict[str, Any]] = []

    def record_transition(
        self,
        relay_index: int,
        previous_state: bool,
        new_state: bool,
        actor_role: str,
        reason: str,
        was_overridden_by_safety: bool = False
    ):
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "relayIndex": relay_index,
            "previousState": previous_state,
            "newState": new_state,
            "actorRole": actor_role,
            "reason": reason,
            "wasSafetyOverridden": was_overridden_by_safety
        }
        self.audit_log.append(entry)
        if len(self.audit_log) > 1000:
            self.audit_log.pop(0)

        # Sync to Supabase PostgreSQL relay_audit table
        if supabase_manager.is_connected:
            try:
                pg_entry = {
                    "device_id": "GFX-ESP32-MASTER-01",
                    "relay_index": relay_index,
                    "previous_state": previous_state,
                    "new_state": new_state,
                    "actor_role": actor_role,
                    "reason": reason,
                    "was_safety_overridden": was_overridden_by_safety,
                    "timestamp": entry["timestamp"],
                }
                supabase_manager.client.table("relay_audit").insert(pg_entry).execute()
            except Exception as e:
                logger.debug(f"Relay audit sync to Supabase bypassed: {e}")

    def get_recent_transitions(self, limit: int = 50) -> List[Dict[str, Any]]:
        return self.audit_log[-limit:]


class AlertRepository:
    """Stores system alerts, safety warnings, and fault notifications."""

    def __init__(self):
        self.alerts: List[Dict[str, Any]] = []

    def add_alert(self, alert: Dict[str, Any]):
        self.alerts.append(alert)
        if len(self.alerts) > 500:
            self.alerts.pop(0)

        # Sync to Supabase PostgreSQL alerts table
        if supabase_manager.is_connected:
            try:
                pg_alert = {
                    "id": alert.get("id", f"ALT-{int(datetime.now(timezone.utc).timestamp())}"),
                    "device_id": alert.get("deviceId", "GFX-ESP32-MASTER-01"),
                    "severity": alert.get("severity", "INFO"),
                    "category": alert.get("category", "SYSTEM"),
                    "title": alert.get("title", alert.get("message", "System Alert")),
                    "message": alert.get("message", ""),
                    "details": alert.get("details", {}),
                    "timestamp": alert.get("timestamp", datetime.now(timezone.utc).isoformat()),
                    "is_acknowledged": alert.get("acknowledged", False),
                }
                supabase_manager.client.table("alerts").upsert(pg_alert).execute()
            except Exception as e:
                logger.debug(f"Alert sync to Supabase bypassed: {e}")

    def get_active_alerts(self) -> List[Dict[str, Any]]:
        return [a for a in self.alerts if not a.get("acknowledged", False)]

    def acknowledge_alert(self, alert_id: str) -> bool:
        for a in self.alerts:
            if a.get("id") == alert_id:
                a["acknowledged"] = True
                a["acknowledgedAt"] = datetime.now(timezone.utc).isoformat()
                if supabase_manager.is_connected:
                    try:
                        supabase_manager.client.table("alerts").update({
                            "is_acknowledged": True,
                            "acknowledged_at": a["acknowledgedAt"]
                        }).eq("id", alert_id).execute()
                    except Exception as e:
                        logger.debug(f"Acknowledge alert sync to Supabase bypassed: {e}")
                return True
        return False


# Singleton repository instances
telemetry_repo = TelemetryRepository()
relay_audit_repo = RelayAuditRepository()
alert_repo = AlertRepository()
