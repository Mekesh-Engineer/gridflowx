"""
GridFlowX Anomaly Detection API Router
======================================
"""

from typing import Dict, Any
from fastapi import APIRouter
from schemas.anomaly import AnomalyDetectionResponse
from services.anomaly_service import AnomalyDetectionService
from services.telemetry_service import telemetry_manager

router = APIRouter(prefix="/api/v1/ai/anomaly", tags=["AI Anomaly Detection"])


@router.get("/live", response_model=AnomalyDetectionResponse)
def get_live_anomalies():
    """Performs real-time multivariate anomaly detection across latest sensor telemetry."""
    return AnomalyDetectionService.detect_anomalies(telemetry_manager.latest_telemetry)


@router.post("/detect", response_model=AnomalyDetectionResponse)
def detect_anomalies_custom(payload: Dict[str, Any]):
    """Analyzes a specific telemetry frame for cyber-physical anomalies."""
    return AnomalyDetectionService.detect_anomalies(payload)
