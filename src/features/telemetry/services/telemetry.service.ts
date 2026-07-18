import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
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
    const telemetryRef = collection(db, "telemetry");
    const q = query(
      telemetryRef,
      where("deviceId", "==", deviceId),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const records: TelemetryRecord[] = [];
    
    snapshot.forEach((doc) => {
      records.push({
        id: doc.id,
        ...doc.data(),
      } as TelemetryRecord);
    });

    return records;
  } catch (err) {
    console.error("Failed to query historical telemetry:", err);
    throw err;
  }
}
