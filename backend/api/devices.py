"""
GridFlowX Devices Endpoints
===========================
"""

from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException
from backend.services.device_service import device_service

router = APIRouter(prefix="/api/v1/devices", tags=["Devices"])


@router.get("")
def list_devices() -> List[Dict[str, Any]]:
    return device_service.get_devices()


@router.get("/{device_id}")
def get_device(device_id: str) -> Dict[str, Any]:
    dev = device_service.get_device_by_id(device_id)
    if not dev:
        raise HTTPException(status_code=404, detail=f"Device {device_id} not found")
    return dev
