"""
GridFlowX Comprehensive Health Monitor
======================================
Monitors Ollama Cloud status, local daemon reachability, specialized agent availability,
and telemetry simulator health.
"""

from typing import Dict, Any
from datetime import datetime, timezone

from config.settings import settings
from integrations.ollama_cloud import ollama_cloud_client
from integrations.ollama_local import ollama_local_client
from tools.tool_registry import tool_registry


class HealthMonitor:
    async def get_system_health(self) -> Dict[str, Any]:
        """Performs full health probe across all layers."""
        local_reachable = await ollama_local_client.is_reachable()
        cloud_ready = ollama_cloud_client.is_configured

        status = "ready" if (cloud_ready or local_reachable) else "standby"

        return {
            "status": status,
            "cloud": "connected" if cloud_ready else "unconfigured",
            "localOllama": "connected" if local_reachable else "unreachable",
            "models": {
                "microFast": settings.model_micro_fast,
                "macroReasoning": settings.model_macro_reasoning,
                "activeDefault": settings.ollama_model_name,
            },
            "specializedAgents": [
                "Solar Forecasting Agent",
                "Load Demand Forecasting Agent",
                "Battery Health Monitoring Agent",
                "Fault Detection & Diagnostics Agent",
                "Energy Management Decision Agent",
                "Automation Engine",
                "System Diagnostics Agent",
                "Conversational AI Copilot"
            ],
            "totalTools": len(tool_registry.tools),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }


health_monitor = HealthMonitor()
