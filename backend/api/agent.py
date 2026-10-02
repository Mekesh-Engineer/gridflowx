"""
GridFlowX Agentic AI & Conversational Assistant Endpoints
=========================================================
Exposes agent status, multi-turn chat, SSE streaming, goal decomposition,
and Human-In-The-Loop (HITL) approval gates.
"""

import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, Header
from fastapi.responses import StreamingResponse

from backend.services.agentic_ai_service import agentic_ai_service
from backend.core.security import security_manager

router = APIRouter(prefix="/api/v1/agent", tags=["Agentic AI Copilot"])


class ChatRequest(BaseModel):
    query: str
    history: List[Dict[str, str]] = Field(default_factory=list)


class PlanRequest(BaseModel):
    goal: str


class HITLApprovalRequest(BaseModel):
    actionId: str
    authorized: bool
    authPinOrToken: str
    reason: str


@router.get("/status")
def get_agent_status():
    return agentic_ai_service.get_agent_status()


@router.get("/health")
async def get_agent_health():
    return await agentic_ai_service.get_health_diagnostics()


@router.get("/tools")
def get_registered_tools():
    return agentic_ai_service.get_tools_catalog()


@router.post("/chat")
async def chat_with_agent(
    req: ChatRequest,
    user: Dict[str, Any] = Depends(security_manager.verify_token),
):
    role = user.get("role", "operator")
    return await agentic_ai_service.chat(req.query, history=req.history, user_role=role)


@router.post("/chat/stream")
async def stream_chat_with_agent(
    req: ChatRequest,
    user: Dict[str, Any] = Depends(security_manager.verify_token),
):
    from services.llm_service import local_llm_service
    role = user.get("role", "operator")

    async def sse_generator():
        async for chunk in local_llm_service.stream_response(req.query, history=req.history, user_role=role):
            yield f"data: {json.dumps(chunk)}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(sse_generator(), media_type="text/event-stream")


@router.post("/plan")
def plan_goal(
    req: PlanRequest,
    user: Dict[str, Any] = Depends(security_manager.verify_token),
):
    role = user.get("role", "operator")
    return agentic_ai_service.plan_goal(req.goal, actor_role=role)


@router.post("/actions/approve")
def approve_action(
    req: HITLApprovalRequest,
    user: Dict[str, Any] = Depends(security_manager.verify_token),
):
    security_manager.require_role("supervisor", user)
    return {
        "actionId": req.actionId,
        "authorized": req.authorized,
        "authorizedBy": user.get("email"),
        "reason": req.reason,
        "status": "APPROVED" if req.authorized else "REJECTED",
    }
