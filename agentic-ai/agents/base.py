"""
GridFlowX Production Base Agent Contract
========================================
Defines the standard asynchronous lifecycle for specialized domain agents.
"""

from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Dict, Any
from datetime import datetime, timezone

TInput = TypeVar("TInput")
TOutput = TypeVar("TOutput")


class BaseAgent(ABC, Generic[TInput, TOutput]):
    """Abstract Base Agent providing common status and execution contracts."""

    def __init__(self, name: str, version: str, role: str):
        self.name = name
        self.version = version
        self.role = role
        self.status = "ONLINE"
        self.last_execution_time: float = 0.0

    @abstractmethod
    async def execute(self, input_data: TInput) -> TOutput:
        """Executes the agent's core cognitive or perception task."""
        pass

    def get_status(self) -> Dict[str, Any]:
        """Returns the health status and metadata of the agent."""
        return {
            "name": self.name,
            "version": self.version,
            "role": self.role,
            "status": self.status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
