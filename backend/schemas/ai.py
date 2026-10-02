"""
GridFlowX AI & Agent Request / Response Schemas
"""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AgentChatRequest(BaseModel):
    message: str
    conversationHistory: Optional[List[Dict[str, str]]] = []
    actorRole: Optional[str] = "operator"
    telemetry: Optional[Dict[str, Any]] = None


class AgentChatResponse(BaseModel):
    reply: str
    modelUsed: str
    confidence: float = 0.95
    suggestedActions: Optional[List[str]] = []
    telemetrySnippet: Optional[Dict[str, Any]] = None
    auditTraceId: Optional[str] = None
    timestamp: str


class GoalDecompositionRequest(BaseModel):
    goal: str
    telemetry: Optional[Dict[str, Any]] = None
    actorRole: Optional[str] = "operator"


class OptimizationTriggerRequest(BaseModel):
    deviceId: str = "GFX-ESP32-MASTER-01"
    mode: str = "ECONOMIC"  # 'ECONOMIC' | 'ECO' | 'RELIABILITY' | 'ISLANDED'
    telemetry: Optional[Dict[str, Any]] = None
