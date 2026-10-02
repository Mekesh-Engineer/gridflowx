"""
GridFlowX Local Ollama Daemon Integration Client
================================================
Client connecting to local Ollama inference server (default: http://127.0.0.1:11434).
Serves as robust offline fallback when cloud connectivity is unavailable.
"""

import os
import json
import time
import httpx
from typing import Dict, Any, List, Optional, AsyncGenerator

from config.settings import settings


class OllamaLocalClient:
    """Client for local Ollama server running on the edge or developer workstation."""

    def __init__(self):
        self.base_url = (settings.ollama_base_url or os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")).rstrip("/")
        self.preferred_model = settings.ollama_model_name or "gemma4:31b-cloud"
        self.timeout_sec = float(settings.ollama_timeout_sec or 60.0)

    async def is_reachable(self) -> bool:
        """Probes the local Ollama server tags endpoint."""
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                return res.status_code == 200
        except Exception:
            return False

    async def get_available_models(self) -> List[str]:
        """Lists all locally installed models."""
        try:
            async with httpx.AsyncClient(timeout=2.5) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    return [m.get("name", "") for m in data.get("models", []) if m.get("name")]
        except Exception:
            pass
        return []

    async def generate(
        self,
        model: str,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.2,
        num_predict: int = 2048,
    ) -> Dict[str, Any]:
        """Generates completion using local Ollama /api/generate or /api/chat."""
        url = f"{self.base_url}/api/chat"
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "num_predict": num_predict,
            },
        }

        t0 = time.time()
        async with httpx.AsyncClient(timeout=self.timeout_sec) as client:
            response = await client.post(url, json=payload)
            if response.status_code != 200:
                raise RuntimeError(f"Local Ollama HTTP {response.status_code}: {response.text}")
            data = response.json()
            latency_ms = round((time.time() - t0) * 1000, 1)

            reply = data.get("message", {}).get("content", "")
            return {
                "reply": reply,
                "model": model,
                "latencyMs": latency_ms,
                "totalDurationNs": data.get("total_duration", 0),
            }

    async def stream_chat(
        self,
        model: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.2,
        num_predict: int = 2048,
    ) -> AsyncGenerator[str, None]:
        """Streams token-by-token completion from local Ollama."""
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": model,
            "messages": messages,
            "stream": True,
            "options": {
                "temperature": temperature,
                "num_predict": num_predict,
            },
        }

        async with httpx.AsyncClient(timeout=self.timeout_sec) as client:
            async with client.stream("POST", url, json=payload) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    raise RuntimeError(f"Local Ollama Stream HTTP {response.status_code}: {error_text.decode('utf-8', errors='ignore')}")

                async for line in response.aiter_lines():
                    if not line:
                        continue
                    try:
                        chunk = json.loads(line)
                        delta = chunk.get("message", {}).get("content", "")
                        if delta:
                            yield delta
                    except Exception:
                        continue


ollama_local_client = OllamaLocalClient()
