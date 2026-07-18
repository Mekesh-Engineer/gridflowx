import { fetchFromAIService } from "@/lib/ai";

export interface ForecastDataPoint {
  timestamp: string;
  predictedSolarYieldW: number;
  predictedLoadDemandW: number;
}

export async function fetchSolarAndLoadForecasts(
  deviceId: string,
  token?: string
): Promise<ForecastDataPoint[]> {
  return fetchFromAIService<ForecastDataPoint[]>(`/api/v1/forecast/${deviceId}`, {
    token,
  });
}
