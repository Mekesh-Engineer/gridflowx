"""
GridFlowX Agentic AI Conversational & Supervisory API Router
============================================================
Provides health checks, real-time SSE token streaming, domain tool catalog,
and supervisory agent orchestration.
"""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request
from fastapi.responses import StreamingResponse

from schemas.agents import (
    AgentChatRequest,
    AgentPlanRequest,
    ActionApprovalRequest,
    AIHealthResponse,
)
from agents.orchestrator.orchestrator_agent import production_orchestrator
from services.telemetry_service import telemetry_manager
from services.llm_service import local_llm_service
from tools.tool_registry import tool_registry
from utils.auth import (
    AuthUser,
    get_current_user,
    get_optional_user,
    require_operator_or_above,
    require_supervisor_or_above,
)

router = APIRouter(prefix="/api/v1/agent", tags=["Agentic AI"])


@router.get("/health", response_model=AIHealthResponse)
async def get_ai_health():
    """Provides detailed local Ollama connectivity and model health diagnostics."""
    health_data = await local_llm_service.get_health_status()
    return health_data


@router.get("/status")
def get_agent_status():
    """Returns active state of all specialized agents and orchestrator."""
    return production_orchestrator.get_system_agent_status()


@router.get("/tools")
def get_available_tools():
    """Lists all registered domain tools callable by the AI copilot."""
    return {
        "count": len(tool_registry.list_tools()),
        "tools": [t.model_dump() for t in tool_registry.list_tools()]
    }


@router.post("/chat")
async def chat_with_agent(
    payload: AgentChatRequest,
    user: AuthUser = Depends(get_optional_user)
):
    """Processes conversational query with live telemetry citations or public educational bounds."""
    effective_role = user.role if user.role != "public" else (payload.role or "public")
    history_dicts = [h.model_dump() for h in (payload.history or [])]
    return await local_llm_service.generate_grounded_chat(
        query=payload.query,
        latest_telemetry=telemetry_manager.latest_telemetry if effective_role != "public" else {},
        history=history_dicts,
        user_role=effective_role
    )


@router.post("/chat/stream")
async def stream_chat_with_agent(
    payload: AgentChatRequest,
    request: Request,
    user: AuthUser = Depends(get_optional_user)
):
    """
    Streams token-by-token response from local Qwen 2.5 via Server-Sent Events (SSE).
    Clients receive progressive chunks formatted as `data: {"type": "token", "content": "..."}\n\n`.
    """
    effective_role = user.role if user.role != "public" else (payload.role or "public")
    history_dicts = [h.model_dump() for h in (payload.history or [])]

    async def event_generator():
        async for sse_chunk in local_llm_service.stream_grounded_chat(
            query=payload.query,
            latest_telemetry=telemetry_manager.latest_telemetry if effective_role != "public" else {},
            history=history_dicts,
            user_role=effective_role
        ):
            if await request.is_disconnected():
                break
            yield sse_chunk

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        }
    )


@router.post("/plan")
def execute_agent_plan(
    payload: AgentPlanRequest,
    user: AuthUser = Depends(require_operator_or_above)
):
    """Decomposes an operational goal into safe executable steps."""
    return production_orchestrator.plan_and_decompose(
        goal=payload.goal,
        latest_telemetry=telemetry_manager.latest_telemetry,
        actor_role=user.role
    )


@router.post("/actions/approve")
async def approve_hitl_action(
    payload: ActionApprovalRequest,
    user: AuthUser = Depends(require_supervisor_or_above)
):
    """Authorizes a high-consequence Human-in-the-Loop action."""
    print(f"[HITL Approval] Action {payload.actionId} status: {payload.authorized} by {user.email} ({user.role})")
    return {
        "success": True,
        "actionId": payload.actionId,
        "authorized": payload.authorized,
        "authorizedBy": user.email or user.uid,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
