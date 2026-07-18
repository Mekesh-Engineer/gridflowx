const AI_SERVICE_BASE = process.env.NEXT_PUBLIC_AI_SERVICE_URL || "http://localhost:8000";

interface AIRequestOptions {
  method?: "GET" | "POST" | "PATCH";
  body?: any;
  headers?: Record<string, string>;
  token?: string;
}

export async function fetchFromAIService<T>(endpoint: string, options: AIRequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {}, token } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  const url = `${AI_SERVICE_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  const response = await fetch(url, {
    method,
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "Unknown error");
    throw new Error(`AI Service Error (${response.status}): ${errorBody}`);
  }

  return response.json() as Promise<T>;
}
