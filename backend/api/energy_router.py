"""
GridFlowX Energy Analytics Router
"""

from typing import Dict, Any
from fastapi import APIRouter
from backend.services.energy_service import energy_service

router = APIRouter(prefix="/api/v1/energy", tags=["Energy"])


@router.get("/summary")
def get_energy_summary() -> Dict[str, Any]:
    """Returns today's aggregate generation, consumption, and carbon metrics."""
    return energy_service.get_summary()


@router.get("/power-flow")
def get_power_flow() -> Dict[str, Any]:
    """Returns instantaneous nodal power flows."""
    return energy_service.get_power_flow()
