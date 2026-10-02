"""
GridFlowX Configuration & Support Endpoints
============================================
"""

from typing import Dict, Any, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends
from backend.core.settings import settings
from backend.database.memory_store import memory_store
from backend.core.security import security_manager

router = APIRouter(prefix="/api/v1", tags=["Configuration & Support"])


class TicketCreateRequest(BaseModel):
    subject: str
    description: str
    priority: str = Field(default="MEDIUM")


@router.get("/config/system")
def get_system_config():
    return {
        "appName": settings.app_name,
        "appVersion": settings.app_version,
        "environment": settings.env,
        "edgeDeviceId": settings.edge_device_id,
        "limits": {
            "voltageLow": settings.voltage_cutoff_low,
            "voltageHigh": settings.voltage_cutoff_high,
            "currentMax": settings.current_limit_max,
            "tempMax": settings.heatsink_temp_limit_c,
        },
        "telemetryRateHz": settings.telemetry_stream_hz,
    }


@router.get("/support/tickets")
def list_tickets(user: Dict[str, Any] = Depends(security_manager.verify_token)):
    return memory_store.tickets


@router.post("/support/tickets")
def create_ticket(req: TicketCreateRequest, user: Dict[str, Any] = Depends(security_manager.verify_token)):
    ticket = {
        "id": f"TCK-{len(memory_store.tickets) + 1:04d}",
        "subject": req.subject,
        "description": req.description,
        "priority": req.priority,
        "status": "OPEN",
        "createdBy": user.get("email", "operator@gridflowx.io"),
    }
    memory_store.tickets.append(ticket)
    return ticket
