"""
GridFlowX Primary AI REST Endpoints
====================================
Exposes forecasting, battery health, anomaly diagnostics, optimization dispatch,
and model registry management by delegating to the authoritative Agentic AI layer.
"""

from typing import Dict, Any, List
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, Query, HTTPException

from backend.services.agentic_ai_service import agentic_ai_service
from backend.core.security import security_manager

router = APIRouter(prefix="/api/v1/ai", tags=["AI Subsystems"])


# 1. Forecasting
@router.get("/forecast/solar")
def get_solar_forecast(
    deviceId: str = Query("GFX-ESP32-MASTER-01"),
    horizonHours: int = Query(24, ge=1, le=72),
):
    return agentic_ai_service.get_solar_forecast(deviceId, horizonHours)


@router.get("/forecast/load")
def get_load_forecast(
    deviceId: str = Query("GFX-ESP32-MASTER-01"),
    horizonHours: int = Query(24, ge=1, le=72),
):
    return agentic_ai_service.get_load_forecast(deviceId, horizonHours)


@router.get("/forecast/accuracy")
def get_forecast_accuracy(deviceId: str = Query("GFX-ESP32-MASTER-01")):
    return agentic_ai_service.get_forecast_accuracy(deviceId)


# 2. Battery Health & Degradation
@router.get("/battery/health")
def get_battery_health(deviceId: str = Query("GFX-ESP32-MASTER-01")):
    return agentic_ai_service.get_battery_health(deviceId)


# 3. Anomaly & Cyber-Physical Diagnostics
@router.get("/anomaly/live")
def get_live_anomaly():
    return agentic_ai_service.get_live_anomaly()


@router.post("/anomaly/detect")
def detect_anomalies(payload: Dict[str, Any]):
    return agentic_ai_service.detect_anomalies(payload)


# 4. Energy Management & Optimization Dispatch
class ApplyDispatchRequest(BaseModel):
    decisionId: str
    targetRelayStates: List[bool]


@router.get("/optimization/dispatch")
def get_optimization_dispatch(deviceId: str = Query("GFX-ESP32-MASTER-01")):
    return agentic_ai_service.get_optimization_dispatch(deviceId)


@router.post("/optimization/apply")
def apply_optimization_dispatch(
    req: ApplyDispatchRequest,
    user: Dict[str, Any] = Depends(security_manager.verify_token),
):
    security_manager.require_role("operator", user)
    return agentic_ai_service.apply_optimization_dispatch(
        decision_id=req.decisionId,
        target_states=req.targetRelayStates,
        actor=user.get("role", "operator"),
    )


# 5. AI Models Registry & Retraining
class RetrainModelRequest(BaseModel):
    modelId: str


@router.get("/models")
def get_all_models():
    return agentic_ai_service.get_all_models()


@router.post("/models/retrain")
def retrain_model(
    req: RetrainModelRequest,
    user: Dict[str, Any] = Depends(security_manager.verify_token),
):
    security_manager.require_role("supervisor", user)
    return agentic_ai_service.retrain_model(req.modelId)
