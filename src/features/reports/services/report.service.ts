import { fetchFromAIService } from "@/lib/ai";

export interface ReportMeta {
  reportId: string;
  generatedAt: string;
  status: "pending" | "completed" | "failed";
  downloadUrl?: string;
}

export async function requestOperationalReport(
  startDate: string,
  endDate: string,
  token?: string
): Promise<ReportMeta> {
  return fetchFromAIService<ReportMeta>("/api/v1/reports/request", {
    method: "POST",
    body: { startDate, endDate },
    token,
  });
}
