"""
GridFlowX Ollama Cloud Integration Client
=========================================
Direct API client for Ollama Cloud (https://cloud.ollama.ai/v1 or custom gateway).
Supports dual cloud models:
- gemma4:31b-cloud (Micro-fast operational intelligence & real-time telemetry QA)
- gpt-oss:120b-cloud (Macro-level reasoning, complex multi-agent planning & optimization)
"""

import os
import json
import time
import httpx
from typing import Dict, Any, List, Optional, AsyncGenerator

from config.settings import settings


class OllamaCloudClient:
    """Client for Ollama Cloud inference with streaming, tool calling, and fallback support."""

    def __init__(self):
        self.api_key = settings.ollama_cloud_api_key or os.getenv("OLLAMA_CLOUD_API_KEY", "")
        self.base_url = (settings.ollama_cloud_base_url or os.getenv("OLLAMA_CLOUD_BASE_URL", "https://cloud.ollama.ai/v1")).rstrip("/")
        self.model_micro = settings.model_micro_fast or "gemma4:31b-cloud"
        self.model_macro = settings.model_macro_reasoning or "gpt-oss:120b-cloud"
        self.timeout_sec = float(os.getenv("AI_INFERENCE_TIMEOUT_MS", "30000")) / 1000.0

    @property
    def is_configured(self) -> bool:
        """Returns True if Ollama Cloud API key is configured."""
        return bool(self.api_key and self.api_key.strip())

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "GridFlowX-AgenticAI/3.0.0",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    async def generate(
        self,
        model: str,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> Dict[str, Any]:
        """Performs non-streaming completion against Ollama Cloud."""
        if not self.is_configured:
            raise ConnectionError("Ollama Cloud API Key is not configured.")

        url = f"{self.base_url}/chat/completions"
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": False,
        }

        t0 = time.time()
        async with httpx.AsyncClient(timeout=self.timeout_sec) as client:
            response = await client.post(url, headers=self._get_headers(), json=payload)
            if response.status_code != 200:
                raise RuntimeError(f"Ollama Cloud HTTP {response.status_code}: {response.text}")
            data = response.json()
            latency_ms = round((time.time() - t0) * 1000, 1)

            reply = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            return {
                "reply": reply,
                "model": model,
                "latencyMs": latency_ms,
                "usage": data.get("usage", {}),
            }

    async def stream_chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        max_tokens: int = 2048,
    ) -> AsyncGenerator[str, None]:
        """Streams token-by-token completion from Ollama Cloud."""
        if not self.is_configured:
            raise ConnectionError("Ollama Cloud API Key is not configured.")

        url = f"{self.base_url}/chat/completions"
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }

        async with httpx.AsyncClient(timeout=self.timeout_sec) as client:
            async with client.stream("POST", url, headers=self._get_headers(), json=payload) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    raise RuntimeError(f"Ollama Cloud Stream HTTP {response.status_code}: {error_text.decode('utf-8', errors='ignore')}")

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data_str)
                            delta = chunk.get("choices", [{}])[0].get("delta", {}).get("content", "")
                            if delta:
                                yield delta
                        except Exception:
                            continue


ollama_cloud_client = OllamaCloudClient()
