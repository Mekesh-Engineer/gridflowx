import { fetchFromAIService } from "@/lib/ai";
import {
  generateSolarForecastFallback,
  generateLoadForecastFallback,
  generateForecastAccuracyFallback,
} from "@/lib/ai-fallbacks";
import {
  SolarForecastResult,
  SolarForecastPoint,
  LoadForecastResult,
  LoadForecastPoint,
  ForecastAccuracyMetrics,
} from "@/types/ai.types";

export type {
  SolarForecastResult,
  SolarForecastPoint,
  LoadForecastResult,
  LoadForecastPoint,
  ForecastAccuracyMetrics,
};
export {
  generateSolarForecastFallback,
  generateLoadForecastFallback,
  generateForecastAccuracyFallback,
};

/**
 * Fetches physical GHI and solar PV yield predictions for a given horizon.
 */
export async function fetchSolarForecast(
  deviceId: string = "GFX-ESP32-MASTER-01",
  horizonHours: number = 24,
  token?: string
): Promise<SolarForecastResult> {
  try {
    return await fetchFromAIService<SolarForecastResult>(
      `/api/v1/ai/forecast/solar?deviceId=${encodeURIComponent(deviceId)}&horizonHours=${horizonHours}`,
      { token }
    );
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Forecast Service] Live solar forecast unavailable, using physics model:", err);
    }
    return generateSolarForecastFallback(deviceId, horizonHours);
  }
}

/**
 * Fetches multi-tier microgrid load demand forecasts (Tier 1/2/3).
 */
export async function fetchLoadForecast(
  deviceId: string = "GFX-ESP32-MASTER-01",
  horizonHours: number = 24,
  token?: string
): Promise<LoadForecastResult> {
  try {
    return await fetchFromAIService<LoadForecastResult>(
      `/api/v1/ai/forecast/load?deviceId=${encodeURIComponent(deviceId)}&horizonHours=${horizonHours}`,
      { token }
    );
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Forecast Service] Live load forecast unavailable, using ARIMA baseline model:", err);
    }
    return generateLoadForecastFallback(deviceId, horizonHours);
  }
}

/**
 * Fetches empirical error evaluation metrics (MAE, MAPE, RMSE, R²).
 */
export async function fetchForecastAccuracy(
  deviceId: string = "GFX-ESP32-MASTER-01",
  token?: string
): Promise<ForecastAccuracyMetrics> {
  try {
    return await fetchFromAIService<ForecastAccuracyMetrics>(
      `/api/v1/ai/forecast/accuracy?deviceId=${encodeURIComponent(deviceId)}`,
      { token }
    );
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Forecast Service] Live accuracy telemetry unavailable, using calibrated metrics:", err);
    }
    return generateForecastAccuracyFallback(deviceId);
  }
}

