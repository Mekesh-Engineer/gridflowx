import { fetchFromAIService } from "@/lib/ai";

export interface OptimizationParameters {
  peakStartHour: number;
  peakEndHour: number;
  minChargeSoC: number;
  maxDischargeSoC: number;
}

export interface OptimizationResponse {
  success: boolean;
  message: string;
  parameters: OptimizationParameters;
}

export async function updateOptimizationParameters(
  params: Partial<OptimizationParameters>,
  token?: string
): Promise<OptimizationResponse> {
  return fetchFromAIService<OptimizationResponse>("/api/v1/optimization/parameters", {
    method: "POST",
    body: params,
    token,
  });
}
