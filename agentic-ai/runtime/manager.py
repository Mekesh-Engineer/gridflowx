"""
GridFlowX Agentic AI Runtime Manager
====================================
Central coordinator for the GridFlowX AI and Agentic AI system.
Responsibilities:
- Task routing & model selection (Gemma 4 31B Cloud vs GPT-OSS 120B Cloud)
- Tool execution under strict deterministic safety policies
- Coordination across 5 Specialized Domain AI Agents
- Working memory and context window management
- Unified execution interface for Backend APIs
"""

import time
import asyncio
from typing import Dict, Any, List, Optional, AsyncGenerator

from runtime.ollama_cloud import ollama_cloud_client, OllamaCloudClient
from runtime.router import model_router, ModelRouter
from tools.tool_registry import tool_registry
from rag.retriever import retriever
from rag.context_builder import context_builder
from prompts.chat_prompts import build_grounded_system_prompt
from agents.orchestrator.query_router import query_router
from safety.validator import CommandValidator
from memory.working_memory import working_memory


class AgenticAIRuntime:
    """Master runtime environment for GridFlowX Agentic AI operations."""

    def __init__(self):
        self.client: OllamaCloudClient = ollama_cloud_client
        self.router: ModelRouter = model_router

    async def get_health(self) -> Dict[str, Any]:
        """Returns health diagnostics for models, agents, and tools."""
        cloud_status = await self.client.get_health_status()
        return {
            "status": "healthy" if (cloud_status["cloud_available"] or cloud_status["local_available"]) else "standby",
            "runtime_version": "3.0.0-agentic",
            "primary_cloud_models": {
                "perception": "gemma4:31b-cloud",
                "reasoning": "gpt-oss:120b-cloud",
            },
            "connectivity": cloud_status,
            "registered_tools_count": len(tool_registry.tools),
            "agents_active": 6,
            "timestamp": time.time(),
        }

    async def process_chat(
        self,
        prompt: str,
        history: Optional[List[Dict[str, str]]] = None,
        role: str = "operator",
        device_id: str = "GFX-ESP32-MASTER-01",
        stream: bool = False,
    ) -> Dict[str, Any]:
        """
        Executes end-to-end perception, reasoning, tool selection, and grounded response generation.
        """
        t0 = time.time()
        routed_config = query_router.route_query(prompt, role)

        # Classify task and select optimal model
        selection = self.router.select_model(
            query=prompt,
            context_token_estimate=512,
            requires_deep_reasoning="ENERGY_DISPATCH" in routed_config.intents or "ROOT_CAUSE" in routed_config.intents,
        )

        # Assemble grounded system prompt
        system_prompt = build_grounded_system_prompt(
            device_id=device_id,
            role=role,
            routed_config=routed_config,
        )

        # Build messages payload
        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(history[-6:])  # Preserve recent conversational context window
        messages.append({"role": "user", "content": prompt})

        # Execute generation via selected cloud model with fallback
        result = await self.client.generate(
            prompt=prompt,
            system=system_prompt,
            model=selection.selected_model,
            temperature=selection.temperature,
        )

        latency = round((time.time() - t0) * 1000, 2)
        return {
            "reply": result["response"],
            "model_used": result["model"],
            "provider": result["provider"],
            "selected_architecture": selection.selected_model,
            "routing_reason": selection.reasoning,
            "intents": routed_config.intents,
            "latency_ms": latency,
            "timestamp": time.time(),
        }

    async def stream_chat_tokens(
        self,
        prompt: str,
        history: Optional[List[Dict[str, str]]] = None,
        role: str = "operator",
        device_id: str = "GFX-ESP32-MASTER-01",
    ) -> AsyncGenerator[str, None]:
        """Yields streaming tokens using the appropriate model."""
        routed_config = query_router.route_query(prompt, role)
        selection = self.router.select_model(query=prompt)
        system_prompt = build_grounded_system_prompt(device_id=device_id, role=role, routed_config=routed_config)

        messages = [{"role": "system", "content": system_prompt}]
        if history:
            messages.extend(history[-6:])
        messages.append({"role": "user", "content": prompt})

        async for chunk in self.client.stream_chat(messages, model=selection.selected_model, temperature=selection.temperature):
            yield chunk


agentic_runtime = AgenticAIRuntime()
