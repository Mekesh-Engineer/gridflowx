"""
GridFlowX Task Classification and Routing Engine
================================================
Analyzes incoming requests to classify operational level (Micro vs Macro),
intent categories, tool prerequisites, and latency requirements.
"""

from typing import Dict, Any, List
from agents.orchestrator.query_router import query_router, RoutedContextConfig


class TaskRouter:
    """Classifies user and system tasks for the Agentic AI Runtime."""

    def classify_task(self, query: str, user_role: str = "operator") -> Dict[str, Any]:
        """
        Extracts task intent, operational level, tool requirements, and context boundaries.
        """
        routed_config: RoutedContextConfig = query_router.route_query(query, user_role)

        # Determine Micro vs Macro
        is_macro = any(
            intent in ("SYSTEM_OPTIMIZATION", "LONG_TERM_PLANNING", "MULTI_TIER_FORECAST")
            for intent in routed_config.intents
        ) or "plan" in query.lower() or "optimize" in query.lower()

        operational_level = "MACRO" if is_macro else "MICRO"

        # Determine tool prerequisites
        tools_needed: List[str] = []
        if "BATTERY_SOC" in routed_config.intents or "BATTERY_HEALTH" in routed_config.intents:
            tools_needed.append("get_battery_status")
        if "SOLAR_STATUS" in routed_config.intents or "SOLAR_FORECAST" in routed_config.intents:
            tools_needed.extend(["get_solar_status", "get_solar_forecast"])
        if "LOAD_STATUS" in routed_config.intents or "LOAD_FORECAST" in routed_config.intents:
            tools_needed.extend(["get_load_status", "get_load_forecast"])
        if "ANOMALY_FAULT" in routed_config.intents or "CIRCUIT_BREAKER" in routed_config.intents:
            tools_needed.extend(["get_fault_diagnostics", "get_active_alerts"])
        if "RELAY_CONTROL" in routed_config.intents or "EMERGENCY_STOP" in routed_config.intents:
            tools_needed.extend(["evaluate_safety_envelope", "request_relay_action"])
        if "ENERGY_DISPATCH" in routed_config.intents or "TARIFF_OPTIMIZATION" in routed_config.intents:
            tools_needed.extend(["get_tariff_rate", "get_live_telemetry"])

        if routed_config.requires_telemetry and "get_live_telemetry" not in tools_needed:
            tools_needed.append("get_live_telemetry")

        return {
            "query": query,
            "userRole": user_role,
            "intents": routed_config.intents,
            "primaryIntent": routed_config.primary_intent,
            "operationalLevel": operational_level,
            "requiresTelemetry": routed_config.requires_telemetry,
            "isDirectMetadata": routed_config.is_direct_metadata_query,
            "toolsNeeded": tools_needed,
            "telemetryFilter": routed_config.relevant_telemetry_keys,
            "allowRelayAction": routed_config.can_propose_relay_action,
        }


task_router = TaskRouter()
