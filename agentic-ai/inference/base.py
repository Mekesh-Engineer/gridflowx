"""
GridFlowX Production Base Inference Adapter
===========================================
Defines the standard inference contract for all AI/ML models in production.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class BaseInferenceAdapter(ABC):
    """Abstract base class for all production inference adapters."""

    def __init__(self, model_name: str, version: str):
        self.model_name = model_name
        self.version = version

    @abstractmethod
    def predict(self, features: Dict[str, Any]) -> Dict[str, Any]:
        """Runs model inference on input feature vector."""
        pass
