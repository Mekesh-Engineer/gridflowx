"""
GridFlowX Agent & Orchestrator Schemas
======================================
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, timezone


from pydantic import BaseModel, Field, model_validator


class ChatMessageItem(BaseModel):
    role: str = Field(..., description="Message author role: 'user', 'assistant', 'system', or 'tool'")
    content: str = Field(..., description="Message text content")
    timestamp: Optional[str] = None


class AgentChatRequest(BaseModel):
    query: Optional[str] = None
    message: Optional[str] = None
    userId: Optional[str] = "operator_01"
    role: Optional[str] = "operator"
    actorRole: Optional[str] = None
    history: Optional[List[ChatMessageItem]] = Field(default_factory=list, description="Recent conversation turns")
    conversationHistory: Optional[List[ChatMessageItem]] = Field(default_factory=list)

    @model_validator(mode="before")
    @classmethod
    def reconcile_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if not data.get("query") and data.get("message"):
                data["query"] = data["message"]
            if not data.get("message") and data.get("query"):
                data["message"] = data["query"]
            if not data.get("role") and data.get("actorRole"):
                data["role"] = data["actorRole"]
            if not data.get("history") and data.get("conversationHistory"):
                data["history"] = data["conversationHistory"]
            if not data.get("query"):
                data["query"] = ""
        return data


class AgentChatResponse(BaseModel):
    success: bool
    query: str
    reply: str
    modelUsed: Optional[str] = None
    telemetrySnippet: Optional[Dict[str, Any]] = None
    citations: Optional[List[str]] = None
    toolsUsed: Optional[List[str]] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AgentPlanRequest(BaseModel):
    goal: str = Field(..., min_length=3, description="High-level goal to plan and decompose")
    actorRole: Optional[str] = "operator"


class PlanStep(BaseModel):
    action: str
    service: str
    description: str


class AgentPlanResponse(BaseModel):
    success: bool
    goal: str
    proposedPlan: List[PlanStep]
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AgentStatusResponse(BaseModel):
    orchestratorStatus: str
    totalAgentsActive: int
    agents: List[str]
    safetyEnvelopeStatus: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ActionApprovalRequest(BaseModel):
    actionId: str = Field(..., description="Unique action ID to authorize")
    authorized: bool = Field(..., description="True to execute, False to reject")
    authPinOrToken: str = Field(..., description="Cryptographic approval token")
    reason: Optional[str] = "Operator approved through dashboard HITL modal"


class ActionApprovalResponse(BaseModel):
    success: bool
    actionId: str
    authorized: bool
    authorizedBy: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class OllamaDiagnostics(BaseModel):
    installed: bool = Field(default=False, description="Whether ollama CLI binary is found on system")
    server_reachable: bool = Field(default=False, description="Whether Ollama HTTP server responded")
    model_available: bool = Field(default=False, description="Whether active/configured model exists")
    inference_available: bool = Field(default=False, description="Whether inference test generation succeeded")
    endpoint: Optional[str] = None
    details: Optional[str] = None


class AIHealthResponse(BaseModel):
    status: str = Field(..., description="'ready', 'standby', or 'offline'")
    ollama: str = Field(..., description="'connected' or 'unreachable'")
    model: str = Field(..., description="Active Qwen model tag")
    detectedModels: List[str] = Field(default_factory=list)
    availableTools: List[str] = Field(default_factory=list)
    cloudModels: List[str] = Field(default_factory=lambda: ["gemma4:31b-cloud", "gpt-oss:120b-cloud", "qwen2.5:3b"])
    latencyMs: Optional[float] = None
    diagnostics: Optional[OllamaDiagnostics] = None
    service: str = "GridFlowX AI Copilot Service"
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
