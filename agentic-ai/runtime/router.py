"""
GridFlowX Model Router & Task Classifier
========================================
Implements dynamic task classification and optimal model selection between:
- gemma4:31b-cloud   (Low latency, perceived telemetry monitoring, live diagnostics, operator chat)
- gpt-oss:120b-cloud  (Deep multi-step reasoning, mathematical dispatch planning, RAG synthesis, root-cause analysis)
"""

from typing import Dict, Any, List, Optional
from enum import Enum


class TaskComplexity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class TaskType(str, Enum):
    GENERAL_CHAT = "GENERAL_CHAT"
    METADATA_LOOKUP = "METADATA_LOOKUP"
    TELEMETRY_STATUS = "TELEMETRY_STATUS"
    FORECAST_ANALYSIS = "FORECAST_ANALYSIS"
    FAULT_DIAGNOSTICS = "FAULT_DIAGNOSTICS"
    DISPATCH_OPTIMIZATION = "DISPATCH_OPTIMIZATION"
    SAFETY_VERIFICATION = "SAFETY_VERIFICATION"


class ModelTarget(str, Enum):
    GEMMA4_31B = "gemma4:31b-cloud"
    GPT_OSS_120B = "gpt-oss:120b-cloud"
    LOCAL_QWEN = "qwen2.5:3b"


class ModelSelectionResult:
    def __init__(
        self,
        selected_model: str,
        reasoning: str,
        complexity: TaskComplexity,
        timeout_sec: float,
        temperature: float,
    ):
        self.selected_model = selected_model
        self.reasoning = reasoning
        self.complexity = complexity
        self.timeout_sec = timeout_sec
        self.temperature = temperature

    def to_dict(self) -> Dict[str, Any]:
        return {
            "selected_model": self.selected_model,
            "reasoning": self.reasoning,
            "complexity": self.complexity.value,
            "timeout_sec": self.timeout_sec,
            "temperature": self.temperature,
        }


class ModelRouter:
    """Intelligently routes AI requests based on prompt complexity, context size, and latency constraints."""

    # Keywords associated with deep multi-step planning and policy optimization
    DEEP_REASONING_KEYWORDS = {
        "optimize", "dispatch", "arbitrage", "schedule", "long-term", "degradation",
        "arrhenius", "multi-objective", "plan", "root-cause", "bifurcation",
        "policy", "reinforcement learning", "simulation", "synthesis", "audit"
    }

    # Keywords associated with rapid perceptual telemetry lookups
    PERCEPTION_KEYWORDS = {
        "status", "live", "voltage", "current", "power", "solar", "battery",
        "soc", "soh", "temperature", "relay", "toggle", "override", "ping",
        "developer", "who created", "who built", "version", "health"
    }

    def select_model(
        self,
        query: str,
        context_token_estimate: int = 256,
        requires_deep_reasoning: bool = False,
        latency_critical: bool = False,
    ) -> ModelSelectionResult:
        """
        Classifies incoming task and routes to gemma4:31b-cloud or gpt-oss:120b-cloud.
        """
        query_lower = query.lower()

        # Check explicit overrides
        if latency_critical:
            return ModelSelectionResult(
                selected_model="gemma4:31b-cloud",
                reasoning="Latency-critical operation requires fast perception model (Gemma 4 31B Cloud).",
                complexity=TaskComplexity.LOW,
                timeout_sec=10.0,
                temperature=0.1,
            )

        if requires_deep_reasoning or context_token_estimate > 2048:
            return ModelSelectionResult(
                selected_model="gpt-oss:120b-cloud",
                reasoning="High context size / complex reasoning requires high-capacity model (GPT-OSS 120B Cloud).",
                complexity=TaskComplexity.HIGH,
                timeout_sec=45.0,
                temperature=0.2,
            )

        # Keyword-based heuristics
        deep_matches = sum(1 for kw in self.DEEP_REASONING_KEYWORDS if kw in query_lower)
        perception_matches = sum(1 for kw in self.PERCEPTION_KEYWORDS if kw in query_lower)

        if deep_matches >= 2:
            return ModelSelectionResult(
                selected_model="gpt-oss:120b-cloud",
                reasoning=f"Query matched {deep_matches} deep reasoning keywords (selected GPT-OSS 120B Cloud).",
                complexity=TaskComplexity.HIGH,
                timeout_sec=35.0,
                temperature=0.2,
            )

        # Default fast path
        return ModelSelectionResult(
            selected_model="gemma4:31b-cloud",
            reasoning="Standard operational dialogue and telemetry perception routed to Gemma 4 31B Cloud.",
            complexity=TaskComplexity.MEDIUM if deep_matches == 1 else TaskComplexity.LOW,
            timeout_sec=15.0,
            temperature=0.2,
        )

    def route_task(self, task_type: TaskType) -> ModelTarget:
        """Determines model target from classified task type."""
        if task_type in (TaskType.DISPATCH_OPTIMIZATION, TaskType.FAULT_DIAGNOSTICS):
            return ModelTarget.GPT_OSS_120B
        return ModelTarget.GEMMA4_31B


model_router = ModelRouter()
