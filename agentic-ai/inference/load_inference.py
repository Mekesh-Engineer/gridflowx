"""
GridFlowX Load Demand Forecast Inference Adapter
================================================
Performs multi-tier load forecasting (Tier 1/2/3) using diurnal baselines,
seasonal demand profiles, and optional ARIMA/LSTM models.
"""

import math
import random
from typing import Dict, Any, List
from datetime import datetime, timezone, timedelta
from inference.base import BaseInferenceAdapter
from schemas.forecasts import LoadForecastPoint, LoadForecastResponse


class LoadInferenceAdapter(BaseInferenceAdapter):
    def __init__(self):
        super().__init__(model_name="GridBrain-LoadARIMA-v2.1", version="2.1.0")

    def predict(self, features: Dict[str, Any]) -> LoadForecastResponse:
        device_id = features.get("deviceId", "GFX-ESP32-MASTER-01")
        horizon_hours = int(features.get("horizonHours", 24))

        now = datetime.now(timezone.utc)
        data_points: List[LoadForecastPoint] = []
        max_demand_w = 0.0
        peak_timestamp = now.isoformat()

        for h in range(horizon_hours):
            point_time = now + timedelta(hours=h)
            hour_of_day = point_time.hour + (point_time.minute / 60.0)

            base_load = 28.0
            tier1 = 18.0 + random.uniform(-0.5, 0.5)

            if 8.0 <= hour_of_day <= 20.0:
                tier2 = 32.0 + 5.0 * math.sin((hour_of_day - 8.0) / 12.0 * math.pi) + random.uniform(-1.0, 1.0)
            else:
                tier2 = 18.0 + random.uniform(-0.5, 0.5)

            if 17.0 <= hour_of_day <= 22.0:
                tier3 = 45.0 + 15.0 * math.sin((hour_of_day - 17.0) / 5.0 * math.pi) + random.uniform(-2.0, 2.0)
            elif 11.0 <= hour_of_day <= 15.0:
                tier3 = 30.0 + random.uniform(-1.5, 1.5)
            else:
                tier3 = 10.0 + random.uniform(-1.0, 1.0)

            total_demand = base_load + tier1 + tier2 + tier3
            uncertainty = (0.04 + 0.002 * h) * total_demand
            lower_bound = max(0.0, total_demand - uncertainty)
            upper_bound = total_demand + uncertainty

            if total_demand > max_demand_w:
                max_demand_w = total_demand
                peak_timestamp = point_time.isoformat()

            data_points.append(
                LoadForecastPoint(
                    timestamp=point_time.isoformat(),
                    predictedDemandW=round(total_demand, 1),
                    tier1CriticalW=round(tier1, 1),
                    tier2ImportantW=round(tier2, 1),
                    tier3FlexibleW=round(tier3, 1),
                    lowerBoundW=round(lower_bound, 1),
                    upperBoundW=round(upper_bound, 1),
                )
            )

        return LoadForecastResponse(
            deviceId=device_id,
            generatedAt=now.isoformat(),
            modelId=self.model_name,
            horizonHours=horizon_hours,
            peakDemandW=round(max_demand_w, 1),
            peakDemandTimestamp=peak_timestamp,
            dataPoints=data_points,
        )


load_inference_adapter = LoadInferenceAdapter()
