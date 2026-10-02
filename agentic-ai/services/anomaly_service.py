"""
GridFlowX / SAMEMAMS Anomaly Detection & Incident Diagnostics Service
====================================================================
Multivariate anomaly scoring across live sensor telemetry, Isolation Forest
statistical envelope verification, root cause hypothesis generation, and triage recommendations.
"""

from typing import List, Dict, Any, Optional
from schemas.anomaly import AnomalyDetectionResponse
from agents.fault.fault_agent import fault_agent


class AnomalyDetectionService:
    @staticmethod
    def detect_anomalies(
        telemetry: Dict[str, Any]
    ) -> AnomalyDetectionResponse:
        return fault_agent.detect_sync(telemetry)
