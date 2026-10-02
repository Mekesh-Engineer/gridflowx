"""
GridFlowX Orchestrator Task Router
===================================
Bridges incoming queries and tasks to specialized agents, workflows,
and optimal LLM models (Gemma 4 31B Cloud vs GPT-OSS 120B Cloud).
"""

from typing import Dict, Any, Optional
from runtime.router import model_router, TaskType, ModelTarget
from agents.orchestrator.query_router import query_router, QueryIntentConfig


class OrchestratorTaskRouter:
    """Unified routing layer for tasks, queries, and control workflows."""

    def __init__(self):
        self.model_router = model_router
        self.query_router = query_router

    def route_query(self, query: str, user_role: str = "operator") -> Dict[str, Any]:
        """Routes natural language queries to intents and optimal model."""
        intent_config: QueryIntentConfig = self.query_router.route_query(query, user_role)
        
        # Classify task type for Ollama Cloud
        if intent_config.is_direct_metadata_query:
            task_type = TaskType.METADATA_LOOKUP
        elif "OPTIMIZE" in intent_config.primary_intent:
            task_type = TaskType.DISPATCH_OPTIMIZATION
        elif "ANOMALY" in intent_config.primary_intent or "FAULT" in intent_config.primary_intent:
            task_type = TaskType.FAULT_DIAGNOSTICS
        elif "FORECAST" in intent_config.primary_intent:
            task_type = TaskType.FORECAST_ANALYSIS
        else:
            task_type = TaskType.GENERAL_CHAT

        model_target = self.model_router.route_task(task_type)

        return {
            "query": query,
            "intents": intent_config.intents,
            "primaryIntent": intent_config.primary_intent,
            "requiresTelemetry": intent_config.requires_telemetry,
            "isDirectMetadata": intent_config.is_direct_metadata_query,
            "recommendedModel": model_target.value,
            "taskType": task_type.value,
        }


task_router = OrchestratorTaskRouter()
