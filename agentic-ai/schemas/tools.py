"""
GridFlowX Production Tool Schemas
=================================
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class ToolDefinitionSchema(BaseModel):
    name: str
    description: str
    required_role: str = "operator"
    is_write_action: bool = False
    requires_hitl: bool = False


class ToolInvocationRequest(BaseModel):
    tool_name: str
    parameters: Dict[str, Any] = Field(default_factory=dict)
    user_id: Optional[str] = "operator_01"
    user_role: str = "operator"


class ToolResultSchema(BaseModel):
    tool_name: str
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    execution_time_ms: float = 0.0
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
