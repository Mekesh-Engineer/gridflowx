import { supabase } from "@/lib/supabase/client";

export interface TelemetryRecord {
  id: string;
  deviceId: string;
  timestamp: string;
  solarPowerW: number;
  batteryCurrentA: number;
  batterySoc: number;
  gridPowerW: number;
  busVoltageV: number;
  relayStates: boolean[];
}

export async function fetchHistoricalTelemetry(
  deviceId: string,
  limitCount = 100
): Promise<TelemetryRecord[]> {
  try {
    const { data, error } = await supabase
      .from("telemetry")
      .select("*")
      .eq("device_id", deviceId)
      .order("timestamp", { ascending: false })
      .limit(limitCount);

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: String(row.id),
      deviceId: row.device_id,
      timestamp: row.timestamp,
      solarPowerW: row.solar_power_w ?? 0,
      batteryCurrentA: row.battery_current_a ?? 0,
      batterySoc: row.battery_soc ?? 80,
      gridPowerW: row.grid_power_w ?? 0,
      busVoltageV: row.bus_voltage_v ?? 48,
      relayStates: Array.isArray(row.relay_states) ? row.relay_states : [true, true, true, true, false, false, false, false],
    }));
  } catch (err) {
    console.error("Failed to query historical telemetry from Supabase:", err);
    return [];
  }
}
