"""
GridFlowX AI Query Router & Intent Classifier
============================================
Implements Section 3 (Intelligence Pipeline), Section 4 (Intent Classification),
Section 7 (Context Selection), and Section 11 (Multi-Agent Orchestration).

Ensures:
1. Intent is classified accurately before any prompt is assembled.
2. Context is selectively chosen — unrelated telemetry is NOT injected into developer,
   project metadata, or architecture queries.
3. Relevant AI agents and tools are routed based on query needs.
"""

import re
from typing import List, Dict, Any, Set
from dataclasses import dataclass, field


@dataclass
class RoutedContextConfig:
    intents: List[str]
    primary_intent: str
    requires_telemetry: bool = False
    requires_rag: bool = True
    requires_agent_status: bool = False
    target_agents: List[str] = field(default_factory=list)
    extracted_entities: Dict[str, Any] = field(default_factory=dict)
    is_direct_metadata_query: bool = False

# Backward-compatibility alias
QueryIntentConfig = RoutedContextConfig



class AIQueryRouter:
    """Classifies user queries into supported intents and configures selective context injection."""

    DEVELOPER_KEYWORDS = {
        "developer", "developed", "who made", "who built", "who created", "who designed",
        "creator", "author", "maker", "mekesh", "mekeshkumar", "mk studios", "kongu", "kec"
    }

    ARCHITECTURE_KEYWORDS = {
        "architecture", "hardware", "esp32", "freertos", "fastapi", "stack", "software stack",
        "next.js", "nextjs", "framework", "microservice", "layer", "how is it built"
    }

    AI_MODEL_KEYWORDS = {
        "ai model", "ai models", "ai agent", "ai agents", "lstm", "arima", "xgboost",
        "isolation forest", "ppo", "machine learning", "models used", "retraining", "forecast model"
    }

    BATTERY_SOC_KEYWORDS = {"battery soc", "state of charge", "current soc", "% soc", "soc %"}
    BATTERY_SOH_KEYWORDS = {"battery soh", "state of health", "degradation", "internal resistance", "esr", "battery health", "cycle life"}
    BATTERY_GENERAL_KEYWORDS = {"battery", "bess", "lifepo4", "pack voltage", "cell delta", "battery temp", "charging current"}

    SOLAR_KEYWORDS = {"solar", "pv", "generation", "irradiance", "mppt", "ghi", "photovoltaic", "solar yield"}
    LOAD_KEYWORDS = {"load", "demand", "tier 1", "tier 2", "tier 3", "shedding", "shed load", "consumption", "critical load"}
    GRID_KEYWORDS = {"grid", "utility grid", "infeed", "grid voltage", "frequency", "ieee 1547", "blackout", "islanding"}

    ENERGY_FLOW_KEYWORDS = {"energy flow", "power flow", "why grid", "why battery", "why solar", "arbitration", "net balance", "surplus", "deficit"}
    MICROGRID_STATUS_KEYWORDS = {"microgrid status", "system status", "current status", "overall status", "how is the system"}
    FAULT_ALERT_KEYWORDS = {"fault", "anomaly", "alert", "warning", "overheating", "trip", "failure", "diagnostic", "error"}
    OPTIMIZATION_KEYWORDS = {"optimize", "optimization", "tou", "tariff", "peak shaving", "cost savings", "economic dispatch"}
    CONTROL_KEYWORDS = {"turn off", "turn on", "switch", "open relay", "close relay", "shed", "disconnect", "estop", "emergency stop", "override"}

    @classmethod
    def _matches_any(cls, text: str, keywords: Set[str]) -> bool:
        for k in keywords:
            # If multi-word phrase, check substring
            if " " in k:
                if k in text:
                    return True
            else:
                # If single word, check word boundary avoiding partial words like grid in gridflowx
                if re.search(rf"\b{re.escape(k)}\b", text):
                    # Exclude 'gridflowx' and 'microgrid' when matching single word 'grid'
                    if k == "grid" and not any(phrase in text for phrase in ["utility grid", "grid power", "grid voltage", "on grid", "off grid", "the grid"]):
                        # Check if 'grid' is appearing as an isolated word and not part of 'smart grid' or 'microgrid'
                        words = set(re.findall(r"\b\w+\b", text))
                        if "grid" in words and "gridflowx" not in text and "microgrid" not in text:
                            return True
                    else:
                        return True
        return False

    @classmethod
    def route_query(cls, query: str, user_role: str = "operator") -> RoutedContextConfig:
        q_clean = query.lower().strip()
        intents: List[str] = []
        target_agents: List[str] = []
        is_metadata = False

        # 1. Developer Information
        if cls._matches_any(q_clean, cls.DEVELOPER_KEYWORDS):
            intents.append("DEVELOPER_INFORMATION")
            intents.append("PROJECT_METADATA")
            is_metadata = True

        # 2. Project Overview / Architecture / Stack
        if cls._matches_any(q_clean, cls.ARCHITECTURE_KEYWORDS):
            intents.append("SYSTEM_ARCHITECTURE")
            intents.append("SOFTWARE_STACK")
            is_metadata = True

        # 3. AI Models & Agents
        if cls._matches_any(q_clean, cls.AI_MODEL_KEYWORDS):
            intents.append("AI_MODEL")
            intents.append("AI_AGENT")
            target_agents.append("Agent Controller / Orchestrator")

        # 4. Battery SoC / SoH / Health
        if cls._matches_any(q_clean, cls.BATTERY_SOC_KEYWORDS):
            intents.append("BATTERY_SOC")
            intents.append("TELEMETRY")
            target_agents.append("Battery Health Monitoring Agent")
        elif cls._matches_any(q_clean, cls.BATTERY_SOH_KEYWORDS):
            intents.append("BATTERY_SOH")
            target_agents.append("Battery Health Monitoring Agent")
        elif cls._matches_any(q_clean, cls.BATTERY_GENERAL_KEYWORDS):
            intents.append("BATTERY")
            target_agents.append("Battery Health Monitoring Agent")

        # 5. Solar Generation & Forecasting
        if cls._matches_any(q_clean, cls.SOLAR_KEYWORDS):
            intents.append("SOLAR")
            if any(w in q_clean for w in ["forecast", "tomorrow", "predict", "yield", "future"]):
                intents.append("FORECASTING")
                intents.append("PREDICTION")
            target_agents.append("Solar Forecasting Agent")

        # 6. Load Demand & Management
        if cls._matches_any(q_clean, cls.LOAD_KEYWORDS):
            intents.append("LOAD")
            if any(w in q_clean for w in ["shed", "priority", "tier", "cut off"]):
                intents.append("LOAD_MANAGEMENT")
            target_agents.append("Load Demand Forecasting Agent")

        # 7. Grid & Interconnection (Excludes standalone 'gridflowx' or 'microgrid')
        if any(phrase in q_clean for phrase in ["utility grid", "grid power", "grid voltage", "grid frequency", "ieee 1547", "blackout", "islanding", "feed-in"]):
            intents.append("GRID")

        # 8. Energy Flow & Arbitration
        if cls._matches_any(q_clean, cls.ENERGY_FLOW_KEYWORDS):
            intents.append("ENERGY_FLOW")
            intents.append("SOURCE_ARBITRATION")
            target_agents.append("Energy Management Decision Agent")

        # 9. Microgrid Status / Live Telemetry
        if cls._matches_any(q_clean, cls.MICROGRID_STATUS_KEYWORDS):
            intents.append("MICROGRID_STATUS")
            intents.append("TELEMETRY")

        # 10. Faults & Anomalies
        if cls._matches_any(q_clean, cls.FAULT_ALERT_KEYWORDS):
            intents.append("FAULT_DETECTION")
            intents.append("ANOMALY_DETECTION")
            target_agents.append("Fault Detection & Diagnostics Agent")

        # 11. Energy Optimization & ToU
        if cls._matches_any(q_clean, cls.OPTIMIZATION_KEYWORDS):
            intents.append("ENERGY_OPTIMIZATION")
            target_agents.append("Energy Management Decision Agent")

        # 12. Control & Actuation
        if cls._matches_any(q_clean, cls.CONTROL_KEYWORDS):
            intents.append("CONTROL")
            target_agents.append("Automation Engine")

        # Fallback default intent
        if not intents:
            intents.append("GENERAL_CONVERSATION")

        primary_intent = intents[0]

        # Determine selective context requirements (Section 7 Context Selection)
        # CRITICAL RULE: If the query is direct project metadata / developer / architecture,
        # DO NOT inject live telemetry into the prompt to prevent reasoning noise and prompt substitution!
        telemetry_intents = {
            "TELEMETRY", "BATTERY_SOC", "MICROGRID_STATUS", "ENERGY_FLOW",
            "SOURCE_ARBITRATION", "FAULT_DETECTION", "ANOMALY_DETECTION", "ALERT", "CONTROL"
        }
        requires_telemetry = bool(set(intents).intersection(telemetry_intents)) and not is_metadata
        requires_rag = True
        requires_agent_status = bool(set(intents).intersection({"AI_AGENT", "AI_MODEL", "SYSTEM_ARCHITECTURE"}))

        # Extract basic entities
        entities: Dict[str, Any] = {}
        if "tier 1" in q_clean:
            entities["target_tier"] = "Tier 1"
        elif "tier 2" in q_clean:
            entities["target_tier"] = "Tier 2"
        elif "tier 3" in q_clean:
            entities["target_tier"] = "Tier 3"

        return RoutedContextConfig(
            intents=intents,
            primary_intent=primary_intent,
            requires_telemetry=requires_telemetry,
            requires_rag=requires_rag,
            requires_agent_status=requires_agent_status,
            target_agents=list(set(target_agents)),
            extracted_entities=entities,
            is_direct_metadata_query=is_metadata
        )


query_router = AIQueryRouter()
