import { fetchFromAIService } from "@/lib/ai";
import { generateBatteryHealthFallback } from "@/lib/ai-fallbacks";
import { BatteryHealthAnalysis, CellDegradationStatus } from "@/types/ai.types";

export type { BatteryHealthAnalysis, CellDegradationStatus };
export { generateBatteryHealthFallback as getFallbackBatteryHealth };

/**
 * Fetches electrochemical degradation analysis, internal resistance (ESR),
 * thermal stress index, and dynamic C-rate throttling for the BESS pack.
 */
export async function fetchBatteryHealth(
  deviceId: string = "GFX-ESP32-MASTER-01",
  token?: string
): Promise<BatteryHealthAnalysis> {
  try {
    return await fetchFromAIService<BatteryHealthAnalysis>(
      `/api/v1/ai/battery/health?deviceId=${encodeURIComponent(deviceId)}`,
      { token }
    );
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Battery Service] Fetch failed, returning simulated electrochemical fallback:", err);
    }
    return generateBatteryHealthFallback(deviceId);
  }
}
