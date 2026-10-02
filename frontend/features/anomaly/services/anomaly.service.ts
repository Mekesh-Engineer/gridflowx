import { fetchFromAIService } from "@/lib/ai";
import { generateAnomalyFallback } from "@/lib/ai-fallbacks";
import { AnomalyDetectionResult, AnomalyItem } from "@/types/ai.types";

export type { AnomalyDetectionResult, AnomalyItem };
export { generateAnomalyFallback };

/**
 * Fetches real-time multivariate anomaly diagnostic report for current telemetry.
 */
export async function fetchLiveAnomalies(token?: string): Promise<AnomalyDetectionResult> {
  try {
    return await fetchFromAIService<AnomalyDetectionResult>("/api/v1/ai/anomaly/live", { token });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Anomaly Service] Live anomaly service offline, using envelope bounds check:", err);
    }
    return generateAnomalyFallback();
  }
}

/**
 * Runs anomaly detection across an arbitrary telemetry frame.
 */
export async function detectAnomaliesForFrame(
  telemetry: Record<string, unknown>,
  token?: string
): Promise<AnomalyDetectionResult> {
  try {
    return await fetchFromAIService<AnomalyDetectionResult>("/api/v1/ai/anomaly/detect", {
      method: "POST",
      body: telemetry,
      token,
    });
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Anomaly Service] Custom frame detector offline, using local statistical model:", err);
    }
    return generateAnomalyFallback("GFX-ESP32-MASTER-01", telemetry);
  }
}

