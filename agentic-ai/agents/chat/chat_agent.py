"""
GridFlowX Production AI Chat Assistant
======================================
Delegates natural language queries to the local Qwen 2.5 model and LLM service.
"""

import asyncio
from typing import Dict, Any, List, Optional
from agents.base import BaseAgent
from schemas.agents import AgentChatRequest, AgentChatResponse
from services.llm_service import local_llm_service


class ProductionChatAssistant(BaseAgent[AgentChatRequest, AgentChatResponse]):
    def __init__(self):
        super().__init__(
            name="Agentic AI Chat Assistant",
            version="3.0.0",
            role="Conversational assistance & telemetry explanation via local Qwen 2.5"
        )

    async def execute(self, input_data: AgentChatRequest) -> AgentChatResponse:
        history_dicts = [h.model_dump() for h in (input_data.history or [])]
        res = await local_llm_service.generate_grounded_chat(
            query=input_data.query,
            latest_telemetry={},
            history=history_dicts,
            user_role=input_data.role or "operator"
        )
        return AgentChatResponse(**res)

    def generate_response(
        self,
        query: str,
        latest_telemetry: Dict[str, Any],
        history: Optional[List[Dict[str, str]]] = None,
        user_role: str = "operator"
    ) -> Dict[str, Any]:
        """Synchronous wrapper for FastAPI endpoint execution."""
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    return pool.submit(
                        asyncio.run,
                        local_llm_service.generate_grounded_chat(query, latest_telemetry, history, user_role)
                    ).result()
            else:
                return asyncio.run(
                    local_llm_service.generate_grounded_chat(query, latest_telemetry, history, user_role)
                )
        except Exception:
            return local_llm_service._heuristic_fallback(query, latest_telemetry)


chat_agent = ProductionChatAssistant()
production_chat_assistant = chat_agent
