"""
GridFlowX Production Type-Safe Tool Registry
============================================
Exposes validated tools with Pydantic validation and RBAC guards.
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from schemas.agents import (
    AgentChatRequest,
    AgentPlanRequest,
    ActionApprovalRequest,
)
from tools.base import BaseTool
from tools.registry import ToolRegistry, tool_registry
from tools.telemetry_tools import (
    LiveTelemetryTool,
    SystemStatusTool,
    BatteryStatusTool,
    SolarStatusTool,
    GridStatusTool,
    LoadStatusTool,
    EnergyFlowTool,
    ActiveAlertsTool,
    SolarForecastTool,
    LoadForecastTool,
    BatteryHealthTool,
    FaultDiagnosticsTool,
    TariffRateTool,
    AgentStatusTool,
    RecentDecisionsTool,
)

# Register all domain tools
tool_registry.register(LiveTelemetryTool())
tool_registry.register(SystemStatusTool())
tool_registry.register(BatteryStatusTool())
tool_registry.register(SolarStatusTool())
tool_registry.register(GridStatusTool())
tool_registry.register(LoadStatusTool())
tool_registry.register(EnergyFlowTool())
tool_registry.register(ActiveAlertsTool())
tool_registry.register(SolarForecastTool())
tool_registry.register(LoadForecastTool())
tool_registry.register(BatteryHealthTool())
tool_registry.register(FaultDiagnosticsTool())
tool_registry.register(TariffRateTool())
tool_registry.register(AgentStatusTool())
tool_registry.register(RecentDecisionsTool())

__all__ = [
    "AgentChatRequest",
    "AgentPlanRequest",
    "ActionApprovalRequest",
    "BaseTool",
    "ToolRegistry",
    "tool_registry",
    "LiveTelemetryTool",
    "SystemStatusTool",
    "BatteryStatusTool",
    "SolarStatusTool",
    "GridStatusTool",
    "LoadStatusTool",
    "EnergyFlowTool",
    "ActiveAlertsTool",
    "SolarForecastTool",
    "LoadForecastTool",
    "BatteryHealthTool",
    "FaultDiagnosticsTool",
    "TariffRateTool",
    "AgentStatusTool",
    "RecentDecisionsTool",
]
