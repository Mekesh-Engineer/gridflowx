"""
GridFlowX Energy Endpoints
==========================
"""

from typing import Dict, Any
from fastapi import APIRouter
from backend.services.energy_service import energy_service

router = APIRouter(prefix="/api/v1/energy", tags=["Energy"])


@router.get("/summary")
def get_energy_summary() -> Dict[str, Any]:
    return energy_service.get_energy_summary()
