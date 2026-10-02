"""
GridFlowX Domain Schemas Package
================================
Consolidates all strongly-typed Pydantic contracts.
"""

from .telemetry import TelemetryPacket, CalibrationPayload
from .relays import (
    RelayOverrideRequest,
    EmergencyStopRequest,
    RecoveryRequest,
    RelayCommandResponse,
)
from .forecasts import (
    SolarForecastPoint,
    SolarForecastResponse,
    LoadForecastPoint,
    LoadForecastResponse,
)
from .battery import BatteryHealthResponse
from .anomaly import AnomalyItem, AnomalyDetectionResponse
from .optimization import OptimizationResponse
from .agents import (
    AgentChatRequest,
    AgentChatResponse,
    AgentPlanRequest,
    PlanStep,
    AgentPlanResponse,
    AgentStatusResponse,
    ActionApprovalRequest,
    ActionApprovalResponse,
)
from .tools import (
    ToolDefinitionSchema,
    ToolInvocationRequest,
    ToolResultSchema,
)
from .safety import SafetyValidationResult, InterlockStatus

__all__ = [
    "TelemetryPacket",
    "CalibrationPayload",
    "RelayOverrideRequest",
    "EmergencyStopRequest",
    "RecoveryRequest",
    "RelayCommandResponse",
    "SolarForecastPoint",
    "SolarForecastResponse",
    "LoadForecastPoint",
    "LoadForecastResponse",
    "BatteryHealthResponse",
    "AnomalyItem",
    "AnomalyDetectionResponse",
    "OptimizationResponse",
    "AgentChatRequest",
    "AgentChatResponse",
    "AgentPlanRequest",
    "PlanStep",
    "AgentPlanResponse",
    "AgentStatusResponse",
    "ActionApprovalRequest",
    "ActionApprovalResponse",
    "ToolDefinitionSchema",
    "ToolInvocationRequest",
    "ToolResultSchema",
    "SafetyValidationResult",
    "InterlockStatus",
]
