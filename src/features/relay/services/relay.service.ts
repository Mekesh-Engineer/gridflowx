import { fetchFromAIService } from "@/lib/ai";

export interface OverrideResponse {
  success: boolean;
  message: string;
  relayStates: boolean[];
}

export async function toggleRelayOverride(
  relayIndex: number,
  newState: boolean,
  reason: string,
  token?: string
): Promise<OverrideResponse> {
  return fetchFromAIService<OverrideResponse>("/api/v1/relays/override", {
    method: "POST",
    body: { relayIndex, newState, reason },
    token,
  });
}

export async function triggerEmergencyRecovery(
  reason: string,
  token?: string
): Promise<OverrideResponse> {
  return fetchFromAIService<OverrideResponse>("/api/v1/relays/recovery", {
    method: "POST",
    body: { reason },
    token,
  });
}
