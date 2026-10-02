"""
GridFlowX AI Model Configurations
=================================
Authoritative definition of Ollama Cloud models and local edge fallbacks.
"""

from typing import Dict, Any

MODELS_CONFIG: Dict[str, Dict[str, Any]] = {
    "gemma4:31b-cloud": {
        "provider": "ollama_cloud",
        "name": "Gemma 4 31B Cloud",
        "description": "High-throughput operational reasoning, fast telemetry perception, and conversational copilot.",
        "contextWindow": 32768,
        "temperature": 0.2,
        "maxTokens": 2048,
        "roles": ["perception", "conversation", "telemetry_analysis", "status_inquiry"]
    },
    "gpt-oss:120b-cloud": {
        "provider": "ollama_cloud",
        "name": "GPT-OSS 120B Cloud",
        "description": "Deep multi-agent orchestration, complex mathematical dispatch, long-horizon predictive planning.",
        "contextWindow": 65536,
        "temperature": 0.1,
        "maxTokens": 4096,
        "roles": ["dispatch_optimization", "complex_planning", "fault_root_cause", "supervisory_orchestration"]
    },
    "qwen2.5:3b": {
        "provider": "ollama_local",
        "name": "Qwen 2.5 3B (Edge Fallback)",
        "description": "Local offline edge inference when cloud connectivity is unavailable.",
        "contextWindow": 8192,
        "temperature": 0.2,
        "maxTokens": 1024,
        "roles": ["local_fallback", "offline_inquiry"]
    }
}
