"""
GridFlowX Authentication Verification Endpoints
================================================
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends
from backend.core.security import security_manager

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])


@router.get("/verify-token")
def verify_token(user: Dict[str, Any] = Depends(security_manager.verify_token)) -> Dict[str, Any]:
    return {
        "valid": True,
        "user": user,
    }


@router.get("/me")
def get_current_user(user: Dict[str, Any] = Depends(security_manager.verify_token)) -> Dict[str, Any]:
    return user
