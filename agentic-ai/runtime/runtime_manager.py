"""
GridFlowX Centralized Agentic AI Runtime Manager
================================================
Coordinates:
- Dynamic model selection (Gemma 4 31B vs GPT-OSS 120B)
- Task classification & complexity analysis
- Context boundaries & RAG memory
- Tool calling & deterministic execution
- Multi-tier resilience: Ollama Cloud -> Local Ollama -> Analytical Physics Fallbacks
- Metrics, logging, and evaluation
"""

import time
from typing import Dict, Any, List, Optional, AsyncGenerator
from datetime import datetime, timezone

from config.settings import settings
from runtime.model_selector import model_selector
from runtime.task_router import task_router
from runtime.context_manager import context_manager
from runtime.executor import safe_executor
from tools.tool_registry import tool_registry
from memory.working_memory import working_memory
from memory.episodic_memory import episodic_memory
from services.telemetry_service import telemetry_manager


class AgenticRuntimeManager:
    """Centralized runtime manager orchestrating all AI agents, models, and tools."""

    def __init__(self):
        self.version = "3.0.0"
        self.is_initialized = True
        self.start_time = datetime.now(timezone.utc).isoformat()

    def get_runtime_status(self) -> Dict[str, Any]:
        """Returns runtime diagnostics, active models, and tool catalog."""
        return {
            "status": "ready",
            "runtimeVersion": self.version,
            "cloudModels": {
                "microFast": settings.model_micro_fast,
                "macroReasoning": settings.model_macro_reasoning,
                "cloudBaseUrl": settings.ollama_cloud_base_url,
                "cloudConfigured": bool(settings.ollama_cloud_api_key),
            },
            "localModel": {
                "baseUrl": settings.ollama_base_url,
                "model": settings.ollama_model_name,
            },
            "totalToolsRegistered": len(tool_registry.tools),
            "tools": list(tool_registry.tools.keys()),
            "startTime": self.start_time,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

    async def execute_query(
        self,
        query: str,
        history: Optional[List[Dict[str, str]]] = None,
        user_role: str = "operator",
        fallback_fn: Optional[Any] = None,
    ) -> Dict[str, Any]:
        """
        Full Agentic execution pipeline:
        1. Task Classification (Micro vs Macro)
        2. Model Selection (Gemma 4 31B vs GPT-OSS 120B)
        3. Context Assembly & Boundary Enforcement
        4. Safe Multi-tier Execution & Tool Layer
        5. Memory Recording & Metrics
        """
        t0 = time.time()
        # 1. Classify Task
        task_info = task_router.classify_task(query, user_role)

        # 2. Select Model
        model_plan = model_selector.select_model(
            task_type="planning" if task_info["operationalLevel"] == "MACRO" else "conversational",
            query=query,
            context=task_info,
        )

        # 3. Assemble Context
        live_telemetry = telemetry_manager.get_latest_telemetry()
        context_data = context_manager.build_task_context(
            query=query,
            task_info=task_info,
            raw_telemetry=live_telemetry,
            history=history,
        )

        # Fallback closure if none provided
        if not fallback_fn:
            from services.llm_service import local_llm_service
            from agents.orchestrator.query_router import query_router
            routed_config = query_router.route_query(query, user_role)
            fallback_fn = lambda: local_llm_service._heuristic_fallback(
                query, live_telemetry, user_role, routed_config
            )

        # 4. Safe Execution
        result = await safe_executor.execute_task(
            model_plan=model_plan,
            context_data=context_data,
            fallback_fn=fallback_fn,
        )

        # 5. Record Memory
        working_memory.add_turn("user", query)
        working_memory.add_turn("assistant", result.get("reply", ""))
        episodic_memory.record_event(
            event_type="AI_QUERY_EXECUTION",
            details={
                "query": query,
                "modelUsed": result.get("modelUsed"),
                "tier": model_plan.get("tier"),
                "durationMs": round((time.time() - t0) * 1000, 1),
            },
        )

        return result


runtime_manager = AgenticRuntimeManager()
