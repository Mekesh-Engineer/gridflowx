"""
GridFlowX Context Manager & Boundary Controller
===============================================
Prevents context pollution by filtering system state to only what is strictly
relevant to the current task. Enforces token budgets and conversation memory limits.
"""

from typing import Dict, Any, List, Optional
from rag.retriever import retriever
from rag.context_builder import context_builder
from memory.working_memory import working_memory


class ContextManager:
    """Manages context assembly, grounding documents, and token budgeting."""

    def __init__(self, max_history_turns: int = 6):
        self.max_history_turns = max_history_turns

    def build_task_context(
        self,
        query: str,
        task_info: Dict[str, Any],
        raw_telemetry: Optional[Dict[str, Any]] = None,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        """
        Builds tightly bounded context:
        - Only relevant telemetry fields based on task_info['telemetryFilter']
        - Retrieved grounding documentation
        - Trimmed conversation history
        """
        raw_telemetry = raw_telemetry or {}
        history = history or []

        # 1. Filter telemetry to relevant keys only
        filtered_telemetry: Dict[str, Any] = {}
        if task_info.get("requiresTelemetry", False):
            filter_keys = task_info.get("telemetryFilter", [])
            if filter_keys:
                for k in filter_keys:
                    if k in raw_telemetry:
                        filtered_telemetry[k] = raw_telemetry[k]
            else:
                # Include standard core values
                core_keys = ["solarPowerW", "loadPowerW", "batteryPowerW", "batterySoc", "gridPowerW"]
                for k in core_keys:
                    if k in raw_telemetry:
                        filtered_telemetry[k] = raw_telemetry[k]

        # 2. Retrieve grounding documentation
        docs = retriever.retrieve(query, top_k=2)
        rag_context = context_builder.build_context(query, docs) if docs else ""

        # 3. Truncate conversation history to last N turns
        recent_history = history[-self.max_history_turns:] if history else []

        return {
            "query": query,
            "operationalLevel": task_info.get("operationalLevel", "MICRO"),
            "primaryIntent": task_info.get("primaryIntent", "GENERAL_QUERY"),
            "telemetry": filtered_telemetry if filtered_telemetry else None,
            "groundingDocs": docs,
            "ragSnippet": rag_context,
            "history": recent_history,
        }


context_manager = ContextManager()
