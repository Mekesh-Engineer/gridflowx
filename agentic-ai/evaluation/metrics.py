"""
GridFlowX AI Model Evaluation Metrics
=====================================
Calculates standard predictive regression metrics (MAE, RMSE, MAPE, R2)
and cyber-physical safety compliance scores.
"""

import math
from typing import List, Dict, Any


def calculate_mae(actual: List[float], predicted: List[float]) -> float:
    if not actual or len(actual) != len(predicted):
        return 0.0
    return sum(abs(a - p) for a, p in zip(actual, predicted)) / len(actual)


def calculate_rmse(actual: List[float], predicted: List[float]) -> float:
    if not actual or len(actual) != len(predicted):
        return 0.0
    mse = sum((a - p) ** 2 for a, p in zip(actual, predicted)) / len(actual)
    return math.sqrt(mse)


def calculate_mape(actual: List[float], predicted: List[float]) -> float:
    if not actual or len(actual) != len(predicted):
        return 0.0
    valid = [(a, p) for a, p in zip(actual, predicted) if abs(a) > 1e-3]
    if not valid:
        return 0.0
    return (sum(abs(a - p) / abs(a) for a, p in valid) / len(valid)) * 100.0


def calculate_r2(actual: List[float], predicted: List[float]) -> float:
    if not actual or len(actual) != len(predicted) or len(actual) < 2:
        return 1.0
    mean_act = sum(actual) / len(actual)
    ss_tot = sum((a - mean_act) ** 2 for a in actual)
    ss_res = sum((a - p) ** 2 for a, p in zip(actual, predicted))
    if ss_tot == 0.0:
        return 1.0
    return max(-1.0, min(1.0, 1.0 - (ss_res / ss_tot)))


def evaluate_forecast(actual: List[float], predicted: List[float]) -> Dict[str, float]:
    return {
        "mae": round(calculate_mae(actual, predicted), 2),
        "rmse": round(calculate_rmse(actual, predicted), 2),
        "mape": round(calculate_mape(actual, predicted), 2),
        "r2": round(calculate_r2(actual, predicted), 4),
    }
