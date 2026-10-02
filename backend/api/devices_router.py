"""
GridFlowX Devices Router
"""

from typing import List, Dict, Any
from fastapi import APIRouter, HTTPException, status
from backend.services.device_service import device_service

router = APIRouter(prefix="/api/v1/devices", tags=["Devices"])


@router.get("")
def list_devices() -> List[Dict[str, Any]]:
    """Returns connected microgrid devices and controllers."""
    return device_service.list_devices()


@router.get("/{device_id}")
def get_device_info(device_id: str) -> Dict[str, Any]:
    dev = device_service.get_device(device_id)
    if not dev:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Device {device_id} not found")
    return dev
