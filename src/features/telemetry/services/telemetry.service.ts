import { ref, query, orderByChild, equalTo, limitToLast, get } from "firebase/database";
import { db } from "@/lib/firebase";

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
    const telemetryRef = ref(db, "telemetry");
    const q = query(
      telemetryRef,
      orderByChild("deviceId"),
      equalTo(deviceId),
      limitToLast(limitCount)
    );

    const snapshot = await get(q);
    const records: TelemetryRecord[] = [];
    
    snapshot.forEach((child) => {
      records.push({
        id: child.key as string,
        ...child.val(),
      } as TelemetryRecord);
    });

    // Sort descending by timestamp manually since RTDB query limitations
    records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return records;
  } catch (err) {
    console.error("Failed to query historical telemetry:", err);
    throw err;
  }
}
