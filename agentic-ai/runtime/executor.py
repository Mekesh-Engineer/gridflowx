"""
GridFlowX Safe Execution Pipeline
=================================
Manages multi-tier model execution, retries, tool execution, and physics fallbacks.
Execution hierarchy:
1. Ollama Cloud (Gemma 4 31B or GPT-OSS 120B)
2. Local Ollama Engine (installed model)
3. Analytical Physics & Deterministic Rule Fallbacks
"""

import time
import asyncio
from typing import Dict, Any, List, Optional, AsyncGenerator

from config.settings import settings
from integrations.ollama_cloud import ollama_cloud_client
from integrations.ollama_local import ollama_local_client
from tools.tool_registry import tool_registry
from safety.validator import CommandValidator


class SafeExecutor:
    """Executes agent queries with retries, tool calls, and resilient fallback chains."""

    def __init__(self):
        self.max_retries = 2
        self.retry_delay_sec = 0.5

    async def execute_task(
        self,
        model_plan: Dict[str, Any],
        context_data: Dict[str, Any],
        fallback_fn: Any,
    ) -> Dict[str, Any]:
        """Executes a non-streaming task through the primary-cloud -> local -> fallback chain."""
        target_model = model_plan.get("model", "gemma4:31b-cloud")
        max_tokens = model_plan.get("maxTokens", 2048)
        temperature = model_plan.get("temperature", 0.2)
        query = context_data.get("query", "")
        system_prompt = self._build_system_prompt(model_plan, context_data)

        # 1. Attempt Primary Ollama Cloud (if configured)
        if ollama_cloud_client.is_configured:
            for attempt in range(self.max_retries):
                try:
                    result = await ollama_cloud_client.generate(
                        model=target_model,
                        prompt=query,
                        system=system_prompt,
                        temperature=temperature,
                        max_tokens=max_tokens,
                    )
                    return {
                        "success": True,
                        "query": query,
                        "reply": result["reply"],
                        "modelUsed": f"{target_model} (Ollama Cloud)",
                        "tier": model_plan.get("tier"),
                        "latencyMs": result.get("latencyMs", 0),
                        "telemetrySnippet": context_data.get("telemetry"),
                    }
                except Exception as cloud_err:
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(self.retry_delay_sec)
                    else:
                        print(f"[AgenticAI Executor] Ollama Cloud attempt failed ({cloud_err}). Falling back...")

        # 2. Attempt Local Ollama (if reachable)
        if await ollama_local_client.is_reachable():
            try:
                available_models = await ollama_local_client.get_available_models()
                local_model = target_model if target_model in available_models else (available_models[0] if available_models else "default")
                result = await ollama_local_client.generate(
                    model=local_model,
                    prompt=query,
                    system=system_prompt,
                    temperature=temperature,
                    num_predict=max_tokens,
                )
                return {
                    "success": True,
                    "query": query,
                    "reply": result["reply"],
                    "modelUsed": f"{local_model} (Local Ollama Engine)",
                    "tier": model_plan.get("tier"),
                    "latencyMs": result.get("latencyMs", 0),
                    "telemetrySnippet": context_data.get("telemetry"),
                }
            except Exception as local_err:
                print(f"[AgenticAI Executor] Local Ollama attempt failed ({local_err}). Using physics fallback.")

        # 3. Deterministic Physics & Heuristic Fallback
        fallback_result = fallback_fn()
        fallback_result["modelUsed"] = f"{target_model} (Physics Baseline Fallback)"
        return fallback_result

    def _build_system_prompt(self, model_plan: Dict[str, Any], context_data: Dict[str, Any]) -> str:
        tier = model_plan.get("tier", "MICRO_FAST")
        system_base = (
            "You are the GridFlowX Production Microgrid AI Copilot.\n"
            f"Mode: {tier}. Respond concisely, accurately, and adhere strictly to cyber-physical safety bounds.\n"
        )
        if context_data.get("telemetry"):
            system_base += f"\nLive Microgrid Telemetry: {context_data['telemetry']}\n"
        if context_data.get("ragSnippet"):
            system_base += f"\nRetrieved Knowledge:\n{context_data['ragSnippet']}\n"
        return system_base


safe_executor = SafeExecutor()
