import { fetchFromAIService } from "@/lib/ai";

export interface BatteryStateAnalysis {
  stateOfHealth: number; // Percentage
  temperatureC: number;
  voltageV: number;
  currentA: number;
  internalResistance: number; // Ohms
  cyclesCompleted: number;
  recommendedMaxChargeCurrent: number;
}

export async function fetchBatteryHealthAnalysis(
  deviceId: string,
  token?: string
): Promise<BatteryStateAnalysis> {
  return fetchFromAIService<BatteryStateAnalysis>(`/api/v1/battery/${deviceId}/health`, {
    token,
  });
}
