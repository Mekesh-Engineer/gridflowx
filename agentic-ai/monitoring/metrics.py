"""
GridFlowX AI Telemetry & Inference Metrics
==========================================
Collects runtime metrics: inference latency, token usage, tool invocations, and error rates.
"""

import time
from typing import Dict, Any, List
from collections import deque


class AIMetricsCollector:
    def __init__(self, buffer_size: int = 100):
        self.latency_history = deque(maxlen=buffer_size)
        self.tool_invocations: Dict[str, int] = {}
        self.model_requests: Dict[str, int] = {}
        self.total_queries = 0
        self.total_errors = 0

    def record_query(self, model: str, latency_ms: float, tools_used: List[str] = None):
        self.total_queries += 1
        self.latency_history.append(latency_ms)
        self.model_requests[model] = self.model_requests.get(model, 0) + 1

        if tools_used:
            for tool in tools_used:
                self.tool_invocations[tool] = self.tool_invocations.get(tool, 0) + 1

    def record_error(self):
        self.total_errors += 1

    def get_summary(self) -> Dict[str, Any]:
        latencies = list(self.latency_history)
        avg_latency = round(sum(latencies) / len(latencies), 1) if latencies else 0.0
        return {
            "totalQueries": self.total_queries,
            "totalErrors": self.total_errors,
            "avgLatencyMs": avg_latency,
            "recentLatencyP95": round(sorted(latencies)[int(len(latencies) * 0.95)], 1) if len(latencies) >= 5 else avg_latency,
            "modelRequests": self.model_requests,
            "topTools": self.tool_invocations,
        }


ai_metrics = AIMetricsCollector()
