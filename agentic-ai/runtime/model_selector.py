"""
GridFlowX Dynamic Model Selector
================================
Selects between primary cloud models based on task classification:
1. gemma4:31b-cloud:
   - Micro-Level: Real-time telemetry Q&A, fast sensor state explanation, rapid anomaly alerts, quick status reports.
   - Low latency, high throughput.
2. gpt-oss:120b-cloud:
   - Macro-Level: Complex multi-agent workflow orchestration, deep economic tariff optimization,
     hierarchical goal decomposition, safety policy verification, root-cause diagnostics.
   - High reasoning capacity, comprehensive multi-step context.
"""

from typing import Dict, Any, Optional
from config.settings import settings


class ModelSelector:
    """Intelligent selector determining whether to dispatch to Gemma 4 (31B) or GPT-OSS (120B)."""

    def __init__(self):
        self.micro_model = settings.model_micro_fast or "gemma4:31b-cloud"
        self.macro_model = settings.model_macro_reasoning or "gpt-oss:120b-cloud"

    def select_model(self, task_type: str, query: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Evaluates task attributes to return the target model name and reasoning tier.
        """
        q_lower = query.lower()
        context = context or {}

        # 1. Macro-Level triggers (Deep Reasoning / Complex Workflows)
        macro_indicators = [
            "plan", "decompose", "strategy", "optimize", "economic", "tariff",
            "dispatch schedule", "arbitrage", "root cause", "post-mortem",
            "supervisory", "multi-step", "workflow", "policy review", "audit compliance"
        ]

        if task_type in ("planning", "optimization", "deep_diagnostics", "supervisory_review"):
            return {
                "model": self.macro_model,
                "tier": "MACRO_REASONING",
                "rationale": f"Task type '{task_type}' requires comprehensive reasoning and multi-step evaluation.",
                "maxTokens": 4096,
                "temperature": 0.1,
            }

        for indicator in macro_indicators:
            if indicator in q_lower:
                return {
                    "model": self.macro_model,
                    "tier": "MACRO_REASONING",
                    "rationale": f"Query contains macro reasoning trigger '{indicator}'.",
                    "maxTokens": 4096,
                    "temperature": 0.1,
                }

        # 2. Micro-Level default (Fast Telemetry / Conversational Copilot)
        return {
            "model": self.micro_model,
            "tier": "MICRO_FAST",
            "rationale": "Micro-level fast operational query routed to lightweight low-latency cloud model.",
            "maxTokens": 1024,
            "temperature": 0.2,
        }


model_selector = ModelSelector()
