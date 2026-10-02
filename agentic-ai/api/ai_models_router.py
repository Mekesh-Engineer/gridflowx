"""
GridFlowX Model Registry API Router
===================================
"""

from typing import Dict
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from services.optimization_service import OptimizationService
from utils.auth import AuthUser, require_supervisor_or_above

router = APIRouter(prefix="/api/v1/ai/models", tags=["AI Models"])


@router.get("")
def get_ai_models():
    """Returns model metadata and drift metrics for all deployed AI models."""
    return {
        "success": True,
        "models": OptimizationService.get_models(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }


@router.post("/retrain")
def retrain_ai_model(
    payload: Dict[str, str],
    user: AuthUser = Depends(require_supervisor_or_above)
):
    """Triggers an automated retraining pipeline for a registered AI model."""
    model_id = payload.get("modelId", "")
    res = OptimizationService.retrain_model(model_id)
    if not res.get("success"):
        raise HTTPException(status_code=404, detail=res.get("message"))
    return res
